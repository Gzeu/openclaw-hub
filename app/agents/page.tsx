'use client'

import { useEffect, useRef, useState } from 'react'
import { api } from '@/lib/api-client'
import AgentCommunicationsPanelFull from '@/components/AgentCommunicationsPanelFull'

// Types
interface Agent {
  key: string
  label?: string
  online: boolean
  capabilities: string[]
  address?: string | null
  pricePerTask?: string | null
}

interface SandboxResult {
  sandboxId: string
  stdout: string
  stderr: string
  error?: string
  executionTime: number
}

interface ChatMsg {
  role: 'user' | 'agent'
  text: string
  ts: string
}

interface Model {
  id: string
  name: string
  provider: string
  description: string
  context: string
  icon: string
  category: 'general' | 'reasoning' | 'coding' | 'conversational' | 'planning' | 'heavy'
}

const MODELS: Model[] = [
  {
    id: 'aurora-alpha-free-full-context',
    name: 'Aurora Alpha Full Context',
    provider: 'Literouter',
    description: 'Unlimited context, generalist with large context handling',
    context: 'You are an AI assistant integrated with OpenClaw. You excel at handling large context, previous messages, and long documents. Perfect for comprehensive analysis and detailed conversations.',
    icon: '🌟',
    category: 'general'
  },
  {
    id: 'ernie-4-5-21b-a3b-thinking-free',
    name: 'Ernie 4.5 Thinking',
    provider: 'Literouter',
    description: 'Specialized for reasoning and chain-of-thought, excellent planner',
    context: 'You are Ernie 4.5 Thinking, an AI assistant integrated with OpenClaw. You specialize in reasoning and chain-of-thought processes. You excel as a planner for complex tasks, providing detailed step-by-step analysis.',
    icon: '🧠',
    category: 'planning'
  },
  {
    id: 'gemini-free',
    name: 'Gemini',
    provider: 'Literouter',
    description: 'Excellent general assistant, stable fallback for mixed tasks',
    context: 'You are Gemini, an AI assistant integrated with OpenClaw. You are excellent at handling mixed tasks including coding, text analysis, and explanations. You serve as a reliable fallback for various requests.',
    icon: '💎',
    category: 'general'
  },
  {
    id: 'gemma-3-27b-it-free',
    name: 'Gemma 3 27B',
    provider: 'Literouter',
    description: 'Large model, excellent at reasoning and coding, heavy brain for tasks',
    context: 'You are Gemma 3 27B, an AI assistant integrated with OpenClaw. You are a large model excellent at reasoning and coding. You serve as the "heavy brain" for complex and difficult tasks in agent workflows.',
    icon: '💎',
    category: 'heavy'
  },
  {
    id: 'kat-coder-pro-free',
    name: 'Kat Coder Pro',
    provider: 'Literouter',
    description: 'Specialized for coding, perfect for code tools',
    context: 'You are Kat Coder Pro, an AI assistant integrated with OpenClaw. You specialize in coding tasks including code generation, refactoring, and bug fixing. You are perfect for code-related tools and development tasks.',
    icon: '👨‍💻',
    category: 'coding'
  },
  {
    id: 'llama-3-1-8b-instruct-turbo-free',
    name: 'Llama 3.1 8B Turbo',
    provider: 'Literouter',
    description: 'Fast, inexpensive, quite smart - ideal workhorse for OpenClaw',
    context: 'You are Llama 3.1 8B Turbo, an AI assistant integrated with OpenClaw. You are fast, inexpensive, and quite smart. You serve as ideal workhorse model for OpenClaw, handling most tasks efficiently.',
    icon: '🦙',
    category: 'general'
  },
  {
    id: 'qwen3-32b-free',
    name: 'Qwen3 32B',
    provider: 'Literouter',
    description: 'Very powerful at reasoning, coding, planning - ideal brain model',
    context: 'You are Qwen3 32B, an AI assistant integrated with OpenClaw. You are very powerful at reasoning, coding, and planning. You serve as ideal "brain model" called only for heavy and difficult tasks.',
    icon: '🧬',
    category: 'heavy'
  },
  {
    id: 'qwen2.5-7b-instruct-free',
    name: 'Qwen2.5 7B',
    provider: 'Literouter',
    description: 'Excellent at coding and reasoning mid-tier, great principal model',
    context: 'You are Qwen2.5 7B, an AI assistant integrated with OpenClaw. You are excellent at coding and reasoning, making you a great candidate for principal model handling code and tool-use tasks.',
    icon: '🎯',
    category: 'coding'
  }
]

