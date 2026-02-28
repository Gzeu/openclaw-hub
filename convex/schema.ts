import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  agents: defineTable({
    name: v.string(),
    description: v.string(),
    walletAddress: v.string(), // The agent developer's MultiversX address
    capabilities: v.array(v.string()),
    isActive: v.boolean(),
    version: v.optional(v.string()), // e.g. "1.0.0"
    framework: v.optional(v.string()), // e.g. "LangChain", "Native Hub", "Eliza"
    endpointUrl: v.optional(v.string()), // Used if agent is hosted externally
  }),

  tasks: defineTable({
    creatorAddress: v.string(), 
    agentId: v.optional(v.id("agents")), 
    prompt: v.string(), 
    status: v.union(
      v.literal("pending_deposit"), 
      v.literal("funded"),          
      v.literal("in_progress"),     
      v.literal("completed"),       
      v.literal("failed")           
    ),
    paymentId: v.optional(v.number()), 
    escrowAmount: v.string(), 
    result: v.optional(v.string()), 
    txHashDeposit: v.optional(v.string()), 
    txHashRelease: v.optional(v.string()), 
  })
  .index("by_creator", ["creatorAddress"])
  .index("by_status", ["status"])
  .index("by_agent", ["agentId"]),
});
