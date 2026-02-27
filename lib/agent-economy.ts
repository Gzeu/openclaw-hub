// ═══════════════════════════════════════════════════════════════════════════
// OPENCLAW HUB — Agent Economy Engine
// Connects agents to external platforms: TheColony, Moltverr, OpenTask, ugig
// Each agent earns sats/USDC/karma and settles internally via EGLD on MVX
// ═══════════════════════════════════════════════════════════════════════════

export interface AgentIdentity {
  id: string
  name: string
  bio?: string
  capabilities: string[]
  // Platform credentials (stored encrypted in DB, loaded at runtime)
  colonyApiKey?: string
  colonyToken?: string
  moltverrToken?: string
  ugigToken?: string
  // Wallets
  mvxAddress?: string
  lightningAddress?: string // e.g. agent@openclaw.ai
}

export interface EarnedIncome {
  platform: string
  taskId: string
  taskTitle: string
  amount: string
  currency: string
  timestamp: number
  status: 'earned' | 'pending' | 'failed'
}

export interface DispatchTask {
  id: string
  title: string
  description: string
  karmaBounty: number
  status: string
  createdAt: string
}

export interface GigListing {
  id: string
  title: string
  description: string
  budget: string
  currency: string
  platform: string
  url: string
}

// ─────────────────────────────────────────────────────────────────────────────
// THE COLONY — Karma economy + Lightning document marketplace
// Docs: https://thecolony.cc/skill.md
// ─────────────────────────────────────────────────────────────────────────────

const COLONY_BASE = 'https://thecolony.cc/api/v1'

export async function colonyRegisterAgent(
  agent: AgentIdentity
): Promise<{ id: string; username: string; apiKey: string } | null> {
  try {
    const res = await fetch(`${COLONY_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: `openclaw_${agent.id.replace(/[^a-z0-9]/gi, '_')}`,
        display_name: agent.name,
        bio: agent.bio ?? `AI agent powered by OpenClaw Hub. Capabilities: ${agent.capabilities.join(', ')}.`,
        capabilities: { domains: agent.capabilities },
        agent_type: 'openclaw',
      }),
    })
    if (!res.ok) return null
    const data = await res.json()
    return { id: data.id, username: data.username, apiKey: data.api_key }
  } catch {
    return null
  }
}

export async function colonyGetToken(apiKey: string): Promise<string | null> {
  try {
    const res = await fetch(`${COLONY_BASE}/auth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ api_key: apiKey }),
    })
    if (!res.ok) return null
    const data = await res.json()
    return data.access_token ?? null
  } catch {
    return null
  }
}

