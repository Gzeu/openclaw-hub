'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'

export default function ConfigPage() {
  const [user, setUser] = useState<any>(null)
  const [settings, setSettings] = useState<any>(null)
  const [providers, setProviders] = useState<any[]>([])
  const [apiKeys, setApiKeys] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showAddKeyModal, setShowAddKeyModal] = useState(false)
  const [newKey, setNewKey] = useState({ providerId: '', keyName: '', apiKey: '' })

  useEffect(() => {
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    try {
      setLoading(true)
      
      // Check if token exists
      const token = localStorage.getItem('auth-token')
      if (!token) {
        throw new Error('No authentication token found')
      }
      
      // Get current user
      const userResponse = await fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (!userResponse.ok) {
        throw new Error('Not authenticated')
      }
      
      const userData = await userResponse.json()
      setUser(userData.user)
      
      // Get user settings
      const settingsResponse = await fetch('/api/config/settings', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (settingsResponse.ok) {
        const settingsData = await settingsResponse.json()
        setSettings(settingsData.settings || { theme: 'dark', language: 'en' })
      }
      
      // Get providers
      const providersResponse = await fetch('/api/config/providers')
      if (providersResponse.ok) {
        const providersData = await providersResponse.json()
        setProviders(providersData.providers)
      }
      
      // Get API keys
      const apiKeysResponse = await fetch('/api/config/apikeys', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (apiKeysResponse.ok) {
        const apiKeysData = await apiKeysResponse.json()
        setApiKeys(apiKeysData.apiKeys || [])
      }
      
    } catch (err: any) {
      setError(err.message)
      // Redirect to login if not authenticated
      if (err.message.includes('Not authenticated') || err.message.includes('No authentication token')) {
        window.location.href = '/login'
      }
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateSettings = async (newSettings: any) => {
    try {
      const token = localStorage.getItem('auth-token')
      if (!token) {
        throw new Error('No authentication token')
      }
      
      const response = await fetch('/api/config/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(newSettings)
      })
      
      if (response.ok) {
        setSettings(newSettings)
      }
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleAddApiKey = async (providerId: string, apiKey: string, keyName: string) => {
    try {
      const token = localStorage.getItem('auth-token')
      if (!token) {
        throw new Error('No authentication token')
      }
      
      const response = await fetch('/api/config/apikeys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ providerId, apiKey, keyName })
      })
      
      if (response.ok) {
        fetchUserData() // Refresh data
      }
    } catch (err: any) {
      setError(err.message)
    }
  }

  const toggleKeyStatus = async (keyId: string) => {
    try {
      const token = localStorage.getItem('auth-token')
      if (!token) {
        throw new Error('No authentication token')
      }
      
      const response = await fetch('/api/config/apikeys', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ keyId })
      })
      
      if (response.ok) {
        fetchUserData() // Refresh data
      }
    } catch (err: any) {
      setError(err.message)
    }
  }

  const deleteApiKey = async (keyId: string) => {
    try {
      const token = localStorage.getItem('auth-token')
      if (!token) {
        throw new Error('No authentication token')
      }
      
      const response = await fetch('/api/config/apikeys', {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ keyId })
      })
      
      if (response.ok) {
        fetchUserData() // Refresh data
      }
    } catch (err: any) {
      setError(err.message)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl mb-4">⚙️</div>
          <p className="text-white">Loading configuration...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl mb-4">❌</div>
          <p className="text-red-400 mb-4">{error}</p>
          <div className="flex gap-3 justify-center">
            <button 
              onClick={() => window.location.href = '/login'}
              className="btn btn-primary"
            >
              🔐 Login
            </button>
            <button 
              onClick={() => window.location.href = '/'}
              className="btn btn-ghost"
            >
              🏠 Go Home
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Configuration</h1>
          <p className="text-gray-400">Manage your settings, API keys, and preferences</p>
        </div>

        {/* User Info */}
        <Card className="mb-6">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-white mb-4">User Profile</h2>
            <div className="space-y-2">
              <div>
                <span className="text-gray-400">Name:</span>
                <span className="text-white ml-2">{user?.name}</span>
              </div>
              <div>
                <span className="text-gray-400">Email:</span>
                <span className="text-white ml-2">{user?.email}</span>
              </div>
              <div>
                <span className="text-gray-400">Role:</span>
                <span className="text-white ml-2">{user?.role}</span>
              </div>
            </div>
          </div>
        </Card>

        {/* User Settings */}
        <Card className="mb-6">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-white mb-4">User Settings</h2>
            
            {/* Theme Settings */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-white mb-3">🎨 Appearance</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Theme</label>
                  <select 
                    value={settings?.theme || 'dark'}
                    onChange={(e) => handleUpdateSettings({ ...settings, theme: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white"
                  >
                    <option value="dark">🌙 Dark</option>
                    <option value="light">☀️ Light</option>
                    <option value="auto">🌓 Auto</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Language</label>
                  <select 
                    value={settings?.language || 'en'}
                    onChange={(e) => handleUpdateSettings({ ...settings, language: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white"
                  >
                    <option value="en">🇺🇸 English</option>
                    <option value="ro">🇷🇴 Română</option>
                    <option value="es">🇪🇸 Español</option>
                    <option value="fr">🇫🇷 Français</option>
                    <option value="de">🇩🇪 Deutsch</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Notification Settings */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-white mb-3">🔔 Notifications</h3>
              <div className="space-y-3">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={settings?.notifications?.email || false}
                    onChange={(e) => handleUpdateSettings({ 
                      ...settings, 
                      notifications: { 
                        ...settings?.notifications, 
                        email: e.target.checked 
                      }
                    })}
                    className="w-4 h-4 text-blue-600 bg-zinc-700 border-zinc-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-300">Email notifications</span>
                </label>
                
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={settings?.notifications?.push || false}
                    onChange={(e) => handleUpdateSettings({ 
                      ...settings, 
                      notifications: { 
                        ...settings?.notifications, 
                        push: e.target.checked 
                      }
                    })}
                    className="w-4 h-4 text-blue-600 bg-zinc-700 border-zinc-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-300">Push notifications</span>
                </label>
                
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={settings?.notifications?.taskUpdates || false}
                    onChange={(e) => handleUpdateSettings({ 
                      ...settings, 
                      notifications: { 
                        ...settings?.notifications, 
                        taskUpdates: e.target.checked 
                      }
                    })}
                    className="w-4 h-4 text-blue-600 bg-zinc-700 border-zinc-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-300">Task updates</span>
                </label>
                
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={settings?.notifications?.systemAlerts || false}
                    onChange={(e) => handleUpdateSettings({ 
                      ...settings, 
                      notifications: { 
                        ...settings?.notifications, 
                        systemAlerts: e.target.checked 
                      }
                    })}
                    className="w-4 h-4 text-blue-600 bg-zinc-700 border-zinc-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-300">System alerts</span>
                </label>
              </div>
            </div>

            {/* Privacy Settings */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-white mb-3">🔒 Privacy</h3>
              <div className="space-y-3">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={settings?.privacy?.shareData || false}
                    onChange={(e) => handleUpdateSettings({ 
                      ...settings, 
                      privacy: { 
                        ...settings?.privacy, 
                        shareData: e.target.checked 
                      }
                    })}
                    className="w-4 h-4 text-blue-600 bg-zinc-700 border-zinc-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-300">Share usage data</span>
                </label>
                
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={settings?.privacy?.analytics || false}
                    onChange={(e) => handleUpdateSettings({ 
                      ...settings, 
                      privacy: { 
                        ...settings?.privacy, 
                        analytics: e.target.checked 
                      }
                    })}
                    className="w-4 h-4 text-blue-600 bg-zinc-700 border-zinc-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-300">Enable analytics</span>
                </label>
                
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={settings?.privacy?.publicProfile || false}
                    onChange={(e) => handleUpdateSettings({ 
                      ...settings, 
                      privacy: { 
                        ...settings?.privacy, 
                        publicProfile: e.target.checked 
                      }
                    })}
                    className="w-4 h-4 text-blue-600 bg-zinc-700 border-zinc-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-300">Public profile</span>
                </label>
              </div>
            </div>

            {/* Performance Settings */}
            <div>
              <h3 className="text-lg font-medium text-white mb-3">⚡ Performance</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Auto-save interval</label>
                  <select 
                    value={settings?.performance?.autoSaveInterval || '30'}
                    onChange={(e) => handleUpdateSettings({ 
                      ...settings, 
                      performance: { 
                        ...settings?.performance, 
                        autoSaveInterval: e.target.value 
                      }
                    })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white"
                  >
                    <option value="10">10 seconds</option>
                    <option value="30">30 seconds</option>
                    <option value="60">1 minute</option>
                    <option value="300">5 minutes</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Cache size</label>
                  <select 
                    value={settings?.performance?.cacheSize || '100'}
                    onChange={(e) => handleUpdateSettings({ 
                      ...settings, 
                      performance: { 
                        ...settings?.performance, 
                        cacheSize: e.target.value 
                      }
                    })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white"
                  >
                    <option value="50">50 MB</option>
                    <option value="100">100 MB</option>
                    <option value="500">500 MB</option>
                    <option value="1000">1 GB</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* API Providers */}
        <Card className="mb-6">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-white mb-4">AI Providers</h2>
            <div className="space-y-3">
              {providers.map((provider) => (
                <div key={provider._id} className="flex items-center justify-between p-4 bg-zinc-800 rounded-lg">
                  <div>
                    <h3 className="text-white font-medium">{provider.name}</h3>
                    <p className="text-gray-400 text-sm">{provider.type}</p>
                    <p className="text-gray-500 text-xs">{provider.supportedModels?.join(', ')}</p>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 rounded text-xs ${provider.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                      {provider.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* API Keys */}
        <Card className="mb-6">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-white">API Keys</h2>
              <button 
                onClick={() => setShowAddKeyModal(true)}
                className="btn btn-primary btn-sm"
              >
                ➕ Add Key
              </button>
            </div>
            <div className="space-y-3">
              {apiKeys.map((key) => (
                <div key={key.id} className="flex items-center justify-between p-4 bg-zinc-800 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-white font-medium">{key.keyName}</h3>
                      <span className={`px-2 py-1 rounded text-xs ${key.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                        {key.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-gray-400">Provider:</span>
                      <span className="text-gray-300">{key.providerId}</span>
                      <span className="text-gray-400">Created:</span>
                      <span className="text-gray-300">{new Date(key.createdAt).toLocaleDateString()}</span>
                      {key.lastUsed && (
                        <>
                          <span className="text-gray-400">Last used:</span>
                          <span className="text-gray-300">{new Date(key.lastUsed).toLocaleDateString()}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleKeyStatus(key.id)}
                      className={`btn btn-sm ${key.isActive ? 'btn-ghost' : 'btn-primary'}`}
                    >
                      {key.isActive ? '🔒 Disable' : '🔓 Enable'}
                    </button>
                    <button
                      onClick={() => deleteApiKey(key.id)}
                      className="btn btn-sm btn-ghost text-red-400"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
              
              {apiKeys.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-400">No API keys configured</p>
                  <p className="text-gray-500 text-sm mt-2">Add API keys to use AI providers</p>
                  <button 
                    onClick={() => setShowAddKeyModal(true)}
                    className="btn btn-primary mt-4"
                  >
                    ➕ Add Your First API Key
                  </button>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Add API Key Modal */}
        {showAddKeyModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-zinc-800 rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold text-white mb-4">Add API Key</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Provider</label>
                  <select 
                    value={newKey.providerId}
                    onChange={(e) => setNewKey({ ...newKey, providerId: e.target.value })}
                    className="w-full bg-zinc-700 border border-zinc-600 rounded-lg px-4 py-2 text-white"
                  >
                    <option value="">Select a provider</option>
                    {providers.map((provider) => (
                      <option key={provider._id} value={provider._id}>
                        {provider.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Key Name</label>
                  <input
                    type="text"
                    value={newKey.keyName}
                    onChange={(e) => setNewKey({ ...newKey, keyName: e.target.value })}
                    placeholder="e.g., My OpenAI Key"
                    className="w-full bg-zinc-700 border border-zinc-600 rounded-lg px-4 py-2 text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">API Key</label>
                  <input
                    type="password"
                    value={newKey.apiKey}
                    onChange={(e) => setNewKey({ ...newKey, apiKey: e.target.value })}
                    placeholder="sk-..."
                    className="w-full bg-zinc-700 border border-zinc-600 rounded-lg px-4 py-2 text-white"
                  />
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    handleAddApiKey(newKey.providerId, newKey.apiKey, newKey.keyName)
                    setShowAddKeyModal(false)
                    setNewKey({ providerId: '', keyName: '', apiKey: '' })
                  }}
                  disabled={!newKey.providerId || !newKey.keyName || !newKey.apiKey}
                  className="btn btn-primary flex-1"
                >
                  Add Key
                </button>
                <button
                  onClick={() => {
                    setShowAddKeyModal(false)
                    setNewKey({ providerId: '', keyName: '', apiKey: '' })
                  }}
                  className="btn btn-ghost flex-1"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="flex gap-4">
          <button 
            onClick={() => window.location.href = '/agents'}
            className="btn btn-primary"
          >
            🤖 Go to Agents
          </button>
          <button 
            onClick={() => window.location.href = '/activity'}
            className="btn btn-ghost"
          >
            📡 View Activity
          </button>
          <button 
            onClick={() => window.location.href = '/'}
            className="btn btn-ghost"
          >
            🏠 Go Home
          </button>
          <button 
            onClick={() => {
              localStorage.removeItem('auth-token')
              window.location.href = '/login'
            }}
            className="btn btn-ghost"
          >
            🚪 Logout
          </button>
        </div>
      </div>
    </div>
  )
}
