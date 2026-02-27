/**
 * API Checker — health-checks APIs from the registry and stores results in MongoDB.
 * Supports:
 *   - Single API check
 *   - Batch check (all, keyless-only, configured-only)
 *   - Auto-discovery: scan env vars and detect which APIs are configured
 *   - Persistent results in MongoDB (collection: api_health)
 */
import { getDb } from './db';
import { API_REGISTRY, ApiEntry, getConfiguredApis, getKeylessApis } from './api-registry';

const API_HEALTH_COLLECTION = 'api_health';

export type ApiStatus = 'ok' | 'degraded' | 'error' | 'unconfigured' | 'unknown';

export interface ApiHealthResult {
  apiId: string;
  apiName: string;
  category: string;
  status: ApiStatus;
  statusCode?: number;
  latencyMs?: number;
  error?: string;
  keyConfigured: boolean;
  keyless: boolean;
  checkedAt: Date;
  /** The capability tags this API provides */
  provides: string[];
}

export interface ApiHealthSummary {
  total: number;
  ok: number;
  degraded: number;
  error: number;
  unconfigured: number;
  results: ApiHealthResult[];
  checkedAt: Date;
}

// ─────────────────────────────────────────────────────────────────────────────
// Core Check Logic
// ─────────────────────────────────────────────────────────────────────────────

