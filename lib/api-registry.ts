/**
 * API Registry — catalog of all known free APIs available to OpenClaw agents.
 * Each entry defines how to health-check the API and what capabilities it provides.
 */

export type ApiCategory =
  | 'ai_llm'
  | 'search'
  | 'scraping'
  | 'data'
  | 'blockchain'
  | 'code'
  | 'storage'
  | 'utility'
  | 'agent_economy';

export type ApiAuthType = 'none' | 'api_key_header' | 'api_key_query' | 'bearer' | 'basic';

export interface ApiCheckConfig {
  /** The URL to GET/POST for a health check */
  url: string;
  method?: 'GET' | 'POST';
  /** Static headers (e.g. Authorization placeholder) */
  headers?: Record<string, string>;
  /** Expected HTTP status codes that count as "alive" */
  expectedStatus?: number[];
  /** Optional: a JSON path key that should exist in the response body */
  bodyKey?: string;
  /** Timeout in milliseconds */
  timeoutMs?: number;
}

export interface ApiEntry {
  id: string;
  name: string;
  description: string;
  category: ApiCategory;
  url: string;
  docsUrl: string;
  authType: ApiAuthType;
  /** Env var name that holds the API key (if any) */
  envKey?: string;
  freeTier: string;
  /** Whether this API works without any key at all */
  keyless: boolean;
  /** Health check configuration */
  check: ApiCheckConfig;
  /** OpenClaw capability tags this API provides */
  provides: string[];
}

// ─────────────────────────────────────────────────────────────────────────────
// REGISTRY
// ─────────────────────────────────────────────────────────────────────────────

