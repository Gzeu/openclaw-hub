'use client'

import { useState, useEffect } from 'react'
import { useAgentCommunications } from '@/hooks/useAgentCommunications'

interface AgentCommunicationsPanelProps {
  agentId: string
}

export default function AgentCommunicationsPanel({ agentId }: AgentCommunicationsPanelProps) {
  const {
    channels,
    messages,
    delegations,
    agentStatus,
    loading,
    sendMessage,
    delegateTask,
    updateHeartbeat,
    respondToDelegation,
    pendingDelegations,
    activeDelegations,
    currentAgentStatus,
  } = useAgentCommunications(agentId)

  const [selectedChannel, setSelectedChannel] = useState<string>('')
  const [newMessage, setNewMessage] = useState('')
  const [delegationForm, setDelegationForm] = useState({
    toAgent: '',
    task: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
  })

  const handleSendMessage = async () => {
    if (!selectedChannel || !newMessage.trim()) return

    try {
      await sendMessage(selectedChannel, newMessage, 'response')
      setNewMessage('')
    } catch (error) {
      console.error('Failed to send message:', error)
    }
  }

  const handleDelegateTask = async () => {
    if (!delegationForm.toAgent || !delegationForm.task.trim()) return

    try {
      await delegateTask(
        delegationForm.toAgent,
        delegationForm.task,
        delegationForm.priority
      )
      setDelegationForm({ toAgent: '', task: '', priority: 'medium' })
    } catch (error) {
      console.error('Failed to delegate task:', error)
    }
  }

  const handleRespondToDelegation = async (delegationId: string, response: 'accepted' | 'rejected') => {
    try {
      await respondToDelegation(delegationId, response)
    } catch (error) {
      console.error('Failed to respond to delegation:', error)
    }
  }

  if (loading) {
    return (
      <div className="p-6 bg-zinc-900 rounded-lg border border-zinc-800">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-zinc-800 rounded w-1/4"></div>
          <div className="h-4 bg-zinc-800 rounded w-1/2"></div>
          <div className="h-4 bg-zinc-800 rounded w-3/4"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
      {/* Agent Status */}
      <div className="bg-zinc-900 rounded-lg border border-zinc-800 p-4">
        <h3 className="text-lg font-semibold text-white mb-4">Agent Status</h3>
        {currentAgentStatus ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                currentAgentStatus.status === 'online' ? 'bg-green-500' :
                currentAgentStatus.status === 'busy' ? 'bg-yellow-500' : 'bg-red-500'
              }`} />
              <span className="text-zinc-300 capitalize">{currentAgentStatus.status}</span>
            </div>
            {currentAgentStatus.currentTask && (
              <p className="text-zinc-400 text-sm">Current: {currentAgentStatus.currentTask}</p>
            )}
            {currentAgentStatus.capabilities && (
              <div className="flex flex-wrap gap-1 mt-2">
                {currentAgentStatus.capabilities.map((cap, idx) => (
                  <span key={idx} className="px-2 py-1 bg-zinc-800 text-zinc-300 text-xs rounded">
                    {cap}
                  </span>
                ))}
              </div>
            )}
          </div>
        ) : (
          <p className="text-zinc-500">No status data</p>
        )}
      </div>

      {/* Delegations */}
      <div className="bg-zinc-900 rounded-lg border border-zinc-800 p-4">
        <h3 className="text-lg font-semibold text-white mb-4">Delegations</h3>
        
        {/* New Delegation Form */}
        <div className="mb-4 p-3 bg-zinc-800 rounded-lg">
          <h4 className="text-sm font-medium text-zinc-300 mb-2">Delegate Task</h4>
          <div className="space-y-2">
            <input
              type="text"
              placeholder="To Agent ID"
              value={delegationForm.toAgent}
              onChange={(e) => setDelegationForm(prev => ({ ...prev, toAgent: e.target.value }))}
              className="w-full px-2 py-1 bg-zinc-700 text-zinc-300 rounded text-sm"
            />
            <textarea
              placeholder="Task description"
              value={delegationForm.task}
              onChange={(e) => setDelegationForm(prev => ({ ...prev, task: e.target.value }))}
              className="w-full px-2 py-1 bg-zinc-700 text-zinc-300 rounded text-sm h-16 resize-none"
            />
            <select
              value={delegationForm.priority}
              onChange={(e) => setDelegationForm(prev => ({ 
                ...prev, 
                priority: e.target.value as 'low' | 'medium' | 'high' | 'urgent'
              }))}
              className="w-full px-2 py-1 bg-zinc-700 text-zinc-300 rounded text-sm"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
            <button
              onClick={handleDelegateTask}
              className="w-full px-3 py-1 bg-violet-600 hover:bg-violet-500 text-white rounded text-sm transition-colors"
            >
              Delegate Task
            </button>
          </div>
        </div>

        {/* Delegation List */}
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {pendingDelegations.length === 0 && activeDelegations.length === 0 ? (
            <p className="text-zinc-500 text-sm">No active delegations</p>
          ) : (
            [...pendingDelegations, ...activeDelegations].map((delegation) => (
              <div key={delegation._id} className="p-2 bg-zinc-800 rounded">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-zinc-300 text-sm font-medium">
                    From: {delegation.fromAgent}
                  </span>
                  <span className={`px-2 py-1 text-xs rounded ${
                    delegation.status === 'pending' ? 'bg-yellow-600 text-yellow-100' :
                    delegation.status === 'accepted' ? 'bg-green-600 text-green-100' :
                    'bg-gray-600 text-gray-100'
                  }`}>
                    {delegation.status}
                  </span>
                </div>
                <p className="text-zinc-400 text-sm mb-2">{delegation.task}</p>
                {delegation.status === 'pending' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleRespondToDelegation(delegation.delegationId, 'accepted')}
                      className="px-2 py-1 bg-green-600 hover:bg-green-500 text-white text-xs rounded transition-colors"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleRespondToDelegation(delegation.delegationId, 'rejected')}
                      className="px-2 py-1 bg-red-600 hover:bg-red-500 text-white text-xs rounded transition-colors"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Communications */}
      <div className="bg-zinc-900 rounded-lg border border-zinc-800 p-4">
        <h3 className="text-lg font-semibold text-white mb-4">Communications</h3>
        
        {/* Channel Selection */}
        <div className="mb-4">
          <select
            value={selectedChannel}
            onChange={(e) => setSelectedChannel(e.target.value)}
            className="w-full px-2 py-1 bg-zinc-700 text-zinc-300 rounded text-sm"
          >
            <option value="">Select Channel</option>
            {channels.map((channel) => (
              <option key={channel._id} value={channel._id}>
                {channel.channelName} ({channel.participants.join(', ')})
              </option>
            ))}
          </select>
        </div>

        {/* Messages */}
        {selectedChannel && messages[selectedChannel] && (
          <div className="mb-4 p-3 bg-zinc-800 rounded-lg max-h-48 overflow-y-auto">
            <div className="space-y-2">
              {messages[selectedChannel].map((message) => (
                <div key={message._id} className="text-sm">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-zinc-300 font-medium">{message.senderId}</span>
                    <span className="text-zinc-500 text-xs">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-zinc-400">{message.message}</p>
                  {message.metadata && (
                    <div className="mt-1 p-1 bg-zinc-700 rounded text-xs text-zinc-500">
                      {JSON.stringify(message.metadata, null, 2)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Message Input */}
        {selectedChannel && (
          <div className="space-y-2">
            <textarea
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="w-full px-2 py-1 bg-zinc-700 text-zinc-300 rounded text-sm h-16 resize-none"
            />
            <button
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              className="w-full px-3 py-1 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded text-sm transition-colors"
            >
              Send Message
            </button>
          </div>
        )}

        {!selectedChannel && (
          <p className="text-zinc-500 text-sm">Select a channel to start communicating</p>
        )}
      </div>
    </div>
  )
}
