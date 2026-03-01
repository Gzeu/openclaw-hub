import { NextRequest, NextResponse } from 'next/server'
import { ConvexHttpClient } from 'convex/browser'
import { api } from '@/convex/_generated/api'

const LITEROUTER_API_KEY = '57d9af92d7e95ebb9e93facc1ac54a059a38990d1607c1d4c584de10363ca7ec'
const LITEROUTER_API_URL = 'https://api.literouter.com/v1/chat/completions'

const MODELS = [
  {
    id: 'aurora-alpha-free-full-context',
    name: 'Aurora Alpha Full Context',
    provider: 'Literouter',
    description: 'Unlimited context, generalist with large context handling',
    context: 'You are an AI assistant integrated with OpenClaw. You excel at handling large context, previous messages, and long documents. Perfect for comprehensive analysis and detailed conversations.',
    model: 'aurora-alpha-free:full-context',
    temperature: 0.7
  },
  {
    id: 'ernie-4-5-21b-a3b-thinking-free',
    name: 'Ernie 4.5 Thinking',
    provider: 'Literouter',
    description: 'Specialized for reasoning and chain-of-thought, excellent planner',
    context: 'You are Ernie 4.5 Thinking, an AI assistant integrated with OpenClaw. You specialize in reasoning and chain-of-thought processes. You excel as a planner for complex tasks, providing detailed step-by-step analysis.',
    model: 'ernie-4.5-21b-a3b-thinking-free',
    temperature: 0.7
  },
  {
    id: 'gemini-free',
    name: 'Gemini',
    provider: 'Literouter',
    description: 'Excellent general assistant, stable fallback for mixed tasks',
    context: 'You are Gemini, an AI assistant integrated with OpenClaw. You are excellent at handling mixed tasks including coding, text analysis, and explanations. You serve as a reliable fallback for various requests.',
    model: 'gemini-free',
    temperature: 0.7
  },
  {
    id: 'gemma-3-27b-it-free',
    name: 'Gemma 3 27B',
    provider: 'Literouter',
    description: 'Large model, excellent at reasoning and coding, heavy brain for tasks',
    context: 'You are Gemma 3 27B, an AI assistant integrated with OpenClaw. You are a large model excellent at reasoning and coding. You serve as the "heavy brain" for complex and difficult tasks in agent workflows.',
    model: 'gemma-3-27b-it-free',
    temperature: 0.7
  },
  {
    id: 'gemma-free',
    name: 'Gemma',
    provider: 'Literouter',
    description: 'Light version, fast and predictable generalist',
    context: 'You are Gemma, an AI assistant integrated with OpenClaw. You are a light, fast, and predictable generalist model. You provide quick responses for general tasks and conversations.',
    model: 'gemma-free',
    temperature: 0.7
  },
  {
    id: 'glm-free',
    name: 'GLM',
    provider: 'Literouter',
    description: 'Decent generalist, secondary model or fallback',
    context: 'You are GLM, an AI assistant integrated with OpenClaw. You are a decent generalist model that can serve as a secondary model or fallback for various tasks.',
    model: 'glm-free',
    temperature: 0.7
  },
  {
    id: 'gpt-oss-20b-free',
    name: 'GPT OSS 20B',
    provider: 'Literouter',
    description: 'Large OSS model, serious reasoning alternative to gemma/gemma-3',
    context: 'You are GPT OSS 20B, an AI assistant integrated with OpenClaw. You are a large open-source model excellent for serious reasoning, serving as an alternative to gemma/gemma-3 for difficult tasks.',
    model: 'gpt-oss-20b-free',
    temperature: 0.7
  },
  {
    id: 'hermes-2-pro-llama-3-8b-free',
    name: 'Hermes 2 Pro Llama 3 8B',
    provider: 'Literouter',
    description: 'Excellent for conversational agents, prompt-following, roleplay',
    context: 'You are Hermes 2 Pro Llama 3 8B, an AI assistant integrated with OpenClaw. You excel at conversational interactions, prompt-following, and roleplay. You are perfect as a front-facing agent in OpenClaw.',
    model: 'hermes-2-pro-llama-3-8b-free',
    temperature: 0.7
  },
  {
    id: 'kat-coder-pro-free',
    name: 'Kat Coder Pro',
    provider: 'Literouter',
    description: 'Specialized for coding, perfect for code tools',
    context: 'You are Kat Coder Pro, an AI assistant integrated with OpenClaw. You specialize in coding tasks including code generation, refactoring, and bug fixing. You are perfect for code-related tools and development tasks.',
    model: 'kat-coder-pro-free',
    temperature: 0.7
  },
  {
    id: 'llama-3-1-8b-instruct-turbo-free',
    name: 'Llama 3.1 8B Turbo',
    provider: 'Literouter',
    description: 'Fast, inexpensive, quite smart - ideal workhorse for OpenClaw',
    context: 'You are Llama 3.1 8B Turbo, an AI assistant integrated with OpenClaw. You are fast, inexpensive, and quite smart. You serve as the ideal workhorse model for OpenClaw, handling most tasks efficiently.',
    model: 'llama-3.1-8b-instruct-turbo-free',
    temperature: 0.7
  },
  {
    id: 'qwen3-32b-free',
    name: 'Qwen3 32B',
    provider: 'Literouter',
    description: 'Very powerful at reasoning, coding, planning - ideal brain model',
    context: 'You are Qwen3 32B, an AI assistant integrated with OpenClaw. You are very powerful at reasoning, coding, and planning. You serve as the ideal "brain model" called only for heavy and difficult tasks.',
    model: 'qwen3-32b-free',
    temperature: 0.7
  },
  {
    id: 'qwen2.5-7b-instruct-free',
    name: 'Qwen2.5 7B',
    provider: 'Literouter',
    description: 'Excellent at coding and reasoning mid-tier, great principal model',
    context: 'You are Qwen2.5 7B, an AI assistant integrated with OpenClaw. You are excellent at coding and reasoning, making you a great candidate for the principal model handling code and tool-use tasks.',
    model: 'qwen2.5-7b-instruct-free',
    temperature: 0.7
  }
]

