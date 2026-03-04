import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/convex/_generated/api';

/**
 * Budget enforcement helpers.
 * Call checkBudget before executing any paid skill.
 * Call deductBudget (fire-and-forget) after successful execution.
 *
 * Usage:
 *   const check = await checkBudget(mxAddress, 0.001);
 *   if (!check.ok) return NextResponse.json({ error: check.reason }, { status: 402 });
 *   // ... execute skill ...
 *   deductBudget(mxAddress, 0.001, 'web-search');
 */

export interface BudgetCheckResult {
  ok: boolean;
  balance: number; // EGLD
  reason?: string;
}

function getClient(): ConvexHttpClient | null {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  return url ? new ConvexHttpClient(url) : null;
}

export async function checkBudget(
  mxAddress: string,
  costEgld: number
): Promise<BudgetCheckResult> {
  const client = getClient();
  if (!client) return { ok: true, balance: Infinity }; // dev mode — no Convex

  try {
    const user = await client.query(api.mxUsers.getByMxAddress, { mxAddress });
    const balance = user?.budget ?? 0;
    if (balance < costEgld) {
      return {
        ok: false,
        balance,
        reason: `Insufficient budget: need ${costEgld} EGLD, have ${balance.toFixed(6)} EGLD`,
      };
    }
    return { ok: true, balance };
  } catch {
    return { ok: true, balance: 0 }; // fail open on network error
  }
}

export function deductBudget(
  mxAddress: string,
  costEgld: number,
  skillKey: string
): void {
  const client = getClient();
  if (!client) return;
  client
    .mutation(api.mxUsers.deductBudget, { mxAddress, costEgld, skillKey })
    .catch(() => {});
}
