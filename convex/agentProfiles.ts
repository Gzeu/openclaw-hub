import { query, mutation } from "./_generated/server"
import { v } from "convex/values"

// Agent Registry Functions

// Create Agent Profile
export const create = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    image_url: v.optional(v.string()),
    owner_id: v.string(),
    owner_address: v.string(),
    creator_address: v.string(),
    agent_id: v.string(),
    token_id: v.string(),
    chain_id: v.number(),
    chain_type: v.union(v.literal("evm"), v.literal("svm"), v.literal("other")),
    is_testnet: v.boolean(),
    contract_address: v.string(),
    agent_wallet: v.string(),
    categories: v.array(v.string()),
    tags: v.array(v.string()),
    capabilities: v.array(v.string()),
    supported_protocols: v.array(v.string()),
    supported_trust_models: v.array(v.string()),
    x402_supported: v.boolean(),
    services: v.any(),
    registrations: v.array(v.any()),
    endpoints: v.array(v.any()),
    is_verified: v.boolean(),
    is_active: v.boolean(),
    star_count: v.number(),
    watch_count: v.number(),
    total_score: v.number(),
    total_feedbacks: v.number(),
    total_validations: v.number(),
    successful_validations: v.number(),
    average_score: v.number(),
    health_status: v.union(v.literal("healthy"), v.literal("degraded"), v.literal("unhealthy"), v.literal("unknown")),
    health_score: v.number(),
    quality_score: v.number(),
    popularity_score: v.number(),
    activity_score: v.number(),
    wallet_score: v.number(),
    freshness_score: v.number(),
    metadata_completeness_score: v.number(),
    parse_status: v.any(),
    raw_metadata: v.any(),
    field_sources: v.any(),
    created_at: v.string(),
    updated_at: v.string(),
  },
  handler: async (ctx, args) => {
    const agentId = await ctx.db.insert("agentProfiles").returnId()
    return agentId
  },
})

// Update Agent Profile
export const update = mutation({
  args: {
    id: v.id("agentProfiles"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    image_url: v.optional(v.string()),
    categories: v.optional(v.array(v.string())),
    tags: v.optional(v.array(v.string())),
    capabilities: v.optional(v.array(v.string())),
    supported_protocols: v.optional(v.array(v.string())),
    services: v.optional(v.any()),
    is_active: v.optional(v.boolean()),
    health_status: v.optional(v.union(v.literal("healthy"), v.literal("degraded"), v.literal("unhealthy"), v.literal("unknown"))),
    health_score: v.optional(v.number()),
    updated_at: v.string(),
  },
  handler: async (ctx, args) => {
    const { id, ...updateData } = args
    await ctx.db.patch(id, updateData)
  },
})

// Get Agent by ID
export const getById = query({
  args: { id: v.id("agentProfiles") },
  handler: async (ctx, args) => {
    const agent = await ctx.db.get(args.id)
    return agent
  },
})

// List Agents
export const list = query({
  args: {},
  handler: async (ctx) => {
    const agents = await ctx.db.query("agentProfiles").collect()
    return agents
  },
})

// Count Agents
export const count = query({
  args: {},
  handler: async (ctx) => {
    const agents = await ctx.db.query("agentProfiles").collect()
    return agents.length
  },
})

// Filter Agents
export const filter = query({
  args: {
    isActive: v.optional(v.boolean()),
    isVerified: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("agentProfiles")
    
    if (args.isActive !== undefined) {
      query = query.filter(q => q.eq("is_active", args.isActive))
    }
    if (args.isVerified !== undefined) {
      query = query.filter(q => q.eq("is_verified", args.isVerified))
    }
    
    const agents = await query.collect()
    return agents
  },
})

// Delete Agent
export const deleteAgent = mutation({
  args: { id: v.id("agentProfiles") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id)
  },
})

// Agent Feedback Functions

// Create Feedback
export const createFeedback = mutation({
  args: {
    agent_id: v.id("agentProfiles"),
    user_id: v.string(),
    score: v.number(),
    comment: v.string(),
    helpful_count: v.number(),
    created_at: v.string(),
  },
  handler: async (ctx, args) => {
    const feedbackId = await ctx.db.insert("agentFeedbacks").returnId()
    return feedbackId
  },
})