// Utils
const truncate = (s: string, n = 12) =>
  s.length > n ? s.slice(0, 6) + '...' + s.slice(-4) : s

// Sub-components
function StatusDot({ online }: { online: boolean }) {
  return (
    <span className="relative flex h-2.5 w-2.5">
      {online && (
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
      )}
      <span
        className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
          online ? 'bg-emerald-400' : 'bg-zinc-600'
        }`}
      />
    </span>
  )
}

function CapBadge({ cap }: { cap: string }) {
  const colors: Record<string, string> = {
    code: 'bg-violet-500/20 text-violet-300 border-violet-500/30',
    web: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
    'data-analysis': 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    default: 'bg-zinc-500/20 text-zinc-300 border-zinc-500/30',
  }
  const cls = colors[cap] ?? colors.default
  return (
    <span
      className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${cls}`}
    >
      {cap}
    </span>
  )
}

function AgentCard({
  agent,
  selected,
  onClick,
}: {
  agent: Agent
  selected: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-3.5 rounded-xl border transition-all duration-200 group ${
        selected
          ? 'bg-violet-600/20 border-violet-500/60 shadow-lg shadow-violet-900/20'
          : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-600 hover:bg-zinc-800/60'
      }`}
    >
      <div className="flex items-center gap-2.5 mb-2">
        <StatusDot online={agent.online} />
        <span className="text-sm font-semibold text-white truncate flex-1">
          {agent.label ?? agent.key}
        </span>
        {agent.pricePerTask && (
          <span className="text-[10px] text-emerald-400 font-mono">
            {agent.pricePerTask} EGLD
          </span>
        )}
      </div>
      <div className="flex flex-wrap gap-1 mb-2">
        {agent.capabilities.map((c) => (
          <CapBadge key={c} cap={c} />
        ))}
      </div>
      {agent.address && (
        <p className="text-[10px] text-zinc-500 font-mono">
          {truncate(agent.address, 24)}
        </p>
      )}
    </button>
  )
}

function ChatBubble({ msg }: { msg: ChatMsg }) {
  const isUser = msg.role === 'user'
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}>
      <div
        className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
          isUser
            ? 'bg-violet-600 text-white rounded-br-sm'
            : 'bg-zinc-800 text-zinc-100 rounded-bl-sm border border-zinc-700'
        }`}
      >
        <p className="whitespace-pre-wrap">{msg.text}</p>
        <p
          className={`text-[10px] mt-1 ${
            isUser ? 'text-violet-300' : 'text-zinc-500'
          }`}
        >
          {new Date(msg.ts).toLocaleTimeString()}
        </p>
      </div>
    </div>
  )
}

