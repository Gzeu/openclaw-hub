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

// A function for developers to register their external agents
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

// Initial seed function to populate the DB with our native agent
export const seedNativeAgent = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("agents").collect();
    if (existing.length === 0) {
      await ctx.db.insert("agents", {
        name: "OpenClaw Base Agent",
        description: "Native Hub LLM (Claude 3) equipped with MultiversX tool calling. Fast, reliable, and runs on-platform.",
        walletAddress: "erd1qqqqqqqqqqqqqpgq...replace_with_hub_address", // Banii raman in hub default
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
