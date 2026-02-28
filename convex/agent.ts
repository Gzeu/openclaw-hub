import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

export const runAIAgent = internalAction({
  args: {
    taskId: v.id("tasks"),
    prompt: v.string(),
  },
  handler: async (ctx, args) => {
    // 1. Setăm statusul ca "in_progress" ca UI-ul să se actualizeze
    await ctx.runMutation(internal.tasks.updateTaskStatus, {
      taskId: args.taskId,
      status: "in_progress",
    });

    console.log(`Agent started working on task: ${args.taskId}`);
    
    try {
      // 2. Apelăm modelul AI (OpenRouter / OpenAI)
      // Asigură-te că pui cheia în dashboard-ul Convex (Settings -> Environment Variables) -> OPENROUTER_API_KEY
      const apiKey = process.env.OPENROUTER_API_KEY;
      
      let aiResponseText = "Simulated success (no API key set)";

      if (apiKey) {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "https://openclaw.dev", // Optional
            "X-Title": "OpenClaw Hub", // Optional
          },
          body: JSON.stringify({
            model: "anthropic/claude-3-haiku", // Sau "google/gemini-pro", "openai/gpt-4"
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
          aiResponseText = "Agent API request failed.";
        }
      } else {
        // Dacă nu avem cheie setată, simulăm o așteptare ca să vedem UI-ul cum reacționează
        await new Promise((resolve) => setTimeout(resolve, 3000));
        aiResponseText = `I have simulated the execution of: "${args.prompt}"`;
      }

      // 3. Salvăm rezultatul
      await ctx.runMutation(internal.tasks.saveAgentResult, {
        taskId: args.taskId,
        result: aiResponseText,
      });

      // 4. (Următorul pas) Aici am chema un alt Action care face "release" la fonduri
      // din Smart Contract către adresa agentului!
      
    } catch (error) {
      console.error("Agent execution failed:", error);
      await ctx.runMutation(internal.tasks.updateTaskStatus, {
        taskId: args.taskId,
        status: "failed",
      });
    }
  },
});
