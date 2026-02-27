/**
 * Task model for MongoDB
 * Collection: tasks
 * Tracks individual tasks accepted and executed by agents
 */
import { ObjectId } from 'mongodb';

export type TaskStatus = 'pending' | 'accepted' | 'running' | 'completed' | 'failed' | 'expired';
export type TaskSource = 'thecolony' | 'opentask' | 'internal' | 'webhook';

export interface Task {
  _id?: ObjectId;
  externalId?: string;           // ID from TheColony / OpenTask
  agentId: string;
  loopRunId?: string;            // Reference to loop_run
  source: TaskSource;
  title: string;
  description: string;
  bountyEGLD: number;
  status: TaskStatus;
  result?: string;
  error?: string;
  acceptedAt?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  metadata?: Record<string, unknown>;
}

export const TASKS_COLLECTION = 'tasks';
