import { mutation, query, internalMutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

// Real-time agent communication channels
export const createAgentChannel = mutation({
  args: {
    channelName: v.string(),
    participants: v.array(v.string()),
    channelType: v.union(v.literal("delegation"), v.literal("collaboration"), v.literal("broadcast")),
  },
  handler: async (ctx, args) => {
    const channelId = await ctx.db.insert("agentChannels", {
      ...args,
      createdAt: Date.now(),
      isActive: true,
      lastActivity: Date.now(),
    });
    return channelId;
  },
});

// Subscribe to agent channel updates
export const getAgentChannel = query({
  args: {
    channelId: v.id("agentChannels"),
  },
  handler: async (ctx, args) => {
    const channel = await ctx.db.get(args.channelId);
    if (!channel) throw new Error("Channel not found");
    
    // Get recent messages
    const messages = await ctx.db
      .query("agentMessages")
      .withIndex("by_channel", (q) => q.eq("channelId", args.channelId))
      .order("desc")
      .take(50);
    
    return {
      channel,
      messages: messages.reverse(),
    };
  },
});

// Send message to agent channel
export const sendAgentMessage = mutation({
  args: {
    channelId: v.id("agentChannels"),
    senderId: v.string(),
    message: v.string(),
    messageType: v.union(v.literal("delegation"), v.literal("response"), v.literal("status"), v.literal("heartbeat")),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const messageId = await ctx.db.insert("agentMessages", {
      ...args,
      timestamp: Date.now(),
    });
    
    // Update channel last activity
    await ctx.db.patch(args.channelId, {
      lastActivity: Date.now(),
    });
    
    return messageId;
  },
});

// Delegate task from one agent to another
export const delegateTaskToAgent = mutation({
  args: {
    fromAgent: v.string(),
    toAgent: v.string(),
    task: v.string(),
    priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high"), v.literal("urgent")),
    context: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const delegationId = `delegation_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    
    // Create channel for delegation communication
    const channelId = await ctx.db.insert("agentChannels", {
      channelName: `delegation_${delegationId}`,
      participants: [args.fromAgent, args.toAgent],
      channelType: "delegation",
      createdAt: Date.now(),
      isActive: true,
      lastActivity: Date.now(),
    });

    // Create delegation record
    const delegationRecord = await ctx.db.insert("agentDelegations", {
      delegationId,
      channelId,
      fromAgent: args.fromAgent,
      toAgent: args.toAgent,
      task: args.task,
      priority: args.priority,
      context: args.context,
      status: "pending",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    
    // Send delegation message
    await ctx.db.insert("agentMessages", {
      channelId,
      senderId: args.fromAgent,
      message: args.task,
      messageType: "delegation",
      timestamp: Date.now(),
      metadata: {
        delegationId,
        priority: args.priority,
        context: args.context,
      },
    });

    // Log activity
    await ctx.db.insert("agentActivities", {
      type: "delegate",
      agentId: args.fromAgent,
      summary: `Delegated task to ${args.toAgent}: ${args.task.slice(0, 100)}${args.task.length > 100 ? '...' : ''}`,
      meta: {
        delegationId,
        toAgent: args.toAgent,
        priority: args.priority,
        taskLength: args.task.length,
      },
      status: "success",
      createdAt: Date.now(),
    });
    
    return {
      delegationId,
      channelId,
      status: "pending",
    };
  },
});

// Get active delegations for an agent
export const getAgentDelegations = query({
  args: {
    agentId: v.string(),
    status: v.optional(v.union(v.literal("pending"), v.literal("accepted"), v.literal("rejected"), v.literal("completed"), v.literal("failed"))),
  },
  handler: async (ctx, args) => {
    let delegations = await ctx.db
      .query("agentDelegations")
      .filter((q) => 
        q.or(
          q.eq(q.field("fromAgent"), args.agentId),
          q.eq(q.field("toAgent"), args.agentId)
        )
      )
      .collect();
    
    if (args.status) {
      delegations = delegations.filter(d => d.status === args.status);
    }
    
    return delegations.sort((a, b) => b.createdAt - a.createdAt);
  },
});

// Subscribe to delegations for an agent (real-time updates)
export const subscribeToAgentDelegations = query({
  args: {
    agentId: v.string(),
  },
  handler: async (ctx, args) => {
    // This query will be used with useSubscription for real-time updates
    return await ctx.db
      .query("agentDelegations")
      .filter((q) => 
        q.or(
          q.eq(q.field("fromAgent"), args.agentId),
          q.eq(q.field("toAgent"), args.agentId)
        )
      )
      .collect();
  },
});

// Get agent activities
export const getAgentActivities = query({
  args: {
    agentId: v.optional(v.string()),
    type: v.optional(v.union(v.literal("sandbox_run"), v.literal("chat_message"), v.literal("delegate"), v.literal("file_upload"), v.literal("desktop_action"), v.literal("mcp_call"))),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("agentActivities").order("desc");
    
    if (args.agentId) {
      query = query.filter((q) => q.eq(q.field("agentId"), args.agentId));
    }
    
    if (args.type) {
      query = query.filter((q) => q.eq(q.field("type"), args.type));
    }
    
    const activities = await query.take(args.limit || 50);
    return activities;
  },
});

// Accept/reject delegation
export const respondToDelegation = mutation({
  args: {
    delegationId: v.string(),
    response: v.union(v.literal("accepted"), v.literal("rejected"), v.literal("failed")),
    responseMessage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const delegation = await ctx.db
      .query("agentDelegations")
      .withIndex("by_delegationId", (q) => q.eq("delegationId", args.delegationId))
      .first();
    
    if (!delegation) throw new Error("Delegation not found");
    
    await ctx.db.patch(delegation._id, {
      status: args.response,
      updatedAt: Date.now(),
    });
    
    // Send response message to channel
    const channels = await ctx.db
      .query("agentChannels")
      .withIndex("by_participants", (q) => 
        q.eq("participants", [delegation.fromAgent, delegation.toAgent].sort())
      )
      .collect();
    
    if (channels.length > 0) {
      await ctx.db.insert("agentMessages", {
        channelId: channels[0]._id,
        senderId: delegation.toAgent,
        message: args.responseMessage || `Delegation ${args.response}`,
        messageType: "response",
        timestamp: Date.now(),
        metadata: {
          delegationId: args.delegationId,
          response: args.response,
        },
      });
    }
    
    return delegation._id;
  },
});

// Agent heartbeat for real-time status
export const updateAgentHeartbeat = mutation({
  args: {
    agentId: v.string(),
    status: v.union(v.literal("online"), v.literal("busy"), v.literal("offline")),
    currentTask: v.optional(v.string()),
    capabilities: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("agentHeartbeats")
      .withIndex("by_agentId", (q) => q.eq("agentId", args.agentId))
      .first();
    
    if (existing) {
      await ctx.db.patch(existing._id, {
        ...args,
        lastHeartbeat: Date.now(),
      });
    } else {
      await ctx.db.insert("agentHeartbeats", {
        ...args,
        lastHeartbeat: Date.now(),
        createdAt: Date.now(),
      });
    }
  },
});

// Get real-time agent status
export const getAgentStatus = query({
  args: {
    agentIds: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    let heartbeats = await ctx.db.query("agentHeartbeats").collect();
    
    if (args.agentIds) {
      heartbeats = heartbeats.filter(h => args.agentIds!.includes(h.agentId));
    }
    
    // Filter out agents that haven't sent heartbeat in last 5 minutes
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    return heartbeats.filter(h => h.lastHeartbeat > fiveMinutesAgo);
  },
});

// Internal mutation for cleanup old messages
export const cleanupOldMessages = internalMutation({
  args: {},
  handler: async (ctx) => {
    const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    
    const oldMessages = await ctx.db
      .query("agentMessages")
      .withIndex("by_timestamp", (q) => q.lt("timestamp", oneWeekAgo))
      .collect();
    
    for (const message of oldMessages) {
      await ctx.db.delete(message._id);
    }
    
    return { deleted: oldMessages.length };
  },
});

// Internal mutations for actions
export const updateDelegationStatus = internalMutation({
  args: {
    delegationId: v.string(),
    status: v.union(v.literal("pending"), v.literal("accepted"), v.literal("rejected"), v.literal("completed"), v.literal("failed")),
  },
  handler: async (ctx, args) => {
    const delegation = await ctx.db
      .query("agentDelegations")
      .withIndex("by_delegationId", (q) => q.eq("delegationId", args.delegationId))
      .first();
    
    if (!delegation) throw new Error("Delegation not found");
    
    await ctx.db.patch(delegation._id, {
      status: args.status,
      updatedAt: Date.now(),
    });
    
    return delegation._id;
  },
});

export const updateAgentHeartbeatInternal = internalMutation({
  args: {
    agentId: v.string(),
    status: v.union(v.literal("online"), v.literal("busy"), v.literal("offline")),
    currentTask: v.optional(v.string()),
    capabilities: v.optional(v.array(v.string())),
    lastHeartbeat: v.number(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("agentHeartbeats")
      .withIndex("by_agentId", (q) => q.eq("agentId", args.agentId))
      .first();
    
    if (existing) {
      await ctx.db.patch(existing._id, {
        status: args.status,
        currentTask: args.currentTask,
        capabilities: args.capabilities,
        lastHeartbeat: args.lastHeartbeat,
      });
    } else {
      await ctx.db.insert("agentHeartbeats", {
        agentId: args.agentId,
        status: args.status,
        currentTask: args.currentTask,
        capabilities: args.capabilities,
        lastHeartbeat: args.lastHeartbeat,
        createdAt: Date.now(),
      });
    }
  },
});

export const getOldMessages = internalQuery({
  args: {
    timestamp: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("agentMessages")
      .withIndex("by_timestamp", (q) => q.lt("timestamp", args.timestamp))
      .collect();
  },
});

export const deleteMessage = internalMutation({
  args: {
    messageId: v.id("agentMessages"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.messageId);
  },
});
