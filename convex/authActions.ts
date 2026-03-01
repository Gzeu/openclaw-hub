"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

// Hash password utility
async function hashPassword(password: string): Promise<string> {
  const bcrypt = await import("bcryptjs");
  return await bcrypt.hash(password, 10);
}

// Verify password utility
async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const bcrypt = await import("bcryptjs");
  return await bcrypt.compare(password, hash);
}

// Generate JWT token
function generateToken(userId: string, email: string, role: string): string {
  const jwt = require("jsonwebtoken");
  const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-key";
  return jwt.sign(
    { userId, email, role },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

// Register new user
export const register = action({
  args: {
    email: v.string(),
    name: v.string(),
    password: v.string(),
    role: v.union(v.literal("user"), v.literal("admin"), v.literal("operator")),
  },
  handler: async (ctx, args) => {
    // Hash password
    const hashedPassword = await hashPassword(args.password);

    // Generate token
    const token = generateToken("temp-id", args.email, args.role);

    return {
      success: true,
      user: {
        id: "temp-id",
        email: args.email,
        name: args.name,
        role: args.role,
      },
      token,
    };
  },
});

// Login user
export const login = action({
  args: {
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    // Generate token
    const token = generateToken("temp-id", args.email, "user");

    return {
      success: true,
      user: {
        id: "temp-id",
        email: args.email,
        name: "Test User",
        role: "user",
        avatar: undefined,
        emailVerified: true,
      },
      token,
    };
  },
});

// Logout user
export const logout = action({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    return { success: true };
  },
});
