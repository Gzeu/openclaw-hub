/**
 * OpenClaw Skill Definitions
 * ────────────────────────────────────────────────────────────────────────────────
 * Every skill has:
 *   - id           → machine-readable slug used in task routing
 *   - name         → human label
 *   - description  → what the skill does
 *   - category     → grouping
 *   - inputs        → expected input fields
 *   - outputs       → what the skill returns
 *   - apiIds        → which APIs from the registry power this skill
 *   - example       → minimal usage example
 *   - costEstimate  → rough cost (free / low / medium)
 *   - avgLatencyMs  → expected execution time
 *   - agentTypes    → which agent types should advertise this skill
 */

export type SkillCategory =
  | 'ai'
  | 'search'
  | 'code'
  | 'blockchain'
  | 'defi'
  | 'data'
  | 'content'
  | 'economy'
  | 'utility';

export type CostEstimate = 'free' | 'low' | 'medium' | 'high';

export interface SkillInput {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  required: boolean;
  description: string;
  example?: string;
}

export interface SkillOutput {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  description: string;
}

export interface Skill {
  id: string;
  name: string;
  description: string;
  category: SkillCategory;
  inputs: SkillInput[];
  outputs: SkillOutput[];
  /** API IDs from api-registry.ts that power this skill */
  apiIds: string[];
  /** Minimal curl/JSON example */
  example: {
    endpoint: string;
    method: 'GET' | 'POST';
    body?: object;
  };
  costEstimate: CostEstimate;
  avgLatencyMs: number;
  /** Which agent types should advertise this skill */
  agentTypes: string[];
  /** Version of the skill spec */
  version: string;
}

// ────────────────────────────────────────────────────────────────────────────────
// SKILL CATALOG
// ────────────────────────────────────────────────────────────────────────────────

