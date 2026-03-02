import { mutation, query } from './_generated/server'
import { v } from 'convex/values'

// Get user by email
export const getUserByEmail = query({
  args: {
    email: v.string()
  },
  handler: async (ctx, args) => {
    const users = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .collect();
    
    return users;
  },
});

// Get user by ID
export const getUserById = query({
  args: {
    userId: v.id("users")
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    return user;
  },
});

// Create new user
export const createUser = mutation({
  args: {
    email: v.string(),
    password: v.string(),
    name: v.string(),
    role: v.union(v.literal("user"), v.literal("admin"), v.literal("operator")),
    isActive: v.boolean(),
    emailVerified: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await ctx.db.insert("users", {
      email: args.email,
      password: args.password,
      name: args.name,
      role: args.role,
      isActive: args.isActive,
      emailVerified: args.emailVerified,
      avatar: undefined,
      lastLogin: undefined,
      createdAt: args.createdAt,
      updatedAt: args.updatedAt,
    });
    
    return userId;
  },
});

// Update last login
export const updateLastLogin = mutation({
  args: {
    userId: v.id("users"),
    lastLogin: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      lastLogin: args.lastLogin,
      updatedAt: Date.now(),
    });
    
    return { success: true };
  },
});

// Update user profile
export const updateUserProfile = mutation({
  args: {
    userId: v.id("users"),
    name: v.optional(v.string()),
    avatar: v.optional(v.string()),
    emailVerified: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const updateData: any = {
      updatedAt: Date.now(),
    };
    
    if (args.name !== undefined) updateData.name = args.name;
    if (args.avatar !== undefined) updateData.avatar = args.avatar;
    if (args.emailVerified !== undefined) updateData.emailVerified = args.emailVerified;
    
    await ctx.db.patch(args.userId, updateData);
    return { success: true };
  },
});

// Change password
export const changePassword = mutation({
  args: {
    userId: v.id("users"),
    currentPassword: v.string(),
    newPassword: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("User not found");
    }
    
    // Verify current password
    const bcrypt = require('bcryptjs');
    const isValidPassword = await bcrypt.compare(args.currentPassword, user.password);
    if (!isValidPassword) {
      throw new Error("Current password is incorrect");
    }
    
    // Hash new password
    const hashedNewPassword = await bcrypt.hash(args.newPassword, 12);
    
    await ctx.db.patch(args.userId, {
      password: hashedNewPassword,
      updatedAt: Date.now(),
    });
    
    return { success: true };
  },
});

// Deactivate user
export const deactivateUser = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      isActive: false,
      updatedAt: Date.now(),
    });
    
    return { success: true };
  },
});
