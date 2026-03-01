import { query } from "./_generated/server";
import { v } from "convex/values";

// Get current user from token (without Node.js APIs)
export const getCurrentUser = query({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      // For demo purposes, return a mock user if token exists
      // In production, you'd verify JWT and get real user
      if (args.token && args.token.startsWith("eyJ")) {
        return {
          id: "temp-id",
          email: "test@example.com",
          name: "Test User",
          role: "user",
          avatar: undefined,
          emailVerified: true,
          lastLogin: Date.now(),
          createdAt: Date.now(),
        };
      }
      
      return null;
    } catch (error) {
      return null;
    }
  },
});

// Get user settings
export const getUserSettings = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const settings = await ctx.db
      .query("userSettings")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();

    return settings;
  },
});
