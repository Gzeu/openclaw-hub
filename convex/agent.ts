import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import { releaseEscrowFunds, refundEscrowFunds } from "./hubWallet";
import { executeTool } from "./tools";

export const runAIAgent = internalAction({
  args: {
    taskId: v.id("tasks"),
    prompt: v.string(),
    paymentId: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await ctx.runMutation(internal.tasks.updateTaskStatus, {
      taskId: args.taskId,
      status: "in_progress",
    });

    console.log(`Agent started working on task: ${args.taskId}`);
    
    try {
      const apiKey = process.env.OPENROUTER_API_KEY;
      let aiResponseText = "Simulated success (no API key set)";

      if (apiKey) {
        const tools = [
          {
            type: "function",
            function: {
              name: "getAccountBalance",
              description: "Get the current EGLD balance and tokens for a MultiversX (erd1...) address.",
              parameters: {
                type: "object",
                properties: { address: { type: "string" } },
                required: ["address"],
              },
            }
          },
          {
            type: "function",
            function: {
              name: "getNetworkConfig",
              description: "Get current MultiversX network configuration, token price, and current round/epoch.",
              parameters: { type: "object", properties: {} },
            }
          }
        ];

        const messages: any[] = [
          { 
            role: "system", 
            content: "You are an expert Web3 AI agent on the OpenClaw Hub network, specialized in the MultiversX blockchain. You can use available tools to query the blockchain. Answer clearly and concisely." 
          },
          { role: "user", content: args.prompt }
        ];

        const initialResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "https://openclaw.dev",
            "X-Title": "OpenClaw Hub",
          },
          body: JSON.stringify({
            model: "anthropic/claude-3-haiku",
            messages: messages,
            tools: tools,
            tool_choice: "auto"
          })
        });

        if (!initialResponse.ok) throw new Error("Agent API initial request failed.");
        const initialData = await initialResponse.json();
        const responseMessage = initialData.choices[0].message;

        if (responseMessage.tool_calls && responseMessage.tool_calls.length > 0) {
          messages.push(responseMessage);
          
          for (const toolCall of responseMessage.tool_calls) {
            const functionName = toolCall.function.name;
            const functionArgs = JSON.parse(toolCall.function.arguments);
            const functionResult = await executeTool(functionName, functionArgs);
            
            messages.push({
              tool_call_id: toolCall.id,
              role: "tool",
              name: functionName,
              content: functionResult,
            });
          }

          const finalResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${apiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "anthropic/claude-3-haiku",
              messages: messages
            })
          });

          if (!finalResponse.ok) throw new Error("Agent API final request failed.");
          const finalData = await finalResponse.json();
          aiResponseText = finalData.choices[0].message.content;

        } else {
          aiResponseText = responseMessage.content;
        }

      } else {
        await new Promise((resolve) => setTimeout(resolve, 3000));
        aiResponseText = `I have simulated the execution of: "${args.prompt}"`;
      }

      // SUCCESS PATH: Salvează rezultatul și dă RELEASE (plătește agentul)
      await ctx.runMutation(internal.tasks.saveAgentResult, {
        taskId: args.taskId,
        result: aiResponseText,
      });

      if (args.paymentId !== undefined) {
          try {
            const releaseTxHash = await releaseEscrowFunds(args.paymentId);
            console.log(`Release successful! TxHash: ${releaseTxHash}`);
          } catch (scError) {
             console.error("Smart Contract release failed:", scError);
          }
      }

    } catch (error: any) {
      console.error("Agent execution failed:", error);
      
      // FAILURE PATH: Schimbă statusul în "failed" și salvează motivul
      await ctx.runMutation(internal.tasks.saveAgentResult, {
        taskId: args.taskId,
        result: `[SYSTEM ERROR] Agent failed to complete the task: ${error.message || "Unknown error"}`,
      });
      await ctx.runMutation(internal.tasks.updateTaskStatus, {
        taskId: args.taskId,
        status: "failed",
      });

      // TRIGGER REFUND: Dă banii înapoi utilizatorului
      if (args.paymentId !== undefined) {
          try {
            console.log(`Triggering Smart Contract REFUND for payment ID: ${args.paymentId}`);
            const refundTxHash = await refundEscrowFunds(args.paymentId);
            console.log(`Refund successful! TxHash: ${refundTxHash}`);
          } catch (scError) {
             console.error("Smart Contract refund failed:", scError);
          }
      }
    }
  },
});
