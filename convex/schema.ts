import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Users and authentication
  users: defineTable({
    email: v.string(),
    name: v.string(),
    password: v.string(), // hashed password
    avatar: v.optional(v.string()),
    role: v.union(v.literal("user"), v.literal("admin"), v.literal("operator")),
    isActive: v.boolean(),
    emailVerified: v.boolean(),
    lastLogin: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
  .index("by_email", ["email"])
  .index("by_role", ["role"])
  .index("by_createdAt", ["createdAt"]),

  // User sessions
  userSessions: defineTable({
    userId: v.id("users"),
    token: v.string(),
    expiresAt: v.number(),
    isActive: v.boolean(),
    userAgent: v.optional(v.string()),
    ipAddress: v.optional(v.string()),
    createdAt: v.number(),
  })
  .index("by_token", ["token"])
  .index("by_userId", ["userId"])
  .index("by_expiresAt", ["expiresAt"]),

  // User settings and preferences
  userSettings: defineTable({
    userId: v.id("users"),
    theme: v.union(v.literal("dark"), v.literal("light"), v.literal("auto")),
    language: v.string(),
    notifications: v.optional(v.any()),
    apiKeys: v.optional(v.any()), // encrypted API keys
    providerConfigs: v.optional(v.any()),
    preferences: v.optional(v.any()),
    updatedAt: v.number(),
  })
  .index("by_userId", ["userId"]),

  // AI Providers
  aiProviders: defineTable({
    name: v.string(),
    type: v.union(v.literal("openai"), v.literal("anthropic"), v.literal("local"), v.literal("huggingface"), v.literal("custom")),
    apiUrl: v.optional(v.string()),
    apiKeyRequired: v.boolean(),
    supportedModels: v.array(v.string()),
    maxTokens: v.optional(v.number()),
    pricing: v.optional(v.any()), // pricing info per model
    isActive: v.boolean(),
    createdBy: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
  .index("by_type", ["type"])
  .index("by_createdBy", ["createdBy"])
  .index("by_active", ["isActive"]),

  // AI Models
  aiModels: defineTable({
    providerId: v.id("aiProviders"),
    name: v.string(),
    modelId: v.string(), // e.g., "gpt-4", "claude-3-opus"
    type: v.union(v.literal("chat"), v.literal("completion"), v.literal("embedding"), v.literal("image")),
    maxTokens: v.number(),
    costPerToken: v.optional(v.number()),
    capabilities: v.array(v.string()), // e.g., ["function-calling", "vision", "code"]
    isActive: v.boolean(),
    createdAt: v.number(),
  })
  .index("by_providerId", ["providerId"])
  .index("by_type", ["type"])
  .index("by_active", ["isActive"]),

  // User API Keys (encrypted storage)
  userApiKeys: defineTable({
    userId: v.id("users"),
    providerId: v.id("aiProviders"),
    encryptedApiKey: v.string(),
    keyName: v.string(),
    isActive: v.boolean(),
    lastUsed: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
  .index("by_userId", ["userId"])
  .index("by_providerId", ["providerId"])
  .index("by_active", ["isActive"]),

  // Agent Registry - Enhanced Agent Profiles (ERC-8004 Inspired)
  agentProfiles: defineTable({
    // Basic Identity
    name: v.string(),
    description: v.optional(v.string()),
    image_url: v.optional(v.string()),
    avatar_url: v.optional(v.string()),
    
    // Owner & Creator
    owner_id: v.string(),
    owner_address: v.string(),
    owner_ens: v.optional(v.string()),
    owner_username: v.optional(v.string()),
    owner_avatar_url: v.optional(v.string()),
    creator_address: v.string(),
    
    // Blockchain Integration
    agent_id: v.string(),
    token_id: v.string(),
    chain_id: v.number(),
    chain_type: v.union(v.literal("evm"), v.literal("svm"), v.literal("other")),
    is_testnet: v.boolean(),
    contract_address: v.string(),
    agent_wallet: v.string(),
    
    // Agent Classification
    agent_type: v.optional(v.string()),
    categories: v.array(v.string()),
    tags: v.array(v.string()),
    capabilities: v.array(v.string()),
    
    // Protocol Support
    supported_protocols: v.array(v.string()),
    supported_trust_models: v.array(v.string()),
    x402_supported: v.boolean(),
    
    // Services & Endpoints
    services: v.object({
      mcp: v.optional(v.object({
        name: v.string(),
        endpoint: v.optional(v.string()),
        version: v.optional(v.string()),
        tools: v.array(v.any()),
        prompts: v.array(v.any()),
        resources: v.array(v.any()),
      })),
      a2a: v.optional(v.object({
        name: v.string(),
        endpoint: v.optional(v.string()),
        version: v.optional(v.string()),
        skills: v.array(v.string()),
      })),
      oasf: v.optional(v.object({
        name: v.string(),
        endpoint: v.optional(v.string()),
        version: v.optional(v.string()),
        skills: v.array(v.string()),
        domains: v.array(v.string()),
      })),
      web: v.optional(v.object({
        name: v.string(),
        endpoint: v.optional(v.string()),
      })),
      api: v.optional(v.object({
        name: v.string(),
        endpoint: v.optional(v.string()),
        version: v.optional(v.string()),
      })),
      agentWallet: v.optional(v.object({
        name: v.string(),
        endpoint: v.optional(v.string()),
      })),
    }),
    registrations: v.array(v.object({
      chain_id: v.number(),
      contract_address: v.string(),
      token_id: v.string(),
      registered_at: v.string(),
    })),
    endpoints: v.array(v.object({
      name: v.string(),
      url: v.string(),
      protocol: v.string(),
      version: v.optional(v.string()),
      status: v.union(v.literal("active"), v.literal("inactive"), v.literal("error")),
      last_checked: v.optional(v.string()),
      response_time: v.optional(v.number()),
    })),
    
    // Performance & Reputation
    is_verified: v.boolean(),
    is_active: v.boolean(),
    star_count: v.number(),
    watch_count: v.number(),
    total_score: v.number(),
    total_feedbacks: v.number(),
    total_validations: v.number(),
    successful_validations: v.number(),
    average_score: v.number(),
    rank: v.optional(v.number()),
    
    // Health & Monitoring
    health_status: v.union(v.literal("healthy"), v.literal("degraded"), v.literal("unhealthy"), v.literal("unknown")),
    health_score: v.optional(v.number()),
    health_checked_at: v.optional(v.string()),
    is_endpoint_verified: v.boolean(),
    endpoint_verified_at: v.optional(v.string()),
    endpoint_verified_domain: v.optional(v.string()),
    endpoint_verification_error: v.optional(v.string()),
    endpoint_last_checked_at: v.optional(v.string()),
    
    // Scoring System
    scores: v.optional(v.object({
      execution_quality: v.number(),
      reliability: v.number(),
      security: v.number(),
      performance: v.number(),
      user_satisfaction: v.number(),
    })),
    quality_score: v.number(),
    popularity_score: v.number(),
    activity_score: v.number(),
    wallet_score: v.number(),
    freshness_score: v.number(),
    metadata_completeness_score: v.number(),
    
    // Metadata & Parsing
    parse_status: v.object({
      status: v.union(v.literal("success"), v.literal("error"), v.literal("warning")),
      info: v.array(v.object({
        code: v.string(),
        field: v.string(),
        message: v.string(),
      })),
      errors: v.array(v.object({
        code: v.string(),
        field: v.string(),
        message: v.string(),
      })),
      warnings: v.array(v.object({
        code: v.string(),
        field: v.string(),
        message: v.string(),
      })),
      llm_attempted: v.boolean(),
      last_parsed_at: v.string(),
      llm_attempted_at: v.optional(v.string()),
    }),
    raw_metadata: v.object({
      onchain: v.array(v.object({
        key: v.string(),
        value: v.string(),
        decoded: v.optional(v.string()),
      })),
      offchain_uri: v.optional(v.string()),
      offchain_content: v.optional(v.any()),
    }),
    field_sources: v.record(v.string(), v.union(v.literal("onchain"), v.literal("offchain"), v.literal("hardcoded"), v.null())),
    
    // Decentralized Identity
    ens: v.optional(v.string()),
    did: v.optional(v.string()),
    mcp_server: v.optional(v.string()),
    mcp_version: v.optional(v.string()),
    a2a_endpoint: v.optional(v.string()),
    a2a_version: v.optional(v.string()),
    agent_url: v.optional(v.string()),
    
    // Timestamps
    created_at: v.string(),
    updated_at: v.string(),
    created_block_number: v.optional(v.number()),
    created_tx_hash: v.optional(v.string()),
  })
  .index("by_agent_id", ["agent_id"])
  .index("by_owner", ["owner_address"])
  .index("by_creator", ["creator_address"])
  .index("by_chain_id", ["chain_id"])
  .index("by_token_id", ["token_id"])
  .index("by_total_score", ["total_score"])
  .index("by_health_status", ["health_status"])
  .index("by_is_active", ["is_active"])
  .index("by_created_at", ["created_at"]),

  // Agent Feedback System
  agentFeedbacks: defineTable({
    agent_id: v.id("agentProfiles"),
    user_id: v.string(),
    score: v.number(),
    comment: v.string(),
    helpful_count: v.number(),
    created_at: v.string(),
  })
  .index("by_agent_id", ["agent_id"])
  .index("by_user_id", ["user_id"])
  .index("by_score", ["score"])
  .index("by_created_at", ["created_at"]),

  // Agent Health Checks
  agentHealthChecks: defineTable({
    agent_id: v.id("agentProfiles"),
    status: v.union(v.literal("healthy"), v.literal("degraded"), v.literal("unhealthy")),
    score: v.number(),
    checks: v.array(v.object({
      name: v.string(),
      status: v.union(v.literal("pass"), v.literal("fail"), v.literal("warn")),
      message: v.string(),
      response_time: v.optional(v.number()),
      details: v.optional(v.any()),
    })),
    timestamp: v.string(),
  })
  .index("by_agent_id", ["agent_id"])
  .index("by_status", ["status"])
  .index("by_timestamp", ["timestamp"]),

  // User-Agent Relationships
  userAgentRelationships: defineTable({
    user_id: v.string(),
    agent_id: v.id("agentProfiles"),
    relationship: v.union(v.literal("owner"), v.literal("creator"), v.literal("operator"), v.literal("user")),
    permissions: v.array(v.string()),
    created_at: v.string(),
  })
  .index("by_user_id", ["user_id"])
  .index("by_agent_id", ["agent_id"])
  .index("by_relationship", ["relationship"]),

  // Legacy agents (for backward compatibility)
  agents: defineTable({
    name: v.string(),
    description: v.string(),
    walletAddress: v.string(), // The agent developer's MultiversX address
    capabilities: v.array(v.string()),
    isActive: v.boolean(),
    version: v.optional(v.string()),
    framework: v.optional(v.string()),
    endpointUrl: v.optional(v.string()),
    sessionKey: v.optional(v.string()),
    preferredModel: v.optional(v.string()),
    createdAt: v.optional(v.number()),
    updatedAt: v.optional(v.number()),
    lastUsed: v.optional(v.number())
  })
  .index("by_walletAddress", ["walletAddress"])
  .index("by_sessionKey", ["sessionKey"])
  .index("by_isActive", ["isActive"])
  .index("by_createdAt", ["createdAt"]),

  tasks: defineTable({
    creatorAddress: v.string(), 
    agentId: v.optional(v.id("agents")), 
    prompt: v.string(), 
    status: v.union(
      v.literal("pending_deposit"), 
      v.literal("funded"),          
      v.literal("in_progress"),     
      v.literal("completed"),       
      v.literal("failed")           
    ),
    paymentId: v.optional(v.number()), 
    escrowAmount: v.string(), 
    result: v.optional(v.string()), 
    txHashDeposit: v.optional(v.string()), 
    txHashRelease: v.optional(v.string()), 
  })
  .index("by_creator", ["creatorAddress"])
  .index("by_status", ["status"])
  .index("by_agent", ["agentId"]),

  // Agent communication channels
  agentChannels: defineTable({
    channelName: v.string(),
    participants: v.array(v.string()),
    channelType: v.union(v.literal("delegation"), v.literal("collaboration"), v.literal("broadcast")),
    createdAt: v.number(),
    lastActivity: v.number(),
    isActive: v.boolean(),
  })
  .index("by_participants", ["participants"])
  .index("by_type", ["channelType"])
  .index("by_activity", ["lastActivity"]),

  // Agent messages in channels
  agentMessages: defineTable({
    channelId: v.id("agentChannels"),
    senderId: v.string(),
    message: v.string(),
    messageType: v.union(v.literal("delegation"), v.literal("response"), v.literal("status"), v.literal("heartbeat")),
    timestamp: v.number(),
    metadata: v.optional(v.any()),
  })
  .index("by_channel", ["channelId"])
  .index("by_sender", ["senderId"])
  .index("by_timestamp", ["timestamp"]),

  // Agent delegations
  agentDelegations: defineTable({
    delegationId: v.string(),
    channelId: v.optional(v.id("agentChannels")),
    fromAgent: v.string(),
    toAgent: v.string(),
    task: v.string(),
    priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high"), v.literal("urgent")),
    status: v.union(v.literal("pending"), v.literal("accepted"), v.literal("rejected"), v.literal("completed"), v.literal("failed")),
    context: v.optional(v.any()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
  .index("by_delegationId", ["delegationId"])
  .index("by_fromAgent", ["fromAgent"])
  .index("by_toAgent", ["toAgent"])
  .index("by_status", ["status"]),

  // Agent heartbeats for real-time status
  agentHeartbeats: defineTable({
    agentId: v.string(),
    status: v.union(v.literal("online"), v.literal("busy"), v.literal("offline")),
    currentTask: v.optional(v.string()),
    capabilities: v.optional(v.array(v.string())),
    lastHeartbeat: v.number(),
    createdAt: v.number(),
  })
  .index("by_agentId", ["agentId"])
  .index("by_status", ["status"])
  .index("by_heartbeat", ["lastHeartbeat"]),

  // Agent activities for logging
  agentActivities: defineTable({
    type: v.union(v.literal("sandbox_run"), v.literal("chat_message"), v.literal("delegate"), v.literal("file_upload"), v.literal("desktop_action"), v.literal("mcp_call")),
    agentId: v.optional(v.string()),
    summary: v.string(),
    meta: v.optional(v.any()),
    durationMs: v.optional(v.number()),
    status: v.union(v.literal("success"), v.literal("error"), v.literal("running")),
    createdAt: v.number(),
  })
  .index("by_agentId", ["agentId"])
  .index("by_type", ["type"])
  .index("by_status", ["status"])
  .index("by_createdAt", ["createdAt"]),
});

