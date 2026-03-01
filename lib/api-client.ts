// API Client with automatic authentication
const API_KEY = process.env.NEXT_PUBLIC_AGENTS_API_KEY || 'a9f3c7e2b5d8104f6a2e9c3b7d5f1a8e'

export class ApiClient {
  private static getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }
    
    // Add API key only if not in development with disabled auth
    if (process.env.NODE_ENV !== 'development' || API_KEY) {
      headers['x-api-key'] = API_KEY
    }
    
    return headers
  }

  static async get(url: string): Promise<Response> {
    return fetch(url, {
      method: 'GET',
      headers: this.getHeaders(),
    })
  }

  static async post(url: string, body?: any): Promise<Response> {
    return fetch(url, {
      method: 'POST',
      headers: this.getHeaders(),
      body: body ? JSON.stringify(body) : undefined,
    })
  }

  static async put(url: string, body?: any): Promise<Response> {
    return fetch(url, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: body ? JSON.stringify(body) : undefined,
    })
  }

  static async delete(url: string): Promise<Response> {
    return fetch(url, {
      method: 'DELETE',
      headers: this.getHeaders(),
    })
  }
}

// Convenience methods for common endpoints
export const api = {
  // Agents
  getAgents: () => ApiClient.get('/api/agents'),
  chatWithAgent: (sessionKey: string, text: string) => 
    ApiClient.post('/api/agents/chat', { sessionKey, text }),
  delegateTask: (sessionKey: string, task: string) =>
    ApiClient.post('/api/agents/delegate', { sessionKey, task }),
  
  // Skills
  getSkills: () => ApiClient.get('/api/skills'),
  executeSkill: (skillId: string, params: any) =>
    ApiClient.post(`/api/skills/execute/${skillId}`, params),
  
  // Tools
  getToolsStatus: (mode?: string) => 
    ApiClient.get(`/api/skills/tools-status${mode ? `?mode=${mode}` : ''}`),
  getAvailableTools: (filters?: any) =>
    ApiClient.post('/api/skills/available-tools', filters),
  getAgentTools: (category?: string) =>
    ApiClient.get(`/api/skills/agent-tools${category ? `?category=${category}` : ''}`),
  
  // Session Management
  getSessionStatus: () => ApiClient.get('/api/skills/session-manager?action=status'),
  autoUnlockSessions: (maxAgeMinutes?: number) =>
    ApiClient.post('/api/skills/session-manager', { action: 'auto-unlock', maxAgeMinutes }),
  
  // Health
  getHealth: () => ApiClient.get('/api/health'),
  getEndpoints: () => ApiClient.get('/api/endpoints'),
}
