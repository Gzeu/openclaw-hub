import type { NativePlugin, PluginCategory } from './types';

export const NATIVE_PLUGINS: NativePlugin[] = [
  // ─── AI / LLM ───────────────────────────────────────────────
  {
    key: 'openrouter', name: 'OpenRouter', category: 'ai', icon: '🤖',
    description: '200+ AI models with one API key (Claude, GPT-4o, Gemini, Llama, Mistral…)',
    authType: 'api_key', docsUrl: 'https://openrouter.ai/docs',
    configFields: [
      { key: 'apiKey', label: 'API Key', type: 'password', required: true, isSecret: true, placeholder: 'sk-or-...' },
      { key: 'defaultModel', label: 'Default Model', type: 'text', required: false, placeholder: 'anthropic/claude-3.5-sonnet' },
    ],
    capabilities: ['llm-complete', 'llm-stream', 'tool-calling', 'vision'],
    isOpenClawSkill: true, skillSlug: 'openrouter',
  },
  {
    key: 'openai', name: 'OpenAI', category: 'ai', icon: '✨',
    description: 'GPT-4o, o3, Whisper, DALL-E, Embeddings',
    authType: 'api_key', docsUrl: 'https://platform.openai.com/docs',
    configFields: [
      { key: 'apiKey', label: 'API Key', type: 'password', required: true, isSecret: true, placeholder: 'sk-...' },
      { key: 'orgId', label: 'Organization ID', type: 'text', required: false, placeholder: 'org-...' },
    ],
    capabilities: ['llm-complete', 'llm-stream', 'image-gen', 'speech-to-text', 'tool-calling', 'embeddings'],
    isOpenClawSkill: true, skillSlug: 'openai',
  },
  {
    key: 'anthropic', name: 'Anthropic Claude', category: 'ai', icon: '🧠',
    description: 'Claude 3.5 Sonnet, Claude 3 Opus — direct API access',
    authType: 'api_key', docsUrl: 'https://docs.anthropic.com',
    configFields: [
      { key: 'apiKey', label: 'API Key', type: 'password', required: true, isSecret: true, placeholder: 'sk-ant-...' },
    ],
    capabilities: ['llm-complete', 'llm-stream', 'vision', 'tool-calling'],
    isOpenClawSkill: true, skillSlug: 'anthropic',
  },
  {
    key: 'groq', name: 'Groq', category: 'ai', icon: '⚡',
    description: 'Ultra-fast inference: Llama 3, Mixtral, Gemma',
    authType: 'api_key', docsUrl: 'https://console.groq.com/docs',
    configFields: [
      { key: 'apiKey', label: 'API Key', type: 'password', required: true, isSecret: true, placeholder: 'gsk_...' },
    ],
    capabilities: ['llm-complete', 'llm-stream'],
    isOpenClawSkill: true, skillSlug: 'groq',
  },
  {
    key: 'gemini', name: 'Google Gemini', category: 'ai', icon: '💎',
    description: 'Gemini 2.0 Flash, Gemini Pro — multimodal AI',
    authType: 'api_key', docsUrl: 'https://ai.google.dev/docs',
    configFields: [
      { key: 'apiKey', label: 'API Key', type: 'password', required: true, isSecret: true, placeholder: 'AIza...' },
    ],
    capabilities: ['llm-complete', 'llm-stream', 'vision', 'tool-calling'],
    isOpenClawSkill: true, skillSlug: 'gemini',
  },
  {
    key: 'mistral', name: 'Mistral AI', category: 'ai', icon: '🌪️',
    description: 'Mistral Large, Mixtral 8x7B, Codestral',
    authType: 'api_key', docsUrl: 'https://docs.mistral.ai',
    configFields: [
      { key: 'apiKey', label: 'API Key', type: 'password', required: true, isSecret: true },
    ],
    capabilities: ['llm-complete', 'llm-stream', 'code-completion'],
    isOpenClawSkill: true, skillSlug: 'mistral',
  },
  {
    key: 'perplexity', name: 'Perplexity AI', category: 'ai', icon: '🔍',
    description: 'Real-time web search + LLM (Sonar Pro)',
    authType: 'api_key', docsUrl: 'https://docs.perplexity.ai',
    configFields: [
      { key: 'apiKey', label: 'API Key', type: 'password', required: true, isSecret: true, placeholder: 'pplx-...' },
    ],
    capabilities: ['web-search', 'llm-complete', 'news-search'],
    isOpenClawSkill: true, skillSlug: 'perplexity',
  },
  {
    key: 'together-ai', name: 'Together AI', category: 'ai', icon: '🤝',
    description: 'Open-source models at scale (Llama, Falcon, Qwen)',
    authType: 'api_key', docsUrl: 'https://docs.together.ai',
    configFields: [
      { key: 'apiKey', label: 'API Key', type: 'password', required: true, isSecret: true },
    ],
    capabilities: ['llm-complete', 'llm-stream', 'image-gen'],
    isOpenClawSkill: false,
  },
  {
    key: 'replicate', name: 'Replicate', category: 'ai', icon: '🎨',
    description: 'Image gen, video, audio, fine-tuned models (FLUX, SDXL)',
    authType: 'api_key', docsUrl: 'https://replicate.com/docs',
    configFields: [
      { key: 'apiToken', label: 'API Token', type: 'password', required: true, isSecret: true, placeholder: 'r8_...' },
    ],
    capabilities: ['image-gen', 'video-gen', 'audio-gen', 'fine-tuning'],
    isOpenClawSkill: false,
  },

  // ─── Blockchain ───────────────────────────────────────────────
  {
    key: 'multiversx', name: 'MultiversX', category: 'blockchain', icon: '🔷',
    description: 'EGLD balance, ESDT tokens, NFTs, transactions, smart contracts',
    authType: 'none', docsUrl: 'https://docs.multiversx.com',
    configFields: [
      { key: 'network', label: 'Network', type: 'select', required: true, options: ['mainnet', 'devnet', 'testnet'] },
    ],
    capabilities: ['mvx-balance', 'mvx-txns', 'mvx-nfts', 'mvx-staking', 'mvx-tokens'],
    isOpenClawSkill: true, skillSlug: 'multiversx',
  },
  {
    key: 'coingecko', name: 'CoinGecko', category: 'blockchain', icon: '🦎',
    description: 'Crypto prices, market cap, charts — free tier available',
    authType: 'api_key', docsUrl: 'https://docs.coingecko.com',
    configFields: [
      { key: 'apiKey', label: 'API Key (optional)', type: 'password', required: false, isSecret: true },
    ],
    capabilities: ['price-feed', 'market-data', 'charts'],
    isOpenClawSkill: true, skillSlug: 'coingecko',
  },
  {
    key: 'binance', name: 'Binance', category: 'blockchain', icon: '🟡',
    description: 'Real-time prices, order book, portfolio (read/trade)',
    authType: 'api_key', docsUrl: 'https://binance-docs.github.io/apidocs/',
    configFields: [
      { key: 'apiKey', label: 'API Key', type: 'password', required: true, isSecret: true },
      { key: 'apiSecret', label: 'API Secret', type: 'password', required: true, isSecret: true },
    ],
    capabilities: ['price-feed', 'order-book', 'portfolio', 'trading'],
    isOpenClawSkill: false,
  },
  {
    key: 'alchemy', name: 'Alchemy', category: 'blockchain', icon: '⚗️',
    description: 'EVM blockchain data, NFT APIs, webhooks (Ethereum, Polygon…)',
    authType: 'api_key', docsUrl: 'https://docs.alchemy.com',
    configFields: [
      { key: 'apiKey', label: 'API Key', type: 'password', required: true, isSecret: true },
      { key: 'network', label: 'Network', type: 'text', required: false, placeholder: 'eth-mainnet' },
    ],
    capabilities: ['blockchain-data', 'nft-data', 'webhooks'],
    isOpenClawSkill: false,
  },

  // ─── Developer ───────────────────────────────────────────────
  {
    key: 'github', name: 'GitHub', category: 'developer', icon: '🐙',
    description: 'Repos, issues, PRs, code search, Actions, Copilot',
    authType: 'oauth2', docsUrl: 'https://docs.github.com/en/rest',
    oauthScopes: ['repo', 'read:user', 'user:email', 'workflow'],
    configFields: [],
    capabilities: ['repo-search', 'issue-management', 'pr-management', 'code-search', 'git-ops'],
    isOpenClawSkill: true, skillSlug: 'github',
  },
  {
    key: 'gitlab', name: 'GitLab', category: 'developer', icon: '🦊',
    description: 'Repos, merge requests, CI/CD pipelines',
    authType: 'oauth2', docsUrl: 'https://docs.gitlab.com/ee/api/',
    oauthScopes: ['api', 'read_user'],
    configFields: [],
    capabilities: ['repo-management', 'mr-management', 'ci-cd'],
    isOpenClawSkill: false,
  },
  {
    key: 'e2b', name: 'E2B Sandbox', category: 'developer', icon: '🏖️',
    description: 'Secure cloud code execution (Python, JS, Bash)',
    authType: 'api_key', docsUrl: 'https://e2b.dev/docs',
    configFields: [
      { key: 'apiKey', label: 'API Key', type: 'password', required: true, isSecret: true },
    ],
    capabilities: ['code-execute', 'sandbox'],
    isOpenClawSkill: true, skillSlug: 'e2b',
  },
  {
    key: 'vercel', name: 'Vercel', category: 'developer', icon: '▲',
    description: 'Deploy projects, manage builds, env vars, domains',
    authType: 'api_key', docsUrl: 'https://vercel.com/docs/rest-api',
    configFields: [
      { key: 'apiToken', label: 'API Token', type: 'password', required: true, isSecret: true },
      { key: 'teamId', label: 'Team ID (optional)', type: 'text', required: false },
    ],
    capabilities: ['deploy', 'build-status', 'env-management'],
    isOpenClawSkill: false,
  },
  {
    key: 'supabase', name: 'Supabase', category: 'developer', icon: '🟢',
    description: 'Postgres DB, realtime, auth, storage, edge functions',
    authType: 'api_key', docsUrl: 'https://supabase.com/docs',
    configFields: [
      { key: 'url', label: 'Project URL', type: 'url', required: true, placeholder: 'https://xxx.supabase.co' },
      { key: 'serviceKey', label: 'Service Role Key', type: 'password', required: true, isSecret: true },
    ],
    capabilities: ['database', 'realtime', 'storage', 'auth'],
    isOpenClawSkill: false,
  },
  {
    key: 'docker', name: 'Docker Hub', category: 'developer', icon: '🐳',
    description: 'Container registry, image management',
    authType: 'api_key', docsUrl: 'https://docs.docker.com/docker-hub/api/latest/',
    configFields: [
      { key: 'username', label: 'Username', type: 'text', required: true },
      { key: 'accessToken', label: 'Access Token', type: 'password', required: true, isSecret: true },
    ],
    capabilities: ['container-registry', 'image-management'],
    isOpenClawSkill: false,
  },

  // ─── Communication ────────────────────────────────────────────
  {
    key: 'telegram', name: 'Telegram', category: 'communication', icon: '✈️',
    description: 'Bot API: send messages, receive updates, manage groups',
    authType: 'api_key', docsUrl: 'https://core.telegram.org/bots/api',
    configFields: [
      { key: 'botToken', label: 'Bot Token', type: 'password', required: true, isSecret: true, placeholder: '123456:ABC-...' },
      { key: 'chatId', label: 'Default Chat ID', type: 'text', required: false },
    ],
    capabilities: ['send-message', 'receive-message', 'bot-management'],
    isOpenClawSkill: true, skillSlug: 'telegram',
  },
  {
    key: 'slack', name: 'Slack', category: 'communication', icon: '💬',
    description: 'Messages, channels, files, workflows via OAuth',
    authType: 'oauth2', docsUrl: 'https://api.slack.com',
    oauthScopes: ['channels:read', 'chat:write', 'files:write', 'users:read'],
    configFields: [],
    capabilities: ['send-message', 'channel-management', 'file-upload'],
    isOpenClawSkill: false,
  },
  {
    key: 'discord', name: 'Discord', category: 'communication', icon: '🎮',
    description: 'Bot API: messages, channels, webhooks, roles',
    authType: 'api_key', docsUrl: 'https://discord.com/developers/docs',
    configFields: [
      { key: 'botToken', label: 'Bot Token', type: 'password', required: true, isSecret: true },
      { key: 'guildId', label: 'Server ID (optional)', type: 'text', required: false },
    ],
    capabilities: ['send-message', 'channel-management', 'webhooks'],
    isOpenClawSkill: false,
  },
  {
    key: 'sendgrid', name: 'SendGrid', category: 'communication', icon: '📧',
    description: 'Transactional email, templates, analytics',
    authType: 'api_key', docsUrl: 'https://docs.sendgrid.com',
    configFields: [
      { key: 'apiKey', label: 'API Key', type: 'password', required: true, isSecret: true, placeholder: 'SG...' },
      { key: 'fromEmail', label: 'Default From Email', type: 'text', required: false },
    ],
    capabilities: ['send-email', 'email-templates', 'analytics'],
    isOpenClawSkill: false,
  },
  {
    key: 'twilio', name: 'Twilio', category: 'communication', icon: '📱',
    description: 'SMS, WhatsApp, Voice, Verify (OTP)',
    authType: 'api_key', docsUrl: 'https://www.twilio.com/docs',
    configFields: [
      { key: 'accountSid', label: 'Account SID', type: 'text', required: true },
      { key: 'authToken', label: 'Auth Token', type: 'password', required: true, isSecret: true },
      { key: 'fromNumber', label: 'From Number', type: 'text', required: false, placeholder: '+1...' },
    ],
    capabilities: ['sms', 'whatsapp', 'voice', 'otp'],
    isOpenClawSkill: false,
  },

  // ─── Productivity ─────────────────────────────────────────────
  {
    key: 'notion', name: 'Notion', category: 'productivity', icon: '📝',
    description: 'Pages, databases, blocks, comments, search',
    authType: 'oauth2', docsUrl: 'https://developers.notion.com',
    oauthScopes: ['read_content', 'update_content', 'insert_content'],
    configFields: [],
    capabilities: ['page-management', 'database-ops', 'search'],
    isOpenClawSkill: true, skillSlug: 'notion',
  },
  {
    key: 'google-workspace', name: 'Google Workspace', category: 'productivity', icon: '🌐',
    description: 'Gmail, Drive, Docs, Sheets, Calendar — full OAuth',
    authType: 'oauth2', docsUrl: 'https://developers.google.com/workspace',
    oauthScopes: ['gmail.readonly', 'drive.file', 'calendar.events', 'spreadsheets'],
    configFields: [],
    capabilities: ['email', 'file-management', 'calendar', 'docs', 'sheets'],
    isOpenClawSkill: false,
  },
  {
    key: 'linear', name: 'Linear', category: 'productivity', icon: '🔺',
    description: 'Issues, projects, cycles, roadmaps (dev-first PM tool)',
    authType: 'oauth2', docsUrl: 'https://developers.linear.app',
    oauthScopes: ['read', 'write', 'issues:create'],
    configFields: [],
    capabilities: ['issue-management', 'project-tracking', 'roadmaps'],
    isOpenClawSkill: false,
  },
  {
    key: 'jira', name: 'Jira', category: 'productivity', icon: '🟦',
    description: 'Issues, sprints, epics, workflows (Atlassian)',
    authType: 'oauth2', docsUrl: 'https://developer.atlassian.com/cloud/jira/',
    oauthScopes: ['read:jira-work', 'write:jira-work'],
    configFields: [],
    capabilities: ['issue-management', 'sprint-management', 'project-tracking'],
    isOpenClawSkill: false,
  },
  {
    key: 'trello', name: 'Trello', category: 'productivity', icon: '📋',
    description: 'Boards, cards, lists, checklists',
    authType: 'api_key', docsUrl: 'https://developer.atlassian.com/cloud/trello/',
    configFields: [
      { key: 'apiKey', label: 'API Key', type: 'password', required: true, isSecret: true },
      { key: 'token', label: 'Token', type: 'password', required: true, isSecret: true },
    ],
    capabilities: ['board-management', 'card-management', 'checklists'],
    isOpenClawSkill: false,
  },
  {
    key: 'mixpost', name: 'Mixpost', category: 'productivity', icon: '📣',
    description: 'Social media scheduling, publishing, analytics',
    authType: 'api_key', docsUrl: 'https://docs.mixpost.app',
    configFields: [
      { key: 'apiKey', label: 'API Key', type: 'password', required: true, isSecret: true },
      { key: 'instanceUrl', label: 'Instance URL', type: 'url', required: true },
    ],
    capabilities: ['social-scheduling', 'publishing', 'analytics'],
    isOpenClawSkill: true, skillSlug: 'mixpost',
  },

  // ─── Data & Search ────────────────────────────────────────────
  {
    key: 'tavily', name: 'Tavily Search', category: 'data', icon: '🔎',
    description: 'AI-optimized web + news search API',
    authType: 'api_key', docsUrl: 'https://tavily.com/docs',
    configFields: [
      { key: 'apiKey', label: 'API Key', type: 'password', required: true, isSecret: true, placeholder: 'tvly-...' },
    ],
    capabilities: ['web-search', 'news-search', 'content-extraction'],
    isOpenClawSkill: true, skillSlug: 'tavily',
  },
  {
    key: 'brave-search', name: 'Brave Search', category: 'data', icon: '🦁',
    description: 'Privacy-first web and news search',
    authType: 'api_key', docsUrl: 'https://api.search.brave.com/app/documentation',
    configFields: [
      { key: 'apiKey', label: 'API Key', type: 'password', required: true, isSecret: true },
    ],
    capabilities: ['web-search', 'news-search'],
    isOpenClawSkill: true, skillSlug: 'brave-search',
  },
  {
    key: 'jina', name: 'Jina Reader', category: 'data', icon: '📖',
    description: 'URL scraping, content extraction, embeddings (free tier)',
    authType: 'api_key', docsUrl: 'https://jina.ai/reader',
    configFields: [
      { key: 'apiKey', label: 'API Key (optional)', type: 'password', required: false, isSecret: true },
    ],
    capabilities: ['scrape-url', 'content-extraction', 'embeddings'],
    isOpenClawSkill: true, skillSlug: 'jina',
  },
  {
    key: 'firecrawl', name: 'Firecrawl', category: 'data', icon: '🔥',
    description: 'Advanced web scraping, site crawling, structured extraction',
    authType: 'api_key', docsUrl: 'https://docs.firecrawl.dev',
    configFields: [
      { key: 'apiKey', label: 'API Key', type: 'password', required: true, isSecret: true, placeholder: 'fc-...' },
    ],
    capabilities: ['scrape-url', 'crawl', 'content-extraction'],
    isOpenClawSkill: true, skillSlug: 'firecrawl',
  },
  {
    key: 'open-meteo', name: 'Open-Meteo', category: 'data', icon: '⛅',
    description: 'Free weather API — hourly/daily forecasts, no key needed',
    authType: 'none', docsUrl: 'https://open-meteo.com/en/docs',
    configFields: [],
    capabilities: ['weather', 'forecast'],
    isOpenClawSkill: true, skillSlug: 'open-meteo',
  },
  {
    key: 'wikipedia', name: 'Wikipedia', category: 'data', icon: '📚',
    description: 'Search and retrieve Wikipedia articles (free)',
    authType: 'none', docsUrl: 'https://www.mediawiki.org/wiki/API:Main_page',
    configFields: [],
    capabilities: ['wiki-search', 'content-retrieval'],
    isOpenClawSkill: true, skillSlug: 'wikipedia',
  },
  {
    key: 'serpapi', name: 'SerpAPI', category: 'data', icon: '🔬',
    description: 'Google, Bing, YouTube, Shopping SERP results',
    authType: 'api_key', docsUrl: 'https://serpapi.com/docs',
    configFields: [
      { key: 'apiKey', label: 'API Key', type: 'password', required: true, isSecret: true },
    ],
    capabilities: ['google-search', 'shopping-search', 'image-search'],
    isOpenClawSkill: false,
  },
  {
    key: 'airtable', name: 'Airtable', category: 'data', icon: '📊',
    description: 'Spreadsheet-database: records, views, automation',
    authType: 'api_key', docsUrl: 'https://airtable.com/developers/web/api/introduction',
    configFields: [
      { key: 'apiKey', label: 'Personal Access Token', type: 'password', required: true, isSecret: true },
      { key: 'baseId', label: 'Base ID', type: 'text', required: true, placeholder: 'app...' },
    ],
    capabilities: ['database', 'spreadsheet', 'automation'],
    isOpenClawSkill: false,
  },

  // ─── Storage ─────────────────────────────────────────────────
  {
    key: 'aws-s3', name: 'AWS S3', category: 'storage', icon: '☁️',
    description: 'Object storage, file upload/download, presigned URLs',
    authType: 'api_key', docsUrl: 'https://docs.aws.amazon.com/s3',
    configFields: [
      { key: 'accessKeyId', label: 'Access Key ID', type: 'password', required: true, isSecret: true },
      { key: 'secretAccessKey', label: 'Secret Access Key', type: 'password', required: true, isSecret: true },
      { key: 'region', label: 'Region', type: 'text', required: true, placeholder: 'eu-west-1' },
      { key: 'bucket', label: 'Default Bucket', type: 'text', required: false },
    ],
    capabilities: ['file-upload', 'file-download', 'storage'],
    isOpenClawSkill: false,
  },
  {
    key: 'cloudflare-r2', name: 'Cloudflare R2', category: 'storage', icon: '🌩️',
    description: 'S3-compatible object storage — zero egress fees',
    authType: 'api_key', docsUrl: 'https://developers.cloudflare.com/r2',
    configFields: [
      { key: 'accountId', label: 'Account ID', type: 'text', required: true },
      { key: 'accessKeyId', label: 'Access Key ID', type: 'password', required: true, isSecret: true },
      { key: 'secretAccessKey', label: 'Secret Access Key', type: 'password', required: true, isSecret: true },
      { key: 'bucket', label: 'Bucket Name', type: 'text', required: true },
    ],
    capabilities: ['file-upload', 'file-download', 'storage'],
    isOpenClawSkill: false,
  },
  {
    key: 'pinecone', name: 'Pinecone', category: 'storage', icon: '🌲',
    description: 'Vector database for embeddings and semantic search',
    authType: 'api_key', docsUrl: 'https://docs.pinecone.io',
    configFields: [
      { key: 'apiKey', label: 'API Key', type: 'password', required: true, isSecret: true },
      { key: 'environment', label: 'Environment', type: 'text', required: false, placeholder: 'gcp-starter' },
    ],
    capabilities: ['vector-search', 'embeddings', 'semantic-search'],
    isOpenClawSkill: false,
  },

  // ─── Monitoring ───────────────────────────────────────────────
  {
    key: 'grafana', name: 'Grafana', category: 'monitoring', icon: '📈',
    description: 'Dashboards, alerts, metrics visualization',
    authType: 'api_key', docsUrl: 'https://grafana.com/docs/grafana/latest/developers/http_api/',
    configFields: [
      { key: 'url', label: 'Grafana URL', type: 'url', required: true, placeholder: 'https://your-grafana.com' },
      { key: 'apiKey', label: 'Service Account Token', type: 'password', required: true, isSecret: true },
    ],
    capabilities: ['metrics', 'dashboards', 'alerts'],
    isOpenClawSkill: false,
  },
  {
    key: 'sentry', name: 'Sentry', category: 'monitoring', icon: '🐛',
    description: 'Error tracking, performance monitoring, replays',
    authType: 'api_key', docsUrl: 'https://docs.sentry.io/api/',
    configFields: [
      { key: 'authToken', label: 'Auth Token', type: 'password', required: true, isSecret: true },
      { key: 'org', label: 'Organization Slug', type: 'text', required: true },
      { key: 'project', label: 'Project Slug', type: 'text', required: false },
    ],
    capabilities: ['error-tracking', 'performance', 'replays'],
    isOpenClawSkill: false,
  },
  {
    key: 'uptime-robot', name: 'UptimeRobot', category: 'monitoring', icon: '🤖',
    description: 'Uptime monitoring, status pages, downtime alerts',
    authType: 'api_key', docsUrl: 'https://uptimerobot.com/api/',
    configFields: [
      { key: 'apiKey', label: 'Main API Key', type: 'password', required: true, isSecret: true },
    ],
    capabilities: ['uptime-monitoring', 'status-pages', 'alerts'],
    isOpenClawSkill: false,
  },
  {
    key: 'datadog', name: 'Datadog', category: 'monitoring', icon: '🐕',
    description: 'Metrics, logs, traces, APM, infrastructure monitoring',
    authType: 'api_key', docsUrl: 'https://docs.datadoghq.com/api/latest/',
    configFields: [
      { key: 'apiKey', label: 'API Key', type: 'password', required: true, isSecret: true },
      { key: 'appKey', label: 'Application Key', type: 'password', required: true, isSecret: true },
      { key: 'site', label: 'Site', type: 'text', required: false, placeholder: 'datadoghq.eu' },
    ],
    capabilities: ['metrics', 'logs', 'traces', 'apm'],
    isOpenClawSkill: false,
  },

  // ─── Payment ─────────────────────────────────────────────────
  {
    key: 'stripe', name: 'Stripe', category: 'payment', icon: '💳',
    description: 'Payments, subscriptions, invoices, customers, webhooks',
    authType: 'api_key', docsUrl: 'https://stripe.com/docs/api',
    configFields: [
      { key: 'secretKey', label: 'Secret Key', type: 'password', required: true, isSecret: true, placeholder: 'sk_live_...' },
      { key: 'webhookSecret', label: 'Webhook Secret (optional)', type: 'password', required: false, isSecret: true, placeholder: 'whsec_...' },
    ],
    capabilities: ['payments', 'subscriptions', 'invoices', 'customers'],
    isOpenClawSkill: false,
  },
  {
    key: 'paddle', name: 'Paddle', category: 'payment', icon: '🏓',
    description: 'Merchant of record, subscriptions, tax handling',
    authType: 'api_key', docsUrl: 'https://developer.paddle.com/api-reference',
    configFields: [
      { key: 'apiKey', label: 'API Key', type: 'password', required: true, isSecret: true },
      { key: 'sandbox', label: 'Sandbox Mode', type: 'boolean', required: false },
    ],
    capabilities: ['payments', 'subscriptions', 'tax'],
    isOpenClawSkill: false,
  },

  // ─── Social ──────────────────────────────────────────────────
  {
    key: 'twitter-x', name: 'Twitter / X', category: 'social', icon: '🐦',
    description: 'Post tweets, search, user lookup, DMs',
    authType: 'oauth2', docsUrl: 'https://developer.twitter.com/en/docs',
    oauthScopes: ['tweet.read', 'tweet.write', 'users.read', 'dm.write'],
    configFields: [
      { key: 'bearerToken', label: 'Bearer Token (read-only)', type: 'password', required: false, isSecret: true },
    ],
    capabilities: ['post', 'search', 'timeline', 'dm'],
    isOpenClawSkill: false,
  },
  {
    key: 'reddit', name: 'Reddit', category: 'social', icon: '🔴',
    description: 'Posts, comments, subreddits, search, moderation',
    authType: 'oauth2', docsUrl: 'https://www.reddit.com/dev/api/',
    oauthScopes: ['read', 'submit', 'edit'],
    configFields: [],
    capabilities: ['post', 'search', 'subreddit-monitoring'],
    isOpenClawSkill: false,
  },
  {
    key: 'linkedin', name: 'LinkedIn', category: 'social', icon: '💼',
    description: 'Profile, posts, company pages, job search',
    authType: 'oauth2', docsUrl: 'https://learn.microsoft.com/en-us/linkedin/',
    oauthScopes: ['r_liteprofile', 'r_emailaddress', 'w_member_social'],
    configFields: [],
    capabilities: ['profile', 'posts', 'job-search'],
    isOpenClawSkill: false,
  },
];

export function getPluginByKey(key: string): NativePlugin | undefined {
  return NATIVE_PLUGINS.find(p => p.key === key);
}

export function getPluginsByCategory(category: PluginCategory): NativePlugin[] {
  return NATIVE_PLUGINS.filter(p => p.category === category);
}

export const PLUGIN_CATEGORIES: { key: PluginCategory; label: string; icon: string }[] = [
  { key: 'ai',             label: 'AI / LLM',        icon: '🤖' },
  { key: 'blockchain',     label: 'Blockchain',       icon: '🔗' },
  { key: 'developer',     label: 'Developer Tools',   icon: '🛠️' },
  { key: 'communication', label: 'Communication',     icon: '💬' },
  { key: 'productivity',  label: 'Productivity',      icon: '📋' },
  { key: 'data',          label: 'Data & Search',     icon: '📊' },
  { key: 'storage',       label: 'Storage',           icon: '☁️' },
  { key: 'monitoring',    label: 'Monitoring',        icon: '📈' },
  { key: 'payment',       label: 'Payment',           icon: '💳' },
  { key: 'social',        label: 'Social',            icon: '🌐' },
];
