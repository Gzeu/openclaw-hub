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
