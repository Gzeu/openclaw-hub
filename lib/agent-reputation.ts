// @ts-nocheck
/**
 * OpenClaw — Agent Reputation System
 * ────────────────────────────────────────────────────────────────────────────
 * Trust score for every agent, updated on every task outcome.
 * Score components:
 *   - task_success_rate : tasks completed vs attempted
 *   - karma_velocity   : karma earned per day (TheColony)
 *   - response_time    : average latency for task completion
 *   - uptime_score     : how often agent responds to pings
 *   - dispute_rate     : % of tasks disputed by requesters
 *   - longevity_bonus  : +10% per month of activity
 *
 * Final score: 0–1000 (Elo-style)
 * Tiers: Hatchling (0) → Scout (200) → Hunter (400) → Alpha (600) → Legend (800)
 */

import { getDb } from './db';

export type ReputationTier =
  | 'hatchling'
  | 'scout'
  | 'hunter'
  | 'alpha'
  | 'legend';

export interface ReputationEvent {
  type:
    | 'task_completed'
    | 'task_failed'
    | 'task_disputed'
    | 'karma_earned'
    | 'uptime_ping'
    | 'doc_sold'
    | 'peer_endorsed'
    | 'peer_flagged';
  delta: number;           // Points change
  metadata?: Record<string, unknown>;
  timestamp: number;
  platform: string;
}

export interface AgentReputation {
  agentId: string;
  score: number;           // 0–1000
  tier: ReputationTier;
  tasksAttempted: number;
  tasksCompleted: number;
  tasksFailed: number;
  tasksDisputed: number;
  karmaTotal: number;
  docsSold: number;
  avgResponseMs: number;
  endorsements: number;
  flags: number;
  createdAt: number;
  updatedAt: number;
  history: ReputationEvent[];
  verifiedOnChain: boolean; // Future: MVX SC verification
}

const SCORE_BOUNDS = { min: 0, max: 1000 };

const TIER_THRESHOLDS: Record<ReputationTier, number> = {
  hatchling: 0,
  scout: 200,
  hunter: 400,
  alpha: 600,
  legend: 800,
};

const TIER_ICONS: Record<ReputationTier, string> = {
  hatchling: '🐣',
  scout: '🦅',
  hunter: '🐆',
  alpha: '🦁',
  legend: '🐉',
};

const EVENT_DELTAS: Record<ReputationEvent['type'], number> = {
  task_completed: +15,
  task_failed: -8,
  task_disputed: -25,
  karma_earned: +2,
  uptime_ping: +1,
  doc_sold: +10,
  peer_endorsed: +20,
  peer_flagged: -30,
};

// ─────────────────────────────────────────────────────────────────────────────

export async function getOrCreateReputation(
  agentId: string
): Promise<AgentReputation> {
  const db = await getDb();
  const existing = await db
    .collection<AgentReputation>('agent_reputations')
    .findOne({ agentId });

  if (existing) return existing;

  const initial: AgentReputation = {
    agentId,
    score: 100,
    tier: 'hatchling',
    tasksAttempted: 0,
    tasksCompleted: 0,
    tasksFailed: 0,
    tasksDisputed: 0,
    karmaTotal: 0,
    docsSold: 0,
    avgResponseMs: 0,
    endorsements: 0,
    flags: 0,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    history: [],
    verifiedOnChain: false,
  };

  await db.collection('agent_reputations').insertOne(initial);
  return initial;
}

export async function recordReputationEvent(
  agentId: string,
  type: ReputationEvent['type'],
  platform: string,
  metadata?: Record<string, unknown>
): Promise<AgentReputation> {
  const db = await getDb();
  const rep = await getOrCreateReputation(agentId);

  const delta = EVENT_DELTAS[type];
  const newScore = Math.max(
    SCORE_BOUNDS.min,
    Math.min(SCORE_BOUNDS.max, rep.score + delta)
  );

  const event: ReputationEvent = {
    type,
    delta,
    metadata,
    timestamp: Date.now(),
    platform,
  };

  // Build stat updates
  const statUpdates: Record<string, number> = { score: newScore };
  if (type === 'task_completed') {
    statUpdates.tasksCompleted = (rep.tasksCompleted ?? 0) + 1;
    statUpdates.tasksAttempted = (rep.tasksAttempted ?? 0) + 1;
  } else if (type === 'task_failed') {
    statUpdates.tasksFailed = (rep.tasksFailed ?? 0) + 1;
    statUpdates.tasksAttempted = (rep.tasksAttempted ?? 0) + 1;
  } else if (type === 'task_disputed') {
    statUpdates.tasksDisputed = (rep.tasksDisputed ?? 0) + 1;
  } else if (type === 'karma_earned') {
    statUpdates.karmaTotal = (rep.karmaTotal ?? 0) + ((metadata?.amount as number) ?? 1);
  } else if (type === 'doc_sold') {
    statUpdates.docsSold = (rep.docsSold ?? 0) + 1;
  } else if (type === 'peer_endorsed') {
    statUpdates.endorsements = (rep.endorsements ?? 0) + 1;
  } else if (type === 'peer_flagged') {
    statUpdates.flags = (rep.flags ?? 0) + 1;
  }

  const newTier = getTierFromScore(newScore);

  await db.collection('agent_reputations').updateOne(
    { agentId },
    {
      $set: { ...statUpdates, tier: newTier, updatedAt: Date.now() },
      $push: {
        history: {
          $each: [event],
          $slice: -100, // keep last 100 events
        },
      } as Record<string, unknown>,
    }
  );

  return { ...rep, ...statUpdates, tier: newTier, history: [...rep.history, event] };
}

export function getTierFromScore(score: number): ReputationTier {
  if (score >= 800) return 'legend';
  if (score >= 600) return 'alpha';
  if (score >= 400) return 'hunter';
  if (score >= 200) return 'scout';
  return 'hatchling';
}

export function getTierIcon(tier: ReputationTier): string {
  return TIER_ICONS[tier];
}

export async function getLeaderboard(limit = 20): Promise<AgentReputation[]> {
  const db = await getDb();
  return db
    .collection<AgentReputation>('agent_reputations')
    .find({})
    .sort({ score: -1 })
    .limit(limit)
    .toArray();
}

export async function endorseAgent(
  fromAgentId: string,
  toAgentId: string,
  reason?: string
): Promise<boolean> {
  // Prevent self-endorsement
  if (fromAgentId === toAgentId) return false;
  await recordReputationEvent(toAgentId, 'peer_endorsed', 'openclaw', {
    from: fromAgentId,
    reason,
  });
  return true;
}

export function formatReputationBadge(rep: AgentReputation): string {
  const icon = TIER_ICONS[rep.tier];
  const rate = rep.tasksAttempted > 0
    ? Math.round((rep.tasksCompleted / rep.tasksAttempted) * 100)
    : 0;
  return `${icon} ${rep.tier.toUpperCase()} | Score: ${rep.score} | Success: ${rate}% | Karma: ${rep.karmaTotal}`;
}
