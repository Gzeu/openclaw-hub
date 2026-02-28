import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// 1. Obține toate task-urile (opțional filtrate după status)
export const getTasks = query({
  args: { status: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (args.status) {
      return await ctx.db
        .query("tasks")
        .withIndex("by_status", (q) => q.eq("status", args.status as any))
        .collect();
    }
    return await ctx.db.query("tasks").order("desc").collect();
  },
});

// 2. User-ul creează un task nou (înainte de a face plata pe MultiversX)
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

// 3. User-ul (sau un cron) marchează task-ul ca plătit (după ce s-a semnat TX-ul)
export const markTaskFunded = mutation({
  args: {
    taskId: v.id("tasks"),
    paymentId: v.number(),
    txHashDeposit: v.string(),
  },
  handler: async (ctx, args) => {
    const task = await ctx.db.get(args.taskId);
    if (!task) throw new Error("Task not found");
    
    // În mod ideal, aici (sau într-un Action) se verifică pe blockchain dacă TX-ul e valid
    
    await ctx.db.patch(args.taskId, {
      status: "funded",
      paymentId: args.paymentId,
      txHashDeposit: args.txHashDeposit,
    });
  },
});

// 4. Agentul actualizează progresul/rezultatul
export const completeTask = mutation({
  args: {
    taskId: v.id("tasks"),
    result: v.string(),
  },
  handler: async (ctx, args) => {
    const task = await ctx.db.get(args.taskId);
    if (!task) throw new Error("Task not found");
    
    await ctx.db.patch(args.taskId, {
      status: "completed",
      result: args.result,
    });
    
    // Următorul pas arhitectural: Un Convex Action "observă" că statusul e "completed" 
    // și apelează smart contract-ul (funcția `release`) pentru a plăti agentul.
  },
});
