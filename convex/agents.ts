import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getActiveAgents = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("agents")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
  },
});

export const registerAgent = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    walletAddress: v.string(),
    capabilities: v.array(v.string()),
    framework: v.optional(v.string()),
    endpointUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("agents", {
      ...args,
      isActive: true,
      version: "1.0",
    });
  },
});

export const createAgent = mutation({
  args: {
    name: v.string(),
    skills: v.array(v.string()),
    model: v.string(),
    description: v.optional(v.string()),
    owner: v.string(),
  },
  handler: async (ctx, args) => {
    // Generate unique session key
    const randomId = Math.random().toString(36).substring(2, 8);
    const sessionKey = `agent:${args.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}:${randomId}`;
    
    const agentId = await ctx.db.insert("agents", {
      name: args.name,
      description: args.description || `Agent ${args.name} with skills: ${args.skills.join(", ")}`,
      walletAddress: args.owner,
      capabilities: args.skills,
      isActive: true,
      version: "1.0",
      framework: "OpenClaw Hub",
      sessionKey,
      preferredModel: args.model,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    
    return {
      success: true,
      agentId,
      sessionKey,
    };
  },
});

export const seedNativeAgent = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("agents").collect();
    if (existing.length === 0) {
      await ctx.db.insert("agents", {
        name: "OpenClaw Base Agent",
        description: "Native Hub LLM equipped with MultiversX tool calling. Fast, reliable, and runs on-platform.",
        walletAddress: "erd1qqqqqqqqqqqqqpgq...replace_with_hub_address", 
        capabilities: ["MultiversX Queries", "Token Balances", "Network Stats", "General AI"],
        isActive: true,
        version: "1.0",
        framework: "Native Hub",
      });
      return "Seeded successfully";
    }
    return "Already seeded";
  }
});
