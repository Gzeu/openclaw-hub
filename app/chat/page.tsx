'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card } from '@/components/ui/card'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
  model?: string
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
    id: 'gemma-free',
    name: 'Gemma',
    provider: 'Literouter',
    description: 'Light version, fast and predictable generalist',
    context: 'You are Gemma, an AI assistant integrated with OpenClaw. You are a light, fast, and predictable generalist model. You provide quick responses for general tasks and conversations.',
    icon: '💎',
    category: 'general'
  },
  {
    id: 'glm-free',
    name: 'GLM',
    provider: 'Literouter',
    description: 'Decent generalist, secondary model or fallback',
    context: 'You are GLM, an AI assistant integrated with OpenClaw. You are a decent generalist model that can serve as a secondary model or fallback for various tasks.',
    icon: '🔮',
    category: 'general'
  },
  {
    id: 'gpt-oss-20b-free',
    name: 'GPT OSS 20B',
    provider: 'Literouter',
    description: 'Large OSS model, serious reasoning alternative to gemma/gemma-3',
    context: 'You are GPT OSS 20B, an AI assistant integrated with OpenClaw. You are a large open-source model excellent for serious reasoning, serving as an alternative to gemma/gemma-3 for difficult tasks.',
    icon: '🤖',
    category: 'reasoning'
  },
  {
    id: 'hermes-2-pro-llama-3-8b-free',
    name: 'Hermes 2 Pro Llama 3 8B',
    provider: 'Literouter',
    description: 'Excellent for conversational agents, prompt-following, roleplay',
    context: 'You are Hermes 2 Pro Llama 3 8B, an AI assistant integrated with OpenClaw. You excel at conversational interactions, prompt-following, and roleplay. You are perfect as a front-facing agent in OpenClaw.',
    icon: '🗣️',
    category: 'conversational'
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
    context: 'You are Llama 3.1 8B Turbo, an AI assistant integrated with OpenClaw. You are fast, inexpensive, and quite smart. You serve as the ideal workhorse model for OpenClaw, handling most tasks efficiently.',
    icon: '🦙',
    category: 'general'
  },
  {
    id: 'qwen3-32b-free',
    name: 'Qwen3 32B',
    provider: 'Literouter',
    description: 'Very powerful at reasoning, coding, planning - ideal brain model',
    context: 'You are Qwen3 32B, an AI assistant integrated with OpenClaw. You are very powerful at reasoning, coding, and planning. You serve as the ideal "brain model" called only for heavy and difficult tasks.',
    icon: '🧬',
    category: 'heavy'
  },
  {
    id: 'qwen2.5-7b-instruct-free',
    name: 'Qwen2.5 7B',
    provider: 'Literouter',
    description: 'Excellent at coding and reasoning mid-tier, great principal model',
    context: 'You are Qwen2.5 7B, an AI assistant integrated with OpenClaw. You are excellent at coding and reasoning, making you a great candidate for the principal model handling code and tool-use tasks.',
    icon: '🎯',
    category: 'coding'
  }
]

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [selectedModel, setSelectedModel] = useState(MODELS[0])
  const [showModelSelector, setShowModelSelector] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('auth-token')
    if (!token) {
      router.push('/login')
      return
    }

    // Check for OpenClaw connection
    checkOpenClawConnection()
  }, [])

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    // Auto-select model from URL params
    const modelId = searchParams.get('model')
    if (modelId) {
      const model = MODELS.find(m => m.id === modelId)
      if (model) {
        setSelectedModel(model)
      }
    }
  }, [searchParams])

  const checkOpenClawConnection = async () => {
    try {
      const response = await fetch('/api/openclaw/status')
      const data = await response.json()
      setIsConnected(data.connected)
    } catch (err) {
      console.error('OpenClaw connection check failed:', err)
      setIsConnected(false)
    }
  }

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: Date.now()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/chat/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth-token')}`
        },
        body: JSON.stringify({
          message: userMessage.content,
          model: selectedModel.id,
          provider: selectedModel.provider
        })
      })

      const data = await response.json()

      if (response.ok) {
        const assistantMessage: Message = {
          id: Date.now().toString(),
          role: 'assistant',
          content: data.response,
          timestamp: Date.now(),
          model: selectedModel.name
        }
        setMessages(prev => [...prev, assistantMessage])
      } else {
        setError(data.error || 'Failed to send message')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to send message')
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const clearChat = () => {
    setMessages([])
    setError('')
  }

  const exportChat = () => {
    const chatData = {
      model: selectedModel.name,
      provider: selectedModel.provider,
      messages: messages,
      timestamp: new Date().toISOString()
    }
    
    const blob = new Blob([JSON.stringify(chatData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `chat-${selectedModel.id}-${Date.now()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-zinc-900">
      {/* Header */}
      <div className="border-b border-zinc-800">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push('/')}
                className="text-zinc-400 hover:text-white transition-colors"
              >
                ← Back
              </button>
              <h1 className="text-xl font-semibold text-white">OpenClaw Chat</h1>
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                isConnected ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
              }`}>
                <div className={`w-2 h-2 rounded-full ${
                  isConnected ? 'bg-green-500' : 'bg-red-500'
                }`} />
                <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowModelSelector(!showModelSelector)}
                className="flex items-center gap-2 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors"
              >
                <span>{selectedModel.icon}</span>
                <span className="text-sm text-white">{selectedModel.name}</span>
                <span className="text-xs text-zinc-400">▼</span>
              </button>
              
              <button
                onClick={clearChat}
                className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors text-sm text-white"
              >
                🗑️ Clear
              </button>
              
              <button
                onClick={exportChat}
                className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors text-sm text-white"
              >
                📥 Export
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Model Selector Modal */}
      {showModelSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-zinc-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
            <h3 className="text-lg font-semibold text-white mb-4">Select Model</h3>
            <div className="space-y-3">
              {MODELS.map((model) => (
                <button
                  key={model.id}
                  onClick={() => {
                    setSelectedModel(model)
                    setShowModelSelector(false)
                    // Update URL
                    const params = new URLSearchParams(searchParams)
                    params.set('model', model.id)
                    router.push(`/chat?${params.toString()}`)
                  }}
                  className={`w-full text-left p-4 rounded-lg border transition-colors ${
                    selectedModel.id === model.id
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-zinc-700 hover:border-zinc-600 bg-zinc-900 hover:bg-zinc-800'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">{model.icon}</div>
                    <div className="flex-1">
                      <div className="font-medium text-white">{model.name}</div>
                      <div className="text-sm text-zinc-400">{model.description}</div>
                      <div className="text-xs text-zinc-500 mt-1">{model.provider}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowModelSelector(false)}
              className="w-full mt-4 px-4 py-2 bg-zinc-700 hover:bg-zinc-600 rounded-lg transition-colors text-white"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Chat Messages */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="bg-zinc-800 rounded-lg border border-zinc-700 h-[500px] overflow-y-auto p-4 mb-4">
          {messages.length === 0 ? (
            <div className="text-center text-zinc-400 py-20">
              <div className="text-4xl mb-4">💬</div>
              <p className="text-lg">Start a conversation with {selectedModel.name}</p>
              <p className="text-sm text-zinc-500">{selectedModel.description}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-2xl px-4 py-3 rounded-lg ${
                      message.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-zinc-700 text-white'
                    }`}
                  >
                    <div className="text-sm opacity-75 mb-1">
                      {message.role === 'user' ? 'You' : message.model || selectedModel.name}
                      {' • '}
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </div>
                    <div className="whitespace-pre-wrap">{message.content}</div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-4">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Input Area */}
        <div className="bg-zinc-800 rounded-lg border border-zinc-700 p-4">
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={`Message ${selectedModel.name}...`}
              disabled={isLoading}
              className="flex-1 bg-zinc-700 border border-zinc-600 rounded-lg px-4 py-3 text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={sendMessage}
              disabled={isLoading || !input.trim()}
              className="px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg text-white font-medium transition-colors"
            >
              {isLoading ? '...' : 'Send'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