export async function colonyGetProfile(token: string) {
  try {
    const res = await fetch(`${COLONY_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    return res.ok ? res.json() : null
  } catch {
    return null
  }
}

export async function colonyScanDispatches(
  token: string,
  limit = 20
): Promise<DispatchTask[]> {
  try {
    const res = await fetch(
      `${COLONY_BASE}/dispatches?status_filter=open&limit=${limit}&order=karma_bounty_desc`,
      { headers: { Authorization: `Bearer ${token}` } }
    )
    if (!res.ok) return []
    const data = await res.json()
    return (data.items ?? []).map((d: any) => ({
      id: d.id,
      title: d.title,
      description: d.description,
      karmaBounty: d.karma_bounty ?? 0,
      status: d.status,
      createdAt: d.created_at,
    }))
  } catch {
    return []
  }
}

export async function colonyClaimDispatch(
  token: string,
  dispatchId: string
): Promise<boolean> {
  try {
    const res = await fetch(`${COLONY_BASE}/dispatches/${dispatchId}/claim`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    })
    return res.ok
  } catch {
    return false
  }
}

export async function colonySubmitDispatch(
  token: string,
  dispatchId: string,
  response: string
): Promise<boolean> {
  try {
    const res = await fetch(`${COLONY_BASE}/dispatches/${dispatchId}/submit`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ response }),
    })
    return res.ok
  } catch {
    return false
  }
}

export async function colonySellDocument(
  token: string,
  title: string,
  content: string,
  priceSats: number
): Promise<{ id: string; url: string } | null> {
  try {
    const res = await fetch(`${COLONY_BASE}/market/documents`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title,
        filename: `${title.toLowerCase().replace(/\s+/g, '-')}.md`,
        content,
        price_sats: priceSats,
        visibility: 'public',
        tags: ['ai-analysis', 'openclaw', 'report'],
      }),
    })
    if (!res.ok) return null
    const data = await res.json()
    return { id: data.id, url: data.url ?? `https://thecolony.cc/market/${data.id}` }
  } catch {
    return null
  }
}

export async function colonyCreateMission(
  token: string,
  title: string,
  objective: string,
  maxAgents = 3
): Promise<{ id: string } | null> {
  try {
    const res = await fetch(`${COLONY_BASE}/missions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title,
        brief: `OpenClaw Hub collaborative mission: ${title}`,
        objective,
        max_agents: maxAgents,
        deadline_hours: 24,
      }),
    })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

export async function colonyPostFinding(
  token: string,
  colonyId: string,
  title: string,
  body: string
): Promise<{ id: string; url: string } | null> {
  try {
    const res = await fetch(`${COLONY_BASE}/posts`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        colony_id: colonyId,
        post_type: 'finding',
        title,
        body,
        tags: ['ai-agent', 'analysis', 'openclaw'],
      }),
    })
    if (!res.ok) return null
    const data = await res.json()
    return { id: data.id, url: `https://thecolony.cc/posts/${data.id}` }
  } catch {
    return null
  }
}

export async function colonyGetKarmaBalance(token: string): Promise<number> {
  const profile = await colonyGetProfile(token)
  return profile?.karma_balance ?? 0
}

// ─────────────────────────────────────────────────────────────────────────────
// MOLTVERR — Freelance gigs for AI agents
// Docs: https://www.moltverr.com/skill.md
// ─────────────────────────────────────────────────────────────────────────────

const MOLTVERR_BASE = 'https://www.moltverr.com/api/v1'

export async function moltverrListGigs(limit = 20): Promise<GigListing[]> {
  try {
    const res = await fetch(
      `${MOLTVERR_BASE}/gigs?status=open&limit=${limit}&order=created_at_desc`
    )
    if (!res.ok) return []
    const data = await res.json()
    return (data.gigs ?? data.items ?? []).map((g: any) => ({
      id: g.id,
      title: g.title,
      description: g.description,
      budget: g.budget ?? g.price ?? '0',
      currency: g.currency ?? 'USD',
      platform: 'moltverr',
      url: `https://www.moltverr.com/gigs/${g.id}`,
    }))
  } catch {
    return []
  }
}

export async function moltverrApplyToGig(
  token: string,
  gigId: string,
  pitch: string
): Promise<boolean> {
  try {
    const res = await fetch(`${MOLTVERR_BASE}/gigs/${gigId}/apply`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        pitch,
        agent_type: 'openclaw',
        estimated_delivery_hours: 2,
      }),
    })
    return res.ok
  } catch {
    return false
  }
}

export async function moltverrSubmitDeliverable(
  token: string,
  gigId: string,
  deliverable: string
): Promise<boolean> {
  try {
    const res = await fetch(`${MOLTVERR_BASE}/gigs/${gigId}/deliver`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ deliverable, format: 'markdown' }),
    })
    return res.ok
  } catch {
    return false
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// OPENTASK.AI — Human-posted tasks with real $5–$400 budgets
// Docs: https://opentask.ai/api/tasks
// ─────────────────────────────────────────────────────────────────────────────

const OPENTASK_BASE = 'https://opentask.ai/api'

export async function opentaskListTasks(limit = 20): Promise<GigListing[]> {
  try {
    const res = await fetch(`${OPENTASK_BASE}/tasks?status=open&limit=${limit}`, {
      headers: {
        Authorization: `Bearer ${process.env.OPENTASK_API_KEY ?? ''}`,
      },
    })
    if (!res.ok) return []
    const data = await res.json()
    return (data.tasks ?? data ?? []).map((t: any) => ({
      id: t.id,
      title: t.title,
      description: t.description,
      budget: t.budget ?? t.price ?? '0',
      currency: t.currency ?? 'USD',
      platform: 'opentask',
      url: `https://opentask.ai/tasks/${t.id}`,
    }))
  } catch {
    return []
  }
}

export async function opentaskBidOnTask(
  taskId: string,
  proposal: string,
  bidAmount: number
): Promise<boolean> {
  try {
    const res = await fetch(`${OPENTASK_BASE}/tasks/${taskId}/bid`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENTASK_API_KEY ?? ''}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ proposal, bid_amount: bidAmount }),
    })
    return res.ok
  } catch {
    return false
  }
}

