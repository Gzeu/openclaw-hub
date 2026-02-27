/**
 * POST /api/tools/check
 * Body: { apiId?: string; mode?: 'all' | 'keyless' | 'configured' | 'discover' }
 *
 * GET  /api/tools/check
 * Returns last stored results from MongoDB (no live check)
 *
 * Examples:
 *   POST { "mode": "keyless" }         — check all keyless APIs
 *   POST { "mode": "configured" }      — check APIs with keys in env
 *   POST { "mode": "all" }             — check everything
 *   POST { "apiId": "groq" }           — check a single API
 *   POST { "mode": "discover" }        — scan env vars, return capability map
 *   GET                                — return cached results from DB
 */
import { NextRequest, NextResponse } from 'next/server';
import {
  checkApi,
  checkAllApis,
  discoverConfiguredApis,
  getStoredHealthResults,
} from '@/lib/api-checker';

export async function GET() {
  try {
    const results = await getStoredHealthResults();
    return NextResponse.json({ success: true, results, count: results.length });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: String(err) },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { apiId, mode = 'keyless' } = body as { apiId?: string; mode?: string };

    // Single API check
    if (apiId) {
      const result = await checkApi(apiId);
      return NextResponse.json({ success: true, result });
    }

    // Discovery mode — no live checks, just env scan
    if (mode === 'discover') {
      const discovery = await discoverConfiguredApis();
      return NextResponse.json({
        success: true,
        discovered: discovery.discovered.length,
        keyless: discovery.keyless.length,
        unconfigured: discovery.unconfigured.length,
        capabilities: discovery.capabilities,
        details: discovery,
      });
    }

    // Batch check modes
    const summary = await checkAllApis({
      keylessOnly: mode === 'keyless',
      configuredOnly: mode === 'configured',
      concurrency: 8,
    });

    return NextResponse.json({ success: true, summary });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: String(err) },
      { status: 500 }
    );
  }
}