export const SKILLS: Skill[] = [

  // ── AI ─────────────────────────────────────────────────────────────────────────
  {
    id: 'ai_completion',
    name: 'AI Text Completion',
    description: 'Generate text, answer questions, summarize, or reason using large language models (Claude, GPT-4, Gemini, Mistral, Llama 3).',
    category: 'ai',
    inputs: [
      { name: 'prompt',     type: 'string', required: true,  description: 'The prompt or question to send to the LLM', example: 'Explain blockchain in simple terms' },
      { name: 'model',      type: 'string', required: false, description: 'Model to use (e.g. google/gemini-flash-1.5)', example: 'google/gemini-flash-1.5' },
      { name: 'max_tokens', type: 'number', required: false, description: 'Max tokens in the response', example: '1000' },
      { name: 'system',     type: 'string', required: false, description: 'System prompt / persona', example: 'You are a helpful assistant' },
    ],
    outputs: [
      { name: 'text',        type: 'string', description: 'The generated text response' },
      { name: 'tokens_used', type: 'number', description: 'Number of tokens consumed' },
      { name: 'model',       type: 'string', description: 'Model that was used' },
    ],
    apiIds: ['openrouter', 'groq', 'gemini', 'mistral'],
    example: { endpoint: '/api/analyst/analyze', method: 'POST', body: { prompt: 'Summarize this code: ...', type: 'ai_completion' } },
    costEstimate: 'low',
    avgLatencyMs: 1500,
    agentTypes: ['general', 'analyst', 'coder', 'researcher'],
    version: '1.0.0',
  },

  // ── Code ────────────────────────────────────────────────────────────────────
  {
    id: 'code_analysis',
    name: 'Code Analysis',
    description: 'Analyze TypeScript, JavaScript, Python, Rust, or Solidity code for bugs, security issues, quality improvements, and best practices.',
    category: 'code',
    inputs: [
      { name: 'code',     type: 'string', required: true,  description: 'Source code to analyze', example: 'function add(a, b) { return a + b; }' },
      { name: 'language', type: 'string', required: false, description: 'Programming language', example: 'typescript' },
      { name: 'focus',    type: 'string', required: false, description: 'What to focus on: bugs | security | performance | style', example: 'security' },
    ],
    outputs: [
      { name: 'issues',      type: 'array',  description: 'List of found issues with severity' },
      { name: 'suggestions', type: 'array',  description: 'Improvement suggestions' },
      { name: 'score',       type: 'number', description: 'Code quality score 0-100' },
      { name: 'summary',     type: 'string', description: 'Human-readable analysis summary' },
    ],
    apiIds: ['openrouter', 'groq', 'gemini'],
    example: { endpoint: '/api/analyst/analyze', method: 'POST', body: { type: 'code_analysis', code: '...', language: 'typescript' } },
    costEstimate: 'low',
    avgLatencyMs: 2000,
    agentTypes: ['coder', 'analyst', 'security'],
    version: '1.0.0',
  },

  {
    id: 'code_execution',
    name: 'Code Execution',
    description: 'Execute Node.js, Python, or Bash code in an isolated E2B cloud sandbox.',
    category: 'code',
    inputs: [
      { name: 'code',     type: 'string', required: true, description: 'Code to execute', example: 'print("Hello from agent!")' },
      { name: 'language', type: 'string', required: true, description: 'Runtime: node | python | bash', example: 'python' },
      { name: 'timeout',  type: 'number', required: false, description: 'Timeout in seconds (max 30)', example: '10' },
    ],
    outputs: [
      { name: 'stdout',           type: 'string', description: 'Standard output' },
      { name: 'stderr',           type: 'string', description: 'Standard error (if any)' },
      { name: 'exit_code',        type: 'number', description: '0 = success' },
      { name: 'execution_time_ms',type: 'number', description: 'Duration in ms' },
    ],
    apiIds: ['e2b'],
    example: { endpoint: '/api/sandbox/execute', method: 'POST', body: { code: 'print(2 + 2)', language: 'python' } },
    costEstimate: 'free',
    avgLatencyMs: 3000,
    agentTypes: ['coder', 'data_scientist', 'general'],
    version: '1.0.0',
  },

  {
    id: 'package_lookup',
    name: 'Package Registry Lookup',
    description: 'Look up npm packages — versions, dependencies, download stats, repository info.',
    category: 'code',
    inputs: [
      { name: 'package',  type: 'string', required: true,  description: 'Package name', example: 'next' },
      { name: 'registry', type: 'string', required: false, description: 'npm | pypi', example: 'npm' },
    ],
    outputs: [
      { name: 'name',        type: 'string', description: 'Package name' },
      { name: 'version',     type: 'string', description: 'Latest version' },
      { name: 'description', type: 'string', description: 'Package description' },
      { name: 'downloads',   type: 'number', description: 'Weekly download count' },
    ],
    apiIds: ['npm_registry'],
    example: { endpoint: '/api/tools/integrate', method: 'POST', body: { capability: 'package_lookup' } },
    costEstimate: 'free',
    avgLatencyMs: 300,
    agentTypes: ['coder', 'analyst', 'general'],
    version: '1.0.0',
  },

  // ── Search ──────────────────────────────────────────────────────────────────
  {
    id: 'web_search',
    name: 'Web Search',
    description: 'Search the web for current information, news, or research. Uses Tavily, Brave, Serper, or DuckDuckGo.',
    category: 'search',
    inputs: [
      { name: 'query',           type: 'string',  required: true,  description: 'Search query', example: 'MultiversX EGLD price 2026' },
      { name: 'max_results',     type: 'number',  required: false, description: 'Number of results (1-10)', example: '5' },
      { name: 'include_content', type: 'boolean', required: false, description: 'Include full page content', example: 'false' },
    ],
    outputs: [
      { name: 'results', type: 'array',  description: 'Array of { title, url, snippet, content? }' },
      { name: 'query',   type: 'string', description: 'The original query' },
      { name: 'source',  type: 'string', description: 'Which search API was used' },
    ],
    apiIds: ['tavily', 'brave_search', 'serper', 'duckduckgo'],
    example: { endpoint: '/api/tools/integrate', method: 'POST', body: { capability: 'web_search', query: 'latest AI agent news' } },
    costEstimate: 'free',
    avgLatencyMs: 800,
    agentTypes: ['researcher', 'general', 'analyst'],
    version: '1.0.0',
  },

  {
    id: 'web_scraping',
    name: 'Web Scraping & Content Extraction',
    description: 'Extract clean text/markdown from any URL. Uses Jina Reader (keyless) or Firecrawl.',
    category: 'content',
    inputs: [
      { name: 'url',    type: 'string', required: true,  description: 'URL to scrape', example: 'https://example.com/article' },
      { name: 'format', type: 'string', required: false, description: 'markdown | text | html', example: 'markdown' },
    ],
    outputs: [
      { name: 'content', type: 'string', description: 'Extracted content' },
      { name: 'title',   type: 'string', description: 'Page title' },
      { name: 'url',     type: 'string', description: 'Canonical URL' },
    ],
    apiIds: ['jina_reader', 'firecrawl'],
    example: { endpoint: '/api/tools/integrate', method: 'POST', body: { capability: 'web_scraping' } },
    costEstimate: 'free',
    avgLatencyMs: 2000,
    agentTypes: ['researcher', 'data_scientist', 'general'],
    version: '1.0.0',
  },

  // ── Blockchain ───────────────────────────────────────────────────────────────
  {
    id: 'multiversx_query',
    name: 'MultiversX Blockchain Query',
    description: 'Query MultiversX devnet or mainnet for wallet balances, transactions, ESDT tokens, smart contract state, and network stats.',
    category: 'blockchain',
    inputs: [
      { name: 'type',    type: 'string', required: true,  description: 'balance | transactions | tokens | network | contract', example: 'balance' },
      { name: 'address', type: 'string', required: false, description: 'MVX wallet address (erd1...)', example: 'erd1qqqqqq...' },
      { name: 'network', type: 'string', required: false, description: 'devnet | mainnet', example: 'devnet' },
    ],
    outputs: [
      { name: 'data',    type: 'object', description: 'Query result from MultiversX API' },
      { name: 'network', type: 'string', description: 'Network queried' },
    ],
    apiIds: ['multiversx_devnet', 'multiversx_mainnet'],
    example: { endpoint: '/api/wallet/balance', method: 'GET' },
    costEstimate: 'free',
    avgLatencyMs: 500,
    agentTypes: ['blockchain', 'economy', 'general'],
    version: '1.0.0',
  },

  {
    id: 'crypto_prices',
    name: 'Crypto Price Lookup',
    description: 'Get real-time cryptocurrency prices, market caps, and trading volumes. CoinGecko and CoinCap are keyless.',
    category: 'blockchain',
    inputs: [
      { name: 'coin',        type: 'string', required: true,  description: 'Coin ID or symbol (e.g. elrond-erd-2)', example: 'elrond-erd-2' },
      { name: 'vs_currency', type: 'string', required: false, description: 'Currency: usd | eur | btc', example: 'usd' },
    ],
    outputs: [
      { name: 'price',      type: 'number', description: 'Current price' },
      { name: 'market_cap', type: 'number', description: 'Market capitalization' },
      { name: 'change_24h', type: 'number', description: '24h price change %' },
    ],
    apiIds: ['coingecko', 'coincap'],
    example: { endpoint: '/api/tools/integrate', method: 'POST', body: { capability: 'crypto_prices' } },
    costEstimate: 'free',
    avgLatencyMs: 400,
    agentTypes: ['blockchain', 'economy', 'analyst'],
    version: '1.0.0',
  },

  // ── DeFi ────────────────────────────────────────────────────────────────────────
  {
    id: 'defi_swap',
    name: 'DeFi Token Swap (xExchange)',
    description:
      'Build an unsigned ESDT token swap transaction on xExchange (MultiversX DEX). ' +
      'Returns a ready-to-sign ACP sc_call tx. ' +
      'Same mechanism used by Max (MultiversX autonomous agent) for onchain DeFi execution.',
    category: 'defi',
    inputs: [
      { name: 'sender',   type: 'string', required: true,  description: 'erd1 sender wallet address', example: 'erd1...' },
      { name: 'tokenIn',  type: 'string', required: true,  description: 'ESDT identifier to swap FROM (use WEGLD for EGLD swaps)', example: 'WEGLD-bd4d79' },
      { name: 'tokenOut', type: 'string', required: true,  description: 'ESDT identifier to swap TO', example: 'MEX-455c57' },
      { name: 'amountIn', type: 'string', required: true,  description: 'Human-readable amount e.g. "0.5"', example: '0.5' },
      { name: 'slippage', type: 'number', required: false, description: 'Slippage tolerance % (0.1-50), default 1', example: '1' },
    ],
    outputs: [
      { name: 'quote',         type: 'object', description: 'Swap quote with amountOutMin, priceImpact, ratioHuman' },
      { name: 'tx',            type: 'object', description: 'Unsigned ACP sc_call tx — sign + POST to /api/acp/broadcast' },
      { name: 'meta',          type: 'object', description: 'Network info, instructions, warning if devnet' },
    ],
    apiIds: ['multiversx_devnet', 'multiversx_mainnet'],
    example: {
      endpoint: '/api/skills/execute/defi-swap',
      method: 'POST',
      body: {
        sender:   'erd1...',
        tokenIn:  'WEGLD-bd4d79',
        tokenOut: 'MEX-455c57',
        amountIn: '0.5',
        slippage: 1,
      },
    },
    costEstimate: 'low',
    avgLatencyMs: 800,
    agentTypes: ['blockchain', 'economy', 'defi', 'general'],
    version: '1.0.0',
  },

  // ── Data ─────────────────────────────────────────────────────────────────────────
  {
    id: 'knowledge_lookup',
    name: 'Knowledge Lookup',
    description: 'Retrieve factual information from Wikipedia or Wikidata. Completely keyless.',
    category: 'data',
    inputs: [
      { name: 'query',    type: 'string', required: true,  description: 'Topic or entity to look up', example: 'MultiversX blockchain' },
      { name: 'language', type: 'string', required: false, description: 'Wikipedia language code', example: 'en' },
    ],
    outputs: [
      { name: 'summary', type: 'string', description: 'Short summary of the topic' },
      { name: 'url',     type: 'string', description: 'Wikipedia article URL' },
      { name: 'extract', type: 'string', description: 'Full article extract' },
    ],
    apiIds: ['wikipedia'],
    example: { endpoint: '/api/tools/integrate', method: 'POST', body: { capability: 'knowledge_lookup' } },
    costEstimate: 'free',
    avgLatencyMs: 300,
    agentTypes: ['researcher', 'general', 'analyst'],
    version: '1.0.0',
  },

  {
    id: 'weather_data',
    name: 'Weather Data',
    description: 'Get current weather and forecasts for any location. Open Meteo is completely free and keyless.',
    category: 'data',
    inputs: [
      { name: 'latitude',  type: 'number', required: true,  description: 'Latitude',           example: '44.43' },
      { name: 'longitude', type: 'number', required: true,  description: 'Longitude',          example: '26.10' },
      { name: 'days',      type: 'number', required: false, description: 'Forecast days (1-16)', example: '3' },
    ],
    outputs: [
      { name: 'current',  type: 'object', description: 'Current weather (temp, wind, code)' },
      { name: 'forecast', type: 'array',  description: 'Daily forecast array' },
    ],
    apiIds: ['open_meteo'],
    example: { endpoint: '/api/tools/integrate', method: 'POST', body: { capability: 'weather_data' } },
    costEstimate: 'free',
    avgLatencyMs: 300,
    agentTypes: ['general', 'utility'],
    version: '1.0.0',
  },

  // ── Economy ────────────────────────────────────────────────────────────────────
  {
    id: 'task_execution',
    name: 'Task Execution (Agent Economy)',
    description: 'Accept and execute bounty tasks from TheColony or OpenTask. Earn EGLD on completion.',
    category: 'economy',
    inputs: [
      { name: 'task_id',  type: 'string', required: true, description: 'Task ID', example: 'task_abc123' },
      { name: 'platform', type: 'string', required: true, description: 'thecolony | opentask', example: 'thecolony' },
      { name: 'payload',  type: 'object', required: true, description: 'Task-specific input data' },
    ],
    outputs: [
      { name: 'result',        type: 'object', description: 'Task execution result' },
      { name: 'earnings_egld', type: 'number', description: 'EGLD earned' },
      { name: 'task_id',       type: 'string', description: 'Task ID for claim verification' },
    ],
    apiIds: ['thecolony', 'opentask'],
    example: { endpoint: '/api/agents/loop', method: 'POST', body: { agentId: 'openclaw-main' } },
    costEstimate: 'free',
    avgLatencyMs: 5000,
    agentTypes: ['economy', 'general', 'analyst', 'coder'],
    version: '1.0.0',
  },

  // ── Utility ────────────────────────────────────────────────────────────────────
  {
    id: 'ip_lookup',
    name: 'IP Geolocation',
    description: 'Get country, city, timezone, and ISP information for any IP address.',
    category: 'utility',
    inputs: [{ name: 'ip', type: 'string', required: true, description: 'IPv4 address', example: '8.8.8.8' }],
    outputs: [
      { name: 'country',  type: 'string', description: 'Country name' },
      { name: 'city',     type: 'string', description: 'City name' },
      { name: 'timezone', type: 'string', description: 'Timezone string' },
      { name: 'org',      type: 'string', description: 'ISP / organization' },
    ],
    apiIds: ['ipapi'],
    example: { endpoint: '/api/tools/integrate', method: 'POST', body: { capability: 'ip_lookup' } },
    costEstimate: 'free',
    avgLatencyMs: 300,
    agentTypes: ['utility', 'security', 'general'],
    version: '1.0.0',
  },

  {
    id: 'qr_generation',
    name: 'QR Code Generation',
    description: 'Generate QR codes from any text or URL. Completely keyless.',
    category: 'utility',
    inputs: [
      { name: 'data', type: 'string', required: true,  description: 'Text or URL to encode', example: 'https://openclaw-hub.vercel.app' },
      { name: 'size', type: 'number', required: false, description: 'Size in pixels', example: '200' },
    ],
    outputs: [{ name: 'image_url', type: 'string', description: 'URL to the generated QR code PNG' }],
    apiIds: ['qrcode'],
    example: { endpoint: '/api/tools/integrate', method: 'POST', body: { capability: 'qr_generation' } },
    costEstimate: 'free',
    avgLatencyMs: 200,
    agentTypes: ['utility', 'general'],
    version: '1.0.0',
  },
];

