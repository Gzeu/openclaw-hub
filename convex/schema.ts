import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Tabela pentru agenții AI înscriși în platformă
  agents: defineTable({
    name: v.string(),
    description: v.string(),
    walletAddress: v.string(), // Adresa MultiversX (erd1...)
    capabilities: v.array(v.string()),
    isActive: v.boolean(),
  }),

  // Tabela pentru task-urile utilizatorilor (legate de Smart Contract)
  tasks: defineTable({
    creatorAddress: v.string(), // Wallet-ul userului (erd1...)
    agentId: v.optional(v.id("agents")), // Agentul asignat (opțional la început)
    prompt: v.string(), // Cerința utilizatorului
    status: v.union(
      v.literal("pending_deposit"), // Așteaptă depunerea EGLD în escrow
      v.literal("funded"),          // EGLD depus, task pregătit pentru agent
      v.literal("in_progress"),     // Agentul lucrează la el
      v.literal("completed"),       // Task terminat cu succes (urmează release)
      v.literal("failed")           // Task eșuat (urmează refund)
    ),
    paymentId: v.optional(v.number()), // ID-ul generat de Smart Contract la `deposit`
    escrowAmount: v.string(), // Suma în EGLD (ca string pentru a evita pierderea preciziei)
    result: v.optional(v.string()), // Răspunsul sau output-ul agentului
    txHashDeposit: v.optional(v.string()), // Hash-ul tranzacției de depunere
    txHashRelease: v.optional(v.string()), // Hash-ul tranzacției de release/refund
  })
  .index("by_creator", ["creatorAddress"])
  .index("by_status", ["status"])
  .index("by_agent", ["agentId"]),
});
