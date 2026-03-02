import { NextRequest, NextResponse } from 'next/server'
import { sendToAgent } from '@/lib/openclaw-gateway'
import { ConvexHttpClient } from 'convex/browser'
import { api } from '@/convex/_generated/api'

export const runtime = 'nodejs'
export const maxDuration = 120

export async function POST(req: NextRequest) {
  try {
    const { sessionKey, text } = await req.json()

    if (!sessionKey || !text) {
      return new Response(JSON.stringify({ error: 'sessionKey and text required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Get user from token first
    const token = req.headers.get('authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return new Response(JSON.stringify({ error: 'No authentication token provided' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Check if user is authenticated
    const userResponse = await fetch(`http://localhost:3000/api/auth/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })

    if (!userResponse.ok) {
      return new Response(JSON.stringify({ error: 'Unauthorized - Invalid token' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const userData = await userResponse.json()
    
    if (!userData.user) {
      return new Response(JSON.stringify({ error: 'User not found' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Check if this is a custom agent from Convex
    const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!)
    const agents = await convex.query(api.agents.getActiveAgents)
    const customAgent = agents.find(a => a.sessionKey === sessionKey || a._id.toString() === sessionKey)

    if (customAgent) {
      // Handle custom agent with Literouter model
      return await handleCustomAgent(customAgent, text, req, token)
    } else {
      // Handle OpenClaw Gateway agent
      const stream = await sendToAgent(sessionKey, text)
      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      })
    }
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

async function handleCustomAgent(agent: any, text: string, req: NextRequest, token: string) {
  try {
    // Check if agent has preferred model
    if (!agent.preferredModel) {
      return NextResponse.json(
        { error: 'Agent has no preferred model configured' },
        { status: 400 }
      )
    }

    // Get available skills for this agent
    const agentSkills = agent.capabilities || []
    
    // Create system prompt based on agent skills
    const skillDescriptions = {
      'chat': 'general conversation and Q&A',
      'web': 'web browsing and information retrieval',
      'data-analysis': 'data processing and analysis',
      'code-execute': 'code execution and programming tasks',
      'scrape-url': 'web scraping and content extraction',
      'web-search': 'web search and information gathering',
      'news-search': 'news article search and summarization',
      'memory-store': 'storing and retrieving information',
      'memory-search': 'searching stored memories',
      'weather': 'weather information and forecasts',
      'wiki-search': 'Wikipedia article search',
      'mvx-balance': 'MultiversX balance queries',
      'mvx-txns': 'MultiversX transaction history',
      'price-feed': 'cryptocurrency price information',
      'session-manager': 'session management and coordination',
      'cleanup': 'cleanup and maintenance tasks',
      'health-check': 'system health monitoring'
    }

    const availableSkills = agentSkills.map((skill: string) => 
      `- ${skill}: ${(skillDescriptions as any)[skill] || 'custom capability'}`
    ).join('\n')

    const systemPrompt = `You are ${agent.name}, an AI agent integrated with OpenClaw Hub.

Your capabilities:
${availableSkills}

Model: ${agent.preferredModel}
Description: ${agent.description}

You should respond to user requests using your available capabilities. If a request requires skills you don't have, explain what you can do instead.

Current user request: ${text}`

    // Call Literouter API with agent's preferred model
    const LITEROUTER_API_KEY = process.env.LITEROUTER_API_KEY || '57d9af92d7e95ebb9e93facc1ac54a059a38990d1607c1d4c584de10363ca7ec'
    const LITEROUTER_API_URL = 'https://api.literouter.com/v1/chat/completions'

    const response = await fetch(LITEROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LITEROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': `OpenClaw Agent - ${agent.name}`
      },
      body: JSON.stringify({
        model: agent.preferredModel,
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: text
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      })
    })

    console.log('Custom Agent Chat Request:', {
      agent: agent.name,
      model: agent.preferredModel,
      skills: agentSkills,
      message: text
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('Custom Agent Chat API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      })
      return NextResponse.json(
        { error: `Failed to get response from agent: ${response.status} ${response.statusText}` },
        { status: 500 }
      )
    }

    const data = await response.json()
    const agentResponse = data.choices?.[0]?.message?.content || 'Sorry, I could not process your request.'

    // Update agent's last used timestamp
    try {
      const convexClient = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!)
      await convexClient.mutation(api.agents.updateAgentLastUsed, {
        agentId: agent._id,
        lastUsed: Date.now()
      })
    } catch (error) {
      console.log('Failed to update agent last used:', error)
    }

    // Return streaming response for consistency
    const streamData = `data: ${JSON.stringify({ response: agentResponse })}\n\n`
    
    return new Response(streamData, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })

  } catch (error: any) {
    console.error('Custom agent chat error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to process agent chat' },
      { status: 500 }
    )
  }
}
