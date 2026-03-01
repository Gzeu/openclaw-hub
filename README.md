# 🐾 OpenClaw Hub

**OpenClaw Hub** is a centralized platform for **AI agents, skills, and decentralized economy** that seamlessly integrates **OpenClaw Embedded Agents** with a **modern web interface**.

The platform offers real-time chat with AI agents, dashboard analytics, and a decentralized economy system based on **EGLD on MultiversX Devnet**.

---

## 🌟 Core Features

### 🤖 Embedded AI Agents
- **3 Available Agents**: `default`, `main`, `op` with different contexts
- **Model**: `mistral-medium-latest` (Mistral AI)
- **Real-time Chat**: Streaming responses with WebSocket fallback
- **Session Persistence**: Conversations permanently saved in JSON files
- **Context Awareness**: Access to workspace, tools, and 25+ skills

### 📊 Dashboard Analytics
- **Session Monitoring**: Token usage, costs, models used
- **Chat Performance**: Response time, success rates
- **Cost Tracking**: Full transparency of API costs
- **Real-time Updates**: Live dashboard with streaming

### 🛠️ Skill Management
- **25+ Skills**: AI/LLM, Web Search, Code, Blockchain, Data
- **Free APIs**: OpenRouter, Groq, Gemini, Tavily, etc.
- **Easy Integration**: Standardized API endpoints
- **Custom Skills**: Ability to add new skills

### 💰 Decentralized Economy
- **Cryptocurrency**: EGLD (MultiversX Devnet)
- **Pricing**: Per-task (pay only for what you use)
- **Transparency**: Costs monitored in real-time
- **Smart Contracts**: MultiversX integration

### 🌐 Modern Web Interface
- **Next.js 14**: React, TypeScript, TailwindCSS
- **Responsive Design**: Mobile-first approach
- **Real-time Updates**: WebSocket streaming
- **Modern UI Components**: Card, Button, Input, etc.

---

## 🚀 Quick Start

### 1. Installation
```bash
git clone https://github.com/Gzeu/openclaw-hub
cd openclaw-hub
npm install
```

### 2. OpenClaw Setup
```bash
# Install OpenClaw
npm install -g openclaw

# Configure workspace
openclaw init

# Check agents
openclaw agents list
```

### 3. Start Platform
```bash
# Start development server
npm run dev

# Access platform
# http://localhost:3000
```

---

## 🌐 API Endpoints

### Chat & Agents
```bash
# Chat with agent
POST /api/agents/chat
{
  "sessionKey": "agent:default:main",
  "message": "What can you do?"
}

# List agents
GET /api/agents

# Chat history
GET /api/chat/history/[sessionKey]
```

### Dashboard Analytics
```bash
# Active sessions
GET /api/dashboard/sessions

# Costs and usage
GET /api/dashboard/costs

# Chat performance
GET /api/dashboard/chat
```

### Skills & Integration
```bash
# Complete skills list
GET /api/skills

# Compact manifest
GET /api/skills?format=compact

# Health check
GET /api/health
```

---

## 🤖 Agent Capabilities

### Default Agent
- **General Purpose**: System context and general responses
- **Skills Integration**: Access to all 25+ skills
- **Real-time Data**: Monitoring and status updates

### Main Agent
- **Development Focus**: Coding, debugging, and development tasks
- **Git Integration**: Repository management and code analysis
- **Project Management**: Task tracking and workflow automation

### OP Agent
- **Operations Focus**: Monitoring, alerts, and system management
- **Crypto Integration**: Binance, Bybit, and blockchain monitoring
- **Analytics**: Performance tracking and reporting

---

## 📊 Session Management

### Persistence System
- **File Storage**: `sessions.json` for persistence
- **Auto-save**: On every message sent/received
- **Load on Startup**: Restore conversations on restart
- **Multi-agent**: Each agent with separate history

### Chat History
```typescript
// Hook for UI integration
const { messages, isLoading, addMessage } = useChatHistory('agent:default:main')
```

---

## 🛠️ Architecture

### Frontend (Next.js 14)
- **Modern UI**: React, TypeScript, TailwindCSS
- **Real-time Chat**: WebSocket + Streaming
- **Dashboard**: Analytics and monitoring
- **Responsive**: Mobile-first design

