import { internalMutation } from "./_generated/server";
import { v } from "convex/values";

// Seed default AI providers and models
export const seedProviders = internalMutation({
  handler: async (ctx) => {
    // Check if providers already exist
    const existingProviders = await ctx.db.query("aiProviders").collect();
    if (existingProviders.length > 0) {
      return { message: "Providers already seeded" };
    }

    // Create a default user first
    const defaultUser = await ctx.db.insert("users", {
      email: "admin@openclaw-hub.com",
      name: "System Admin",
      password: "hashed-password", // In production, this should be properly hashed
      role: "admin",
      isActive: true,
      emailVerified: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Create default providers
    const openaiProvider = await ctx.db.insert("aiProviders", {
      name: "OpenAI",
      type: "openai",
      apiUrl: "https://api.openai.com/v1",
      apiKeyRequired: true,
      supportedModels: ["gpt-4", "gpt-4-turbo", "gpt-3.5-turbo"],
      maxTokens: 128000,
      pricing: {
        "gpt-4": { input: 0.03, output: 0.06 },
        "gpt-4-turbo": { input: 0.01, output: 0.03 },
        "gpt-3.5-turbo": { input: 0.0015, output: 0.002 }
      },
      isActive: true,
      createdBy: defaultUser,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    const anthropicProvider = await ctx.db.insert("aiProviders", {
      name: "Anthropic",
      type: "anthropic",
      apiUrl: "https://api.anthropic.com",
      apiKeyRequired: true,
      supportedModels: ["claude-3-opus", "claude-3-sonnet", "claude-3-haiku"],
      maxTokens: 200000,
      pricing: {
        "claude-3-opus": { input: 0.015, output: 0.075 },
        "claude-3-sonnet": { input: 0.003, output: 0.015 },
        "claude-3-haiku": { input: 0.00025, output: 0.00125 }
      },
      isActive: true,
      createdBy: defaultUser,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Create models for OpenAI
    await ctx.db.insert("aiModels", {
      providerId: openaiProvider,
      name: "GPT-4",
      modelId: "gpt-4",
      type: "chat",
      maxTokens: 8192,
      costPerToken: 0.00003,
      capabilities: ["function-calling", "vision", "code"],
      isActive: true,
      createdAt: Date.now(),
    });

    await ctx.db.insert("aiModels", {
      providerId: openaiProvider,
      name: "GPT-4 Turbo",
      modelId: "gpt-4-turbo",
      type: "chat",
      maxTokens: 128000,
      costPerToken: 0.00001,
      capabilities: ["function-calling", "vision", "code", "json"],
      isActive: true,
      createdAt: Date.now(),
    });

    await ctx.db.insert("aiModels", {
      providerId: openaiProvider,
      name: "GPT-3.5 Turbo",
      modelId: "gpt-3.5-turbo",
      type: "chat",
      maxTokens: 16384,
      costPerToken: 0.0000015,
      capabilities: ["function-calling", "code"],
      isActive: true,
      createdAt: Date.now(),
    });

    // Create models for Anthropic
    await ctx.db.insert("aiModels", {
      providerId: anthropicProvider,
      name: "Claude 3 Opus",
      modelId: "claude-3-opus",
      type: "chat",
      maxTokens: 200000,
      costPerToken: 0.000075,
      capabilities: ["vision", "analysis", "code"],
      isActive: true,
      createdAt: Date.now(),
    });

    await ctx.db.insert("aiModels", {
      providerId: anthropicProvider,
      name: "Claude 3 Sonnet",
      modelId: "claude-3-sonnet",
      type: "chat",
      maxTokens: 200000,
      costPerToken: 0.000015,
      capabilities: ["vision", "analysis", "code"],
      isActive: true,
      createdAt: Date.now(),
    });

    await ctx.db.insert("aiModels", {
      providerId: anthropicProvider,
      name: "Claude 3 Haiku",
      modelId: "claude-3-haiku",
      type: "chat",
      maxTokens: 200000,
      costPerToken: 0.00000125,
      capabilities: ["fast-response", "analysis"],
      isActive: true,
      createdAt: Date.now(),
    });

    return { message: "Providers and models seeded successfully" };
  },
});
