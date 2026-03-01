import { useState, useEffect } from 'react'
import { getSessionHistory } from '@/lib/openclaw-gateway'

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

export function useChatHistory(sessionKey: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadHistory = async () => {
      try {
        setIsLoading(true)
        const history = getSessionHistory(sessionKey)
        setMessages(history)
      } catch (error) {
        console.error('Failed to load chat history:', error)
        setMessages([])
      } finally {
        setIsLoading(false)
      }
    }

    loadHistory()
  }, [sessionKey])

  const addMessage = (message: ChatMessage) => {
    setMessages(prev => [...prev, message])
  }

  const clearHistory = () => {
    setMessages([])
  }

  return {
    messages,
    isLoading,
    addMessage,
    clearHistory
  }
}
