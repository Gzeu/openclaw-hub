/**
 * POST /api/tools/integrate
 * Body: { capability: string }
 *
 * Finds the best available (configured + alive) API for a given capability,
 * runs a live health check, and returns the API to use + how to call it.
 *
 * Example:
 *   POST { "capability": "web_search" }
 *   → { api: "tavily", status: "ok", latencyMs: 340, howToCall: { ... } }
 */
import { NextRequest, NextResponse } from 'next/server';
import { findBestApiForCapability } from '@/lib/api-checker';
import { API_REGISTRY } from '@/lib/api-registry';

export async function POST(req: NextRequest) {
  try {
    const { capability } = await req.json();

    if (!capability || typeof capability !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Missing required field: capability' },
        { status: 400 }
      );
    }

    const { api, result } = await findBestApiForCapability(capability);

    if (!api || !result) {
      // Return all APIs that provide this capability so the user knows what to configure
      const allCandidates = API_REGISTRY.filter((a) => a.provides.includes(capability));
      return NextResponse.json({
        success: false,
        capability,
        message: `No configured or keyless API found for capability: ${capability}`,
        availableApis: allCandidates.map((a) => ({
          id: a.id,
          name: a.name,
          envKey: a.envKey,
          keyless: a.keyless,
          freeTier: a.freeTier,
          docsUrl: a.docsUrl,
        })),
      });
    }

    return NextResponse.json({
      success: true,
      capability,
      api: {
        id: api.id,
        name: api.name,
        category: api.category,
        url: api.url,
        authType: api.authType,
        envKey: api.envKey,
        keyless: api.keyless,
      },
      health: {
        status: result.status,
        latencyMs: result.latencyMs,
        statusCode: result.statusCode,
      },
      howToCall: buildCallGuide(api),
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: String(err) },
      { status: 500 }
    );
  }
}

function buildCallGuide(api: (typeof API_REGISTRY)[0]) {
  const guides: Record<string, object> = {
    openrouter: {
      endpoint: 'https://openrouter.ai/api/v1/chat/completions',
      method: 'POST',
      headers: { Authorization: 'Bearer $OPENROUTER_API_KEY', 'Content-Type': 'application/json' },
      body: { model: 'google/gemini-flash-1.5', messages: [{ role: 'user', content: '...' }] },
    },
    groq: {
      endpoint: 'https://api.groq.com/openai/v1/chat/completions',
      method: 'POST',
      headers: { Authorization: 'Bearer $GROQ_API_KEY', 'Content-Type': 'application/json' },
      body: { model: 'llama3-8b-8192', messages: [{ role: 'user', content: '...' }] },
    },
    gemini: {
      endpoint:
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=$GEMINI_API_KEY',
      method: 'POST',
      body: { contents: [{ parts: [{ text: '...' }] }] },
    },
    tavily: {
      endpoint: 'https://api.tavily.com/search',
      method: 'POST',
      headers: { 'api-key': '$TAVILY_API_KEY', 'Content-Type': 'application/json' },
      body: { query: '...', search_depth: 'basic', max_results: 5 },
    },
    brave_search: {
      endpoint: 'https://api.search.brave.com/res/v1/web/search?q={query}',
      method: 'GET',
      headers: { 'X-Subscription-Token': '$BRAVE_SEARCH_API_KEY', Accept: 'application/json' },
    },
    serper: {
      endpoint: 'https://google.serper.dev/search',
      method: 'POST',
      headers: { 'X-API-KEY': '$SERPER_API_KEY', 'Content-Type': 'application/json' },
      body: { q: '...' },
    },
    duckduckgo: {
      endpoint: 'https://api.duckduckgo.com/?q={query}&format=json&no_html=1',
      method: 'GET',
      note: 'No API key required',
    },
    jina_reader: {
      endpoint: 'https://r.jina.ai/{url_to_scrape}',
      method: 'GET',
      note: 'No API key required. Just prepend r.jina.ai/ to any URL.',
    },
    wikipedia: {
      endpoint: 'https://en.wikipedia.org/api/rest_v1/page/summary/{title}',
      method: 'GET',
      note: 'No API key required',
    },
    coingecko: {
      endpoint: 'https://api.coingecko.com/api/v3/simple/price?ids={coin_id}&vs_currencies=usd',
      method: 'GET',
      note: 'No API key required for basic endpoints',
    },
    multiversx_devnet: {
      endpoint: 'https://devnet-api.multiversx.com/accounts/{address}',
      method: 'GET',
      note: 'No API key required',
    },
    github: {
      endpoint: 'https://api.github.com/repos/{owner}/{repo}',
      method: 'GET',
      headers: { Authorization: 'Bearer $GITHUB_TOKEN', 'User-Agent': 'OpenClaw-Hub' },
      note: '60 req/hr without token, 5000/hr with token',
    },
  };

  return (
    guides[api.id] ?? {
      endpoint: api.check.url,
      method: api.check.method ?? 'GET',
      authType: api.authType,
      envKey: api.envKey,
      note: `See docs at ${api.docsUrl}`,
    }
  );
}
