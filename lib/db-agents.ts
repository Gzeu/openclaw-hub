// @ts-nocheck
/**
 * Agent repository — CRUD operations for agents in MongoDB
 */
import { getDb } from './db';
import { Agent, AgentCreateInput, AGENTS_COLLECTION } from './models/agent';
import { LoopRun, LOOP_RUNS_COLLECTION } from './models/loop-run';
import { Task, TASKS_COLLECTION } from './models/task';
import { ObjectId } from 'mongodb';

// Simple AES encryption using Web Crypto (Node.js built-in)
import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'openclaw-default-dev-key-32bytes!';

function encryptApiKey(plaintext: string): string {
  const iv = randomBytes(16);
  const key = scryptSync(ENCRYPTION_KEY, 'salt', 32);
  const cipher = createCipheriv('aes-256-cbc', key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

export function decryptApiKey(ciphertext: string): string {
  const [ivHex, encryptedHex] = ciphertext.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const key = scryptSync(ENCRYPTION_KEY, 'salt', 32);
  const decipher = createDecipheriv('aes-256-cbc', key, iv);
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encryptedHex, 'hex')),
    decipher.final(),
  ]);
  return decrypted.toString('utf8');
}

// ─── Agent CRUD ────────────────────────────────────────────────────────────

export async function createAgent(input: AgentCreateInput): Promise<Agent> {
  const db = await getDb();
  const now = new Date();
  const agent: Agent = {
    id: input.id,
    name: input.name,
    description: input.description,
    mvxAddress: input.mvxAddress,
    colonyApiKeyEncrypted: input.colonyApiKey ? encryptApiKey(input.colonyApiKey) : undefined,
    capabilities: input.capabilities ?? ['task_execution', 'code_analysis'],
    status: 'active',
    loopIntervalMinutes: input.loopIntervalMinutes ?? 15,
    totalEarningsEGLD: 0,
    tasksCompleted: 0,
    tasksFailed: 0,
    createdAt: now,
    updatedAt: now,
  };
  const result = await db.collection<Agent>(AGENTS_COLLECTION).insertOne(agent);
  return { ...agent, _id: result.insertedId };
}

export async function getAgent(id: string): Promise<Agent | null> {
  const db = await getDb();
  return db.collection<Agent>(AGENTS_COLLECTION).findOne({ id });
}

export async function getAllAgents(): Promise<Agent[]> {
  const db = await getDb();
  return db.collection<Agent>(AGENTS_COLLECTION).find({}).sort({ createdAt: -1 }).toArray();
}

export async function updateAgentStats(
  agentId: string,
  delta: { earningsEGLD?: number; tasksCompleted?: number; tasksFailed?: number }
): Promise<void> {
  const db = await getDb();
  const inc: Record<string, number> = {};
  if (delta.earningsEGLD) inc.totalEarningsEGLD = delta.earningsEGLD;
  if (delta.tasksCompleted) inc.tasksCompleted = delta.tasksCompleted;
  if (delta.tasksFailed) inc.tasksFailed = delta.tasksFailed;
  await db.collection<Agent>(AGENTS_COLLECTION).updateOne(
    { id: agentId },
    { $inc: inc, $set: { updatedAt: new Date() } }
  );
}

export async function deleteAgent(id: string): Promise<boolean> {
  const db = await getDb();
  const result = await db.collection<Agent>(AGENTS_COLLECTION).deleteOne({ id });
  return result.deletedCount > 0;
}

// ─── Loop Run CRUD ──────────────────────────────────────────────────────────

export async function createLoopRun(
  agentId: string,
  source: LoopRun['source']
): Promise<string> {
  const db = await getDb();
  const run: LoopRun = {
    agentId,
    startedAt: new Date(),
    status: 'running',
    tasksAttempted: 0,
    tasksCompleted: 0,
    tasksFailed: 0,
    earningsEGLD: 0,
    errors: [],
    log: [],
    source,
  };
  const result = await db.collection<LoopRun>(LOOP_RUNS_COLLECTION).insertOne(run);
  return result.insertedId.toString();
}

export async function completeLoopRun(
  runId: string,
  update: Partial<LoopRun>
): Promise<void> {
  const db = await getDb();
  await db.collection<LoopRun>(LOOP_RUNS_COLLECTION).updateOne(
    { _id: new ObjectId(runId) },
    { $set: { ...update, completedAt: new Date() } }
  );
}

export async function getRecentLoopRuns(agentId: string, limit = 20): Promise<LoopRun[]> {
  const db = await getDb();
  return db
    .collection<LoopRun>(LOOP_RUNS_COLLECTION)
    .find({ agentId })
    .sort({ startedAt: -1 })
    .limit(limit)
    .toArray();
}

// ─── Task CRUD ──────────────────────────────────────────────────────────────

export async function createTask(
  task: Omit<Task, '_id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const db = await getDb();
  const now = new Date();
  const result = await db.collection<Task>(TASKS_COLLECTION).insertOne({
    ...task,
    createdAt: now,
    updatedAt: now,
  });
  return result.insertedId.toString();
}

export async function updateTask(taskId: string, update: Partial<Task>): Promise<void> {
  const db = await getDb();
  await db.collection<Task>(TASKS_COLLECTION).updateOne(
    { _id: new ObjectId(taskId) },
    { $set: { ...update, updatedAt: new Date() } }
  );
}

export async function getRecentTasks(agentId: string, limit = 50): Promise<Task[]> {
  const db = await getDb();
  return db
    .collection<Task>(TASKS_COLLECTION)
    .find({ agentId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .toArray();
}
