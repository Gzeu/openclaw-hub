// OpenClaw Gateway client — connects to local or remote OpenClaw instance
// Docs: https://github.com/openclaw/openclaw/blob/main/docs.acp.md

export interface GatewayConfig {
  url: string   // e.g. ws://localhost:18789
  token?: string
}

export interface ChatMessage {
  sessionKey: string
  text: string
  attachments?: string[]
}

export interface GatewaySession {
  key: string
  label?: string
  agentId?: string
}

const GATEWAY_URL = process.env.OPENCLAW_GATEWAY_URL ?? 'ws://localhost:18789'
const GATEWAY_TOKEN = process.env.OPENCLAW_GATEWAY_TOKEN ?? ''

export async function listSessions(): Promise<GatewaySession[]> {
  // REST fallback — OpenClaw Gateway exposes HTTP on same port
  const base = GATEWAY_URL.replace(/^ws/, 'http')
  const res = await fetch(`${base}/api/sessions`, {
    headers: { Authorization: `Bearer ${GATEWAY_TOKEN}` },
    next: { revalidate: 0 },
  })
  if (!res.ok) return []
  return res.json()
}

export async function sendToAgent(
  sessionKey: string,
  text: string
): Promise<ReadableStream<Uint8Array>> {
  const base = GATEWAY_URL.replace(/^ws/, 'http')
  const res = await fetch(`${base}/api/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${GATEWAY_TOKEN}`,
    },
    body: JSON.stringify({ sessionKey, text }),
  })
  if (!res.ok || !res.body) throw new Error(`Gateway error: ${res.status}`)
  return res.body
}

export async function resetSession(sessionKey: string): Promise<void> {
  const base = GATEWAY_URL.replace(/^ws/, 'http')
  await fetch(`${base}/api/sessions/${sessionKey}/reset`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${GATEWAY_TOKEN}` },
  })
}
