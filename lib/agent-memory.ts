// @ts-nocheck
/**
 * OpenClaw — Agent Memory System
 * ────────────────────────────────────────────────────────────────────────────
 * Gives every agent persistent, searchable memory across sessions.
 * Memory types:
 *   - episodic   : "I did task X and earned 50 karma" (what happened)
 *   - semantic   : "The user prefers Python over JS" (learned facts)
 *   - procedural : "To search the web, use Tavily first" (how-to patterns)
 *   - working    : Short-term context for current session (cleared after 1h)
 *
 * Storage: MongoDB `agent_memories` collection
 * Retrieval: Keyword + recency scoring (no vector DB needed)
 */

import { getDb } from './db';

export type MemoryType = 'episodic' | 'semantic' | 'procedural' | 'working';

export interface Memory {
  _id?: string;
  agentId: string;
  type: MemoryType;
  content: string;          // The actual memory text
  keywords: string[];       // Extracted keywords for retrieval
  importance: number;       // 1-10 (10 = critical, never forget)
  accessCount: number;      // How many times retrieved
  lastAccessedAt: number;
  createdAt: number;
  expiresAt?: number;       // For working memory (1h TTL)
  sourceTaskId?: string;    // If memory came from a task
  sourcePlatform?: string;  // thecolony | moltverr | user
  tags?: string[];
}

export interface MemorySearchResult {
  memory: Memory;
  score: number;            // Relevance score 0-1
}

// ─────────────────────────────────────────────────────────────────────────────

export async function saveMemory(
  agentId: string,
  content: string,
  type: MemoryType = 'episodic',
  options: {
    importance?: number;
    sourceTaskId?: string;
    sourcePlatform?: string;
    tags?: string[];
    ttlHours?: number; // for working memory
  } = {}
): Promise<string> {
  const db = await getDb();
  const keywords = extractKeywords(content);
  const now = Date.now();

  const memory: Memory = {
    agentId,
    type,
    content,
    keywords,
    importance: options.importance ?? 5,
    accessCount: 0,
    lastAccessedAt: now,
    createdAt: now,
    expiresAt: options.ttlHours ? now + options.ttlHours * 3600 * 1000 : undefined,
    sourceTaskId: options.sourceTaskId,
    sourcePlatform: options.sourcePlatform,
    tags: options.tags ?? [],
  };

  const result = await db.collection('agent_memories').insertOne(memory);
  return result.insertedId.toString();
}

export async function searchMemory(
  agentId: string,
  query: string,
  options: {
    type?: MemoryType;
    limit?: number;
    minImportance?: number;
  } = {}
): Promise<MemorySearchResult[]> {
  const db = await getDb();
  const now = Date.now();
  const queryKeywords = extractKeywords(query);

  const filter: Record<string, unknown> = {
    agentId,
    $or: [
      { expiresAt: { $exists: false } },
      { expiresAt: { $gt: now } },
    ],
  };
  if (options.type) filter.type = options.type;
  if (options.minImportance) filter.importance = { $gte: options.minImportance };

  const memories = await db
    .collection<Memory>('agent_memories')
    .find(filter)
    .sort({ importance: -1, lastAccessedAt: -1 })
    .limit(100)
    .toArray();

  // Score by keyword overlap + recency + importance
  const scored: MemorySearchResult[] = memories
    .map((m) => {
      const overlap = queryKeywords.filter((k) => m.keywords.includes(k)).length;
      const keywordScore = queryKeywords.length > 0 ? overlap / queryKeywords.length : 0;
      const ageHours = (now - m.createdAt) / 3600000;
      const recencyScore = Math.max(0, 1 - ageHours / (24 * 30)); // decay over 30 days
      const importanceScore = m.importance / 10;
      const score = keywordScore * 0.5 + recencyScore * 0.2 + importanceScore * 0.3;
      return { memory: m, score };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, options.limit ?? 10);

  // Update access count for retrieved memories
  const ids = scored.map((r) => r.memory._id).filter(Boolean);
  if (ids.length > 0) {
    await db.collection('agent_memories').updateMany(
      { _id: { $in: ids } } as Record<string, unknown>,
      { $inc: { accessCount: 1 }, $set: { lastAccessedAt: now } }
    );
  }

  return scored;
}

export async function getRecentMemories(
  agentId: string,
  type?: MemoryType,
  limit = 20
): Promise<Memory[]> {
  const db = await getDb();
  const filter: Record<string, unknown> = { agentId };
  if (type) filter.type = type;
  return db
    .collection<Memory>('agent_memories')
    .find(filter)
    .sort({ createdAt: -1 })
    .limit(limit)
    .toArray();
}

export async function buildContextWindow(
  agentId: string,
  currentTask: string,
  maxTokens = 2000
): Promise<string> {
  const results = await searchMemory(agentId, currentTask, { limit: 15 });
  const working = await getRecentMemories(agentId, 'working', 5);
  const procedural = await getRecentMemories(agentId, 'procedural', 5);

  let context = `## Agent Memory Context\n\n`;

  if (working.length > 0) {
    context += `### Current Session\n`;
    working.forEach((m) => { context += `- ${m.content}\n`; });
    context += `\n`;
  }

  if (procedural.length > 0) {
    context += `### How-To Patterns\n`;
    procedural.forEach((m) => { context += `- ${m.content}\n`; });
    context += `\n`;
  }

  if (results.length > 0) {
    context += `### Relevant Past Experience\n`;
    results.forEach((r) => {
      context += `- [${r.memory.type}] ${r.memory.content}\n`;
    });
  }

  // Trim to approx max tokens (4 chars ~ 1 token)
  return context.slice(0, maxTokens * 4);
}

export async function deleteExpiredMemories(): Promise<number> {
  const db = await getDb();
  const result = await db.collection('agent_memories').deleteMany({
    expiresAt: { $lt: Date.now() },
  });
  return result.deletedCount;
}

export async function getMemoryStats(agentId: string) {
  const db = await getDb();
  const total = await db.collection('agent_memories').countDocuments({ agentId });
  const byType = await db.collection('agent_memories').aggregate([
    { $match: { agentId } },
    { $group: { _id: '$type', count: { $sum: 1 }, avgImportance: { $avg: '$importance' } } },
  ]).toArray();
  return { total, byType };
}

// ─────────────────────────────────────────────────────────────────────────────
// Keyword extractor (no NLP library needed)
// ─────────────────────────────────────────────────────────────────────────────

const STOP_WORDS = new Set([
  'the','a','an','is','it','in','on','at','to','of','and','or','for',
  'with','this','that','was','are','be','have','has','had','do','did',
  'will','would','could','should','i','you','he','she','we','they','my',
  'your','his','her','our','their','its','am','been','being','by','from',
]);

export function extractKeywords(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w))
    .filter((w, i, arr) => arr.indexOf(w) === i) // unique
    .slice(0, 30);
}