### Backend (Node.js)
- **API Routes**: REST endpoints for all functionality
- **Session Management**: Conversation persistence
- **Agent Integration**: OpenClaw Embedded Agent CLI
- **File Storage**: JSON-based session persistence

### OpenClaw Integration
- **Embedded Agent**: `npx openclaw agent --local`
- **Workspace Access**: `C:\Users\el\.openclaw\workspace`
- **Skills System**: 25+ predefined skills
- **Tool Integration**: Read, Edit, Exec, Browser, etc.

---

## 📋 Requirements

### System Requirements
- **Node.js**: Version 18.x or newer
- **OpenClaw CLI**: Required for embedded agent functionality
- **Git**: For version control and deployment

### OpenClaw Setup
- **Workspace**: `C:\Users\el\.openclaw\workspace`
- **Configuration**: `openclaw.json` with model settings
- **Skills**: Available in `workspace\skills\` directory

---

## 🔧 Configuration

### OpenClaw Configuration
```json
{
  "agents": {
    "defaults": {
      "model": {
        "primary": "mistral/mistral-medium-latest",
        "fallbacks": ["mistral/mistral-medium-latest"]
      }
    }
  },
  "gateway": {
    "mode": "local",
    "auth": {
      "mode": "token",
      "token": "test-token"
    }
  }
}
```

### Environment Variables
```bash
# OpenClaw workspace
OPENCLAW_WORKSPACE="C:\\Users\\el\\.openclaw\\workspace"

# Gateway configuration
GATEWAY_URL="ws://127.0.0.1:18789"
GATEWAY_TOKEN="test-token"
```

---

## 📊 Available Skills

| Category | Skills | Free APIs used |
|---|---|---|
| AI / LLM | `llm-complete`, `llm-stream`, `embedded-chat` | OpenRouter, Groq, Gemini, Mistral |
| Web Search | `web-search`, `news-search` | Tavily, Brave, DuckDuckGo |
| Web Scraping | `scrape-url`, `extract-content` | Jina Reader, Firecrawl |
| Code | `code-execute`, `code-analyze`, `repo-search` | E2B, GitHub API |
| Blockchain | `mvx-balance`, `mvx-txns`, `price-feed` | MultiversX, CoinGecko |
| Data | `weather`, `wiki-search` | Open-Meteo, Wikipedia |
| Memory | `memory-store`, `memory-search` | Upstash, Qdrant |

---

## 🚀 Usage Examples

### Chat with Agent
```bash
curl -X POST http://localhost:3000/api/agents/chat \
  -H "Content-Type: application/json" \
  -d '{
    "sessionKey": "agent:default:main",
    "message": "What are you doing now?"
  }'
```

### Dashboard Analytics
```bash
# Session monitoring
curl http://localhost:3000/api/dashboard/sessions

# Costs and usage
curl http://localhost:3000/api/dashboard/costs
```

### Skill Integration
```bash
# Available skills
curl http://localhost:3000/api/skills

# Integration manifest
curl http://localhost:3000/api/skills?format=compact
```

---

## 🤝 Contributing

### Development
```bash
# Install dependencies
npm install

# Start development
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

### Contributing Guide
1. Fork repository
2. Create feature branch
3. Make changes
4. Add tests
5. Submit pull request

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

---

## 🔗 Useful Links

- **GitHub**: https://github.com/Gzeu/openclaw-hub
- **Issues**: https://github.com/Gzeu/openclaw-hub/issues
- **Documentation**: http://localhost:3000/skill.md
- **API Reference**: http://localhost:3000/api/skills
- **OpenClaw**: https://github.com/openclaw-d

---

## 🎉 Conclusion

**OpenClaw Hub** is a complete, production-ready platform for:
- **AI Agent Development**: With OpenClaw integration
- **Real-time Chat**: With session persistence
- **Dashboard Analytics**: For monitoring and costs
- **Skill Management**: With 25+ predefined skills
- **Decentralized Economy**: With EGLD on MultiversX

**The platform is ready for production and can be extended with new features!** 🚀

---

*Built with ❤️ using OpenClaw, Next.js, and MultiversX*
