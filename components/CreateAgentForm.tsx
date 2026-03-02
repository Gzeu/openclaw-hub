'use client'

import { useState } from 'react'
import { api } from '@/lib/api-client'

interface CreateAgentFormProps {
  onSuccess?: (agentId: string, sessionKey: string) => void
  onCancel?: () => void
}

const AVAILABLE_SKILLS = [
  'chat',
  'web',
  'data-analysis', 
  'code-execute',
  'scrape-url',
  'web-search',
  'news-search',
  'memory-store',
  'memory-search',
  'weather',
  'wiki-search',
  'mvx-balance',
  'mvx-txns',
  'price-feed',
  'session-manager',
  'cleanup',
  'health-check'
]

const LITEROUTER_MODELS = [
  { id: 'aurora-alpha-free-full-context', name: 'Aurora Alpha Full Context' },
  { id: 'ernie-4-5-21b-a3b-thinking-free', name: 'Ernie 4.5 Thinking' },
  { id: 'gemini-free', name: 'Gemini' },
  { id: 'gemma-3-27b-it-free', name: 'Gemma 3 27B' },
  { id: 'kat-coder-pro-free', name: 'Kat Coder Pro' },
  { id: 'llama-3-1-8b-instruct-turbo-free', name: 'Llama 3.1 8B Turbo' },
  { id: 'qwen3-32b-free', name: 'Qwen3 32B' },
  { id: 'qwen2.5-7b-instruct-free', name: 'Qwen2.5 7B' }
]

export default function CreateAgentForm({ onSuccess, onCancel }: CreateAgentFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    skills: [] as string[],
    model: 'llama-3-1-8b-instruct-turbo-free',
    description: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/agents/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth-token')}`
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create agent')
      }

      onSuccess?.(data.agentId, data.sessionKey)
      
      // Reset form
      setFormData({
        name: '',
        skills: [],
        model: 'llama-3-1-8b-instruct-turbo-free',
        description: ''
      })
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const toggleSkill = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }))
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 max-w-md w-full">
      <h3 className="text-lg font-semibold text-white mb-4">Create New Agent</h3>
      
      {error && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Agent Name */}
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1">
            Agent Name *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="e.g. crypto-trader"
            required
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500"
          />
        </div>

        {/* Skills Multi-select */}
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1">
            Skills *
          </label>
          <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto p-2 bg-zinc-800 border border-zinc-700 rounded-lg">
            {AVAILABLE_SKILLS.map(skill => (
              <label key={skill} className="flex items-center space-x-2 cursor-pointer hover:bg-zinc-700 p-1 rounded">
                <input
                  type="checkbox"
                  checked={formData.skills.includes(skill)}
                  onChange={() => toggleSkill(skill)}
                  className="rounded border-zinc-600 bg-zinc-700 text-violet-500 focus:ring-violet-500"
                />
                <span className="text-xs text-zinc-300">{skill}</span>
              </label>
            ))}
          </div>
          {formData.skills.length === 0 && (
            <p className="text-xs text-amber-400 mt-1">Select at least one skill</p>
          )}
        </div>

        {/* Model Dropdown */}
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1">
            Preferred Model *
          </label>
          <select
            value={formData.model}
            onChange={(e) => setFormData(prev => ({ ...prev, model: e.target.value }))}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-violet-500"
          >
            {LITEROUTER_MODELS.map(model => (
              <option key={model.id} value={model.id}>
                {model.name}
              </option>
            ))}
          </select>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Optional description of your agent..."
            rows={3}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500 resize-none"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !formData.name || formData.skills.length === 0}
            className="flex-1 px-4 py-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
          >
            {loading ? 'Creating...' : 'Create Agent'}
          </button>
        </div>
      </form>
    </div>
  )
}
