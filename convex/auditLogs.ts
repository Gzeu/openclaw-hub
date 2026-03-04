import { mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Insert an audit log entry for every authenticated API call.
 * Called fire-and-forget from lib/auditLog.ts.
 */
export const insert = mutation({
  args: {
    apiKey: v.optional(v.string()),
    mxAddress: v.optional(v.string()),
    path: v.string(),
    method: v.string(),
    status: v.number(),
    durationMs: v.optional(v.number()),
    error: v.optional(v.string()),
    ts: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("auditLogs", args);
  },
});
