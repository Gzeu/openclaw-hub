'use client'

import { useEffect, useState, useCallback } from 'react'
import { getConvexClientWithSubscriptions } from '@/lib/convex-client'
import { api } from '@/convex/_generated/api'

interface AgentChannel {
  _id: string
  channelName: string
  participants: string[]
  channelType: 'delegation' | 'collaboration' | 'broadcast'
  createdAt: number
  lastActivity: number
  isActive: boolean
}

interface AgentMessage {
  _id: string
  channelId: string
  senderId: string
  message: string
  messageType: 'delegation' | 'response' | 'status' | 'heartbeat'
  timestamp: number
  metadata?: any
}

interface AgentDelegation {
  _id: string
  delegationId: string
  fromAgent: string
  toAgent: string
  task: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'pending' | 'accepted' | 'completed' | 'failed'
  context?: any
  createdAt: number
  updatedAt: number
}

interface AgentHeartbeat {
  _id: string
  agentId: string
  status: 'online' | 'busy' | 'offline'
  currentTask?: string
  capabilities?: string[]
  lastHeartbeat: number
  createdAt: number
}

export function useAgentCommunications(agentId: string) {
  const convex = getConvexClientWithSubscriptions()
  const [channels, setChannels] = useState<AgentChannel[]>([])
  const [messages, setMessages] = useState<Record<string, AgentMessage[]>>({})
  const [delegations, setDelegations] = useState<AgentDelegation[]>([])
  const [agentStatus, setAgentStatus] = useState<AgentHeartbeat[]>([])
  const [loading, setLoading] = useState(true)

  // Subscribe to agent channels
  useEffect(() => {
    if (!agentId) return

    const unsubscribe = convex.onSubscription(
      api.agentComms.getAgentChannel,
      { channelId: undefined } // Will be filtered client-side
    )

    const subscription = unsubscribe.subscribe((result: any) => {
      if (result) {
        // Filter channels where agent is a participant
        const relevantChannels = result.channel?.participants?.includes(agentId) ? [result.channel] : []
        setChannels(prev => {
          const updated = [...prev]
          relevantChannels.forEach(channel => {
            const existingIndex = updated.findIndex(c => c._id === channel._id)
            if (existingIndex >= 0) {
              updated[existingIndex] = channel
            } else {
              updated.push(channel)
            }
          })
          return updated
        })

        // Update messages
        if (result.messages) {
          setMessages(prev => ({
            ...prev,
            [result.channel._id]: result.messages
          }))
        }
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [agentId, convex])

  // Subscribe to agent delegations
  useEffect(() => {
    if (!agentId) return

    const unsubscribe = convex.onSubscription(
      api.agentComms.getAgentDelegations,
      { agentId }
    )

    const subscription = unsubscribe.subscribe((result: any) => {
      if (result) {
        setDelegations(result)
      }
    })

    return () => subscription.unsubscribe()
  }, [agentId, convex])

  // Subscribe to agent status
  useEffect(() => {
    const unsubscribe = convex.onSubscription(
      api.agentComms.getAgentStatus,
      { agentIds: [agentId] }
    )

    const subscription = unsubscribe.subscribe((result: any) => {
      if (result) {
        setAgentStatus(result)
      }
    })

    return () => subscription.unsubscribe()
  }, [agentId, convex])

  // Send message to channel
  const sendMessage = useCallback(async (
    channelId: string,
    message: string,
    messageType: 'delegation' | 'response' | 'status' | 'heartbeat',
    metadata?: any
  ) => {
    try {
      const response = await fetch('/api/agents/communications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'sendMessage',
          channelId,
          senderId: agentId,
          message,
          messageType,
          metadata,
        }),
      })

      if (!response.ok) {
        throw new Error(`Failed to send message: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Send message error:', error)
      throw error
    }
  }, [agentId])

  // Delegate task to agent
  const delegateTask = useCallback(async (
    toAgent: string,
    task: string,
    priority: 'low' | 'medium' | 'high' | 'urgent' = 'medium',
    context?: any
  ) => {
    try {
      const response = await fetch('/api/agents/delegation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromAgent: agentId,
          toAgent,
          task,
          priority,
          context,
        }),
      })

      if (!response.ok) {
        throw new Error(`Failed to delegate task: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Delegate task error:', error)
      throw error
    }
  }, [agentId])

  // Update agent heartbeat
  const updateHeartbeat = useCallback(async (
    status: 'online' | 'busy' | 'offline',
    currentTask?: string,
    capabilities?: string[]
  ) => {
    try {
      const response = await fetch('/api/agents/communications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'updateHeartbeat',
          agentId,
          status,
          currentTask,
          capabilities,
        }),
      })

      if (!response.ok) {
        throw new Error(`Failed to update heartbeat: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Update heartbeat error:', error)
      throw error
    }
  }, [agentId])

  // Respond to delegation
  const respondToDelegation = useCallback(async (
    delegationId: string,
    response: 'accepted' | 'rejected',
    responseMessage?: string
  ) => {
    try {
      const result = await fetch('/api/agents/communications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'respondToDelegation',
          delegationId,
          response,
          responseMessage,
        }),
      })

      if (!result.ok) {
        throw new Error(`Failed to respond to delegation: ${result.statusText}`)
      }

      return await result.json()
    } catch (error) {
      console.error('Respond to delegation error:', error)
      throw error
    }
  }, [])

  return {
    // Data
    channels,
    messages,
    delegations,
    agentStatus,
    loading,

    // Actions
    sendMessage,
    delegateTask,
    updateHeartbeat,
    respondToDelegation,

    // Computed values
    pendingDelegations: delegations.filter(d => d.status === 'pending'),
    activeDelegations: delegations.filter(d => d.status === 'accepted'),
    completedDelegations: delegations.filter(d => d.status === 'completed'),
    currentAgentStatus: agentStatus.find(s => s.agentId === agentId),
  }
}

// Hook for real-time delegation monitoring
export function useDelegationMonitor(delegationId: string) {
  const convex = getConvexClientWithSubscriptions()
  const [delegation, setDelegation] = useState<AgentDelegation | null>(null)
  const [messages, setMessages] = useState<AgentMessage[]>([])

  useEffect(() => {
    if (!delegationId) return

    // Subscribe to delegation updates
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/agents/delegation?agentId=any&status=pending`)
        const data = await response.json()
        const found = data.delegations.find((d: AgentDelegation) => d.delegationId === delegationId)
        
        if (found) {
          setDelegation(found)
        }
      } catch (error) {
        console.error('Delegation monitor error:', error)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [delegationId])

  return { delegation, messages }
}
