import { mutation, query, internalQuery, internalMutation } from "./_generated/server";
import { v } from "convex/values";

export const getTasks = query({
  args: { status: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (args.status) {
      return await ctx.db
        .query("tasks")
        .withIndex("by_status", (q) => q.eq("status", args.status as any))
        .order("desc")
        .collect();
    }
    return await ctx.db.query("tasks").order("desc").collect();
  },
});

export const createTask = mutation({
  args: {
    creatorAddress: v.string(),
    prompt: v.string(),
    escrowAmount: v.string(),
  },
  handler: async (ctx, args) => {
    const taskId = await ctx.db.insert("tasks", {
      creatorAddress: args.creatorAddress,
      prompt: args.prompt,
      escrowAmount: args.escrowAmount,
      status: "pending_deposit",
    });
    return taskId;
  },
});

// Update pentru frontend - doar ataseaza TX hash-ul, cron-ul valideaza
export const attachTxHashToTask = mutation({
  args: {
    taskId: v.id("tasks"),
    txHashDeposit: v.string(),
  },
  handler: async (ctx, args) => {
    const task = await ctx.db.get(args.taskId);
    if (!task) throw new Error("Task not found");
    
    await ctx.db.patch(args.taskId, {
      txHashDeposit: args.txHashDeposit,
    });
  },
});

// --- INTERNAL FUNCTIONS (Pot fi chemate doar de backend/actions/cron) ---

export const getTasksByStatus = internalQuery({
  args: { status: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("tasks")
      .withIndex("by_status", (q) => q.eq("status", args.status as any))
      .collect();
  },
});

export const internalMarkTaskFunded = internalMutation({
  args: {
    taskId: v.id("tasks"),
    paymentId: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.taskId, {
      status: "funded",
      paymentId: args.paymentId,
    });
  },
});

export const updateTaskStatus = internalMutation({
  args: {
    taskId: v.id("tasks"),
    status: v.union(v.literal("in_progress"), v.literal("failed")),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.taskId, {
      status: args.status,
    });
  },
});

export const saveAgentResult = internalMutation({
  args: {
    taskId: v.id("tasks"),
    result: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.taskId, {
      status: "completed",
      result: args.result,
    });
  },
});
