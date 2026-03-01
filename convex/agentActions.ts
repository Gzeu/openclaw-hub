"use node";

import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

// Agent delegation action that can use Node.js APIs
export const processAgentDelegation = internalAction({
  args: {
    delegationId: v.string(),
    fromAgent: v.string(),
    toAgent: v.string(),
    task: v.string(),
    priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high"), v.literal("urgent")),
    context: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    console.log(`Processing delegation ${args.delegationId} from ${args.fromAgent} to ${args.toAgent}`);
    
    try {
      // Update delegation status to in_progress
      await ctx.runMutation(internal.agentComms.updateDelegationStatus, {
        delegationId: args.delegationId,
        status: "accepted",
      });

      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mark as completed
      await ctx.runMutation(internal.agentComms.updateDelegationStatus, {
        delegationId: args.delegationId,
        status: "completed",
      });

      return { success: true, delegationId: args.delegationId };
    } catch (error) {
      console.error(`Failed to process delegation ${args.delegationId}:`, error);
      
      // Mark as failed
      await ctx.runMutation(internal.agentComms.updateDelegationStatus, {
        delegationId: args.delegationId,
        status: "failed",
      });

      throw error;
    }
  },
});

// Agent heartbeat action
export const processAgentHeartbeat = internalAction({
  args: {
    agentId: v.string(),
    status: v.union(v.literal("online"), v.literal("busy"), v.literal("offline")),
    currentTask: v.optional(v.string()),
    capabilities: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    console.log(`Processing heartbeat for ${args.agentId}: ${args.status}`);
    
    // Update heartbeat in database
    await ctx.runMutation(internal.agentComms.updateAgentHeartbeatInternal, {
      agentId: args.agentId,
      status: args.status,
      currentTask: args.currentTask,
      capabilities: args.capabilities,
      lastHeartbeat: Date.now(),
    });

    return { success: true, agentId: args.agentId };
  },
});

// Cleanup old messages action
export const cleanupOldMessages = internalAction({
  args: {},
  handler: async (ctx): Promise<{ deleted: number }> => {
    const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    
    // Get old messages
    const oldMessages = await ctx.runQuery(internal.agentComms.getOldMessages, {
      timestamp: oneWeekAgo,
    });

    // Delete old messages
    for (const message of oldMessages) {
      await ctx.runMutation(internal.agentComms.deleteMessage, {
        messageId: message._id,
      });
    }

    console.log(`Cleaned up ${oldMessages.length} old messages`);
    return { deleted: oldMessages.length };
  },
});
