import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import { releaseEscrowFunds } from "./hubWallet";

export const runAIAgent = internalAction({
  args: {
    taskId: v.id("tasks"),
    prompt: v.string(),
    paymentId: v.optional(v.number()), // Id-ul platii din smart contract
  },
  handler: async (ctx, args) => {
    // 1. Setăm statusul ca "in_progress"
    await ctx.runMutation(internal.tasks.updateTaskStatus, {
      taskId: args.taskId,
      status: "in_progress",
    });

    console.log(`Agent started working on task: ${args.taskId}`);
    
    try {
      // 2. Executăm modelul AI (OpenRouter)
      const apiKey = process.env.OPENROUTER_API_KEY;
      let aiResponseText = "Simulated success (no API key set)";

      if (apiKey) {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "https://openclaw.dev",
            "X-Title": "OpenClaw Hub",
          },
          body: JSON.stringify({
            model: "anthropic/claude-3-haiku",
            messages: [
              { role: "system", content: "You are an expert AI agent inside the OpenClaw Hub network. Complete the user's task to the best of your ability." },
              { role: "user", content: args.prompt }
            ]
          })
        });

        if (response.ok) {
          const data = await response.json();
          aiResponseText = data.choices[0].message.content;
        } else {
          throw new Error("Agent API request failed.");
        }
      } else {
        await new Promise((resolve) => setTimeout(resolve, 3000));
        aiResponseText = `I have simulated the execution of: "${args.prompt}"`;
      }

      // 3. Salvăm rezultatul task-ului (dar păstrăm statusul pentru UI pe moment)
      await ctx.runMutation(internal.tasks.saveAgentResult, {
        taskId: args.taskId,
        result: aiResponseText,
      });

      // 4. Executăm tranzacția de release pe rețeaua MultiversX folosind portofelul Hub-ului
      if (args.paymentId !== undefined) {
          console.log(`Calling Smart Contract release for payment ID: ${args.paymentId}`);
          try {
            const releaseTxHash = await releaseEscrowFunds(args.paymentId);
            console.log(`Release successful! TxHash: ${releaseTxHash}`);
            
            // Salvăm hash-ul de release (opțional poți face o mutație pt asta)
          } catch (scError) {
             console.error("Smart Contract release failed:", scError);
             // Nu picăm tot task-ul dacă fail-uie doar tranzacția, 
             // dar într-un mediu de producție ar trebui un mecanism de retry.
          }
      } else {
          console.log("No paymentId provided. Skipping Smart Contract release (Simulation only).");
      }

    } catch (error) {
      console.error("Agent execution failed:", error);
      await ctx.runMutation(internal.tasks.updateTaskStatus, {
        taskId: args.taskId,
        status: "failed",
      });
      // Aici (la fel ca mai sus) s-ar chema hubWallet.ts dar cu metoda refund()
    }
  },
});