export async function POST(request: NextRequest) {
  try {
    const { message, model, provider } = await request.json()

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    // Get user from token
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json(
        { error: 'No authentication token provided' },
        { status: 401 }
      )
    }

    // Check if user is authenticated
    const userResponse = await fetch(`http://localhost:3000/api/auth/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })

    if (!userResponse.ok) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid token' },
        { status: 401 }
      )
    }

    const userData = await userResponse.json()
    
    if (!userData.user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 401 }
      )
    }

    // Find model configuration
    const selectedModel = MODELS.find(m => m.id === model) || MODELS[0]
    const modelConfig = {
      model: selectedModel.model,
      temperature: selectedModel.temperature
    }

    // Call OpenRouter API
    const response = await fetch(LITEROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LITEROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'OpenClaw Hub Chat'
      },
      body: JSON.stringify({
        model: modelConfig.model,
        messages: [
          {
            role: 'system',
            content: selectedModel.context || 'You are a helpful AI assistant integrated with OpenClaw.'
          },
          {
            role: 'user',
            content: message
          }
        ],
        temperature: modelConfig.temperature,
        max_tokens: 1000
      })
    })

    console.log('OpenRouter API Request:', {
      url: LITEROUTER_API_URL,
      model: modelConfig.model,
      message: message
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('OpenRouter API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      })
      return NextResponse.json(
        { error: `Failed to get response from AI model: ${response.status} ${response.statusText}` },
        { status: 500 }
      )
    }

    const data = await response.json()
    console.log('OpenRouter API Response:', data)
    
    const aiResponse = data.choices?.[0]?.message?.content || 'Sorry, I could not generate a response.'

    // Log the interaction (optional - could integrate with OpenClaw)
    console.log('Chat interaction:', {
      user: userData.user?.email,
      model: selectedModel.name,
      message: message,
      response: aiResponse,
      timestamp: new Date().toISOString()
    })

    return NextResponse.json({
      response: aiResponse,
      model: selectedModel.id,
      provider: selectedModel.provider
    })

  } catch (error: any) {
    console.error('Chat error:', error)
    return NextResponse.json(
      { error: error.message || 'OpenClaw Hub - Chat API Error' },
      { status: 500 }
    )
  }
}
