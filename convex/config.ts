import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Update user settings
export const updateUserSettings = mutation({
  args: {
    userId: v.string(),
    theme: v.union(v.literal("dark"), v.literal("light"), v.literal("auto")),
    language: v.string(),
    notifications: v.optional(v.any()),
    preferences: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    // Convert string userId to Id
    const userId = args.userId as any;
    
    const existingSettings = await ctx.db
      .query("userSettings")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (existingSettings) {
      await ctx.db.patch(existingSettings._id, {
        theme: args.theme,
        language: args.language,
        notifications: args.notifications,
        preferences: args.preferences,
        updatedAt: Date.now(),
      });
    } else {
      await ctx.db.insert("userSettings", {
        userId,
        theme: args.theme,
        language: args.language,
        notifications: args.notifications,
        preferences: args.preferences,
        updatedAt: Date.now(),
      });
    }

    return { success: true };
  },
});

// Get user settings
export const getUserSettings = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    // Convert string userId to Id
    const userId = args.userId as any;
    
    const settings = await ctx.db
      .query("userSettings")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    return settings;
  },
});

// Get AI providers
export const getAIProviders = query({
  args: {
    type: v.optional(v.union(v.literal("openai"), v.literal("anthropic"), v.literal("local"), v.literal("huggingface"), v.literal("custom"))),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    let providers = await ctx.db.query("aiProviders").collect();

    if (args.type) {
      providers = providers.filter(p => p.type === args.type);
    }

    if (args.isActive !== undefined) {
      providers = providers.filter(p => p.isActive === args.isActive);
    }

    return providers;
  },
});

// Get AI models for a provider
export const getAIModels = query({
  args: {
    providerId: v.id("aiProviders"),
    type: v.optional(v.union(v.literal("chat"), v.literal("completion"), v.literal("embedding"), v.literal("image"))),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    let models = await ctx.db
      .query("aiModels")
      .withIndex("by_providerId", (q) => q.eq("providerId", args.providerId))
      .collect();

    if (args.type) {
      models = models.filter(m => m.type === args.type);
    }

    if (args.isActive !== undefined) {
      models = models.filter(m => m.isActive === args.isActive);
    }

    return models;
  },
});

// Get user API keys
export const getUserApiKeys = query({
  args: {
    userId: v.string(),
    providerId: v.optional(v.id("aiProviders")),
  },
  handler: async (ctx, args) => {
    // Convert string userId to Id
    const userId = args.userId as any;
    
    let keys = await ctx.db
      .query("userApiKeys")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();

    if (args.providerId) {
      keys = keys.filter(k => k.providerId === args.providerId);
    }

    return keys;
  },
});

// Add/update API key
export const upsertApiKey = mutation({
  args: {
    userId: v.string(),
    providerId: v.id("aiProviders"),
    encryptedApiKey: v.string(),
    keyName: v.string(),
  },
  handler: async (ctx, args) => {
    // Convert string userId to Id
    const userId = args.userId as any;
    
    // Check if key already exists for this user and provider
    const existingKey = await ctx.db
      .query("userApiKeys")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("providerId"), args.providerId))
      .first();

    if (existingKey) {
      // Update existing key
      await ctx.db.patch(existingKey._id, {
        encryptedApiKey: args.encryptedApiKey,
        keyName: args.keyName,
        updatedAt: Date.now(),
      });
    } else {
      // Create new key
      await ctx.db.insert("userApiKeys", {
        userId,
        providerId: args.providerId,
        encryptedApiKey: args.encryptedApiKey,
        keyName: args.keyName,
        isActive: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }

    return { success: true };
  },
});

// Delete API key
export const deleteApiKey = mutation({
  args: {
    keyId: v.id("userApiKeys"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    // Convert string userId to Id
    const userId = args.userId as any;
    
    // Verify ownership
    const apiKey = await ctx.db.get(args.keyId);
    if (!apiKey || apiKey.userId !== userId) {
      throw new Error("API key not found or access denied");
    }

    await ctx.db.delete(args.keyId);
    return { success: true };
  },
});

// Toggle API key active status
export const toggleApiKeyStatus = mutation({
  args: {
    keyId: v.id("userApiKeys"),
    userId: v.string(),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    // Convert string userId to Id
    const userId = args.userId as any;
    
    // Verify ownership
    const apiKey = await ctx.db.get(args.keyId);
    if (!apiKey || apiKey.userId !== userId) {
      throw new Error("API key not found or access denied");
    }

    await ctx.db.patch(args.keyId, {
      isActive: args.isActive,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// Get user's active API keys with provider info
export const getUserActiveApiKeys = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    // Convert string userId to Id
    const userId = args.userId as any;
    
    const apiKeys = await ctx.db
      .query("userApiKeys")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();

    // Filter active keys
    const activeKeys = apiKeys.filter(key => key.isActive);

    // Fetch provider info for each key
    const keysWithProviders = await Promise.all(
      activeKeys.map(async (key) => {
        const provider = await ctx.db.get(key.providerId);
        return {
          ...key,
          provider: {
            name: provider?.name,
            type: provider?.type,
            apiUrl: provider?.apiUrl,
            apiKeyRequired: provider?.apiKeyRequired,
          },
        };
      })
    );

    return keysWithProviders;
  },
});
