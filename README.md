# 🦾 OpenClaw Hub

**OpenClaw Hub** is a centralized platform for **AI agents, skills, and decentralized economy** that seamlessly integrates **OpenClaw Embedded Agents** with a **modern web interface**.

The platform offers real-time agent communications, AI chat with multiple models, configuration management, and a decentralized economy system based on **EGLD on MultiversX Devnet**.

---

## 🌟 Core Features

### 🔐 User Authentication & Account System
- **Secure Login/Register**: Email/password with JWT tokens
- **User Profiles**: Avatar, name, role management
- **Session Management**: HTTP-only cookies with expiration
- **Role-based Access**: User, Operator, Admin roles
- **Password Security**: bcryptjs hashing with salt rounds 10

### 💬 AI Chat Interface
- **Real-time Chat**: Modern chat interface with multiple AI models
- **Literouter Integration**: 12+ models including Aurora Alpha, Ernie 4.5, Gemini, Gemma, Qwen
- **Model Categories**: General, Reasoning, Coding, Conversational, Planning, Heavy
- **Context Management**: Unlimited context handling with Aurora Alpha
- **Model Switching**: Dynamic model selection during conversations
- **Chat Export**: Download conversations in JSON format
- **OpenClaw Context**: Each model has OpenClaw-specific context for agent integration

### 🤖 Agent Communications
- **Real-time Chat**: WebSocket streaming with fallback
- **Agent Delegations**: Task delegation between agents
- **Message History**: Persistent conversation storage
- **Status Tracking**: Online/offline/busy agent status
- **Channel Management**: Multi-agent communication channels

### 📊 Configuration Management
- **User Settings**: Theme, language, notifications, privacy, performance
- **API Key Management**: Encrypted storage for AI providers
- **Provider Registry**: AI providers with models and pricing
- **Model Registry**: Detailed model capabilities and costs
- **Provider Configuration**: Custom API endpoints and settings

### 🛠️ Task Execution Pipeline
- **Task Queue Management**: Priority-based task queuing
- **Status Tracking**: Real-time task status updates
- **Result Storage**: Persistent result storage and retrieval
- **Retry Logic**: Exponential backoff for failed tasks
- **Task Dependencies**: Task chaining and workflow automation

### 🤖 Activity Logging System
- **Real-time Feed**: Live activity monitoring
- **Audit Trails**: Complete action logging
- **Performance Metrics**: Response time and success rates
- **Error Logging**: Stack traces and debug information
- **Filterable Views**: By type, agent, status, time range

### ⚙️ Settings & Preferences UI
- **User Dashboard**: Personalized configuration panels
- **Theme Management**: Dark/light/auto themes
- **Language Support**: Multi-language localization
- **Notification Settings**: Email, push, task updates, system alerts
- **Privacy Controls**: Data sharing, analytics, public profile
- **Performance Settings**: Auto-save interval, cache size optimization
- **Drag-Drop Interface**: Intuitive configuration panels

---

## 🚀 Quick Start

### 1. Installation
```bash
git clone https://github.com/Gzeu/openclaw-hub
cd openclaw-hub
npm install
```

### 2. Environment Setup
```bash
# Copy environment variables
cp .env.example .env.local

# Configure Convex
npx convex dev
```

### 3. Environment Variables
```env
# Convex Configuration
NEXT_PUBLIC_CONVEX_URL=https://your-convex-url.convex.cloud

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key

# OpenClaw Gateway (Optional)
OPENCLAW_GATEWAY_URL=https://your-openclaw-gateway.com
OPENCLAW_PRIVATE_KEY=your-openclaw-private-key

# Literouter API Key (for Chat)
LITEROUTER_API_KEY=your-literouter-api-key-here

# Note: Get your free API key from https://literouter.ai
# The platform includes 12+ free models for unlimited usage
```

### 4. Start Development Server
```bash
npm run dev
```

### 5. Access the Platform
- **🌐 Open**: http://localhost:3000
- **🔐 Login**: Sign in with `test@example.com` / `password123`
- **💬 Chat**: Start chatting with AI models
- **⚙️ Configure**: Manage settings and API keys
- **🤖 Agents**: Explore agent communications

---

## 🔧 Configuration

### Environment Variables
```bash
# Convex Backend
NEXT_PUBLIC_CONVEX_URL="https://chatty-eagle-75.eu-west-1.convex.cloud"

# Authentication
JWT_SECRET="your-jwt-secret-key-here"

# OpenClaw Gateway (optional)
OPENCLAW_GATEWAY_URL="ws://127.0.0.1:18789"
OPENCLAW_GATEWAY_TOKEN="test-token"
```

---

## 🌐 API Endpoints

### Authentication
```bash
# Register user
POST /api/auth/register
{
  "email": "user@example.com",
  "name": "John Doe",
  "password": "password123",
  "role": "user"
}

# Login user
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "password123"
}

# Get current user
GET /api/auth/me
```

### Configuration Management
```bash
# User settings
GET /api/config/settings

# Update settings
PATCH /api/config/settings
{
  "theme": "dark",
  "language": "en",
  "notifications": {
    "email": true,
    "push": true,
    "taskUpdates": true,
    "systemAlerts": true
  }
}

# AI providers
GET /api/config/providers

# API keys
GET /api/config/apikeys

# Add API key
POST /api/config/apikeys
{
  "providerId": "provider-id",
  "apiKey": "sk-api-key-here",
  "keyName": "My API Key"
}
```

### Agent Communications
```bash
# Create channel
POST /api/agents/communications
{
  "action": "createChannel",
  "channelName": "Test Channel",
  "participants": ["agent:default:main", "agent:default:op"],
  "channelType": "delegation"
}

# Send message
POST /api/agents/communications
{
  "action": "sendMessage",
  "channelId": "channel-id",
  "senderId": "agent:default:main",
  "message": "Hello from agent!",
  "messageType": "chat"
}

# Get delegations
GET /api/agents/delegation?agentId=agent:default:main
```

