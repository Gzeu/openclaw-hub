/**
 * User model for MongoDB
 * Collection: users
 * Used with NextAuth.js — stores user profile + MVX wallet link
 */
import { ObjectId } from 'mongodb';

export interface User {
  _id?: ObjectId;
  email?: string;
  name?: string;
  image?: string;
  mvxAddress?: string;           // erd1... linked wallet
  role: 'admin' | 'user';
  createdAt: Date;
  updatedAt: Date;
  // NextAuth adapter fields
  emailVerified?: Date | null;
}

export interface Account {
  _id?: ObjectId;
  userId: ObjectId;
  type: string;
  provider: string;
  providerAccountId: string;
  refresh_token?: string;
  access_token?: string;
  expires_at?: number;
  token_type?: string;
  scope?: string;
  id_token?: string;
  session_state?: string;
}

export interface Session {
  _id?: ObjectId;
  sessionToken: string;
  userId: ObjectId;
  expires: Date;
}

export const USERS_COLLECTION = 'users';
export const ACCOUNTS_COLLECTION = 'accounts';
export const SESSIONS_COLLECTION = 'sessions';
