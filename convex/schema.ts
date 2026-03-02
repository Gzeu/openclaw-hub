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
    lastUsed: v.optional(v.number()),
  }),

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