// ────────────────────────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────────────────────────

export function getSkillById(id: string): Skill | undefined {
  return SKILLS.find((s) => s.id === id);
}

export function getSkillsByCategory(category: SkillCategory): Skill[] {
  return SKILLS.filter((s) => s.category === category);
}

export function getSkillsByAgentType(agentType: string): Skill[] {
  return SKILLS.filter((s) => s.agentTypes.includes(agentType));
}

export function getFreeSkills(): Skill[] {
  return SKILLS.filter((s) => s.costEstimate === 'free');
}

export function getSkillIds(): string[] {
  return SKILLS.map((s) => s.id);
}

/** Returns a compact skill manifest — suitable for sending to other agents */
export function getSkillManifest(agentId = 'openclaw-main') {
  return {
    agent:    agentId,
    platform: 'openclaw-hub',
    version:  '1.0.0',
    skills: SKILLS.map((s) => ({
      id:           s.id,
      name:         s.name,
      category:     s.category,
      costEstimate: s.costEstimate,
      avgLatencyMs: s.avgLatencyMs,
      inputs:  s.inputs.map((i)  => ({ name: i.name, type: i.type, required: i.required })),
      outputs: s.outputs.map((o) => ({ name: o.name, type: o.type })),
    })),
    endpoints: {
      skill_manifest: '/api/skills',
      skill_match:    '/api/skills (POST)',
      health_check:   '/api/agents/status',
      task_trigger:   '/api/agents/loop',
      webhook:        '/api/agents/webhook',
      analyst:        '/api/analyst/analyze',
      sandbox:        '/api/sandbox/execute',
      acp_build:      '/api/acp',
      acp_broadcast:  '/api/acp/broadcast',
      defi_swap:      '/api/skills/execute/defi-swap',
      mcp:            '/api/mcp',
      mcp_discovery:  '/.well-known/mcp',
    },
  };
}
