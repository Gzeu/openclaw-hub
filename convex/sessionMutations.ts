import { mutation } from "./_generated/server";
import { v } from "convex/values";

// Create user session
export const createUserSession = mutation({
  args: {
    userId: v.id("users"),
    token: v.string(),
    expiresAt: v.number(),
    isActive: v.boolean(),
    userAgent: v.optional(v.string()),
    ipAddress: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const sessionId = await ctx.db.insert("userSessions", {
      userId: args.userId,
      token: args.token,
      expiresAt: args.expiresAt,
      isActive: args.isActive,
      userAgent: args.userAgent,
      ipAddress: args.ipAddress,
      createdAt: Date.now(),
    });

    return { sessionId };
  },
});