export const API_REGISTRY: ApiEntry[] = [
  // ── AI / LLM ──────────────────────────────────────────────────────────────
  {
    id: 'openrouter',
    name: 'OpenRouter',
    description: 'Access 100+ AI models (Claude, GPT-4, Gemini, Mistral) via one API',
    category: 'ai_llm',
    url: 'https://openrouter.ai/api/v1',
    docsUrl: 'https://openrouter.ai/docs',
    authType: 'bearer',
    envKey: 'OPENROUTER_API_KEY',
    freeTier: '$5 free credits on signup',
    keyless: false,
    check: {
      url: 'https://openrouter.ai/api/v1/models',
      expectedStatus: [200, 401],
      timeoutMs: 5000,
    },
    provides: ['ai_completion', 'ai_chat', 'code_analysis', 'summarization'],
  },
  {
    id: 'groq',
    name: 'Groq',
    description: 'Ultra-fast LLM inference — Llama 3, Mixtral, Gemma',
    category: 'ai_llm',
    url: 'https://api.groq.com/openai/v1',
    docsUrl: 'https://console.groq.com/docs',
    authType: 'bearer',
    envKey: 'GROQ_API_KEY',
    freeTier: 'Free tier with rate limits',
    keyless: false,
    check: {
      url: 'https://api.groq.com/openai/v1/models',
      expectedStatus: [200, 401],
      timeoutMs: 5000,
    },
    provides: ['ai_completion', 'ai_chat', 'fast_inference'],
  },
  {
    id: 'gemini',
    name: 'Google Gemini',
    description: 'Gemini 1.5 Flash/Pro — multimodal AI by Google',
    category: 'ai_llm',
    url: 'https://generativelanguage.googleapis.com/v1beta',
    docsUrl: 'https://aistudio.google.com',
    authType: 'api_key_query',
    envKey: 'GEMINI_API_KEY',
    freeTier: 'Free tier available',
    keyless: false,
    check: {
      url: 'https://generativelanguage.googleapis.com/v1beta/models?key=test',
      expectedStatus: [200, 400, 403],
      timeoutMs: 5000,
    },
    provides: ['ai_completion', 'ai_chat', 'vision', 'summarization'],
  },
  {
    id: 'mistral',
    name: 'Mistral AI',
    description: 'Mistral 7B, Mixtral 8x7B — European open models',
    category: 'ai_llm',
    url: 'https://api.mistral.ai/v1',
    docsUrl: 'https://docs.mistral.ai',
    authType: 'bearer',
    envKey: 'MISTRAL_API_KEY',
    freeTier: 'Free tier available',
    keyless: false,
    check: {
      url: 'https://api.mistral.ai/v1/models',
      expectedStatus: [200, 401],
      timeoutMs: 5000,
    },
    provides: ['ai_completion', 'ai_chat'],
  },
  {
    id: 'cohere',
    name: 'Cohere',
    description: 'Command R+ for RAG, embeddings, reranking',
    category: 'ai_llm',
    url: 'https://api.cohere.com/v1',
    docsUrl: 'https://docs.cohere.com',
    authType: 'bearer',
    envKey: 'COHERE_API_KEY',
    freeTier: 'Free trial tier',
    keyless: false,
    check: {
      url: 'https://api.cohere.com/v1/check-api-key',
      method: 'POST',
      expectedStatus: [200, 401],
      timeoutMs: 5000,
    },
    provides: ['ai_completion', 'embeddings', 'reranking'],
  },

  // ── Search ─────────────────────────────────────────────────────────────────
  {
    id: 'tavily',
    name: 'Tavily Search',
    description: 'AI-optimized web search — best for AI agents',
    category: 'search',
    url: 'https://api.tavily.com',
    docsUrl: 'https://docs.tavily.com',
    authType: 'api_key_header',
    envKey: 'TAVILY_API_KEY',
    freeTier: '1,000 searches/month free',
    keyless: false,
    check: {
      url: 'https://api.tavily.com/search',
      method: 'POST',
      expectedStatus: [200, 400, 401, 422],
      timeoutMs: 8000,
    },
    provides: ['web_search', 'news_search'],
  },
  {
    id: 'brave_search',
    name: 'Brave Search',
    description: 'Privacy-first web search API',
    category: 'search',
    url: 'https://api.search.brave.com/res/v1',
    docsUrl: 'https://api.search.brave.com/app/documentation',
    authType: 'api_key_header',
    envKey: 'BRAVE_SEARCH_API_KEY',
    freeTier: '2,000 queries/month free',
    keyless: false,
    check: {
      url: 'https://api.search.brave.com/res/v1/web/search?q=test',
      expectedStatus: [200, 401, 403],
      timeoutMs: 5000,
    },
    provides: ['web_search'],
  },
  {
    id: 'serper',
    name: 'Serper.dev',
    description: 'Google Search JSON API',
    category: 'search',
    url: 'https://google.serper.dev',
    docsUrl: 'https://serper.dev/docs',
    authType: 'api_key_header',
    envKey: 'SERPER_API_KEY',
    freeTier: '2,500 free searches',
    keyless: false,
    check: {
      url: 'https://google.serper.dev/search',
      method: 'POST',
      expectedStatus: [200, 400, 401],
      timeoutMs: 5000,
    },
    provides: ['web_search', 'news_search', 'image_search'],
  },
  {
    id: 'exa',
    name: 'Exa.ai',
    description: 'Semantic neural web search',
    category: 'search',
    url: 'https://api.exa.ai',
    docsUrl: 'https://docs.exa.ai',
    authType: 'bearer',
    envKey: 'EXA_API_KEY',
    freeTier: '1,000 searches/month free',
    keyless: false,
    check: {
      url: 'https://api.exa.ai/search',
      method: 'POST',
      expectedStatus: [200, 400, 401],
      timeoutMs: 6000,
    },
    provides: ['web_search', 'semantic_search'],
  },
  {
    id: 'duckduckgo',
    name: 'DuckDuckGo Instant Answer',
    description: 'No-key instant answers API',
    category: 'search',
    url: 'https://api.duckduckgo.com',
    docsUrl: 'https://duckduckgo.com/api',
    authType: 'none',
    freeTier: 'Unlimited, no key needed',
    keyless: true,
    check: {
      url: 'https://api.duckduckgo.com/?q=test&format=json',
      expectedStatus: [200],
      bodyKey: 'Abstract',
      timeoutMs: 4000,
    },
    provides: ['web_search', 'instant_answers'],
  },

  // ── Scraping / Content ─────────────────────────────────────────────────────
  {
    id: 'jina_reader',
    name: 'Jina Reader',
    description: 'Convert any URL to clean markdown — no key needed',
    category: 'scraping',
    url: 'https://r.jina.ai',
    docsUrl: 'https://jina.ai/reader',
    authType: 'none',
    freeTier: 'Free, no key needed',
    keyless: true,
    check: {
      url: 'https://r.jina.ai/https://example.com',
      expectedStatus: [200],
      timeoutMs: 10000,
    },
    provides: ['web_scraping', 'content_extraction', 'markdown_conversion'],
  },
  {
    id: 'firecrawl',
    name: 'Firecrawl',
    description: 'Full site crawl + markdown extraction',
    category: 'scraping',
    url: 'https://api.firecrawl.dev/v1',
    docsUrl: 'https://docs.firecrawl.dev',
    authType: 'bearer',
    envKey: 'FIRECRAWL_API_KEY',
    freeTier: '500 pages/month free',
    keyless: false,
    check: {
      url: 'https://api.firecrawl.dev/v1/scrape',
      method: 'POST',
      expectedStatus: [200, 400, 401],
      timeoutMs: 8000,
    },
    provides: ['web_scraping', 'content_extraction', 'site_crawl'],
  },

  // ── Data & Knowledge ──────────────────────────────────────────────────────
  {
    id: 'wikipedia',
    name: 'Wikipedia API',
    description: 'Full Wikipedia content — no key needed',
    category: 'data',
    url: 'https://en.wikipedia.org/api/rest_v1',
    docsUrl: 'https://en.wikipedia.org/api/rest_v1/',
    authType: 'none',
    freeTier: 'Unlimited, no key needed',
    keyless: true,
    check: {
      url: 'https://en.wikipedia.org/api/rest_v1/page/summary/OpenAI',
      expectedStatus: [200],
      bodyKey: 'title',
      timeoutMs: 5000,
    },
    provides: ['knowledge_lookup', 'summarization'],
  },
  {
    id: 'open_meteo',
    name: 'Open Meteo',
    description: 'Weather forecasts — no key needed',
    category: 'data',
    url: 'https://api.open-meteo.com/v1',
    docsUrl: 'https://open-meteo.com/en/docs',
    authType: 'none',
    freeTier: 'Unlimited, no key needed',
    keyless: true,
    check: {
      url: 'https://api.open-meteo.com/v1/forecast?latitude=44.43&longitude=26.1&current_weather=true',
      expectedStatus: [200],
      bodyKey: 'current_weather',
      timeoutMs: 4000,
    },
    provides: ['weather_data'],
  },
  {
    id: 'rest_countries',
    name: 'REST Countries',
    description: 'Country data — no key needed',
    category: 'data',
    url: 'https://restcountries.com/v3.1',
    docsUrl: 'https://restcountries.com',
    authType: 'none',
    freeTier: 'Unlimited, no key needed',
    keyless: true,
    check: {
      url: 'https://restcountries.com/v3.1/name/romania',
      expectedStatus: [200],
      timeoutMs: 4000,
    },
    provides: ['country_data', 'geo_data'],
  },
  {
    id: 'newsapi',
    name: 'News API',
    description: 'News headlines from 80,000+ sources',
    category: 'data',
    url: 'https://newsapi.org/v2',
    docsUrl: 'https://newsapi.org/docs',
    authType: 'api_key_query',
    envKey: 'NEWSAPI_KEY',
    freeTier: '100 requests/day free',
    keyless: false,
    check: {
      url: 'https://newsapi.org/v2/top-headlines?country=us&apiKey=test',
      expectedStatus: [200, 401],
      timeoutMs: 5000,
    },
    provides: ['news_search', 'news_feed'],
  },

  // ── Blockchain & Web3 ─────────────────────────────────────────────────────
  {
    id: 'multiversx_devnet',
    name: 'MultiversX Devnet API',
    description: 'MultiversX devnet — accounts, transactions, tokens',
    category: 'blockchain',
    url: 'https://devnet-api.multiversx.com',
    docsUrl: 'https://docs.multiversx.com/sdk-and-tools/rest-api',
    authType: 'none',
    freeTier: 'Unlimited, no key needed',
    keyless: true,
    check: {
      url: 'https://devnet-api.multiversx.com/network/status/1',
      expectedStatus: [200],
      bodyKey: 'code',
      timeoutMs: 6000,
    },
    provides: ['blockchain_query', 'wallet_balance', 'multiversx'],
  },
  {
    id: 'multiversx_mainnet',
    name: 'MultiversX Mainnet API',
    description: 'MultiversX mainnet — production blockchain data',
    category: 'blockchain',
    url: 'https://api.multiversx.com',
    docsUrl: 'https://docs.multiversx.com/sdk-and-tools/rest-api',
    authType: 'none',
    freeTier: 'Unlimited, no key needed',
    keyless: true,
    check: {
      url: 'https://api.multiversx.com/network/economics',
      expectedStatus: [200],
      timeoutMs: 6000,
    },
    provides: ['blockchain_query', 'wallet_balance', 'multiversx'],
  },
  {
    id: 'coingecko',
    name: 'CoinGecko',
    description: 'Crypto prices, market data, 10,000+ coins',
    category: 'blockchain',
    url: 'https://api.coingecko.com/api/v3',
    docsUrl: 'https://www.coingecko.com/en/api/documentation',
    authType: 'none',
    freeTier: '30 calls/min free, no key needed',
    keyless: true,
    check: {
      url: 'https://api.coingecko.com/api/v3/ping',
      expectedStatus: [200],
      bodyKey: 'gecko_says',
      timeoutMs: 5000,
    },
    provides: ['crypto_prices', 'market_data'],
  },
  {
    id: 'coincap',
    name: 'CoinCap',
    description: 'Real-time crypto asset prices',
    category: 'blockchain',
    url: 'https://api.coincap.io/v2',
    docsUrl: 'https://docs.coincap.io',
    authType: 'none',
    freeTier: 'Unlimited free',
    keyless: true,
    check: {
      url: 'https://api.coincap.io/v2/assets/bitcoin',
      expectedStatus: [200],
      bodyKey: 'data',
      timeoutMs: 5000,
    },
    provides: ['crypto_prices', 'market_data'],
  },
  {
    id: 'defillama',
    name: 'DeFiLlama',
    description: 'DeFi TVL, protocol data — no key needed',
    category: 'blockchain',
    url: 'https://api.llama.fi',
    docsUrl: 'https://defillama.com/docs/api',
    authType: 'none',
    freeTier: 'Unlimited, no key needed',
    keyless: true,
    check: {
      url: 'https://api.llama.fi/protocols',
      expectedStatus: [200],
      timeoutMs: 8000,
    },
    provides: ['defi_data', 'tvl_data'],
  },
  {
    id: 'blockscout',
    name: 'Blockscout',
    description: 'Multi-chain block explorer API — Ethereum, Base, Gnosis etc.',
    category: 'blockchain',
    url: 'https://eth.blockscout.com/api/v2',
    docsUrl: 'https://docs.blockscout.com',
    authType: 'none',
    freeTier: 'Unlimited, no key needed',
    keyless: true,
    check: {
      url: 'https://eth.blockscout.com/api/v2/stats',
      expectedStatus: [200],
      timeoutMs: 6000,
    },
    provides: ['blockchain_query', 'ethereum', 'multi_chain'],
  },

  // ── Code & Dev ────────────────────────────────────────────────────────────
  {
    id: 'github',
    name: 'GitHub API',
    description: 'Repos, issues, code search — 5,000 req/hr with token',
    category: 'code',
    url: 'https://api.github.com',
    docsUrl: 'https://docs.github.com/en/rest',
    authType: 'bearer',
    envKey: 'GITHUB_TOKEN',
    freeTier: '60 req/hr unauth, 5,000 with token',
    keyless: true,
    check: {
      url: 'https://api.github.com/zen',
      expectedStatus: [200],
      timeoutMs: 4000,
    },
    provides: ['code_search', 'repo_data', 'issue_tracking'],
  },
  {
    id: 'npm_registry',
    name: 'npm Registry',
    description: 'Package info, versions, downloads — no key needed',
    category: 'code',
    url: 'https://registry.npmjs.org',
    docsUrl: 'https://github.com/npm/registry/blob/master/docs/REGISTRY-API.md',
    authType: 'none',
    freeTier: 'Unlimited, no key needed',
    keyless: true,
    check: {
      url: 'https://registry.npmjs.org/next',
      expectedStatus: [200],
      bodyKey: 'name',
      timeoutMs: 4000,
    },
    provides: ['package_lookup'],
  },
  {
    id: 'e2b',
    name: 'E2B Sandbox',
    description: 'Safe cloud code execution — Node.js, Python, Bash',
    category: 'code',
    url: 'https://api.e2b.dev',
    docsUrl: 'https://e2b.dev/docs',
    authType: 'api_key_header',
    envKey: 'E2B_API_KEY',
    freeTier: 'Free dev tier',
    keyless: false,
    check: {
      url: 'https://api.e2b.dev/health',
      expectedStatus: [200, 401, 404],
      timeoutMs: 5000,
    },
    provides: ['code_execution', 'sandbox'],
  },

  // ── Utilities ─────────────────────────────────────────────────────────────
  {
    id: 'ipapi',
    name: 'IPapi',
    description: 'IP geolocation — 1,000 req/day free',
    category: 'utility',
    url: 'https://ipapi.co',
    docsUrl: 'https://ipapi.co/api',
    authType: 'none',
    freeTier: '1,000 req/day free',
    keyless: true,
    check: {
      url: 'https://ipapi.co/8.8.8.8/json/',
      expectedStatus: [200],
      bodyKey: 'country',
      timeoutMs: 4000,
    },
    provides: ['ip_lookup', 'geolocation'],
  },
  {
    id: 'qrcode',
    name: 'QR Code API',
    description: 'Generate QR codes — no key needed',
    category: 'utility',
    url: 'https://api.qrserver.com/v1',
    docsUrl: 'https://goqr.me/api/',
    authType: 'none',
    freeTier: 'Unlimited, no key needed',
    keyless: true,
    check: {
      url: 'https://api.qrserver.com/v1/create-qr-code/?size=50x50&data=test',
      expectedStatus: [200],
      timeoutMs: 4000,
    },
    provides: ['qr_generation'],
  },

  // ── Agent Economy ─────────────────────────────────────────────────────────
  {
    id: 'thecolony',
    name: 'TheColony',
    description: 'Agent task dispatch & EGLD bounties',
    category: 'agent_economy',
    url: 'https://thecolony.io',
    docsUrl: 'https://thecolony.io/docs',
    authType: 'api_key_header',
    envKey: 'COLONY_AGENT_API_KEY',
    freeTier: 'Free agent registration',
    keyless: false,
    check: {
      url: 'https://thecolony.io/api/health',
      expectedStatus: [200, 404, 401],
      timeoutMs: 6000,
    },
    provides: ['task_dispatch', 'egld_payments', 'agent_economy'],
  },
  {
    id: 'opentask',
    name: 'OpenTask',
    description: 'Bounty marketplace for AI agents',
    category: 'agent_economy',
    url: 'https://opentask.app',
    docsUrl: 'https://opentask.app/docs',
    authType: 'api_key_header',
    envKey: 'OPENTASK_API_KEY',
    freeTier: 'Free agent registration',
    keyless: false,
    check: {
      url: 'https://opentask.app/api/health',
      expectedStatus: [200, 404, 401],
      timeoutMs: 6000,
    },
    provides: ['task_dispatch', 'bounty_marketplace'],
  },
];

/** Get all APIs that work without any API key */
export function getKeylessApis(): ApiEntry[] {
  return API_REGISTRY.filter((a) => a.keyless);
}

/** Get all APIs that have an env key configured in the current environment */
export function getConfiguredApis(): ApiEntry[] {
  return API_REGISTRY.filter((a) => {
    if (a.keyless) return true;
    if (!a.envKey) return false;
    return !!process.env[a.envKey];
  });
}

/** Get APIs by capability tag */
export function getApisByCapability(capability: string): ApiEntry[] {
  return API_REGISTRY.filter((a) => a.provides.includes(capability));
}

/** Get APIs by category */
export function getApisByCategory(category: ApiCategory): ApiEntry[] {
  return API_REGISTRY.filter((a) => a.category === category);
}

/** Find the best available API for a given capability */
export function getBestApiForCapability(capability: string): ApiEntry | null {
  const configured = getConfiguredApis().filter((a) => a.provides.includes(capability));
  // Prefer keyless first, then configured
  const keyless = configured.filter((a) => a.keyless);
  return keyless[0] ?? configured[0] ?? null;
}
