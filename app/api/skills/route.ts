/**
 * GET  /api/skills
 *   Returns the full skill manifest (machine-readable JSON)
 *   Optional query params:
 *     ?category=ai|search|code|blockchain|data|content|economy|utility
 *     ?agentType=general|coder|analyst|researcher|blockchain|economy|security
 *     ?free=true — only free skills
 *     ?id=code_analysis — single skill by ID
 *     ?format=compact — minimal manifest for inter-agent communication
 *
 * POST /api/skills
 *   Body: { task: string } — uses LLM-free keyword matching to suggest skills
 *
 * x402: All responses include X-402-* headers advertising EGLD pricing.
 *   Free skills advertise X-402-Price-EGLD: 0
 *   Non-free skills advertise their costEstimate mapped to EGLD.
 *   Actual payment: POST /api/acp with { action: 'pay_skill', skillId, priceEgld, sender }
 */
import { NextRequest, NextResponse } from 'next/server';
import {
  SKILLS,
  getSkillById,
  getSkillsByCategory,
  getSkillsByAgentType,
  getFreeSkills,
  getSkillManifest,
  SkillCategory,
} from '@/lib/skills';
import { MVX_NETWORK } from '@/lib/multiversx';

// ---------------------------------------------------------------------------
// x402 helpers
// ---------------------------------------------------------------------------
const COST_TO_EGLD: Record<string, string> = {
  free:   '0',
  low:    '0.0001',
  medium: '0.001',
  high:   '0.01',
}

function x402Headers(priceEgld = '0'): Record<string, string> {
  const receiver = process.env.MVX_WALLET_ADDRESS ?? ''
  return {
    'X-402-Version':       '1',
    'X-402-Currency':      'EGLD',
    'X-402-Network':       MVX_NETWORK,
    'X-402-Receiver':      receiver,
    'X-402-Price-EGLD':    priceEgld,
    'X-402-Pay-Endpoint':  '/api/acp',
    'X-402-Pay-Action':    'pay_skill',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Expose-Headers':
      'X-402-Version, X-402-Currency, X-402-Network, X-402-Receiver, X-402-Price-EGLD, X-402-Pay-Endpoint, X-402-Pay-Action',
  }
}

// ---------------------------------------------------------------------------
// Handlers
// ---------------------------------------------------------------------------
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category') as SkillCategory | null;
  const agentType = searchParams.get('agentType');
  const freeOnly  = searchParams.get('free') === 'true';
  const id        = searchParams.get('id');
  const format    = searchParams.get('format');
  const agentId   = searchParams.get('agentId') ?? 'openclaw-main';

  // Single skill lookup
  if (id) {
    const skill = getSkillById(id);
    if (!skill) {
      return NextResponse.json(
        { success: false, error: `Skill '${id}' not found` },
        { status: 404, headers: x402Headers('0') }
      );
    }
    const price = COST_TO_EGLD[skill.costEstimate] ?? '0';
    return NextResponse.json(
      { success: true, skill },
      { headers: { ...x402Headers(price), 'X-402-Skill-Id': id } }
    );
  }

  // Compact manifest
  if (format === 'compact') {
    return NextResponse.json(
      getSkillManifest(agentId),
      { headers: x402Headers('0') }
    );
  }

  // Filtered list
  let skills = SKILLS;
  if (category) skills = getSkillsByCategory(category);
  if (agentType) skills = getSkillsByAgentType(agentType);
  if (freeOnly)  skills = getFreeSkills();

  // Compute average price for x402 header (lowest non-zero price in result set)
  const prices   = skills.map(s => parseFloat(COST_TO_EGLD[s.costEstimate] ?? '0')).filter(p => p > 0);
  const minPrice = prices.length > 0 ? Math.min(...prices).toFixed(4) : '0';

  return NextResponse.json(
    {
      success:  true,
      total:    skills.length,
      platform: 'openclaw-hub',
      version:  '1.0.0',
      skills,
    },
    { headers: x402Headers(minPrice) }
  );
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { task } = body as { task: string };

    if (!task || typeof task !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Missing required field: task (string)' },
        { status: 400, headers: x402Headers('0') }
      );
    }

    const keywords: Record<string, string[]> = {
      ai_completion:    ['generate', 'write', 'explain', 'summarize', 'translate', 'answer', 'create text', 'llm', 'gpt', 'claude', 'gemini'],
      code_analysis:    ['analyze code', 'review code', 'bug', 'security', 'audit', 'lint', 'refactor', 'typescript', 'javascript', 'python', 'rust'],
      code_execution:   ['run', 'execute', 'sandbox', 'script', 'compute', 'calculate', 'bash', 'node', 'python script'],
      web_search:       ['search', 'find', 'look up', 'google', 'news', 'latest', 'current', 'today', 'recent'],
      web_scraping:     ['scrape', 'extract', 'fetch url', 'read page', 'website content', 'article', 'crawl'],
      multiversx_query: ['multiversx', 'egld', 'erd1', 'wallet balance', 'mvx', 'elrond', 'transaction history', 'smart contract'],
      crypto_prices:    ['price', 'bitcoin', 'ethereum', 'crypto', 'coin', 'token price', 'market cap', 'coingecko'],
      knowledge_lookup: ['what is', 'who is', 'definition', 'wikipedia', 'history', 'explain concept', 'fact'],
      weather_data:     ['weather', 'temperature', 'forecast', 'rain', 'wind', 'climate'],
      task_execution:   ['task', 'bounty', 'colony', 'opentask', 'earn', 'job', 'work loop'],
      ip_lookup:        ['ip address', 'geolocation', 'where is ip', 'isp', 'location of'],
      qr_generation:    ['qr code', 'qr', 'barcode', 'generate qr'],
      package_lookup:   ['npm', 'package', 'library', 'module', 'dependency', 'pypi', 'version of'],
    };

    const taskLower = task.toLowerCase();
    const matches: Array<{ skillId: string; score: number; skill: typeof SKILLS[0] }> = [];

    for (const [skillId, kws] of Object.entries(keywords)) {
      const score = kws.filter((kw) => taskLower.includes(kw)).length;
      if (score > 0) {
        const skill = getSkillById(skillId);
        if (skill) matches.push({ skillId, score, skill });
      }
    }

    matches.sort((a, b) => b.score - a.score);

    const topPrice = matches.length > 0
      ? (COST_TO_EGLD[matches[0].skill.costEstimate] ?? '0')
      : '0';

    return NextResponse.json(
      {
        success:     true,
        task,
        matched:     matches.length,
        suggestions: matches.map((m) => ({
          id:           m.skillId,
          name:         m.skill.name,
          score:        m.score,
          costEstimate: m.skill.costEstimate,
          priceEgld:    COST_TO_EGLD[m.skill.costEstimate] ?? '0',
          avgLatencyMs: m.skill.avgLatencyMs,
          endpoint:     m.skill.example.endpoint,
          payWith:      {
            action:   'pay_skill',
            skillId:  m.skillId,
            priceEgld: COST_TO_EGLD[m.skill.costEstimate] ?? '0',
            endpoint: '/api/acp',
          },
        })),
      },
      { headers: { ...x402Headers(topPrice), 'X-402-Matched-Skills': String(matches.length) } }
    );
  } catch (err) {
    return NextResponse.json(
      { success: false, error: String(err) },
      { status: 500, headers: x402Headers('0') }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      ...x402Headers('0'),
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
