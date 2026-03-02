'use client'

import { useState, useRef, useEffect } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Send, Bot, User, Settings2, RefreshCw } from 'lucide-react'

// You might already have a similar type in your Convex schema
interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  agentId?: string;
  model?: string;
}

export default function ChatPage() {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [selectedAgent, setSelectedAgent] = useState('agent:default:main')
  const [selectedModel, setSelectedModel] = useState('aurora-alpha')
  const [isTyping, setIsTyping] = useState(false)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  // Fetch active agents and models
  const activeAgents = useQuery(api.agents.getActiveAgents) || []
  
  // Example dummy models - replace with actual fetch from Literouter API if needed
  const availableModels = [
    { id: 'aurora-alpha', name: 'Aurora Alpha' },
    { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro' },
    { id: 'qwen-2.5-max', name: 'Qwen 2.5 Max' },
    { id: 'gpt-4o', name: 'GPT-4o' },
  ]

  // Add a Convex mutation for sending messages later
  // const sendMessageMutation = useMutation(api.chat.sendMessage)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
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
      // TODO: Connect this to actual Convex mutation / Literouter API
      // await sendMessageMutation({ 
      //   content: input, 
      //   agentId: selectedAgent,
      //   model: selectedModel 
      // })
      
      // Temporary mock response
      setTimeout(() => {
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `I am responding using **${selectedModel}** via the **${selectedAgent}** agent. This is a placeholder response until the Convex/WebSocket backend is fully hooked up!`,
          timestamp: Date.now(),
          agentId: selectedAgent,
          model: selectedModel
        }
        setMessages(prev => [...prev, botMessage])
        setIsTyping(false)
      }, 1500)

    } catch (error) {
      console.error('Failed to send message:', error)
      setIsTyping(false)
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-56px)] bg-[#0a0a0a]">
      {/* Top Configuration Bar */}
      <div className="flex items-center justify-between p-4 border-b border-[#1a1a1a] bg-[#111]">
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <label className="text-xs text-gray-500 mb-1">Select Agent</label>
            <select 
              value={selectedAgent}
              onChange={(e) => setSelectedAgent(e.target.value)}
              className="bg-[#1a1a1a] border border-[#333] text-white text-sm rounded-md px-3 py-1.5 focus:outline-none focus:border-[#23F7DD]"
            >
              <option value="agent:default:main">Main Agent (Dev)</option>
              <option value="agent:default:op">OP Agent (Ops)</option>
              <option value="agent:default:general">General Agent</option>
              {activeAgents.map(agent => (
                <option key={agent._id} value={agent.id}>{agent.name || agent.id}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col">
            <label className="text-xs text-gray-500 mb-1">AI Model</label>
            <select 
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="bg-[#1a1a1a] border border-[#333] text-white text-sm rounded-md px-3 py-1.5 focus:outline-none focus:border-[#23F7DD]"
            >
              {availableModels.map(model => (
                <option key={model.id} value={model.id}>{model.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="p-2 text-gray-400 hover:text-white transition-colors rounded-md hover:bg-[#1a1a1a]">
            <RefreshCw size={18} />
          </button>
          <button className="p-2 text-gray-400 hover:text-white transition-colors rounded-md hover:bg-[#1a1a1a]">
            <Settings2 size={18} />
          </button>
        </div>
      </div>

      {/* Chat History Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center opacity-50">
            <Bot size={48} className="mb-4 text-[#23F7DD]" />
            <h2 className="text-xl font-semibold mb-2">Start a conversation</h2>
            <p className="max-w-md text-sm">
              Select an agent and a model from the top bar, then type your message below to begin interacting with the OpenClaw Hub ecosystem.
            </p>
          </div>
        ) : (
          messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role !== 'user' && (
                <div className="w-8 h-8 rounded-full bg-[#1a1a1a] border border-[#333] flex items-center justify-center shrink-0">
                  <Bot size={16} className="text-[#23F7DD]" />
                </div>
              )}
              
              <div 
                className={`max-w-[80%] rounded-xl p-4 ${
                  msg.role === 'user' 
                    ? 'bg-[#23F7DD] text-black rounded-tr-sm' 
                    : 'bg-[#1a1a1a] border border-[#333] text-white rounded-tl-sm'
                }`}
              >
                {msg.role === 'assistant' && (
                  <div className="flex items-center gap-2 mb-2 text-xs opacity-50">
                    <span>{msg.agentId}</span>
                    <span>•</span>
                    <span>{msg.model}</span>
                  </div>
                )}
                <div className="text-sm leading-relaxed whitespace-pre-wrap">
                  {msg.content}
                </div>
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
              <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-[#111] border-t border-[#1a1a1a]">
        <form 
          onSubmit={handleSend}
          className="max-w-4xl mx-auto relative flex items-center"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message to your agent..."
            className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl pl-4 pr-12 py-3 text-white focus:outline-none focus:border-[#23F7DD] transition-colors"
          />
          <button 
            type="submit"
            disabled={!input.trim() || isTyping}
            className="absolute right-2 p-2 text-[#23F7DD] hover:bg-[#23F7DD]/10 rounded-lg transition-colors disabled:opacity-50 disabled:hover:bg-transparent"
          >
            <Send size={20} />
          </button>
        </form>
        <div className="text-center mt-2">
          <span className="text-[10px] text-gray-600">
            Powered by Literouter & OpenClaw framework. Press Enter to send.
          </span>
        </div>
      </div>
    </div>
  )
}