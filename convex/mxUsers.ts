import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Upsert a MultiversX user by mxAddress.
 * - If user exists: updates lastSeen, returns their stored apiKey.
 * - If new: inserts with provided candidateKey, returns it.
 */
export const upsertMxUser = mutation({
  args: {
    mxAddress: v.string(),
    apiKey: v.string(), // candidate key (used only on first insert)
  },
  handler: async (ctx, { mxAddress, apiKey }) => {
    const existing = await ctx.db
      .query("mxUsers")
      .withIndex("by_mxAddress", q => q.eq("mxAddress", mxAddress))
      .unique();

    const now = Date.now();

    if (existing) {
      await ctx.db.patch(existing._id, { lastSeen: now, updatedAt: now });
      return { apiKey: existing.apiKey, isNew: false };
    }

    await ctx.db.insert("mxUsers", {
      mxAddress,
      apiKey,
      budget: 0,
      totalSpent: 0,
      isActive: true,
      lastSeen: now,
      createdAt: now,
      updatedAt: now,
    });
    return { apiKey, isNew: true };
  },
});

export const getByMxAddress = query({
  args: { mxAddress: v.string() },
  handler: async (ctx, { mxAddress }) =>
    ctx.db
      .query("mxUsers")
      .withIndex("by_mxAddress", q => q.eq("mxAddress", mxAddress))
      .unique(),
});

export const getByApiKey = query({
  args: { apiKey: v.string() },
  handler: async (ctx, { apiKey }) =>
    ctx.db
      .query("mxUsers")
      .withIndex("by_apiKey", q => q.eq("apiKey", apiKey))
      .unique(),
});

export const deductBudget = mutation({
  args: {
    mxAddress: v.string(),
    costEgld: v.number(),
    skillKey: v.string(),
  },
  handler: async (ctx, { mxAddress, costEgld }) => {
    const user = await ctx.db
      .query("mxUsers")
      .withIndex("by_mxAddress", q => q.eq("mxAddress", mxAddress))
      .unique();
    if (!user) return;
    await ctx.db.patch(user._id, {
      budget: Math.max(0, user.budget - costEgld),
      totalSpent: user.totalSpent + costEgld,
      updatedAt: Date.now(),
    });
  },
});
