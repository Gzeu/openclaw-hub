/**
 * Agent model for MongoDB
 * Collection: agents
 */
import { ObjectId } from 'mongodb';

export interface Agent {
  _id?: ObjectId;
  id: string;                    // e.g. 'openclaw-main'
  name: string;
  description?: string;
  mvxAddress?: string;           // erd1...
  colonyApiKeyEncrypted?: string; // AES-256 encrypted
  capabilities: string[];
  status: 'active' | 'paused' | 'error';
  loopIntervalMinutes: number;
  totalEarningsEGLD: number;
  tasksCompleted: number;
  tasksFailed: number;
  createdAt: Date;
  updatedAt: Date;
  ownerId?: string;              // future: link to user account
}

export interface AgentCreateInput {
  id: string;
  name: string;
  description?: string;
  mvxAddress?: string;
  colonyApiKey?: string;         // plain — will be encrypted before storing
  capabilities?: string[];
  loopIntervalMinutes?: number;
}

export const AGENTS_COLLECTION = 'agents';
