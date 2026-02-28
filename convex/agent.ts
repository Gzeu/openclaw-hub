import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import { releaseEscrowFunds } from "./hubWallet";
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
        // Definim tool-urile (funcțiile) pe care agentul le poate apela
        const tools = [
          {
            type: "function",
            function: {
              name: "getAccountBalance",
              description: "Get the current EGLD balance and tokens for a MultiversX (erd1...) address.",
              parameters: {
                type: "object",
                properties: {
                  address: {
                    type: "string",
                    description: "The MultiversX wallet address starting with erd1",
                  }
                },
                required: ["address"],
              },
            }
          },
          {
            type: "function",
            function: {
              name: "getNetworkConfig",
              description: "Get current MultiversX network configuration, token price, and current round/epoch.",
              parameters: {
                type: "object",
                properties: {},
                required: [],
              },
            }
          }
        ];

        // 1. Primul request către LLM (îi dăm prompt-ul și tool-urile)
        const messages: any[] = [
          { 
            role: "system", 
            content: "You are an expert Web3 AI agent on the OpenClaw Hub network, specialized in the MultiversX blockchain. You can use available tools to query the blockchain. Answer clearly and concisely. Format numerical values (like balances) in a human-readable way (EGLD has 18 decimals)." 
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
            model: "anthropic/claude-3-haiku", // Haiku suportă tool calling foarte bine
            messages: messages,
            tools: tools,
            tool_choice: "auto"
          })
        });

        if (!initialResponse.ok) throw new Error("Agent API initial request failed.");
        const initialData = await initialResponse.json();
        const responseMessage = initialData.choices[0].message;

        // 2. Verificăm dacă LLM-ul a decis să apeleze un tool
        if (responseMessage.tool_calls && responseMessage.tool_calls.length > 0) {
          console.log("Agent requested tool calls:", responseMessage.tool_calls);
          
          messages.push(responseMessage); // Adăugăm răspunsul lui (cu intenția de a apela tool-ul) în istoric
          
          // Executăm toate tool-urile cerute
          for (const toolCall of responseMessage.tool_calls) {
            const functionName = toolCall.function.name;
            const functionArgs = JSON.parse(toolCall.function.arguments);
            
            // Apelăm funcția reală care face request la MultiversX API
            const functionResult = await executeTool(functionName, functionArgs);
            
            // Adăugăm rezultatul în istoric ca să-l citească LLM-ul
            messages.push({
              tool_call_id: toolCall.id,
              role: "tool",
              name: functionName,
              content: functionResult,
            });
          }

          // 3. Al doilea request către LLM (acum are datele de pe blockchain)
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

          const finalData = await finalResponse.json();
          aiResponseText = finalData.choices[0].message.content;

        } else {
          // LLM-ul a răspuns direct, fără să folosească tools
          aiResponseText = responseMessage.content;
        }

      } else {
        await new Promise((resolve) => setTimeout(resolve, 3000));
        aiResponseText = `I have simulated the execution of: "${args.prompt}"`;
      }

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

    } catch (error) {
      console.error("Agent execution failed:", error);
      await ctx.runMutation(internal.tasks.updateTaskStatus, {
        taskId: args.taskId,
        status: "failed",
      });
    }
  },
});
