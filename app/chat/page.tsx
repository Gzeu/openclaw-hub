'use client'

import { useState, useRef, useEffect } from 'react'
import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Send, Bot, User, Settings2, RefreshCw } from 'lucide-react'

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  agentId?: string;
  model?: string;
}

const AVAILABLE_MODELS = [
  { id: 'aurora-alpha',          name: 'Aurora Alpha' },
  { id: 'gemini-1.5-pro',        name: 'Gemini 1.5 Pro' },
  { id: 'qwen-2.5-max',          name: 'Qwen 2.5 Max' },
  { id: 'gpt-4o',                name: 'GPT-4o' },
  { id: 'claude-3.5-sonnet',     name: 'Claude 3.5 Sonnet' },
  { id: 'mistral-medium-latest', name: 'Mistral Medium' },
];

export default function ChatPage() {
  const [input, setInput]                 = useState('')
  const [messages, setMessages]           = useState<Message[]>([])
  const [selectedAgent, setSelectedAgent] = useState('agent:main:main')
  const [selectedModel, setSelectedModel] = useState('mistral-medium-latest')
  const [isTyping, setIsTyping]           = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const activeAgents = useQuery(api.agents.getActiveAgents) || []

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: Date.now(),
    }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsTyping(true)

    try {
      const res = await fetch('/api/agents/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input, agentId: selectedAgent, model: selectedModel }),
      })

      if (res.body) {
        const reader = res.body.getReader()
        const decoder = new TextDecoder()
        let accumulated = ''
        const botId = (Date.now() + 1).toString()

        setMessages(prev => [...prev, {
          id: botId, role: 'assistant', content: '',
          timestamp: Date.now(), agentId: selectedAgent, model: selectedModel,
        }])

        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          accumulated += decoder.decode(value, { stream: true })
          setMessages(prev => prev.map(m =>
            m.id === botId ? { ...m, content: accumulated } : m
          ))
        }
      }
    } catch (err) {
      console.error('Chat error:', err)
    } finally {
      setIsTyping(false)
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-56px)] bg-[#0a0a0a]">
      {/* Config bar */}
      <div className="flex items-center justify-between p-4 border-b border-[#1a1a1a] bg-[#111]">
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <label className="text-xs text-gray-500 mb-1">Agent</label>
            <select
              value={selectedAgent}
              onChange={e => setSelectedAgent(e.target.value)}
              className="bg-[#1a1a1a] border border-[#333] text-white text-sm rounded-md px-3 py-1.5 focus:outline-none focus:border-[#23F7DD]"
            >
              <option value="agent:main:main">Main Agent</option>
              <option value="agent:main:op">OP Agent</option>
              {activeAgents.map((a: { _id: string; id: string; name?: string }) => (
                <option key={a._id} value={a.id}>{a.name || a.id}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col">
            <label className="text-xs text-gray-500 mb-1">Model</label>
            <select
              value={selectedModel}
              onChange={e => setSelectedModel(e.target.value)}
              className="bg-[#1a1a1a] border border-[#333] text-white text-sm rounded-md px-3 py-1.5 focus:outline-none focus:border-[#23F7DD]"
            >
              {AVAILABLE_MODELS.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMessages([])}
            className="p-2 text-gray-400 hover:text-white rounded-md hover:bg-[#1a1a1a]"
            title="Clear chat"
          >
            <RefreshCw size={18} />
          </button>
          <button className="p-2 text-gray-400 hover:text-white rounded-md hover:bg-[#1a1a1a]">
            <Settings2 size={18} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center opacity-50">
            <Bot size={48} className="mb-4 text-[#23F7DD]" />
            <h2 className="text-xl font-semibold mb-2">Start a conversation</h2>
            <p className="max-w-md text-sm">Select an agent and model, then type your message.</p>
          </div>
        ) : (
          messages.map(msg => (
            <div key={msg.id} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role !== 'user' && (
                <div className="w-8 h-8 rounded-full bg-[#1a1a1a] border border-[#333] flex items-center justify-center shrink-0">
                  <Bot size={16} className="text-[#23F7DD]" />
                </div>
              )}
              <div className={`max-w-[80%] rounded-xl p-4 ${
                msg.role === 'user'
                  ? 'bg-[#23F7DD] text-black rounded-tr-sm'
                  : 'bg-[#1a1a1a] border border-[#333] text-white rounded-tl-sm'
              }`}>
                {msg.role === 'assistant' && (
                  <div className="flex items-center gap-2 mb-2 text-xs opacity-50">
                    <span>{msg.agentId}</span><span>·</span><span>{msg.model}</span>
                  </div>
                )}
                <div className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</div>
              </div>
              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-[#333] flex items-center justify-center shrink-0">
                  <User size={16} className="text-white" />
                </div>
              )}
            </div>
          ))
        )}
        {isTyping && (
          <div className="flex gap-4 justify-start">
            <div className="w-8 h-8 rounded-full bg-[#1a1a1a] border border-[#333] flex items-center justify-center shrink-0">
              <Bot size={16} className="text-[#23F7DD]" />
            </div>
            <div className="bg-[#1a1a1a] border border-[#333] rounded-xl rounded-tl-sm p-4 flex items-center gap-1">
              {[0, 200, 400].map(d => (
                <div key={d} className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />
              ))}
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-[#111] border-t border-[#1a1a1a]">
        <form onSubmit={handleSend} className="max-w-4xl mx-auto relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Type a message to your agent..."
            className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl pl-4 pr-12 py-3 text-white focus:outline-none focus:border-[#23F7DD] transition-colors"
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="absolute right-2 p-2 text-[#23F7DD] hover:bg-[#23F7DD]/10 rounded-lg transition-colors disabled:opacity-50"
          >
            <Send size={20} />
          </button>
        </form>
        <p className="text-center mt-2 text-[10px] text-gray-600">Powered by OpenClaw Hub · streaming via /api/agents/chat</p>
      </div>
    </div>
  )
}