### Activity Monitoring
```bash
# Get activities
GET /api/activity/convex

# Clear activities
DELETE /api/activity
```

---

## 🤖 Agent Capabilities

### Default Agent
- **General Purpose**: System context and general responses
- **Skills Integration**: Access to all available skills
- **Real-time Data**: Monitoring and status updates

### Main Agent  
- **Development Focus**: Coding, debugging, and development tasks
- **Git Integration**: Repository management and code analysis
- **Project Management**: Task tracking and workflow automation

### OP Agent
- **Operations Focus**: Monitoring, alerts, and system management
- **Crypto Integration**: Binance, Bybit, blockchain monitoring
- **Analytics**: Performance tracking and reporting

---

## 📊 Dashboard Features

### Real-time Monitoring
- **Active Sessions**: Track active agent sessions
- **Cost Tracking**: Monitor API usage and costs
- **Performance Metrics**: Response times and success rates
- **Activity Feed**: Live agent activity updates

### Configuration Dashboard
- **User Profiles**: Manage user accounts and settings
- **API Key Management**: Secure encrypted storage
- **Provider Settings**: Configure AI providers and models
- **System Health**: Monitor platform status

---

## 🛠️ Architecture

### Frontend (Next.js 15)
- **Modern UI**: React, TypeScript, TailwindCSS
- **Real-time Updates**: WebSocket + Convex subscriptions
- **Responsive Design**: Mobile-first approach
- **Type Safety**: Strict TypeScript checking

### Backend (Convex + Next.js API)
- **Real-time Database**: Convex for live data
- **API Routes**: REST endpoints for all functionality
- **Authentication**: JWT-based session management
- **File Storage**: JSON-based persistence

### OpenClaw Integration
- **Embedded Agents**: Local OpenClaw agent CLI
- **Workspace Access**: Direct file system integration
- **Skills System**: 25+ predefined skills
- **Tool Integration**: Read, Edit, Exec, Browser, etc.

---

## 📋 Available Skills

| Category | Skills | Free APIs Used |
|---|---|---|
| AI / LLM | `llm-complete`, `llm-stream`, `embedded-chat` | OpenRouter, Groq, Gemini, Mistral |
| Web Search | `web-search`, `news-search` | Tavily, Brave, DuckDuckGo |
| Web Scraping | `scrape-url`, `extract-content` | Jina Reader, Firecrawl |
| Code | `code-execute`, `code-analyze`, `repo-search` | E2B, GitHub API |
| Blockchain | `mvx-balance`, `mvx-txns`, `price-feed` | MultiversX, CoinGecko |
| Data | `weather`, `wiki-search`, `memory-store`, `memory-search` | Open-Meteo, Wikipedia |
| System | `session-manager`, `cleanup`, `health-check` | OpenClaw CLI |

---

## 🎯 Development

### Local Development
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

### Production Deployment
```bash
# Build optimized version
npm run build

# Deploy to Vercel
npm run deploy
```

---

## 🔧 Configuration

### OpenClaw Configuration
```json
{
  "agents": {
    "defaults": {
      "model": {
        "primary": "gpt-4",
        "fallbacks": ["gpt-4", "claude-3-opus"]
      }
    }
  },
  "gateway": {
    "mode": "local",
{{ ... }
}
```

### Environment Variables
```bash
# Convex Backend
NEXT_PUBLIC_CONVEX_URL="https://your-convex-url.convex.cloud"

# Authentication
JWT_SECRET="your-jwt-secret-key-here"

# OpenClaw Integration
OPENCLAW_WORKSPACE="C:\\Users\\username\\.openclaw\\workspace"
```

---

## � Usage Examples

### Authentication
```bash
# Register new user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "name": "John Doe",
    "password": "password123",
    "role": "user"
  }'

# Login user
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Agent Communications
```bash
# Create delegation
curl -X POST http://localhost:3000/api/agents/delegation \
  -H "Content-Type: application/json" \
  -d '{
    "fromAgent": "agent:default:main",
    "toAgent": "agent:default:op",
    "task": "Analyze this data and provide insights",
    "priority": "high"
  }'

# Get delegations
curl -X GET "http://localhost:3000/api/agents/delegation?agentId=agent:default:main"
```

### Configuration Management
```bash
# Get user settings
curl -X GET http://localhost:3000/api/config/settings

# Update settings
curl -X PATCH http://localhost:3000/api/config/settings \
  -H "Content-Type: application/json" \
  -d '{
    "theme": "dark",
    "language": "en",
    "notifications": {
      "email": true,
      "push": true,
      "taskUpdates": true,
      "systemAlerts": true
    }
  }'
```

---

## 🤝 Contributing

### Development Workflow
1. Fork repository
2. Create feature branch
3. Make changes
4. Add tests
5. Submit pull request

### Code Style
- **TypeScript**: Strict type checking enabled
- **Prettier**: Code formatting configured
- **ESLint**: Linting with strict rules
- **Conventional Commits**: Clear and descriptive messages

### � License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

### 🤝 GitHub

- **Repository**: https://github.com/Gzeu/openclaw-hub
- **Issues**: https://github.com/Gzeu/openclaw-hub/issues
- **Discussions**: https://github.com/Gzeu/openclaw-hub/discussions

---

**🦄 OpenClaw Hub · v0.3.0 · MIT License**: http://localhost:3000/skill.md
- **API Reference**: http://localhost:3000/api/skills
- **OpenClaw**: https://github.com/openclaw-d

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
