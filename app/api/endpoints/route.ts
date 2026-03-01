import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

// Get all available API endpoints
function getAvailableEndpoints() {
  return {
    chat: {
      method: 'POST',
      path: '/api/agents/chat',
      description: 'Send messages to OpenClaw agents',
      parameters: {
        sessionKey: 'string (e.g., "agent:default:main")',
        message: 'string (message to send)'
      },
      example: {
        sessionKey: 'agent:default:main',
        message: 'Hello, how are you?'
      }
    },
    agents: {
      method: 'GET',
      path: '/api/agents',
      description: 'List all available agents',
      response: 'Array of agent objects'
    },
    chatHistory: {
      method: 'GET',
      path: '/api/chat/history/[sessionKey]',
      description: 'Get chat history for a specific session',
      parameters: {
        sessionKey: 'string (e.g., "agent:default:main")'
      },
      example: '/api/chat/history/agent:default:main'
    },
    clearHistory: {
      method: 'DELETE',
      path: '/api/chat/history/[sessionKey]',
      description: 'Clear chat history for a specific session',
      parameters: {
        sessionKey: 'string (e.g., "agent:default:main")'
      }
    },
    unlockSession: {
      method: 'POST',
      path: '/api/unlock-session',
      description: 'Unlock OpenClaw session and remove lock files',
      parameters: {
        sessionKey: 'string (e.g., "agent:default:main")'
      },
      example: {
        sessionKey: 'agent:default:main'
      }
    },
    skills: {
      method: 'GET',
      path: '/api/skills',
      description: 'Get all available skills',
      parameters: {
        format: 'optional: "compact" for agent integration'
      },
      examples: [
        '/api/skills',
        '/api/skills?format=compact'
      ]
    },
    dashboard: {
      method: 'GET',
      path: '/api/dashboard/*',
      description: 'Dashboard analytics endpoints',
      endpoints: [
        '/api/dashboard/sessions - Active sessions',
        '/api/dashboard/costs - Cost tracking',
        '/api/dashboard/chat - Chat performance',
        '/api/dashboard/full - Complete dashboard data'
      ]
    },
    health: {
      method: 'GET',
      path: '/api/health',
      description: 'Health check and system status',
      response: 'System status and uptime'
    },
    settings: {
      method: 'GET/POST',
      path: '/api/settings',
      description: 'Get or update system settings',
      response: 'Current configuration'
    },
    endpoints: {
      method: 'GET',
      path: '/api/endpoints',
      description: 'List all available API endpoints (this endpoint)',
      response: 'Complete API documentation'
    }
  }
}

export async function GET() {
  try {
    const endpoints = getAvailableEndpoints()
    
    return NextResponse.json({
      success: true,
      message: 'OpenClaw Hub API Endpoints',
      version: '0.3.0',
      timestamp: new Date().toISOString(),
      endpoints,
      usage: {
        authentication: 'None required (local development)',
        rateLimit: 'No rate limiting (local)',
        format: 'JSON',
        encoding: 'UTF-8'
      },
      examples: {
        curl: `curl -X POST http://localhost:3000/api/agents/chat \\
  -H "Content-Type: application/json" \\
  -d '{"sessionKey": "agent:default:main", "message": "Hello!"}'`,
        
        javascript: `fetch('/api/agents/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    sessionKey: 'agent:default:main',
    message: 'Hello!'
  })
})`,
        
        python: `import requests

response = requests.post('http://localhost:3000/api/agents/chat', json={
    'sessionKey': 'agent:default:main',
    'message': 'Hello!'
})

print(response.json())`
      }
    })
  } catch (error: any) {
    return NextResponse.json({ 
      error: error.message,
      success: false
    }, { status: 500 })
  }
}
