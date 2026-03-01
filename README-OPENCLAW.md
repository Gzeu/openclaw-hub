# OpenClaw Hub - Platformă AI Completă

## 🎯 Despre OpenClaw Hub

**OpenClaw Hub** este o platformă centralizată pentru **agenți AI, skill-uri și economie descentralizată** care integrează perfect **OpenClaw Embedded Agents** cu **web interface modern**.

### 🚀 Funcționalități Principale

#### 🤖 **Embedded Agents**
- **3 Agenți Disponibili**: `default`, `main`, `op`
- **Model**: `mistral-medium-latest` (Mistral AI)
- **Chat Real-time**: Streaming responses cu WebSocket fallback
- **Session Persistence**: Conversații salvate permanent în fișiere JSON
- **Context Awareness**: Acces la workspace, tools, și 25+ skills

#### 📊 **Dashboard Analytics**
- **Monitorizare Sesiuni**: Token usage, costuri, modele folosite
- **Performanță Chat**: Timp de răspuns, rate de succes
- **Cost Tracking**: Transparență totală a costurilor API
- **Real-time Updates**: Dashboard live cu streaming

#### 🛠️ **Skill Management**
- **25+ Skills**: AI/LLM, Web Search, Code, Blockchain, Data
- **API-uri Gratuite**: OpenRouter, Groq, Gemini, Tavily, etc.
- **Easy Integration**: API endpoints standardizate
- **Custom Skills**: Posibilitate de a adăuga skills noi

#### 💰 **Economie Descentralizată**
- **Cryptomoneda**: EGLD (MultiversX Devnet)
- **Pricing**: Per-task (plătești doar pentru ce folosești)
- **Transparență**: Costuri monitorizate în timp real
- **Smart Contracts**: Integrare cu MultiversX

## 🔧 Arhitectură

### **Frontend (Next.js 14)**
- **UI Modern**: React, TypeScript, TailwindCSS
- **Real-time Chat**: WebSocket + Streaming
- **Dashboard**: Analytics și monitoring
- **Responsive**: Mobile-first design

### **Backend (Node.js)**
- **API Routes**: REST endpoints pentru toate funcționalitățile
- **Session Management**: Persistență conversații
- **Agent Integration**: OpenClaw Embedded Agent CLI
- **File Storage**: JSON-based session persistence

### **OpenClaw Integration**
- **Embedded Agent**: `npx openclaw agent --local`
- **Workspace Access**: `C:\Users\el\.openclaw\workspace`
- **Skills System**: 25+ skills predefinite
- **Tool Integration**: Read, Edit, Exec, Browser, etc.

## 🌐 API Endpoints

### **Chat & Agents**
```bash
# Chat cu agent
POST /api/agents/chat
{
  "sessionKey": "agent:default:main",
  "message": "Ce poți face?"
}

# Listă agenți
GET /api/agents

# Istoric conversație
GET /api/chat/history/[sessionKey]
```

### **Dashboard Analytics**
```bash
# Sesiuni active
GET /api/dashboard/sessions

# Costuri și usage
GET /api/dashboard/costs

# Performanță chat
GET /api/dashboard/chat
```

### **Skills & Integration**
```bash
# Listă completă skills
GET /api/skills

# Manifest compact
GET /api/skills?format=compact

# Health check
GET /api/health
```

## 🚀 Quick Start

### **1. Instalare**
```bash
git clone https://github.com/Gzeu/openclaw-hub
cd openclaw-hub
npm install
```

### **2. OpenClaw Setup**
```bash
# Instalează OpenClaw
npm install -g openclaw

# Configurează workspace
openclaw init

# Verifică agenți
openclaw agents list
```

### **3. Start Platform**
```bash
# Start development server
npm run dev

# Accesează platforma
# http://localhost:3000
```

## 💡 Exemple de Utilizare

### **Chat cu Agent**
```bash
curl -X POST http://localhost:3000/api/agents/chat \
  -H "Content-Type: application/json" \
  -d '{
    "sessionKey": "agent:default:main",
    "message": "Ce faci acum?"
  }'
```

### **Dashboard Analytics**
```bash
# Monitorizare sesiuni
curl http://localhost:3000/api/dashboard/sessions

# Costuri și usage
curl http://localhost:3000/api/dashboard/costs
```

### **Skill Integration**
```bash
# Listă skills disponibile
curl http://localhost:3000/api/skills

# Manifest pentru integrare
curl http://localhost:3000/api/skills?format=compact
```

## 🔧 Configurare

### **OpenClaw Configuration**
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

### **Environment Variables**
```bash
# OpenClaw workspace
OPENCLAW_WORKSPACE="C:\\Users\\el\\.openclaw\\workspace"

# Gateway configuration
GATEWAY_URL="ws://127.0.0.1:18789"
GATEWAY_TOKEN="test-token"
```

## 📊 Monitorizare

### **Session Persistence**
- **File Storage**: `sessions.json`
- **Auto-save**: La fiecare mesaj
- **Load on Startup**: Restore conversații
- **Multi-agent**: Fiecare agent cu istoric separat

### **Performance Metrics**
- **Response Time**: Tracking timp de răspuns
- **Token Usage**: Monitorizare consum API
- **Success Rate**: Rate de succes chat
- **Error Tracking**: Logging erori și timeouts

## 🤝 Contribuții

### **Development**
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

### **Contributing Guide**
1. Fork repository
2. Create feature branch
3. Make changes
4. Add tests
5. Submit pull request

## 📄 Licență

MIT License - vezi fișierul [LICENSE](LICENSE) pentru detalii.

## 🔗 Link-uri Utile

- **GitHub**: https://github.com/Gzeu/openclaw-hub
- **Issues**: https://github.com/Gzeu/openclaw-hub/issues
- **Documentation**: http://localhost:3000/skill.md
- **API Reference**: http://localhost:3000/api/skills

---

## 🎉 Concluzie

**OpenClaw Hub** este o platformă completă și producțională pentru:
- **AI Agent Development**: Cu OpenClaw integration
- **Real-time Chat**: Cu persistență conversații
- **Dashboard Analytics**: Pentru monitoring și costuri
- **Skill Management**: Cu 25+ skills predefinite
- **Economie Descentralizată**: Cu EGLD pe MultiversX

**Platforma este gata pentru producție și poate fi extinsă cu noi funcționalități!** 🚀

---

*Built with ❤️ using OpenClaw, Next.js, și MultiversX*