async function checkSingleApi(entry: ApiEntry): Promise<ApiHealthResult> {
  const { check, envKey, keyless, id, name, category, provides } = entry;
  const keyConfigured = keyless || (envKey ? !!process.env[envKey] : false);

  // Don't bother hitting the network if key is required and not configured
  if (!keyless && !keyConfigured) {
    return {
      apiId: id,
      apiName: name,
      category,
      status: 'unconfigured',
      keyConfigured: false,
      keyless: false,
      checkedAt: new Date(),
      provides,
    };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), check.timeoutMs ?? 6000);
  const start = Date.now();

  try {
    const headers: Record<string, string> = {
      'User-Agent': 'OpenClaw-Hub-HealthCheck/1.0',
      'Content-Type': 'application/json',
      ...(check.headers ?? {}),
    };

    // Inject real API key if available
    if (envKey && process.env[envKey]) {
      const key = process.env[envKey]!;
      if (entry.authType === 'bearer') headers['Authorization'] = `Bearer ${key}`;
      if (entry.authType === 'api_key_header') {
        // Different services use different header names
        const headerMap: Record<string, string> = {
          tavily: 'api-key',
          brave_search: 'X-Subscription-Token',
          serper: 'X-API-KEY',
          firecrawl: 'Authorization',
          e2b: 'X-API-Key',
          thecolony: 'X-Agent-Api-Key',
          opentask: 'X-Api-Key',
        };
        const headerName = headerMap[id] ?? 'X-API-Key';
        if (id === 'firecrawl') headers['Authorization'] = `Bearer ${key}`;
        else headers[headerName] = key;
      }
    }

    const res = await fetch(check.url, {
      method: check.method ?? 'GET',
      headers,
      signal: controller.signal,
      // For POST checks, send a minimal body to avoid 422 errors
      ...(check.method === 'POST'
        ? { body: JSON.stringify({ query: 'test', url: 'https://example.com' }) }
        : {}),
    });

    clearTimeout(timeout);
    const latencyMs = Date.now() - start;
    const expectedStatus = check.expectedStatus ?? [200];

    // Validate body key if specified
    let bodyValid = true;
    if (check.bodyKey && res.status === 200) {
      try {
        const body = await res.json();
        bodyValid = check.bodyKey in body || (Array.isArray(body) && body.length > 0);
      } catch {
        bodyValid = false;
      }
    }

    const statusOk = expectedStatus.includes(res.status);
    const status: ApiStatus =
      statusOk && bodyValid ? 'ok' : latencyMs > 3000 ? 'degraded' : 'error';

    return {
      apiId: id,
      apiName: name,
      category,
      status,
      statusCode: res.status,
      latencyMs,
      keyConfigured,
      keyless,
      checkedAt: new Date(),
      provides,
    };
  } catch (err: unknown) {
    clearTimeout(timeout);
    const latencyMs = Date.now() - start;
    const isTimeout = err instanceof Error && err.name === 'AbortError';
    return {
      apiId: id,
      apiName: name,
      category,
      status: 'error',
      latencyMs,
      error: isTimeout ? 'Timeout' : (err instanceof Error ? err.message : 'Unknown error'),
      keyConfigured,
      keyless,
      checkedAt: new Date(),
      provides,
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────

/** Check a single API by ID */
export async function checkApi(apiId: string): Promise<ApiHealthResult> {
  const entry = API_REGISTRY.find((a) => a.id === apiId);
  if (!entry) {
    return {
      apiId,
      apiName: apiId,
      category: 'unknown',
      status: 'unknown',
      keyConfigured: false,
      keyless: false,
      checkedAt: new Date(),
      provides: [],
      error: `API '${apiId}' not found in registry`,
    };
  }
  const result = await checkSingleApi(entry);
  await persistResult(result);
  return result;
}

/** Check all registered APIs in parallel (with concurrency cap) */
export async function checkAllApis(options?: {
  keylessOnly?: boolean;
  configuredOnly?: boolean;
  concurrency?: number;
}): Promise<ApiHealthSummary> {
  const { keylessOnly = false, configuredOnly = false, concurrency = 8 } = options ?? {};

  let targets: ApiEntry[];
  if (keylessOnly) targets = getKeylessApis();
  else if (configuredOnly) targets = getConfiguredApis();
  else targets = API_REGISTRY;

  // Run in batches to avoid hammering too many endpoints at once
  const results: ApiHealthResult[] = [];
  for (let i = 0; i < targets.length; i += concurrency) {
    const batch = targets.slice(i, i + concurrency);
    const batchResults = await Promise.all(batch.map(checkSingleApi));
    results.push(...batchResults);
  }

  // Persist all results
  await persistResults(results);

  return buildSummary(results);
}

/**
 * Auto-discovery: scan environment variables and detect which APIs from the
 * registry are configured. Returns a discovery report.
 */
export async function discoverConfiguredApis(): Promise<{
  discovered: ApiEntry[];
  keyless: ApiEntry[];
  unconfigured: ApiEntry[];
  capabilities: Record<string, string[]>;
}> {
  const discovered: ApiEntry[] = [];
  const keyless: ApiEntry[] = [];
  const unconfigured: ApiEntry[] = [];
  const capabilities: Record<string, string[]> = {};

  for (const entry of API_REGISTRY) {
    if (entry.keyless) {
      keyless.push(entry);
      for (const cap of entry.provides) {
        capabilities[cap] = [...(capabilities[cap] ?? []), entry.id];
      }
    } else if (entry.envKey && process.env[entry.envKey]) {
      discovered.push(entry);
      for (const cap of entry.provides) {
        capabilities[cap] = [...(capabilities[cap] ?? []), entry.id];
      }
    } else {
      unconfigured.push(entry);
    }
  }

  return { discovered, keyless, unconfigured, capabilities };
}

/**
 * Find the best available (configured + healthy) API for a given capability.
 * Runs a live health check on candidates.
 */
export async function findBestApiForCapability(capability: string): Promise<{
  api: ApiEntry | null;
  result: ApiHealthResult | null;
}> {
  const candidates = API_REGISTRY.filter(
    (a) =>
      a.provides.includes(capability) &&
      (a.keyless || (a.envKey && !!process.env[a.envKey]))
  );

  if (candidates.length === 0) return { api: null, result: null };

  // Check all candidates in parallel, return first healthy one
  const checks = await Promise.all(candidates.map(checkSingleApi));
  const healthy = checks.find((r) => r.status === 'ok');
  if (!healthy) return { api: candidates[0], result: checks[0] };

  const api = candidates.find((a) => a.id === healthy.apiId) ?? null;
  return { api, result: healthy };
}

// ─────────────────────────────────────────────────────────────────────────────
// MongoDB Persistence
// ─────────────────────────────────────────────────────────────────────────────

async function persistResult(result: ApiHealthResult): Promise<void> {
  try {
    const db = await getDb();
    await db.collection(API_HEALTH_COLLECTION).updateOne(
      { apiId: result.apiId },
      { $set: result },
      { upsert: true }
    );
  } catch {
    // Non-fatal — health checks should not break if DB is down
  }
}

async function persistResults(results: ApiHealthResult[]): Promise<void> {
  try {
    const db = await getDb();
    const ops = results.map((r) => ({
      updateOne: {
        filter: { apiId: r.apiId },
        update: { $set: r },
        upsert: true,
      },
    }));
    if (ops.length > 0) await db.collection(API_HEALTH_COLLECTION).bulkWrite(ops);
  } catch {
    // Non-fatal
  }
}

/** Get the last known health status of all APIs from MongoDB */
export async function getStoredHealthResults(): Promise<ApiHealthResult[]> {
  try {
    const db = await getDb();
    return db
      .collection<ApiHealthResult>(API_HEALTH_COLLECTION)
      .find({})
      .sort({ checkedAt: -1 })
      .toArray() as Promise<ApiHealthResult[]>;
  } catch {
    return [];
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function buildSummary(results: ApiHealthResult[]): ApiHealthSummary {
  return {
    total: results.length,
    ok: results.filter((r) => r.status === 'ok').length,
    degraded: results.filter((r) => r.status === 'degraded').length,
    error: results.filter((r) => r.status === 'error').length,
    unconfigured: results.filter((r) => r.status === 'unconfigured').length,
    results,
    checkedAt: new Date(),
  };
}