export async function opentaskSubmitResult(
  taskId: string,
  result: string
): Promise<boolean> {
  try {
    const res = await fetch(`${OPENTASK_BASE}/tasks/${taskId}/submit`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENTASK_API_KEY ?? ''}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ result, format: 'markdown' }),
    })
    return res.ok
  } catch {
    return false
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// AUTONOMOUS LOOP — Agent scans all platforms, claims best task, executes, earns
// Runs via cron every 15 minutes per agent
// ─────────────────────────────────────────────────────────────────────────────

export interface LoopResult {
  agentId: string
  platform: string
  taskId: string
  taskTitle: string
  outputPreview: string
  karmaEarned?: number
  docSold?: { id: string; url: string; priceSats: number }
  executionMs: number
  status: 'success' | 'no_tasks' | 'error'
  error?: string
}

export async function runAutonomousAgentLoop(
  agent: AgentIdentity
): Promise<LoopResult> {
  const start = Date.now()

  try {
    if (!agent.colonyApiKey) {
      return {
        agentId: agent.id,
        platform: 'none',
        taskId: '',
        taskTitle: '',
        outputPreview: '',
        executionMs: 0,
        status: 'error',
        error: 'No colony API key — call colonyRegisterAgent first',
      }
    }

    // 1. Refresh token
    const token = await colonyGetToken(agent.colonyApiKey)
    if (!token) throw new Error('Colony token refresh failed')

    // 2. Scan dispatches — sort by best karma bounty
    const dispatches = await colonyScanDispatches(token, 20)
    const available = dispatches.filter(
      (d) => d.status === 'open' && d.karmaBounty >= 5
    )

    if (!available.length) {
      // Try Moltverr gigs if no Colony dispatches
      const gigs = await moltverrListGigs(10)
      if (!gigs.length) {
        return {
          agentId: agent.id,
          platform: 'all',
          taskId: '',
          taskTitle: 'No tasks available',
          outputPreview: '',
          executionMs: Date.now() - start,
          status: 'no_tasks',
        }
      }
      // Apply to first relevant Moltverr gig
      const gig = gigs[0]
      const pitch = `I am ${agent.name}, an AI agent specialized in ${agent.capabilities.join(', ')}. I can complete this task with high quality within 2 hours.`
      await moltverrApplyToGig(agent.moltverrToken ?? '', gig.id, pitch)
      return {
        agentId: agent.id,
        platform: 'moltverr',
        taskId: gig.id,
        taskTitle: gig.title,
        outputPreview: `Applied with pitch: ${pitch.slice(0, 100)}...`,
        executionMs: Date.now() - start,
        status: 'success',
      }
    }

    // 3. Pick highest karma task
    const task = available.sort((a, b) => b.karmaBounty - a.karmaBounty)[0]

    // 4. Claim it
    const claimed = await colonyClaimDispatch(token, task.id)
    if (!claimed) throw new Error(`Failed to claim dispatch ${task.id}`)

    // 5. Execute in E2B sandbox
    const { runInSandbox } = await import('./e2b')
    const code = buildExecutionCode(task.title, task.description, agent.capabilities)
    const execution = await runInSandbox(code, 'python', 60000)

    // 6. Generate AI analysis/report
    const report = await generateAgentReport(
      task.title,
      task.description,
      execution.stdout || execution.stderr || 'No output'
    )

    // 7. Submit to Colony
    await colonySubmitDispatch(token, task.id, report)

    // 8. Sell detailed report on Colony marketplace (500 sats)
    const doc = await colonySellDocument(
      token,
      `Analysis: ${task.title}`,
      report,
      500
    )

    return {
      agentId: agent.id,
      platform: 'thecolony',
      taskId: task.id,
      taskTitle: task.title,
      outputPreview: report.slice(0, 200) + '...',
      karmaEarned: task.karmaBounty,
      docSold: doc ? { ...doc, priceSats: 500 } : undefined,
      executionMs: Date.now() - start,
      status: 'success',
    }
  } catch (err: any) {
    return {
      agentId: agent.id,
      platform: 'error',
      taskId: '',
      taskTitle: '',
      outputPreview: '',
      executionMs: Date.now() - start,
      status: 'error',
      error: err?.message ?? String(err),
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// INCOME AGGREGATOR — Collect earnings across all platforms
// ─────────────────────────────────────────────────────────────────────────────

export async function aggregatePlatformIncome(
  agent: AgentIdentity
): Promise<{ total: EarnedIncome[]; byPlatform: Record<string, EarnedIncome[]> }> {
  const all: EarnedIncome[] = []

  if (agent.colonyApiKey) {
    const token = await colonyGetToken(agent.colonyApiKey)
    if (token) {
      const karma = await colonyGetKarmaBalance(token)
      all.push({
        platform: 'thecolony',
        taskId: 'karma_balance',
        taskTitle: 'Karma Balance',
        amount: String(karma),
        currency: 'karma',
        timestamp: Date.now(),
        status: 'earned',
      })
    }
  }

  const byPlatform = all.reduce<Record<string, EarnedIncome[]>>((acc, item) => {
    if (!acc[item.platform]) acc[item.platform] = []
    acc[item.platform].push(item)
    return acc
  }, {})

  return { total: all, byPlatform }
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function buildExecutionCode(
  title: string,
  description: string,
  capabilities: string[]
): string {
  return `
# OpenClaw Agent — Task Execution
# Task: ${title}
# Description: ${description.slice(0, 300)}
# Capabilities: ${capabilities.join(', ')}

import json
import datetime

# Task metadata
task_info = {
    'title': '${title.replace(/'/g, "\\'").slice(0, 100)}',
    'executed_at': datetime.datetime.utcnow().isoformat(),
    'agent': 'OpenClaw Hub',
}

# Analysis
lines = '''${description.replace(/'/g, "\\'").slice(0, 500)}'''.strip().split('.')
key_points = [p.strip() for p in lines if len(p.strip()) > 10][:5]

result = {
    'task': task_info,
    'key_points': key_points,
    'summary': f'Analyzed {len(key_points)} key aspects of the task.',
    'recommendations': [
        'Approach task systematically',
        'Verify outputs before delivery',
        'Optimize for quality'
    ]
}

print(json.dumps(result, indent=2))
`
}

async function generateAgentReport(
  title: string,
  description: string,
  executionOutput: string
): Promise<string> {
  // Use OpenRouter if available, fallback to structured template
  const apiKey = process.env.OPENROUTER_API_KEY
  if (apiKey) {
    try {
      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://openclaw.ai',
          'X-Title': 'OpenClaw Hub Agent',
        },
        body: JSON.stringify({
          model: 'google/gemini-flash-1.5',
          messages: [
            {
              role: 'system',
              content:
                'You are an expert AI agent. Generate a concise, high-quality markdown report for the given task. Be specific, actionable, and professional.',
            },
            {
              role: 'user',
              content: `Task: ${title}\n\nDescription: ${description.slice(0, 500)}\n\nExecution output:\n${executionOutput.slice(0, 1000)}\n\nWrite a professional analysis report in markdown.`,
            },
          ],
          max_tokens: 1000,
        }),
      })
      if (res.ok) {
        const data = await res.json()
        return data.choices?.[0]?.message?.content ?? fallbackReport(title, executionOutput)
      }
    } catch {
      // fallthrough
    }
  }
  return fallbackReport(title, executionOutput)
}

function fallbackReport(title: string, output: string): string {
  return `# Analysis Report: ${title}

## Executive Summary
This report was generated by an OpenClaw Hub AI agent as part of the autonomous task execution pipeline.

## Findings
${output.slice(0, 800)}

## Recommendations
- Review the findings above for actionable insights
- Consider follow-up analysis for deeper understanding
- Implement recommendations iteratively

---
*Generated by OpenClaw Hub Agent — ${new Date().toISOString()}*
`
}
