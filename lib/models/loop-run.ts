/**
 * LoopRun model for MongoDB
 * Collection: loop_runs
 * Records each execution of the agent work loop
 */
import { ObjectId } from 'mongodb';

export interface LoopRun {
  _id?: ObjectId;
  agentId: string;
  startedAt: Date;
  completedAt?: Date;
  status: 'running' | 'success' | 'partial' | 'error';
  tasksAttempted: number;
  tasksCompleted: number;
  tasksFailed: number;
  earningsEGLD: number;
  errors: string[];
  log: string[];                 // Human-readable execution log
  source: 'cron' | 'webhook' | 'manual';
}

export const LOOP_RUNS_COLLECTION = 'loop_runs';
