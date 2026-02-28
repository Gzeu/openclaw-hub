import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

// URL-ul MultiversX Devnet API
const MVX_API_URL = "https://devnet-api.multiversx.com";

export const verifyPendingDeposits = internalAction({
  args: {},
  handler: async (ctx) => {
    // 1. Luăm toate task-urile care așteaptă confirmarea depozitului
    const pendingTasks = await ctx.runQuery(internal.tasks.getTasksByStatus, { 
      status: "pending_deposit" 
    });

    for (const task of pendingTasks) {
      if (!task.txHashDeposit) continue; // Dacă nu avem hash salvat încă, trecem peste

      try {
        // 2. Verificăm statusul tranzacției pe API-ul MultiversX
        const response = await fetch(`${MVX_API_URL}/transactions/${task.txHashDeposit}`);
        
        if (!response.ok) continue;

        const txData = await response.json();

        // 3. Dacă tranzacția are succes pe blockchain
        if (txData.status === "success") {
            
          // (Opțional) Aici poți extrage Payment ID-ul din log-urile/event-urile SC-ului
          // txData.logs.events.find(e => e.identifier === "deposit") ...
          
          // 4. Marcăm task-ul ca funded în DB
          await ctx.runMutation(internal.tasks.internalMarkTaskFunded, {
            taskId: task._id,
            paymentId: 1, // Ar trebui scos din event în mod real
          });

          // 5. Acum că e funded, punem agentul la treabă!
          await ctx.runAction(internal.agent.runAIAgent, {
            taskId: task._id,
            prompt: task.prompt,
          });
        } 
        else if (txData.status === "fail" || txData.status === "invalid") {
          // Dacă tranzacția a eșuat pe rețea, o marcăm ca failed
          await ctx.runMutation(internal.tasks.updateTaskStatus, {
            taskId: task._id,
            status: "failed",
          });
        }
      } catch (error) {
        console.error(`Error verifying tx ${task.txHashDeposit}:`, error);
      }
    }
  },
});
