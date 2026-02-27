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
 * POST /api/skills/match
 *   Body: { task: string } — uses LLM-free keyword matching to suggest skills
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

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category') as SkillCategory | null;
  const agentType = searchParams.get('agentType');
  const freeOnly = searchParams.get('free') === 'true';
  const id = searchParams.get('id');
  const format = searchParams.get('format');
  const agentId = searchParams.get('agentId') ?? 'openclaw-main';

  // Single skill lookup
  if (id) {
    const skill = getSkillById(id);
    if (!skill) {
      return NextResponse.json({ success: false, error: `Skill '${id}' not found` }, { status: 404 });
    }
    return NextResponse.json({ success: true, skill });
  }

  // Compact manifest for inter-agent communication
  if (format === 'compact') {
    return NextResponse.json(getSkillManifest(agentId));
  }

  // Filter
  let skills = SKILLS;
  if (category) skills = getSkillsByCategory(category);
  if (agentType) skills = getSkillsByAgentType(agentType);
  if (freeOnly) skills = getFreeSkills();

  return NextResponse.json({
    success: true,
    total: skills.length,
    platform: 'openclaw-hub',
    version: '1.0.0',
    skills,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { task } = body as { task: string };

    if (!task || typeof task !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Missing required field: task (string)' },
        { status: 400 }
      );
    }

    // Keyword-based skill matching (no LLM needed, instant)
    const keywords: Record<string, string[]> = {
      ai_completion: ['generate', 'write', 'explain', 'summarize', 'translate', 'answer', 'create text', 'llm', 'gpt', 'claude', 'gemini'],
      code_analysis: ['analyze code', 'review code', 'bug', 'security', 'audit', 'lint', 'refactor', 'typescript', 'javascript', 'python', 'rust'],
      code_execution: ['run', 'execute', 'sandbox', 'script', 'compute', 'calculate', 'bash', 'node', 'python script'],
      web_search: ['search', 'find', 'look up', 'google', 'news', 'latest', 'current', 'today', 'recent'],
      web_scraping: ['scrape', 'extract', 'fetch url', 'read page', 'website content', 'article', 'crawl'],
      multiversx_query: ['multiversx', 'egld', 'erd1', 'wallet balance', 'mvx', 'elrond', 'transaction history', 'smart contract'],
      crypto_prices: ['price', 'bitcoin', 'ethereum', 'crypto', 'coin', 'token price', 'market cap', 'coingecko'],
      knowledge_lookup: ['what is', 'who is', 'definition', 'wikipedia', 'history', 'explain concept', 'fact'],
      weather_data: ['weather', 'temperature', 'forecast', 'rain', 'wind', 'climate'],
      task_execution: ['task', 'bounty', 'colony', 'opentask', 'earn', 'job', 'work loop'],
      ip_lookup: ['ip address', 'geolocation', 'where is ip', 'isp', 'location of'],
      qr_generation: ['qr code', 'qr', 'barcode', 'generate qr'],
      package_lookup: ['npm', 'package', 'library', 'module', 'dependency', 'pypi', 'version of'],
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

    return NextResponse.json({
      success: true,
      task,
      matched: matches.length,
      suggestions: matches.map((m) => ({
        id: m.skillId,
        name: m.skill.name,
        score: m.score,
        costEstimate: m.skill.costEstimate,
        avgLatencyMs: m.skill.avgLatencyMs,
        endpoint: m.skill.example.endpoint,
      })),
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
