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
      if (!task.txHashDeposit || task.txHashDeposit === "dummy-hash") continue;

      try {
        // 2. Verificăm statusul tranzacției reale pe API-ul MultiversX
        const response = await fetch(`${MVX_API_URL}/transactions/${task.txHashDeposit}`);
        
        if (!response.ok) continue;

        const txData = await response.json();

        // 3. Dacă tranzacția are succes pe blockchain
        if (txData.status === "success") {
          
          let extractedPaymentId = 0;

          // 4. Extragem ID-ul real de plata generat de Smart Contract
          // Cautam un eveniment cu identifier-ul "deposit" care apartine SC-ului nostru
          if (txData.logs && txData.logs.events) {
             const depositEvent = txData.logs.events.find((e: any) => 
               e.identifier === "deposit" || // Depinde daca s-a exportat clar in ABI, de obicei ia identifier-ul default
               e.topics?.[0] === Buffer.from("deposit").toString('base64') // Event topics fallback
             );

             if (depositEvent && depositEvent.topics && depositEvent.topics.length > 1) {
                 // topic[0] e adresa, topic[1] (daca e indexat) e payment_id
                 // In MultiversX base64 topics pot fi transformate in hex
                 const paymentIdBase64 = depositEvent.topics[1]; // Conform definitiei din SC: #[indexed] payment_id: u64,
                 const hexString = Buffer.from(paymentIdBase64, 'base64').toString('hex');
                 extractedPaymentId = parseInt(hexString, 16);
                 console.log(`Extracted real Payment ID from contract event: ${extractedPaymentId}`);
             } else {
                console.log("Could not find 'deposit' event topics properly. Ensure SC emits events correctly.");
             }
          }

          if (extractedPaymentId === 0) {
            console.error("Warning: Payment ID extraction failed for tx:", task.txHashDeposit, "Falling back to safe fail.");
            // Daca nu stim ce ID să dăm release, mai bine anulăm ca să nu stricăm sistemul
            await ctx.runMutation(internal.tasks.updateTaskStatus, {
              taskId: task._id,
              status: "failed",
            });
            continue;
          }

          // 5. Marcăm task-ul ca funded în DB folosind id-ul real
          await ctx.runMutation(internal.tasks.internalMarkTaskFunded, {
            taskId: task._id,
            paymentId: extractedPaymentId, 
          });

          // 6. Punem agentul la treabă pasandu-i ID-ul real al platii!
          await ctx.runAction(internal.agent.runAIAgent, {
            taskId: task._id,
            prompt: task.prompt,
            paymentId: extractedPaymentId
          });

        } 
        else if (txData.status === "fail" || txData.status === "invalid") {
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
