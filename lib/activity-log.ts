// In-memory activity log (swap with DB/Redis for production)
export type ActivityType =
  | 'sandbox_run'
  | 'chat_message'
  | 'delegate'
  | 'file_upload'
  | 'desktop_action'
  | 'mcp_call'

export interface ActivityEntry {
  id: string
  type: ActivityType
  agentId?: string
  summary: string
  meta?: Record<string, any>
  durationMs?: number
  status: 'success' | 'error' | 'running'
  createdAt: string
}

// Simple global store — works across API routes in dev
// For prod use Upstash Redis or Vercel KV
const MAX_ENTRIES = 200
const log: ActivityEntry[] = []

export function addActivity(entry: Omit<ActivityEntry, 'id' | 'createdAt'>): ActivityEntry {
  const full: ActivityEntry = {
    ...entry,
    id: Math.random().toString(36).slice(2, 10),
    createdAt: new Date().toISOString(),
  }
  log.unshift(full)
  if (log.length > MAX_ENTRIES) log.pop()
  return full
}

export function getActivity(limit = 50): ActivityEntry[] {
  return log.slice(0, limit)
}

export function clearActivity() {
  log.length = 0
}
