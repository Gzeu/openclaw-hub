'use client'

import { useState, useEffect } from 'react'
import type { AgentProfile, AgentSearchParams, ProtocolName } from '@/lib/agent-profiles'

const PROTOCOL_COLORS = {
  'MCP': '#10b981',
  'A2A': '#3b82f6', 
  'OASF': '#8b5cf6',
  'Web': '#f59e0b',
  'API': '#ef4444'
}

export default function AgentRegistryPage() {
  const [agents, setAgents] = useState<AgentProfile[]>([])
  const [loading, setLoading] = useState(false)
  const [searchParams, setSearchParams] = useState<AgentSearchParams>({
    sortBy: 'total_score',
    sortOrder: 'desc',
    isActive: true
  })
  const [selectedAgent, setSelectedAgent] = useState<AgentProfile | null>(null)
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    fetchAgents()
  }, [searchParams])

  async function fetchAgents() {
    setLoading(true)
    try {
      // Mock data for now - replace with actual API call
      const mockAgents: AgentProfile[] = [
        {
          id: '1',
          name: 'Twilight Nexus',
          description: 'Born from the cold, rhythmic pulse of the February evening broadcast, Twilight Nexus views the universe as a series of closing credits.',
          image_url: 'https://api.celonova.xyz/images/image-103.webp',
          owner_id: 'd3b531b0-718c-4f33-ad5b-71584fb750bc',
          owner_address: '0xfb2ff4eb9eb00a9b019e4014bbc67c5c3adfa2c5',
          creator_address: '0xfb2ff4eb9eb00a9b019e4014bbc67c5c3adfa2c5',
          agent_id: '42220:0x8004a169fb4a3325136eb29fa0ceb6d2e539a432:713',
          token_id: '713',
          chain_id: 42220,
          chain_type: 'evm',
          is_testnet: false,
          contract_address: '0x8004a169fb4a3325136eb29fa0ceb6d2e539a432',
          agent_wallet: '0xfb2ff4eb9eb00a9b019e4014bbc67c5c3adfa2c5',
          categories: ['geopolitics', 'news-analysis'],
          tags: ['news-born', 'celonova', 'geopolitics', 'ai-agent', 'celo', 'autonomous'],
          capabilities: ['analytical_skills/geopolitical_analysis', 'information_skills/news_synthesis'],
          supported_protocols: [
            { name: 'MCP' },
            { name: 'A2A' },
            { name: 'OASF' },
            { name: 'Web' }
          ],
          supported_trust_models: ['reputation'],
          x402_supported: false,
          services: {
            mcp: {
              name: 'mcp',
              endpoint: 'https://api.celonova.xyz/mcp',
              version: '2025-03-26',
              tools: [],
              prompts: [],
              resources: []
            },
            a2a: {
              name: 'a2a',
              endpoint: 'https://api.celonova.xyz/.well-known/agent-card.json',
              version: '0.3.0',
              skills: []
            },
            oasf: {
              name: 'OASF',
              endpoint: 'https://github.com/agntcy/oasf/',
              version: '0.8.0',
              skills: ['analytical_skills/geopolitical_analysis', 'information_skills/news_synthesis'],
              domains: ['geopolitics/international_relations', 'finance/global_economics']
            },
            web: {
              name: 'web',
              endpoint: 'https://celonova.xyz/agent/645'
            }
          },
          registrations: [],
          endpoints: [],
          is_verified: false,
          is_active: true,
          star_count: 0,
          watch_count: 0,
          total_score: 85.5,
          total_feedbacks: 0,
          total_validations: 0,
          successful_validations: 0,
          average_score: 0,
          health_status: 'healthy',
          health_score: 95,
          health_checked_at: new Date().toISOString(),
          is_endpoint_verified: false,
          quality_score: 88,
          popularity_score: 76,
          activity_score: 92,
          wallet_score: 85,
          freshness_score: 90,
          metadata_completeness_score: 95,
          parse_status: {
            status: 'success',
            info: [],
            errors: [],
            warnings: [],
            llm_attempted: false,
            last_parsed_at: new Date().toISOString()
          },
          raw_metadata: {
            onchain: []
          },
          field_sources: {},
          did: 'did:web:api.celonova.xyz:agents:645',
          created_at: '2026-03-02T10:19:51Z',
          updated_at: '2026-03-02T10:21:59.661017Z',
          created_block_number: 60546033,
          created_tx_hash: '0x0d95f0e20f0d5ced7e6b0376fd9c75b935995108295ada5c858fe180e3869006'
        }
      ]
      
      // Filter agents based on search params
      let filteredAgents = mockAgents.filter(agent => {
        if (searchParams.isActive !== undefined && agent.is_active !== searchParams.isActive) return false
        if (searchParams.isVerified !== undefined && agent.is_verified !== searchParams.isVerified) return false
        if (searchParams.minScore && agent.total_score < searchParams.minScore) return false
        if (searchParams.protocol && !agent.supported_protocols.some(p => p.name === searchParams.protocol)) return false
        if (searchParams.search) {
          const searchLower = searchParams.search.toLowerCase()
          return agent.name.toLowerCase().includes(searchLower) ||
                 agent.description?.toLowerCase().includes(searchLower) ||
                 agent.tags.some(tag => tag.toLowerCase().includes(searchLower))
        }
        return true
      })

      // Sort agents
      filteredAgents.sort((a, b) => {
        let comparison = 0
        switch (searchParams.sortBy) {
          case 'total_score':
            comparison = a.total_score - b.total_score
            break
          case 'created_at':
            comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
            break
          case 'name':
            comparison = a.name.localeCompare(b.name)
            break
          case 'stars':
            comparison = a.star_count - b.star_count
            break
          default:
            comparison = 0
        }
        return searchParams.sortOrder === 'asc' ? comparison : -comparison
      })

      setAgents(filteredAgents)
    } catch (error) {
      console.error('Failed to fetch agents:', error)
    } finally {
      setLoading(false)
    }
  }

  const totalAgents = agents.length
  const activeAgents = agents.filter(a => a.is_active).length
  const verifiedAgents = agents.filter(a => a.is_verified).length

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            🤖 Agent Registry
          </h1>
          <p className="text-gray-400 text-sm">
            Discover and explore AI agents registered on OpenClaw Hub. Inspired by ERC-8004 standard.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-[#111] border border-[#1e1e1e] rounded-xl p-4">
            <div className="text-2xl mb-2">📊</div>
            <div className="text-2xl font-bold text-white">{totalAgents}</div>
            <div className="text-xs text-gray-500">Total Agents</div>
          </div>
          <div className="bg-[#111] border border-[#1e1e1e] rounded-xl p-4">
            <div className="text-2xl mb-2">✅</div>
            <div className="text-2xl font-bold text-[#23F7DD]">{activeAgents}</div>
            <div className="text-xs text-gray-500">Active</div>
          </div>
          <div className="bg-[#111] border border-[#1e1e1e] rounded-xl p-4">
            <div className="text-2xl mb-2">⭐</div>
            <div className="text-2xl font-bold text-yellow-400">{verifiedAgents}</div>
            <div className="text-xs text-gray-500">Verified</div>
          </div>
          <div className="bg-[#111] border border-[#1e1e1e] rounded-xl p-4">
            <div className="text-2xl mb-2">🔗</div>
            <div className="text-2xl font-bold text-[#8b5cf6]">
              {agents.reduce((sum, agent) => sum + agent.supported_protocols.length, 0)}
            </div>
            <div className="text-xs text-gray-500">Protocols</div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-[#111] border border-[#1e1e1e] rounded-xl p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search agents by name, description, or capabilities..."
                value={searchParams.search || ''}
                onChange={(e) => setSearchParams(prev => ({ ...prev, search: e.target.value }))}
                className="w-full bg-[#0d0d0d] border border-[#2a2a2a] rounded-lg px-4 py-2 text-sm text-white placeholder-gray-500"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={searchParams.sortBy || 'total_score'}
                onChange={(e) => setSearchParams(prev => ({ ...prev, sortBy: e.target.value as any }))}
                className="bg-[#0d0d0d] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-white"
              >
                <option value="total_score">Score</option>
                <option value="created_at">Created</option>
                <option value="name">Name</option>
                <option value="stars">Stars</option>
              </select>
              <select
                value={searchParams.sortOrder || 'desc'}
                onChange={(e) => setSearchParams(prev => ({ ...prev, sortOrder: e.target.value as any }))}
                className="bg-[#0d0d0d] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-white"
              >
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
              </select>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-4 py-2 bg-[#333] text-gray-300 rounded-lg text-sm hover:bg-[#444] transition-colors"
              >
                {showFilters ? 'Hide' : 'Show'} Filters
              </button>
            </div>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-[#2a2a2a]">
              <div>
                <label className="text-xs text-gray-500 block mb-1">Protocol</label>
                <select
                  value={searchParams.protocol || ''}
                  onChange={(e) => setSearchParams(prev => ({ ...prev, protocol: e.target.value }))}
                  className="w-full bg-[#0d0d0d] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-white"
                >
                  <option value="">All Protocols</option>
                  <option value="MCP">MCP</option>
                  <option value="A2A">A2A</option>
                  <option value="OASF">OASF</option>
                  <option value="Web">Web</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Status</label>
                <select
                  value={searchParams.isActive === undefined ? '' : searchParams.isActive.toString()}
                  onChange={(e) => setSearchParams(prev => ({ 
                    ...prev, 
                    isActive: e.target.value === '' ? undefined : e.target.value === 'true' 
                  }))}
                  className="w-full bg-[#0d0d0d] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-white"
                >
                  <option value="">All</option>
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Verified</label>
                <select
                  value={searchParams.isVerified === undefined ? '' : searchParams.isVerified.toString()}
                  onChange={(e) => setSearchParams(prev => ({ 
                    ...prev, 
                    isVerified: e.target.value === '' ? undefined : e.target.value === 'true' 
                  }))}
                  className="w-full bg-[#0d0d0d] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-white"
                >
                  <option value="">All</option>
                  <option value="true">Verified</option>
                  <option value="false">Not Verified</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Min Score</label>
                <input
                  type="number"
                  value={searchParams.minScore || ''}
                  onChange={(e) => setSearchParams(prev => ({ ...prev, minScore: parseFloat(e.target.value) || undefined }))}
                  className="w-full bg-[#0d0d0d] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-white"
                  min="0"
                  max="100"
                  step="0.1"
                />
              </div>
            </div>
          )}
        </div>

        {/* Agents Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="text-gray-500">Loading agents...</div>
          </div>
        ) : agents.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500">No agents found matching your criteria</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {agents.map((agent) => (
              <div
                key={agent.id}
                onClick={() => setSelectedAgent(agent)}
                className="bg-[#111] border border-[#1e1e1e] rounded-xl p-6 hover:border-[#2a2a2a] transition-colors cursor-pointer"
              >
                {/* Agent Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-[#23F7DD] rounded-full flex items-center justify-center text-black font-bold">
                      {agent.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{agent.name}</h3>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        {agent.is_verified && <span className="text-blue-400">✓ Verified</span>}
                        {agent.is_active && <span className="text-green-400">● Active</span>}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-[#23F7DD]">{agent.total_score.toFixed(1)}</div>
                    <div className="text-xs text-gray-500">Score</div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm text-gray-400 mb-4 line-clamp-3">
                  {agent.description || 'No description available'}
                </p>

                {/* Protocols */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {agent.supported_protocols.map((protocol) => (
                    <span
                      key={protocol.name}
                      className="px-2 py-1 rounded-full text-xs font-medium"
                      style={{ 
                        backgroundColor: `${PROTOCOL_COLORS[protocol.name as keyof typeof PROTOCOL_COLORS] || '#666'}20`,
                        color: PROTOCOL_COLORS[protocol.name as keyof typeof PROTOCOL_COLORS] || '#666'
                      }}
                    >
                      {protocol.name}
                    </span>
                  ))}
                </div>

                {/* Tags */}
                {agent.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {agent.tags.slice(0, 3).map((tag) => (
                      <span key={tag} className="px-2 py-1 bg-[#2a2a2a] rounded text-xs text-gray-400">
                        #{tag}
                      </span>
                    ))}
                    {agent.tags.length > 3 && (
                      <span className="px-2 py-1 bg-[#2a2a2a] rounded text-xs text-gray-500">
                        +{agent.tags.length - 3}
                      </span>
                    )}
                  </div>
                )}

                {/* Footer Stats */}
                <div className="flex items-center justify-between text-xs text-gray-500 pt-4 border-t border-[#2a2a2a]">
                  <div className="flex items-center gap-4">
                    <span>⭐ {agent.star_count}</span>
                    <span>💬 {agent.total_feedbacks}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className={`w-2 h-2 rounded-full ${
                      agent.health_status === 'healthy' ? 'bg-green-500' :
                      agent.health_status === 'degraded' ? 'bg-yellow-500' :
                      agent.health_status === 'unhealthy' ? 'bg-red-500' :
                      'bg-gray-500'
                    }`}></div>
                    <span>{agent.chain_id}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Agent Detail Modal */}
        {selectedAgent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-6 z-50">
            <div className="bg-[#111] border border-[#1e1e1e] rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">{selectedAgent.name}</h2>
                  <button
                    onClick={() => setSelectedAgent(null)}
                    className="text-gray-400 hover:text-white text-2xl"
                  >
                    ×
                  </button>
                </div>

                {/* Agent Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-white mb-3">Agent Information</h3>
                    <div className="space-y-2 text-sm">
                      <div><span className="text-gray-500">ID:</span> <span className="text-white">{selectedAgent.agent_id}</span></div>
                      <div><span className="text-gray-500">Owner:</span> <span className="text-white">{selectedAgent.owner_address}</span></div>
                      <div><span className="text-gray-500">Chain:</span> <span className="text-white">{selectedAgent.chain_id}</span></div>
                      <div><span className="text-gray-500">Token ID:</span> <span className="text-white">{selectedAgent.token_id}</span></div>
                      <div><span className="text-gray-500">Created:</span> <span className="text-white">{new Date(selectedAgent.created_at).toLocaleDateString()}</span></div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-white mb-3">Performance Metrics</h3>
                    <div className="space-y-2 text-sm">
                      <div><span className="text-gray-500">Total Score:</span> <span className="text-[#23F7DD] font-bold">{selectedAgent.total_score.toFixed(2)}</span></div>
                      <div><span className="text-gray-500">Stars:</span> <span className="text-yellow-400">{selectedAgent.star_count}</span></div>
                      <div><span className="text-gray-500">Feedbacks:</span> <span className="text-white">{selectedAgent.total_feedbacks}</span></div>
                      <div><span className="text-gray-500">Validations:</span> <span className="text-white">{selectedAgent.successful_validations}/{selectedAgent.total_validations}</span></div>
                      <div><span className="text-gray-500">Average Score:</span> <span className="text-white">{selectedAgent.average_score.toFixed(2)}</span></div>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="mt-6">
                  <h3 className="font-semibold text-white mb-3">Description</h3>
                  <p className="text-sm text-gray-400">{selectedAgent.description || 'No description available'}</p>
                </div>

                {/* Services */}
                <div className="mt-6">
                  <h3 className="font-semibold text-white mb-3">Services & Protocols</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {Object.entries(selectedAgent.services).map(([key, service]) => (
                      service && (
                        <div key={key} className="bg-[#0d0d0d] rounded-lg p-3">
                          <div className="font-medium text-white text-sm mb-1">{key.toUpperCase()}</div>
                          <div className="text-xs text-gray-500">{service.version || 'N/A'}</div>
                          {service.endpoint && (
                            <div className="text-xs text-[#23F7DD] truncate mt-1">{service.endpoint}</div>
                          )}
                        </div>
                      )
                    ))}
                  </div>
                </div>

                {/* Tags and Categories */}
                <div className="mt-6">
                  <h3 className="font-semibold text-white mb-3">Tags & Categories</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedAgent.categories.map((cat) => (
                      <span key={cat} className="px-3 py-1 bg-[#23F7DD] bg-opacity-20 text-[#23F7DD] rounded-full text-sm">
                        {cat}
                      </span>
                    ))}
                    {selectedAgent.tags.map((tag) => (
                      <span key={tag} className="px-3 py-1 bg-[#2a2a2a] rounded-full text-sm text-gray-400">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
