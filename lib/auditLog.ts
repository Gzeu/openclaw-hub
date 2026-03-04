import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/convex/_generated/api';

/**
 * Fire-and-forget audit log.
 * Writes to Convex auditLogs table asynchronously — never blocks the response.
 *
 * Usage:
 *   auditLog({ apiKey, mxAddress, path, method, status, durationMs });
 */

export interface AuditEntry {
  apiKey?: string;
  mxAddress?: string;
  path: string;
  method: string;
  status: number;
  durationMs?: number;
  error?: string;
}

export function auditLog(entry: AuditEntry): void {
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!convexUrl) return;
  const client = new ConvexHttpClient(convexUrl);
  // Fire and forget — swallow all errors
  client
    .mutation(api.auditLogs.insert, { ...entry, ts: Date.now() })
    .catch(() => {});
}