function SandboxPanel({
  result,
  loading,
}: {
  result: SandboxResult | null
  loading: boolean
}) {
  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-zinc-800">
        <div className="flex gap-1.5">
          <span className="w-3 h-3 rounded-full bg-red-500/80" />
          <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
          <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
        </div>
        <span className="text-xs text-zinc-400 font-mono">E2B Sandbox</span>
        {loading && (
          <span className="ml-auto text-xs text-violet-400 animate-pulse">
            ● Running...
          </span>
        )}
        {result && !loading && (
          <span className="ml-auto text-xs text-zinc-500 font-mono">
            {result.executionTime}ms · {result.sandboxId.slice(0, 8)}
          </span>
        )}
      </div>
      <div className="flex-1 overflow-auto p-4 font-mono text-xs">
        {!result && !loading && (
          <p className="text-zinc-600 italic">
            Run code to see output here...
          </p>
        )}
        {loading && (
          <div className="space-y-2">
            {[60, 40, 80].map((w, i) => (
              <div
                key={i}
                className="h-3 bg-zinc-800 rounded animate-pulse"
                style={{ width: `${w}%` }}
              />
            ))}
          </div>
        )}
        {result && !loading && (
          <>
            {result.stdout && (
              <div className="mb-3">
                <p className="text-emerald-400 mb-1">// stdout</p>
                <pre className="text-zinc-300 whitespace-pre-wrap">
                  {result.stdout}
                </pre>
              </div>
            )}
            {result.stderr && (
              <div className="mb-3">
                <p className="text-amber-400 mb-1">// stderr</p>
                <pre className="text-amber-300 whitespace-pre-wrap">
                  {result.stderr}
                </pre>
              </div>
            )}
            {result.error && (
              <div>
                <p className="text-red-400 mb-1">// error</p>
                <pre className="text-red-300 whitespace-pre-wrap">
                  {result.error}
                </pre>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

// Main Page
export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [agentsLoading, setAgentsLoading] = useState(true)
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)

  // Agent Chat
  const [messages, setMessages] = useState<ChatMsg[]>([])
  const [input, setInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)

  // AI Chat
  const [aiMessages, setAiMessages] = useState<ChatMsg[]>([])
  const [aiInput, setAiInput] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [selectedModel, setSelectedModel] = useState(MODELS[0])
  const [showModelSelector, setShowModelSelector] = useState(false)
  const aiChatEndRef = useRef<HTMLDivElement>(null)

  // Sandbox
  const [code, setCode] = useState(
    '# Write Python or JS code here\nprint("Hello from E2B sandbox!")\n'
  )
  const [lang, setLang] = useState<'python' | 'javascript'>('python')
  const [sandboxResult, setSandboxResult] = useState<SandboxResult | null>(null)
  const [sandboxLoading, setSandboxLoading] = useState(false)

  type RightTab = 'sandbox' | 'delegate' | 'ai-chat' | 'communications' | 'agent-chat'

  // Active tab on right panel
  const [rightTab, setRightTab] = useState<RightTab>('ai-chat')

  // Delegate
  const [delegateTask, setDelegateTask] = useState('')
  const [delegateTarget, setDelegateTarget] = useState('')
  const [delegateLoading, setDelegateLoading] = useState(false)
  const [delegateResult, setDelegateResult] = useState<any>(null)

  // Fetch agents
  useEffect(() => {
    const load = async () => {
      setAgentsLoading(true)
      try {
        const res = await api.getAgents()
        const data = await res.json()
        setAgents(data.agents ?? [])
        if (data.agents?.length > 0 && !selectedAgent) {
          setSelectedAgent(data.agents[0])
        }
      } catch {
        setAgents([])
      } finally {
        setAgentsLoading(false)
      }
    }
    load()
    const iv = setInterval(load, 15000)
    return () => clearInterval(iv)
  }, [])

  // Agent chat handler
  const send = async () => {
    if (!selectedAgent || !input.trim()) return
    const userMsg = { role: 'user' as const, text: input, ts: new Date().toISOString() }
    setMessages((m) => [...m, userMsg])
    setChatLoading(true)
    try {
      const res = await api.chatWithAgent(selectedAgent.key, input)
      const reader = res.body?.getReader()
      if (!reader) throw new Error('No stream')
      let full = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        full += new TextDecoder().decode(value)
      }
      const agentMsg: ChatMsg = {
        role: 'agent',
        text: full || '(no response)',
        ts: new Date().toISOString(),
      }
      setMessages((m) => [...m, agentMsg])
    } catch (e: any) {
      setMessages((m) => [
        ...m,
        { role: 'agent', text: `Error: ${e.message}`, ts: new Date().toISOString() },
      ])
    } finally {
      setChatLoading(false)
    }
    setInput('')
  }

  // AI chat handler
  const sendAiChat = async () => {
    if (!aiInput.trim()) return
    const userMsg = { role: 'user' as const, text: aiInput, ts: new Date().toISOString() }
    setAiMessages((m) => [...m, userMsg])
    setAiLoading(true)
    try {
      const token = localStorage.getItem('auth-token')
      const res = await fetch('/api/chat/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          message: aiInput,
          model: selectedModel.id,
          provider: selectedModel.provider
        }),
      })
      const data = await res.json()
      const aiMsg: ChatMsg = {
        role: 'agent',
        text: data.response || 'Sorry, I could not generate a response.',
        ts: new Date().toISOString(),
      }
      setAiMessages((m) => [...m, aiMsg])
    } catch (e: any) {
      setAiMessages((m) => [
        ...m,
        { role: 'agent', text: `Error: ${e.message}`, ts: new Date().toISOString() },
      ])
    } finally {
      setAiLoading(false)
    }
    setAiInput('')
  }

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    aiChatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [aiMessages])

  // Sandbox
  const runSandbox = async () => {
    if (!code.trim() || sandboxLoading) return
    setSandboxLoading(true)
    setSandboxResult(null)
    try {
      const res = await fetch('/api/sandbox/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language: lang, agentId: selectedAgent?.key }),
      })
      const data = await res.json()
      setSandboxResult(data)
    } catch (e: any) {
      setSandboxResult({
        sandboxId: 'error',
        stdout: '',
        stderr: '',
        error: e.message,
        executionTime: 0,
      })
    } finally {
      setSandboxLoading(false)
    }
  }

  // Delegate
  const runDelegate = async () => {
    if (!delegateTask.trim() || !selectedAgent || !delegateTarget || delegateLoading)
      return
    setDelegateLoading(true)
    setDelegateResult(null)
    try {
      const res = await fetch('/api/agents/delegate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromAgent: selectedAgent.key,
          toAgent: delegateTarget,
          task: delegateTask,
          code: code.trim() || undefined,
          language: lang,
        }),
      })
      const data = await res.json()
      setDelegateResult(data)
    } catch (e: any) {
      setDelegateResult({ error: e.message })
    } finally {
      setDelegateLoading(false)
    }
  }

  // Render
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex flex-col">
      {/* Topbar */}
      <header className="border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-[1600px] mx-auto px-6 h-14 flex items-center gap-4">
          <a href="/" className="flex items-center gap-2 mr-4">
            <span className="text-xl">🦾</span>
            <span className="font-bold text-white tracking-tight">OpenClaw Hub</span>
          </a>
          <nav className="flex gap-1">
            {[['/', 'Projects'], ['/agents', 'Agents'], ['/chat', 'Chat']].map(([href, label]) => (
              <a
                key={href}
                href={href}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  href === '/agents'
                    ? 'bg-violet-600/20 text-violet-300'
                    : href === '/chat'
                    ? 'bg-violet-600/20 text-violet-300'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                }`}
              >
                {label}
              </a>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-3">
            <span className="text-xs text-zinc-500">
              {agents.filter((a) => a.online).length} online
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          </div>
        </div>
      </header>

      {/* Main 3-panel layout */}
      <div className="flex-1 flex max-w-[1600px] mx-auto w-full">
        {/* Panel 1 — Agent list */}
        <aside className="w-72 shrink-0 border-r border-zinc-800/80 flex flex-col">
          <div className="px-4 py-3 border-b border-zinc-800">
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">
              Agents
            </p>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {agentsLoading
              ? Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-20 rounded-xl bg-zinc-900 animate-pulse"
                  />
                ))
              : agents.length === 0
              ? (
                <div className="text-center py-12">
                  <p className="text-4xl mb-2">🔌</p>
                  <p className="text-sm text-zinc-500">
                    No agents online
                  </p>
                  <p className="text-xs text-zinc-600 mt-1">
                    Start OpenClaw gateway
                  </p>
                </div>
              )
              : agents.map((a) => (
                  <AgentCard
                    key={a.key}
                    agent={a}
                    selected={selectedAgent?.key === a.key}
                    onClick={() => {
                      setSelectedAgent(a)
                      setMessages([])
                    }}
                  />
                ))}
          </div>
        </aside>

        {/* Panel 2 — Chat */}
        <section className="flex-1 flex flex-col border-r border-zinc-800/80 min-w-0">
          <div className="px-5 py-3 border-b border-zinc-800 flex items-center gap-3">
            {selectedAgent ? (
              <>
                <StatusDot online={selectedAgent.online} />
                <span className="font-semibold text-sm">
                  {selectedAgent.label ?? selectedAgent.key}
                </span>
                <div className="flex gap-1 ml-1">
                  {selectedAgent.capabilities.map((c) => (
                    <CapBadge key={c} cap={c} />
                  ))}
                </div>
              </>
            ) : (
              <span className="text-zinc-500 text-sm">Select an agent</span>
            )}
          </div>

          {/* Chat Type Tabs */}
          <div className="flex border-b border-zinc-800">
            <button
              onClick={() => setRightTab('agent-chat')}
              className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                rightTab === 'agent-chat'
                  ? 'text-violet-400 border-b-2 border-violet-400'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              🤖 Agent Chat
            </button>
            <button
              onClick={() => setRightTab('ai-chat')}
              className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                rightTab === 'ai-chat'
                  ? 'text-violet-400 border-b-2 border-violet-400'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              💬 AI Chat
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-5 py-4">
            {(rightTab === 'agent-chat' ? messages : aiMessages).length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <span className="text-5xl mb-3">
                  {rightTab === 'agent-chat' ? '🤖' : '💬'}
                </span>
                <p className="text-zinc-400 font-medium">
                  {rightTab === 'agent-chat'
                    ? `Chat with ${selectedAgent?.label ?? selectedAgent?.key}`
                    : selectedModel
                    ? `Chat with ${selectedModel.name}`
                    : 'Select a model to start'
                  }
                </p>
                <p className="text-zinc-600 text-sm mt-1">
                  {rightTab === 'agent-chat'
                    ? 'Messages stream via OpenClaw Gateway'
                    : 'Messages powered by Literouter AI'
                  }
                </p>
              </div>
            )}
            {(rightTab === 'agent-chat' ? messages : aiMessages).map((m: any, i: number) => (
              <ChatBubble key={i} msg={m} />
            ))}
            {(rightTab === 'agent-chat' ? chatLoading : aiLoading) && (
              <div className="flex justify-start mb-3">
                <div className="bg-zinc-800 border border-zinc-700 px-4 py-2.5 rounded-2xl rounded-bl-sm">
                  <span className="flex gap-1">
                    {[0, 150, 300].map((d) => (
                      <span
                        key={d}
                        className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce"
                        style={{ animationDelay: `${d}ms` }}
                      />
                    ))}
                  </span>
                </div>
              </div>
            )}
            <div ref={rightTab === 'agent-chat' ? chatEndRef : aiChatEndRef} />
          </div>

          {/* Input */}
          <div className="px-5 py-4 border-t border-zinc-800">
            {rightTab === 'agent-chat' ? (
              <div className="flex gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === 'Enter' && !e.shiftKey && send()
                  }
                  placeholder={
                    selectedAgent
                      ? `Message ${selectedAgent.label ?? selectedAgent.key}...`
                      : 'Select an agent first'
                  }
                  disabled={!selectedAgent || chatLoading}
                  className="flex-1 bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500 transition-colors disabled:opacity-40"
                />
                <button
                  onClick={send}
                  disabled={!selectedAgent || !input.trim() || chatLoading}
                  className="px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors"
                >
                  Send
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Model Selector */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowModelSelector(!showModelSelector)}
                    className="flex items-center gap-2 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-white hover:bg-zinc-700 transition-colors"
                  >
                    <span>{selectedModel.icon}</span>
                    <span>{selectedModel.name}</span>
                    <span className="ml-auto">▼</span>
                  </button>
                  <div className="text-xs text-zinc-500">
                    {selectedModel.description}
                  </div>
                </div>

                {/* Model Selector Modal */}
                {showModelSelector && (
                  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 max-w-2xl max-h-[80vh] overflow-y-auto">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-white">Select AI Model</h3>
                        <button
                          onClick={() => setShowModelSelector(false)}
                          className="text-zinc-400 hover:text-white"
                        >
                          ✕
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {MODELS.map((model) => (
                          <button
                            key={model.id}
                            onClick={() => {
                              setSelectedModel(model)
                              setShowModelSelector(false)
                            }}
                            className={`p-3 rounded-lg border text-left transition-colors ${
                              selectedModel.id === model.id
                                ? 'bg-violet-600/20 border-violet-500/60'
                                : 'bg-zinc-800/60 border-zinc-700 hover:border-zinc-600'
                            }`}
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-xl">{model.icon}</span>
                              <div>
                                <div className="font-medium text-white">{model.name}</div>
                                <div className="text-xs text-zinc-400">{model.provider}</div>
                              </div>
                            </div>
                            <div className="text-xs text-zinc-300">{model.description}</div>
                            <div className="mt-2">
                              <span className="text-[10px] px-2 py-1 rounded bg-zinc-700 text-zinc-300">
                                {model.category}
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Chat Input */}
                <div className="flex gap-2">
                  <input
                    value={aiInput}
                    onChange={(e) => setAiInput(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === 'Enter' && !e.shiftKey && sendAiChat()
                    }
                    placeholder={`Message ${selectedModel.name}...`}
                    disabled={aiLoading}
                    className="flex-1 bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500 transition-colors disabled:opacity-40"
                  />
                  <button
                    onClick={sendAiChat}
                    disabled={!aiInput.trim() || aiLoading}
                    className="px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors"
                  >
                    {aiLoading ? 'Sending...' : 'Send'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Panel 3 — Sandbox + Delegate */}
        <aside className="w-[420px] shrink-0 flex flex-col">
          {/* Tabs */}
          <div className="flex border-b border-zinc-800">
            {(['sandbox', 'delegate', 'communications'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setRightTab(tab)}
                className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                  rightTab === tab
                    ? 'text-violet-400 border-b-2 border-violet-400'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {tab === 'sandbox' ? '⚡ E2B Sandbox' : tab === 'delegate' ? '🔀 A2A Delegate' : '💬 Communications'}
              </button>
            ))}
          </div>

          {rightTab === 'sandbox' ? (
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Code editor area */}
              <div className="flex items-center gap-2 px-4 py-2 border-b border-zinc-800">
                <select
                  value={lang}
                  onChange={(e) => setLang(e.target.value as any)}
                  className="bg-zinc-900 border border-zinc-700 text-xs text-zinc-300 rounded-lg px-2 py-1 focus:outline-none"
                >
                  <option value="python">Python</option>
                  <option value="javascript">JavaScript</option>
                </select>
                <button
                  onClick={runSandbox}
                  disabled={sandboxLoading}
                  className="ml-auto px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-xs font-semibold text-white transition-colors"
                >
                  {sandboxLoading ? 'Running...' : '▶ Run'}
                </button>
              </div>
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="flex-1 bg-zinc-950 font-mono text-xs text-zinc-200 p-4 resize-none focus:outline-none border-b border-zinc-800"
                spellCheck={false}
                style={{ minHeight: '180px', maxHeight: '220px' }}
              />
              {/* Output */}
              <div className="flex-1 overflow-hidden">
                <SandboxPanel result={sandboxResult} loading={sandboxLoading} />
              </div>
            </div>
          ) : rightTab === 'delegate' ? (
            <div className="flex-1 flex flex-col p-4 gap-4 overflow-y-auto">
              <div>
                <label className="text-xs text-zinc-400 mb-1.5 block">
                  From Agent
                </label>
                <div className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-300">
                  {selectedAgent?.key ?? 'Select agent first'}
                </div>
              </div>
              <div>
                <label className="text-xs text-zinc-400 mb-1.5 block">
                  To Agent (session key)
                </label>
                <select
                  value={delegateTarget}
                  onChange={(e) => setDelegateTarget(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 text-sm text-zinc-300 rounded-lg px-3 py-2 focus:outline-none focus:border-violet-500"
                >
                  <option value="">-- select target agent --</option>
                  {agents
                    .filter((a) => a.key !== selectedAgent?.key)
                    .map((a) => (
                      <option key={a.key} value={a.key}>
                        {a.label ?? a.key}
                      </option>
                    ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-zinc-400 mb-1.5 block">Task</label>
                <textarea
                  value={delegateTask}
                  onChange={(e) => setDelegateTask(e.target.value)}
                  placeholder="Describe what Agent B should do..."
                  rows={3}
                  className="w-full bg-zinc-900 border border-zinc-700 text-sm text-zinc-200 rounded-lg px-3 py-2 focus:outline-none focus:border-violet-500 resize-none placeholder-zinc-600"
                />
              </div>
              <p className="text-xs text-zinc-500">
                Code from Sandbox will be included as context automatically.
              </p>
              <button
                onClick={runDelegate}
                disabled={delegateLoading || !selectedAgent || !delegateTarget || !delegateTask}
                className="w-full py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-sm font-semibold text-white transition-colors"
              >
                {delegateLoading ? 'Delegating...' : '🔀 Delegate Task'}
              </button>
              {delegateResult && (
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3">
                  {delegateResult.error ? (
                    <p className="text-red-400 text-xs">{delegateResult.error}</p>
                  ) : (
                    <>
                      <p className="text-xs text-zinc-400 mb-1">
                        ✅ Delegated at{' '}
                        {new Date(delegateResult.delegatedAt).toLocaleTimeString()}
                      </p>
                      <pre className="text-xs text-zinc-200 whitespace-pre-wrap">
                        {delegateResult.response?.slice(0, 500)}
                      </pre>
                    </>
                  )}
                </div>
              )}
            </div>
          ) : (
            <AgentCommunicationsPanelFull agentId={selectedAgent?.key || ''} />
          )}
        </aside>
      </div>
    </div>
  )
}
