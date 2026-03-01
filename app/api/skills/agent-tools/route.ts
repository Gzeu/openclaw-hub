import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

// Get all available agent tools and capabilities
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')

    // All available tools organized by category
    const allTools = {
      file_management: {
        name: "📂 File Management",
        description: "Read, write, and edit files",
        tools: [
          {
            id: "read",
            name: "Read File",
            description: "Read content from text or image files",
            example: 'read("C:/path/file.txt")',
            parameters: ["file_path", "optional_lines"],
            returns: "file_content"
          },
          {
            id: "write",
            name: "Write File", 
            description: "Write or overwrite files",
            example: 'write("C:/path/file.txt", "content")',
            parameters: ["file_path", "content"],
            returns: "success_status"
          },
          {
            id: "edit",
            name: "Edit File",
            description: "Edit files by replacing exact text",
            example: 'edit("C:/path/file.txt", "old_text", "new_text")',
            parameters: ["file_path", "old_string", "new_string"],
            returns: "edit_status"
          }
        ]
      },
      command_execution: {
        name: "💻 Command Execution",
        description: "Execute terminal commands and manage processes",
        tools: [
          {
            id: "exec",
            name: "Execute Command",
            description: "Run terminal commands (PowerShell, Bash)",
            example: 'exec("curl http://localhost:3000/api/health")',
            parameters: ["command", "cwd"],
            returns: "command_output"
          },
          {
            id: "process",
            name: "Process Management",
            description: "Manage background processes",
            example: 'process(action="poll", sessionId="123")',
            parameters: ["action", "sessionId"],
            returns: "process_status"
          }
        ]
      },
      web_interaction: {
        name: "🌐 Web Interaction",
        description: "Search, fetch, and automate web interactions",
        tools: [
          {
            id: "web_search",
            name: "Web Search",
            description: "Search internet using Brave API",
            example: 'web_search("EGLD price today")',
            parameters: ["query", "count"],
            returns: "search_results"
          },
          {
            id: "web_fetch",
            name: "Web Fetch",
            description: "Extract web page content (HTML → text/markdown)",
            example: 'web_fetch("https://example.com")',
            parameters: ["url"],
            returns: "page_content"
          },
          {
            id: "browser",
            name: "Browser Control",
            description: "Control browser for complex automations",
            example: 'browser(action="open", url="http://localhost:3000")',
            parameters: ["action", "url"],
            returns: "browser_status"
          }
        ]
      },
      agent_sessions: {
        name: "🤖 Agent Sessions",
        description: "Manage agent sessions and sub-agents",
        tools: [
          {
            id: "sessions_spawn",
            name: "Spawn Session",
            description: "Create new isolated agent session",
            example: 'sessions_spawn(task="Generate report", runtime="subagent")',
            parameters: ["task", "runtime"],
            returns: "session_info"
          },
          {
            id: "sessions_list",
            name: "List Sessions",
            description: "List all active sessions",
            example: 'sessions_list()',
            parameters: [],
            returns: "sessions_list"
          },
          {
            id: "sessions_send",
            name: "Send to Session",
            description: "Send message to existing session",
            example: 'sessions_send(sessionKey="abc123", message="Hello")',
            parameters: ["sessionKey", "message"],
            returns: "response"
          },
          {
            id: "subagents",
            name: "Sub-agent Management",
            description: "Manage sub-agents (list, stop, route)",
            example: 'subagents(action="list")',
            parameters: ["action"],
            returns: "subagent_status"
          }
        ]
      },
      automation: {
        name: "📅 Automation",
        description: "Schedule and manage recurring tasks",
        tools: [
          {
            id: "cron",
            name: "Cron Jobs",
            description: "Schedule recurring tasks",
            example: 'cron(action="add", job={"name": "Check EGLD", "schedule": {"kind": "every", "everyMs": 3600000}})',
            parameters: ["action", "job"],
            returns: "cron_status"
          }
        ]
      },
      messaging: {
        name: "💬 Messaging",
        description: "Send messages and notifications",
        tools: [
          {
            id: "message",
            name: "Send Message",
            description: "Send messages via Telegram, Discord, etc.",
            example: 'message(action="send", to="user123", message="EGLD price alert!")',
            parameters: ["action", "to", "message"],
            returns: "message_status"
          }
        ]
      },
      gateway_management: {
        name: "🔄 Gateway Management",
        description: "Manage OpenClaw Gateway",
        tools: [
          {
            id: "gateway",
            name: "Gateway Control",
            description: "Restart or configure OpenClaw Gateway",
            example: 'gateway(action="restart", note="Apply new settings")',
            parameters: ["action", "note"],
            returns: "gateway_status"
          }
        ]
      },
      memory: {
        name: "🧠 Memory",
        description: "Search and retrieve memory content",
        tools: [
          {
            id: "memory_search",
            name: "Memory Search",
            description: "Search in agent memory (MEMORY.md, memory/)",
            example: 'memory_search("EGLD price")',
            parameters: ["query"],
            returns: "search_results"
          },
          {
            id: "memory_get",
            name: "Get Memory",
            description: "Extract specific memory fragment",
            example: 'memory_get(path="memory/2026-03-01.md", from=1, lines=10)',
            parameters: ["path", "from", "lines"],
            returns: "memory_content"
          }
        ]
      }
    }

    // Filter by category if requested
    let filteredTools: typeof allTools = allTools
    if (category && allTools[category as keyof typeof allTools]) {
      filteredTools = { [category]: allTools[category as keyof typeof allTools] } as typeof allTools
    }

    // Generate summary
    const summary = {
      total_categories: Object.keys(allTools).length,
      total_tools: Object.values(allTools).reduce((total, cat) => total + cat.tools.length, 0),
      categories: Object.keys(allTools),
      available_filters: Object.keys(allTools)
    }

    return NextResponse.json({
      success: true,
      summary,
      tools: filteredTools,
      usage_examples: [
        "Check EGLD price and send alert: exec('curl...') + message('send', ...)",
        "Create daily report: exec('python report.py') + write('report.txt', ...)",
        "Automate price monitoring: cron('add', job={schedule: 'every 1hr', ...})"
      ],
      integrations: {
        openclaw_hub: "http://localhost:3000",
        api_endpoints: [
          "/api/agents/chat",
          "/api/skills/*", 
          "/api/tools/check",
          "/api/health"
        ]
      },
      timestamp: new Date().toISOString()
    })

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

// Execute agent tool
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { toolId, parameters, action } = body

    // Validate tool ID
    const validTools = [
      'read', 'write', 'edit', 'exec', 'process',
      'web_search', 'web_fetch', 'browser',
      'sessions_spawn', 'sessions_list', 'sessions_send', 'subagents',
      'cron', 'message', 'gateway', 'memory_search', 'memory_get'
    ]

    if (!validTools.includes(toolId)) {
      return NextResponse.json({
        success: false,
        error: `Invalid tool: ${toolId}. Valid tools: ${validTools.join(', ')}`
      }, { status: 400 })
    }

    // Simulate tool execution (in real implementation, this would call actual tool functions)
    const executionResult = {
      toolId,
      action: action || 'execute',
      parameters,
      result: `Simulated execution of ${toolId} with parameters: ${JSON.stringify(parameters)}`,
      status: 'success',
      timestamp: new Date().toISOString()
    }

    return NextResponse.json({
      success: true,
      execution: executionResult
    })

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
