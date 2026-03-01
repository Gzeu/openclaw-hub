'use client'

import { useState } from 'react'

interface AgentCommunicationsPanelProps {
  agentId: string
}

export default function AgentCommunicationsPanel({ agentId }: AgentCommunicationsPanelProps) {
  const [loading, setLoading] = useState(false)

  return (
    <div className="p-6 space-y-6">
      <div className="bg-zinc-900 rounded-lg border border-zinc-800 p-4">
        <h3 className="text-lg font-semibold text-white mb-4">Agent Communications</h3>
        
        <div className="space-y-4">
          <div className="p-3 bg-zinc-800 rounded-lg">
            <p className="text-zinc-300 text-sm mb-2">Agent ID:</p>
            <p className="text-zinc-100 font-mono text-xs">{agentId}</p>
          </div>

          <div className="p-3 bg-zinc-800 rounded-lg">
            <p className="text-zinc-300 text-sm mb-2">Status:</p>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span className="text-zinc-100 text-sm">Online</span>
            </div>
          </div>

          <div className="p-3 bg-zinc-800 rounded-lg">
            <p className="text-zinc-300 text-sm mb-2">Capabilities:</p>
            <div className="flex flex-wrap gap-1">
              <span className="px-2 py-1 bg-zinc-700 text-zinc-300 text-xs rounded">Chat</span>
              <span className="px-2 py-1 bg-zinc-700 text-zinc-300 text-xs rounded">Delegation</span>
              <span className="px-2 py-1 bg-zinc-700 text-zinc-300 text-xs rounded">Tools</span>
            </div>
          </div>

          <div className="p-3 bg-zinc-800 rounded-lg">
            <p className="text-zinc-300 text-sm mb-2">Quick Actions:</p>
            <div className="space-y-2">
              <button 
                className="w-full px-3 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded text-sm transition-colors"
                onClick={() => alert('Delegation feature coming soon!')}
              >
                🔄 Delegate Task
              </button>
              <button 
                className="w-full px-3 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded text-sm transition-colors"
                onClick={() => alert('Channel creation coming soon!')}
              >
                💬 Create Channel
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-zinc-900 rounded-lg border border-zinc-800 p-4">
        <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
        <div className="space-y-2">
          <div className="p-2 bg-zinc-800 rounded text-sm text-zinc-400">
            No recent activity
          </div>
        </div>
      </div>
    </div>
  )
}
