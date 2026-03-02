// ═══════════════════════════════════════════════════════════════════════════
// OPENCLAW HUB — Enhanced Agent Profiles
// Inspired by 8004scan.io agent registry with comprehensive metadata
// ═══════════════════════════════════════════════════════════════════════════

export interface AgentProfile {
  // Basic Identity
  id: string
  name: string
  description: string
  image_url?: string
  avatar_url?: string
  
  // Owner & Creator
  owner_id: string
  owner_address: string
  owner_ens?: string
  owner_username?: string
  owner_avatar_url?: string
  creator_address: string
  
  // Blockchain Integration
  agent_id: string
  token_id: string
  chain_id: number
  chain_type: 'evm' | 'svm' | 'other'
  is_testnet: boolean
  contract_address: string
  agent_wallet: string
  
  // Agent Classification
  agent_type?: string
  categories: string[]
  tags: string[]
  capabilities: string[]
  
  // Protocol Support
  supported_protocols: Protocol[]
  supported_trust_models: string[]
  x402_supported: boolean
  
  // Services & Endpoints
  services: AgentServices
  registrations: AgentRegistration[]
  endpoints: AgentEndpoint[]
  
  // Performance & Reputation
  is_verified: boolean
  is_active: boolean
  star_count: number
  watch_count: number
  total_score: number
  total_feedbacks: number
  total_validations: number
  successful_validations: number
  average_score: number
  rank?: number
  
  // Health & Monitoring
  health_status?: 'healthy' | 'degraded' | 'unhealthy' | 'unknown'
  health_score?: number
  health_checked_at?: string
  is_endpoint_verified: boolean
  endpoint_verified_at?: string
  endpoint_verified_domain?: string
  endpoint_verification_error?: string
  endpoint_last_checked_at?: string
  
  // Scoring System
  scores?: AgentScores
  quality_score: number
  popularity_score: number
  activity_score: number
  wallet_score: number
  freshness_score: number
  metadata_completeness_score: number
  
  // Metadata & Parsing
  parse_status?: ParseStatus
  raw_metadata?: RawMetadata
  field_sources?: FieldSources
  
  // Decentralized Identity
  ens?: string
  did?: string
  
  // Timestamps
  created_at: string
  updated_at: string
  created_block_number?: number
  created_tx_hash?: string
}

export interface Protocol {
  name: string
  endpoint?: string
  version?: string
  skills?: string[]
  domains?: string[]
  tools?: any[]
  prompts?: any[]
  resources?: any[]
}

// Protocol name type for easier usage
export type ProtocolName = 'MCP' | 'A2A' | 'OASF' | 'Web' | 'API' | 'mcp' | 'a2a' | 'oasf' | 'web' | 'api'

export interface AgentServices {
  mcp?: Protocol
  a2a?: Protocol
  oasf?: Protocol
  web?: Protocol
  api?: Protocol
  agentWallet?: Protocol
  [key: string]: Protocol | undefined
}

export interface AgentRegistration {
  chain_id: number
  contract_address: string
  token_id: string
  registered_at: string
}

export interface AgentEndpoint {
  name: string
  url: string
  protocol: string
  version?: string
  status: 'active' | 'inactive' | 'error'
  last_checked?: string
  response_time?: number
}

export interface AgentScores {
  execution_quality: number
  reliability: number
  security: number
  performance: number
  user_satisfaction: number
}

export interface ParseStatus {
  status: 'success' | 'error' | 'warning'
  info: ParseIssue[]
  errors: ParseIssue[]
  warnings: ParseIssue[]
  llm_attempted: boolean
  last_parsed_at: string
  llm_attempted_at?: string
}

export interface ParseIssue {
  code: string
  field: string
  message: string
}

export interface RawMetadata {
  onchain: OnchainMetadata[]
  offchain_uri?: string
  offchain_content?: any
}

export interface OnchainMetadata {
  key: string
  value: string
  decoded?: string
}

export interface FieldSources {
  [key: string]: 'onchain' | 'offchain' | 'hardcoded' | null
}

// Agent Registry Response Types
export interface AgentListResponse {
  success: boolean
  data: AgentProfile[]
  meta: ResponseMeta
}

export interface AgentResponse {
  success: boolean
  data: AgentProfile
  meta: ResponseMeta
}

export interface ResponseMeta {
  version: string
  timestamp: string
  requestId: string
  pagination?: Pagination
}

export interface Pagination {
  page: number
  limit: number
  total: number
  hasMore: boolean
}

// Search & Filter Types
export interface AgentSearchParams {
  search?: string
  chainId?: number
  ownerAddress?: string
  protocol?: string
  sortBy?: 'created_at' | 'stars' | 'name' | 'token_id' | 'total_score'
  sortOrder?: 'asc' | 'desc'
  isTestnet?: boolean
  minScore?: number
  categories?: string[]
  tags?: string[]
  isActive?: boolean
  isVerified?: boolean
}

export interface AgentSearchResponse {
  success: boolean
  data: AgentProfile[]
  meta: ResponseMeta
}

// Agent Creation & Update Types
export interface CreateAgentRequest {
  name: string
  description: string
  image?: string
  agent_type?: string
  categories: string[]
  tags: string[]
  capabilities: string[]
  services: AgentServices
  supported_protocols: string[]
  supported_trust_models: string[]
  active: boolean
  x402Support?: boolean
}

export interface UpdateAgentRequest {
  name?: string
  description?: string
  image?: string
  categories?: string[]
  tags?: string[]
  capabilities?: string[]
  services?: Partial<AgentServices>
  active?: boolean
}

// Agent Statistics
export interface AgentStats {
  total_agents: number
  total_users: number
  total_feedbacks: number
  total_validations: number
  active_agents: number
  verified_agents: number
  average_score: number
  chain_distribution: ChainStats[]
}

export interface ChainStats {
  chain_id: number
  name: string
  agent_count: number
  is_testnet: boolean
}

// Agent Feedback
export interface AgentFeedback {
  id: string
  agent_id: string
  user_id: string
  score: number
  comment: string
  created_at: string
  helpful_count: number
}

// Agent Health Check
export interface HealthCheckResult {
  agent_id: string
  status: 'healthy' | 'degraded' | 'unhealthy'
  score: number
  checks: HealthCheck[]
  timestamp: string
}

export interface HealthCheck {
  name: string
  status: 'pass' | 'fail' | 'warn'
  message: string
  response_time?: number
  details?: any
}
