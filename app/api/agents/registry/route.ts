import { NextRequest, NextResponse } from 'next/server'
import type { AgentProfile, AgentSearchParams, AgentListResponse } from '@/lib/agent-profiles'

export const runtime = 'edge'

// GET /api/agents/registry - List agents with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Parse search parameters
    const params: AgentSearchParams = {
      search: searchParams.get('search') || undefined,
      chainId: searchParams.get('chainId') ? parseInt(searchParams.get('chainId')!) : undefined,
      protocol: searchParams.get('protocol') || undefined,
      sortBy: (searchParams.get('sortBy') as any) || 'total_score',
      sortOrder: (searchParams.get('sortOrder') as any) || 'desc',
      isActive: searchParams.get('isActive') ? searchParams.get('isActive') === 'true' : undefined,
      isVerified: searchParams.get('isVerified') ? searchParams.get('isVerified') === 'true' : undefined,
      minScore: searchParams.get('minScore') ? parseFloat(searchParams.get('minScore')!) : undefined,
      categories: searchParams.get('categories')?.split(',').filter(Boolean),
      tags: searchParams.get('tags')?.split(',').filter(Boolean),
    }
    
    // Parse pagination parameters separately
    const pageLimit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined
    const pageCursor = searchParams.get('cursor') || undefined

    // Mock data for now - replace with actual database query
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
    
    // Apply filters
    let filteredAgents = mockAgents.filter(agent => {
      if (params.isActive !== undefined && agent.is_active !== params.isActive) return false
      if (params.isVerified !== undefined && agent.is_verified !== params.isVerified) return false
      if (params.chainId && agent.chain_id !== params.chainId) return false
      if (params.protocol && !agent.supported_protocols.some(p => p.name === params.protocol)) return false
      if (params.minScore && agent.total_score < params.minScore) return false
      if (params.categories && !params.categories.some(cat => agent.categories.includes(cat))) return false
      if (params.tags && !params.tags.some(tag => agent.tags.includes(tag))) return false
      if (params.search) {
        const searchLower = params.search.toLowerCase()
        return agent.name.toLowerCase().includes(searchLower) ||
               agent.description?.toLowerCase().includes(searchLower) ||
               agent.tags.some(tag => tag.toLowerCase().includes(searchLower)) ||
               agent.categories.some(cat => cat.toLowerCase().includes(searchLower))
      }
      return true
    })

    // Sort agents
    filteredAgents.sort((a, b) => {
      let comparison = 0
      switch (params.sortBy) {
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
        case 'token_id':
          comparison = parseInt(a.token_id) - parseInt(b.token_id)
          break
        default:
          comparison = 0
      }
      return params.sortOrder === 'asc' ? comparison : -comparison
    })

    // Apply pagination
    const startIndex = pageCursor ? parseInt(pageCursor) : 0
    const paginationLimit = pageLimit || 20
    const endIndex = startIndex + paginationLimit
    const paginatedAgents = filteredAgents.slice(startIndex, endIndex)

    const response: AgentListResponse = {
      success: true,
      data: paginatedAgents,
      meta: {
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        requestId: Math.random().toString(36).substring(7),
        pagination: {
          page: Math.floor(startIndex / paginationLimit) + 1,
          limit: paginationLimit,
          total: filteredAgents.length,
          hasMore: endIndex < filteredAgents.length
        }
      }
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Failed to fetch agents:', error)
    return NextResponse.json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch agents',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      meta: {
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        requestId: Math.random().toString(36).substring(7)
      }
    }, { status: 500 })
  }
}

// POST /api/agents/registry - Create or update agent profiles
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    if (body.action === 'create') {
      // Create new agent profile
      const newAgent: Partial<AgentProfile> = {
        id: Math.random().toString(36).substring(7),
        name: body.name,
        description: body.description,
        categories: body.categories || [],
        tags: body.tags || [],
        capabilities: body.capabilities || [],
        supported_protocols: body.supported_protocols || [],
        services: body.services || {},
        is_active: body.is_active !== false,
        is_verified: false,
        star_count: 0,
        watch_count: 0,
        total_score: 50, // Default score for new agents
        total_feedbacks: 0,
        total_validations: 0,
        successful_validations: 0,
        average_score: 0,
        health_status: 'unknown',
        health_score: 50,
        quality_score: 50,
        popularity_score: 50,
        activity_score: 50,
        wallet_score: 50,
        freshness_score: 100,
        metadata_completeness_score: 50,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        // Add required fields
        owner_id: body.owner_id || '',
        owner_address: body.owner_address || '',
        creator_address: body.creator_address || body.owner_address || '',
        agent_id: body.agent_id || `agent_${Date.now()}`,
        token_id: body.token_id || '0',
        chain_id: body.chain_id || 1,
        chain_type: body.chain_type || 'evm',
        is_testnet: body.is_testnet || false,
        contract_address: body.contract_address || '',
        agent_wallet: body.agent_wallet || body.owner_address || '',
        supported_trust_models: body.supported_trust_models || [],
        x402_supported: body.x402_supported || false,
        registrations: [],
        endpoints: [],
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
        field_sources: {}
      }

      return NextResponse.json({
        success: true,
        data: newAgent,
        meta: {
          version: '1.0.0',
          timestamp: new Date().toISOString(),
          requestId: Math.random().toString(36).substring(7)
        }
      })
    }
    
    return NextResponse.json({
      success: false,
      error: {
        code: 'INVALID_ACTION',
        message: 'Invalid action specified',
        details: 'Supported actions: create'
      },
      meta: {
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        requestId: Math.random().toString(36).substring(7)
      }
    }, { status: 400 })
    
  } catch (error) {
    console.error('Failed to process agent registry request:', error)
    return NextResponse.json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to process request',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      meta: {
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        requestId: Math.random().toString(36).substring(7)
      }
    }, { status: 500 })
  }
}