// Get Agent Feedback
export const getAgentFeedback = query({
  args: {
    agent_id: v.id("agentProfiles"),
    limit: v.optional(v.number()),
    minScore: v.optional(v.number()),
    maxScore: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("agentFeedbacks")
      .filter(q => q.eq("agent_id", args.agent_id))
    
    if (args.minScore !== undefined) {
      query = query.filter(q => q.gte("score", args.minScore))
    }
    if (args.maxScore !== undefined) {
      query = query.filter(q => q.lte("score", args.maxScore))
    }
    
    if (args.limit) {
      query = query.limit(args.limit)
    }
    
    const feedbacks = await query.order("desc", "created_at").collect()
    return feedbacks
  },
})

// Agent Health Check Functions

// Create Health Check
export const createHealthCheck = mutation({
  args: {
    agent_id: v.id("agentProfiles"),
    status: v.union(v.literal("healthy"), v.literal("degraded"), v.literal("unhealthy")),
    score: v.number(),
    checks: v.array(v.any()),
    timestamp: v.string(),
  },
  handler: async (ctx, args) => {
    const healthCheckId = await ctx.db.insert("agentHealthChecks").returnId()
    
    // Update agent health status
    await ctx.db.patch(args.agent_id, {
      health_status: args.status,
      health_score: args.score,
      health_checked_at: args.timestamp,
    })
    
    return healthCheckId
  },
})

// Get Agent Health History
export const getAgentHealthHistory = query({
  args: {
    agent_id: v.id("agentProfiles"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const history = await ctx.db.query("agentHealthChecks")
      .filter(q => q.eq("agent_id", args.agent_id))
      .order("desc", "timestamp")
      .limit(args.limit || 10)
      .collect()
    
    return history
  },
})

// User-Agent Relationship Functions

// Create User-Agent Relationship
export const createUserAgentRelationship = mutation({
  args: {
    user_id: v.string(),
    agent_id: v.id("agentProfiles"),
    relationship: v.union(v.literal("owner"), v.literal("creator"), v.literal("operator"), v.literal("user")),
    permissions: v.array(v.string()),
    created_at: v.string(),
  },
  handler: async (ctx, args) => {
    const relationshipId = await ctx.db.insert("userAgentRelationships").returnId()
    return relationshipId
  },
})

// Get User's Agents
export const getUserAgents = query({
  args: { user_id: v.string() },
  handler: async (ctx, args) => {
    const relationships = await ctx.db.query("userAgentRelationships")
      .filter(q => q.eq("user_id", args.user_id))
      .collect()
    
    const agentIds = relationships.map(r => r.agent_id)
    
    if (agentIds.length === 0) return []
    
    const agents = await ctx.db.query("agentProfiles")
      .filter(q => q.or(...agentIds.map(id => q.eq("_id", id))))
      .collect()
    
    // Add relationship info to each agent
    return agents.map(agent => {
      const relationship = relationships.find(r => r.agent_id === agent._id)
      return {
        ...agent,
        relationship: relationship?.relationship || null,
        permissions: relationship?.permissions || [],
      }
    })
  },
})

// Agent Statistics
export const getAgentStats = query({
  args: {},
  handler: async (ctx) => {
    const [totalAgents, activeAgents, verifiedAgents, allAgents] = await Promise.all([
      ctx.db.query("agentProfiles").count(),
      ctx.db.query("agentProfiles").filter(q => q.eq("is_active", true)).count(),
      ctx.db.query("agentProfiles").filter(q => q.eq("is_verified", true)).count(),
      ctx.db.query("agentProfiles").collect(),
    ])

    const avgScore = allAgents.length > 0 
      ? allAgents.reduce((sum, agent) => sum + agent.total_score, 0) / allAgents.length 
      : 0

    return {
      total_agents: totalAgents,
      active_agents: activeAgents,
      verified_agents: verifiedAgents,
      average_score: avgScore,
    }
  },
})
