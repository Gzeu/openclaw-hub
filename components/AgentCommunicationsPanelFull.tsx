'use client'

import { useState } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'

interface AgentCommunicationsPanelProps {
  agentId: string
}

interface Delegation {
  _id: string
  _creationTime: number
  delegationId: string
  fromAgent: string
  toAgent: string
  task: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'pending' | 'accepted' | 'completed' | 'failed' | 'rejected'
  createdAt: number
  updatedAt?: number
  response?: string
  responseMessage?: string
}

export default function AgentCommunicationsPanelFull({ agentId }: AgentCommunicationsPanelProps) {
  const [newDelegation, setNewDelegation] = useState({
    toAgent: '',
    task: '',
    priority: 'medium' as 'low' | 'medium' | 'high'
  })
  const [isCreating, setIsCreating] = useState(false)

  // Load delegations for this agent (both sent and received)
  const sentDelegations = useQuery(
    api.agentComms.getAgentDelegations,
    { agentId, status: undefined } // Get all statuses for sent delegations
  ) || []

  const receivedDelegations = useQuery(
    api.agentComms.getAgentDelegations,
    { agentId, status: 'pending' } // Only pending for received
  ) || []

  // Create delegation mutation
  const createDelegation = useMutation(api.agentComms.delegateTaskToAgent)

  // Respond to delegation mutation
  const respondToDelegation = useMutation(api.agentComms.respondToDelegation)

  const handleCreateDelegation = async () => {
    if (!newDelegation.toAgent || !newDelegation.task.trim()) return

    setIsCreating(true)
    try {
      await createDelegation({
        fromAgent: agentId,
        toAgent: newDelegation.toAgent,
        task: newDelegation.task.trim(),
        priority: newDelegation.priority,
        context: { source: 'communications_panel' }
      })
      
      // Reset form
      setNewDelegation({
        toAgent: '',
        task: '',
        priority: 'medium'
      })
    } catch (error) {
      console.error('Failed to create delegation:', error)
    } finally {
      setIsCreating(false)
    }
  }

  const handleRespondToDelegation = async (
    delegationId: string,
    response: 'accepted' | 'rejected',
    responseMessage?: string
  ) => {
    try {
      await respondToDelegation({
        delegationId,
        response,
        responseMessage
      })
    } catch (error) {
      console.error('Failed to respond to delegation:', error)
    }
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString()
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-purple-400 bg-purple-400/20 border-purple-400/30'
      case 'high': return 'text-red-400 bg-red-400/20 border-red-400/30'
      case 'medium': return 'text-yellow-400 bg-yellow-400/20 border-yellow-400/30'
      case 'low': return 'text-green-400 bg-green-400/20 border-green-400/30'
      default: return 'text-zinc-400 bg-zinc-400/20 border-zinc-400/30'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-amber-400 bg-amber-400/20 border-amber-400/30'
      case 'accepted': return 'text-blue-400 bg-blue-400/20 border-blue-400/30'
      case 'completed': return 'text-emerald-400 bg-emerald-400/20 border-emerald-400/30'
      case 'failed': return 'text-red-400 bg-red-400/20 border-red-400/30'
      case 'rejected': return 'text-zinc-400 bg-zinc-400/20 border-zinc-400/30'
      default: return 'text-zinc-400 bg-zinc-400/20 border-zinc-400/30'
    }
  }

  const isLoading = !sentDelegations && !receivedDelegations

  return (
    <div className="p-6 space-y-6 h-full flex flex-col">
      {/* Header */}
      <div className="bg-zinc-900 rounded-lg border border-zinc-800 p-4">
        <h3 className="text-lg font-semibold text-white mb-2">Agent Communications</h3>
        <div className="flex items-center gap-2 text-sm">
          <div className="w-2 h-2 rounded-full bg-green-500"></div>
          <span className="text-zinc-300">Agent ID:</span>
          <span className="text-zinc-100 font-mono text-xs">{agentId}</span>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="bg-zinc-900 rounded-lg border border-zinc-800 p-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-zinc-400 text-sm">Loading communications...</span>
          </div>
        </div>
      )}

      {/* Create New Delegation */}
      <div className="bg-zinc-900 rounded-lg border border-zinc-800 p-4">
        <h4 className="text-md font-semibold text-white mb-3">Create New Delegation</h4>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">Target Agent</label>
            <input
              type="text"
              value={newDelegation.toAgent}
              onChange={(e) => setNewDelegation(prev => ({ ...prev, toAgent: e.target.value }))}
              placeholder="agent:default:target"
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">Task Description</label>
            <textarea
              value={newDelegation.task}
              onChange={(e) => setNewDelegation(prev => ({ ...prev, task: e.target.value }))}
              placeholder="Describe the task to delegate..."
              rows={3}
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500 resize-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">Priority</label>
            <select
              value={newDelegation.priority}
              onChange={(e) => setNewDelegation(prev => ({ ...prev, priority: e.target.value as any }))}
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-white focus:outline-none focus:border-violet-500"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <button
            onClick={handleCreateDelegation}
            disabled={!newDelegation.toAgent || !newDelegation.task.trim() || isCreating}
            className="w-full px-4 py-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
          >
            {isCreating ? 'Creating...' : 'Delegate Task'}
          </button>
        </div>
      </div>

      {/* Delegations Lists */}
      <div className="flex-1 space-y-6 overflow-y-auto">
        {/* Sent Delegations */}
        <div className="bg-zinc-900 rounded-lg border border-zinc-800 p-4">
          <h4 className="text-md font-semibold text-white mb-3">Sent Delegations ({sentDelegations.length})</h4>
          <div className="space-y-2">
            {sentDelegations.length === 0 ? (
              <p className="text-zinc-500 text-sm italic">No delegations sent</p>
            ) : (
              sentDelegations.map((delegation: Delegation) => (
                <div key={delegation._id} className="bg-zinc-800 rounded-lg p-3 border border-zinc-700">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <p className="text-white text-sm font-medium mb-1">{delegation.task}</p>
                      <div className="flex items-center gap-2 text-xs">
                        <span>To: <span className="text-zinc-300 font-mono">{delegation.toAgent}</span></span>
                        <span className={`px-2 py-0.5 rounded border ${getPriorityColor(delegation.priority)}`}>
                          {delegation.priority}
                        </span>
                        <span className={`px-2 py-0.5 rounded border ${getStatusColor(delegation.status)}`}>
                          {delegation.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-zinc-500 text-xs">{formatDate(delegation.createdAt)}</p>
                  {delegation.responseMessage && (
                    <div className="mt-2 p-2 bg-zinc-700 rounded text-xs text-zinc-300">
                      <strong>Response:</strong> {delegation.responseMessage}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Received Delegations (Pending) */}
        <div className="bg-zinc-900 rounded-lg border border-zinc-800 p-4">
          <h4 className="text-md font-semibold text-white mb-3">Pending Delegations ({receivedDelegations.length})</h4>
          <div className="space-y-2">
            {receivedDelegations.length === 0 ? (
              <p className="text-zinc-500 text-sm italic">No pending delegations</p>
            ) : (
              receivedDelegations.map((delegation: Delegation) => (
                <div key={delegation._id} className="bg-zinc-800 rounded-lg p-3 border border-zinc-700">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <p className="text-white text-sm font-medium mb-1">{delegation.task}</p>
                      <div className="flex items-center gap-2 text-xs">
                        <span>From: <span className="text-zinc-300 font-mono">{delegation.fromAgent}</span></span>
                        <span className={`px-2 py-0.5 rounded border ${getPriorityColor(delegation.priority)}`}>
                          {delegation.priority}
                        </span>
                        <span className={`px-2 py-0.5 rounded border ${getStatusColor(delegation.status)}`}>
                          {delegation.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-zinc-500 text-xs mb-3">{formatDate(delegation.createdAt)}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleRespondToDelegation(delegation.delegationId, 'accepted', 'Task accepted')}
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium rounded transition-colors"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleRespondToDelegation(delegation.delegationId, 'rejected', 'Task rejected')}
                      className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white text-xs font-medium rounded transition-colors"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
