'use client'

import React, { useState, useEffect } from 'react'
import { Search, Filter, RefreshCw, Settings, TrendingUp, AlertCircle, CheckCircle, X, Clock, DollarSign, Activity, Zap, ChevronDown, ChevronUp, Eye, Play, Pause, RotateCw, Terminal, BarChart3, Users, Star, ThumbsUp, MessageSquare, ExternalLink, ArrowRight } from 'lucide-react'

// Platform configurations
const PLATFORMS = [
  { id: 'thecolony', name: 'TheColony', url: 'https://thecolony.io', currency: 'karma', color: '#FF6B6B', icon: '🏛' },
  { id: 'moltverse', name: 'Moltiverse', url: 'https://moltiverse.com', currency: 'sats', color: '#F59E0B', icon: '⚡' },
  { id: 'e2b', name: 'E2B', url: 'https://e2b.dev', currency: 'sats', color: '#10B981', icon: '🤖' },
  { id: 'farcaster', name: 'Farcaster', url: 'https://warpcast.com', currency: 'degen', color: '#8B5CF6', icon: '🌐' },
  { id: 'supremacy', name: 'Supremacy', url: 'https://supremacy.games', currency: 'sats', color: '#DC2626', icon: '👑' },
  { id: 'bounties', name: 'Bounties', url: 'https://bounties.network', currency: 'sats', color: '#F97316', icon: '🎯' }
]

// Types
interface Task {
  id: string
  title: string
  description: string
  budget: number
  currency: string
  url: string
  platform: string
  status: 'open' | 'in_progress' | 'completed'
  created_at: string
}

interface PlatformTasks {
  platform: string
  tasks: Task[]
  count: number
}

interface TaskFilters {
  minBudget: number
  platforms: string[]
  sortBy: 'budget' | 'title' | 'platform'
  sortOrder: 'asc' | 'desc'
}

interface LoopConfig {
  minKarma: number
  maxRetries: number
  retryDelay: number
  enableAutoRetry: boolean
  preferredPlatforms: string[]
}

interface ExecutionLog {
  timestamp: string
  step: string
  message: string
  status: 'info' | 'success' | 'error'
}

interface LoopResult {
  status: 'success' | 'no_tasks' | 'error'
  message?: string
  data?: any
}

export default function EconomyPage() {
  const [activeTab, setActiveTab] = useState<'market' | 'loop'>('market')
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(false)
  const [taskFilters, setTaskFilters] = useState<TaskFilters>({
    minBudget: 0,
    platforms: [],
    sortBy: 'budget',
    sortOrder: 'desc'
  })
  
  // Loop state
  const [loopRunning, setLoopRunning] = useState(false)
  const [loopConfig, setLoopConfig] = useState<LoopConfig>({
    minKarma: 50,
    maxRetries: 3,
    retryDelay: 5000,
    enableAutoRetry: true,
    preferredPlatforms: ['thecolony', 'moltverse', 'e2b']
  })
  const [executionLogs, setExecutionLogs] = useState<ExecutionLog[]>([])
  const [currentStep, setCurrentStep] = useState<string>('')
  const [loopResult, setLoopResult] = useState<LoopResult | null>(null)
  const [showConfig, setShowConfig] = useState(false)
  const [errorInfo, setErrorInfo] = useState<{
    type: string
    message: string
    recoverable: boolean
    details?: any
  } | null>(null)

  // Fetch tasks from all platforms
  const fetchTasks = async () => {
    setLoading(true)
    try {
      // Mock data for now - replace with actual API calls
      const mockTasks: Task[] = [
        {
          id: '1',
          title: 'AI Agent Development',
          description: 'Build an AI agent that can analyze market trends and provide investment recommendations',
          budget: 100,
          currency: 'karma',
          url: 'https://thecolony.io/tasks/1',
          platform: 'thecolony',
          status: 'open',
          created_at: new Date().toISOString()
        },
        {
          id: '2',
          title: 'Smart Contract Audit',
          description: 'Audit a DeFi smart contract for security vulnerabilities and gas optimization',
          budget: 500,
          currency: 'sats',
          url: 'https://moltiverse.com/tasks/2',
          platform: 'moltiverse',
          status: 'open',
          created_at: new Date().toISOString()
        },
        {
          id: '3',
          title: 'Data Analysis Pipeline',
          description: 'Create a data processing pipeline for real-time market analytics',
          budget: 200,
          currency: 'sats',
          url: 'https://e2b.dev/tasks/3',
          platform: 'e2b',
          status: 'open',
          created_at: new Date().toISOString()
        }
      ]
      
      setTasks(mockTasks)
    } catch (error) {
      console.error('Failed to fetch tasks:', error)
    } finally {
      setLoading(false)
    }
  }

  // Add execution log
  const addExecutionLog = (step: string, message: string, status: 'info' | 'success' | 'error' = 'info') => {
    const log: ExecutionLog = {
      timestamp: new Date().toISOString(),
      step,
      message,
      status
    }
    setExecutionLogs(prev => [...prev, log])
  }

  // Clear execution logs
  const clearExecutionLogs = () => {
    setExecutionLogs([])
    setCurrentStep('')
    setLoopResult(null)
    setErrorInfo(null)
  }

  // Trigger autonomous loop
  const triggerLoop = async () => {
    setLoopRunning(true)
    setErrorInfo(null)
    setLoopResult(null)
    
    addExecutionLog('scanning', 'Scanning platforms for available tasks...', 'info')
    
    // Simulate platform scanning
    await new Promise(resolve => setTimeout(resolve, 1000))
    addExecutionLog('selecting', 'Selecting best task based on filters...', 'info')
    
    await new Promise(resolve => setTimeout(resolve, 1000))
    addExecutionLog('executing', 'Executing task in E2B sandbox...', 'info')
    
    await new Promise(resolve => setTimeout(resolve, 3000))
    addExecutionLog('generating', 'Generating AI analysis report...', 'info')
    
    await new Promise(resolve => setTimeout(resolve, 2000))
    addExecutionLog('submitting', 'Submitting results to platform...', 'info')
    
    await new Promise(resolve => setTimeout(resolve, 1000))
    addExecutionLog('completed', 'Task completed successfully! Earned 75 karma and 500 sats', 'success')
    
    setLoopResult({
      status: 'success',
      message: 'Successfully completed task and earned rewards'
    })
    
    setLoopRunning(false)
    setCurrentStep('')
  }

  // Filter and sort tasks
  const filteredAndSortedTasks = PLATFORMS.map(platform => {
    const platformTasks = tasks.filter(task => task.platform === platform.id)
    
    // Apply filters
    let filteredTasks = platformTasks
    if (taskFilters.minBudget > 0) {
      filteredTasks = filteredTasks.filter(task => task.budget >= taskFilters.minBudget)
    }
    if (taskFilters.platforms.length > 0) {
      filteredTasks = filteredTasks.filter(task => taskFilters.platforms.includes(task.platform))
    }
    
    // Sort tasks
    const sortedTasks = filteredTasks.sort((a, b) => {
      let comparison = 0
      switch (taskFilters.sortBy) {
        case 'budget':
          comparison = a.budget - b.budget
          break
        case 'title':
          comparison = a.title.localeCompare(b.title)
          break
        case 'platform':
          comparison = a.platform.localeCompare(b.platform)
          break
      }
      
      return taskFilters.sortOrder === 'asc' ? comparison : -comparison
    })
    
    return { ...platform, tasks: sortedTasks, count: sortedTasks.length }
  })

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6">
      {/* Header */}
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-1">
            🤖 Agent Economy
          </h1>
          <p className="text-gray-400 text-sm">
            Agenții tăi muncesc autonom pe platformele din ecosistem și câștigă karma, sats, și crypto.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-[#111] rounded-lg p-1 w-fit">
        {(['market', 'loop'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab
                ? 'bg-[#23F7DD] text-black'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {tab === 'market' ? '🛒' : '🔄'} {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Market Tab */}
      {activeTab === 'market' && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="bg-[#111] border-[#1e1e1e] rounded-xl p-6">
            <h3 className="font-semibold text-white mb-4">🔍 Task Filters</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-500 block mb-1">Minimum Budget</label>
                <input
                  type="number"
                  value={taskFilters.minBudget}
                  onChange={(e) => setTaskFilters(prev => ({ ...prev, minBudget: parseInt(e.target.value) || 0 }))}
                  className="w-full bg-[#0d0d0d] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-white"
                  min="1"
                  max="1000"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Platforms</label>
                <div className="space-y-2">
                  {PLATFORMS.map(platform => (
                    <label key={platform.id} className="flex items-center gap-2 text-xs text-gray-400">
                      <input
                        type="checkbox"
                        checked={taskFilters.platforms.includes(platform.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setTaskFilters(prev => ({ ...prev, platforms: [...prev.platforms, platform.id] }))
                          } else {
                            setTaskFilters(prev => ({ ...prev, platforms: prev.platforms.filter(p => p !== platform.id) }))
                          }
                        }}
                        className="bg-[#0d0d0d] border border-[#2a2a2a] rounded"
                      />
                      {platform.name}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Sort By</label>
                <select
                  value={taskFilters.sortBy}
                  onChange={(e) => setTaskFilters(prev => ({ ...prev, sortBy: e.target.value as 'title' | 'platform' | 'budget' }))}
                  className="w-full bg-[#0d0d0d] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-white"
                >
                  <option value="budget">Budget</option>
                  <option value="title">Title</option>
                  <option value="platform">Platform</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Order</label>
                <select
                  value={taskFilters.sortOrder}
                  onChange={(e) => setTaskFilters(prev => ({ ...prev, sortOrder: e.target.value as 'asc' | 'desc' }))}
                  className="w-full bg-[#0d0d0d] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-white"
                >
                  <option value="desc">Descending</option>
                  <option value="asc">Ascending</option>
                </select>
              </div>
            </div>
          </div>

          {/* Task Listings */}
          {loading ? (
            <div className="text-gray-500 text-sm">Loading tasks from all platforms...</div>
          ) : filteredAndSortedTasks.length === 0 || filteredAndSortedTasks.every(p => p.tasks.length === 0) ? (
            <div className="text-gray-600 text-sm">
              {taskFilters.minBudget > 0 || taskFilters.platforms.length > 0 
                ? 'No tasks match your filters. Try adjusting them.' 
                : 'No tasks loaded. Configure your Colony API key to see live dispatches.'}
            </div>
          ) : (
            filteredAndSortedTasks.map((platform) => (
              <div key={platform.id}>
                <div className="text-xs text-gray-500 uppercase tracking-wider mb-3">
                  {platform.name} — {platform.count} open {platform.count !== tasks.filter(t => t.platform === platform.id).length && '(filtered)'}
                </div>
                <div className="grid gap-3">
                  {platform.tasks.slice(0, 5).map((task) => (
                    <div
                      key={task.id}
                      className="bg-[#111] border border-[#1e1e1e] rounded-xl p-4 hover:border-[#2a2a2a] transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm text-white truncate">
                            {task.title}
                          </div>
                          <div className="text-xs text-gray-500 mt-1 line-clamp-2">
                            {task.description}
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="text-sm font-bold text-[#23F7DD]">
                            {task.budget} {task.currency}
                          </div>
                          <a
                            href={task.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-gray-600 hover:text-gray-400 transition-colors"
                          >
                            view →
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
          <button
            onClick={fetchTasks}
            className="text-xs text-gray-600 hover:text-gray-400 transition-colors"
          >
            ↻ Refresh
          </button>
        </div>
      )}

      {/* Loop Tab */}
      {activeTab === 'loop' && (
        <div className="space-y-6">
          {/* Configuration Panel */}
          <div className="bg-[#111] border-[#1e1e1e] rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-white">⚙️ Loop Configuration</h2>
              <button
                onClick={() => setShowConfig(!showConfig)}
                className="text-xs text-gray-400 hover:text-gray-300 transition-colors"
              >
                {showConfig ? 'Hide' : 'Show'} Settings
              </button>
            </div>
            
            {showConfig && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Minimum Karma</label>
                  <input
                    type="number"
                    value={loopConfig.minKarma}
                    onChange={(e) => setLoopConfig(prev => ({ ...prev, minKarma: parseInt(e.target.value) || 0 }))}
                    className="w-full bg-[#0d0d0d] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-white"
                    min="1"
                    max="100"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Max Retries</label>
                  <input
                    type="number"
                    value={loopConfig.maxRetries}
                    onChange={(e) => setLoopConfig(prev => ({ ...prev, maxRetries: parseInt(e.target.value) || 0 }))}
                    className="w-full bg-[#0d0d0d] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-white"
                    min="0"
                    max="5"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Retry Delay (ms)</label>
                  <input
                    type="number"
                    value={loopConfig.retryDelay}
                    onChange={(e) => setLoopConfig(prev => ({ ...prev, retryDelay: parseInt(e.target.value) || 1000 }))}
                    className="w-full bg-[#0d0d0d] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-white"
                    min="1000"
                    max="30000"
                    step="1000"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Preferred Platforms</label>
                  <div className="space-y-2">
                    {PLATFORMS.map(platform => (
                      <label key={platform.id} className="flex items-center gap-2 text-xs text-gray-400">
                        <input
                          type="checkbox"
                          checked={loopConfig.preferredPlatforms.includes(platform.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setLoopConfig(prev => ({ ...prev, preferredPlatforms: [...prev.preferredPlatforms, platform.id] }))
                            } else {
                              setLoopConfig(prev => ({ ...prev, preferredPlatforms: prev.preferredPlatforms.filter(p => p !== platform.id) }))
                            }
                          }}
                          className="bg-[#0d0d0d] border border-[#2a2a2a] rounded"
                        />
                        {platform.name}
                      </label>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="autoRetry"
                    checked={loopConfig.enableAutoRetry}
                    onChange={(e) => setLoopConfig(prev => ({ ...prev, enableAutoRetry: e.target.checked }))}
                    className="bg-[#0d0d0d] border border-[#2a2a2a] rounded"
                  />
                  <label htmlFor="autoRetry" className="text-xs text-gray-400">Enable Auto Retry</label>
                </div>
              </div>
            )}
          </div>

          {/* Main Loop Control */}
          <div className="bg-[#111] border-[#1e1e1e] rounded-xl p-6">
            <h2 className="font-semibold text-white mb-2">🔄 Autonomous Agent Loop</h2>
            <p className="text-sm text-gray-400 mb-4">
              Agentul scanează platformele, preia task-uri, execută în E2B sandbox, generează rapoarte și câștigă karma/sats.
            </p>
            <div className="bg-[#0d0d0d] rounded-lg p-3 text-xs font-mono text-gray-500 mb-4">
              <div>1. Scan TheColony dispatches (karma ≥ {loopConfig.minKarma})</div>
              <div>2. Fallback → Moltverse gigs</div>
              <div>3. Execute in E2B Python sandbox</div>
              <div>4. Generate AI report via OpenRouter</div>
              <div>5. Submit → earn karma + sell doc for 500 sats</div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={triggerLoop}
                disabled={loopRunning}
                className="px-6 py-2.5 bg-[#23F7DD] text-black font-semibold rounded-lg text-sm hover:bg-[#1de0c8] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loopRunning ? '⏳ Running...' : '🚀 Run Agent Loop Now'}
              </button>
              {executionLogs.length > 0 && (
                <button
                  onClick={clearExecutionLogs}
                  className="px-4 py-2.5 bg-[#333] text-gray-300 font-medium rounded-lg text-sm hover:bg-[#444] transition-colors"
                >
                  Clear Logs
                </button>
              )}
            </div>
          </div>

          {/* Real-time Execution Logs */}
          {executionLogs.length > 0 && (
            <div className="bg-[#111] border-[#1e1e1e] rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-white">📋 Execution Logs</h3>
                {currentStep && (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-[#23F7DD] rounded-full animate-pulse"></div>
                    <span className="text-xs text-gray-400">Current: {currentStep}</span>
                  </div>
                )}
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {executionLogs.map((log, idx) => (
                  <div key={idx} className="flex items-start gap-3 text-sm">
                    <div className="flex-shrink-0 w-16 text-xs text-gray-500 font-mono">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </div>
                    <div className="flex-shrink-0">
                      {log.step === 'scanning' && '🔍'}
                      {log.step === 'selecting' && '📋'}
                      {log.step === 'executing' && '⚡'}
                      {log.step === 'generating' && '🤖'}
                      {log.step === 'submitting' && '📤'}
                      {log.step === 'completed' && '✅'}
                      {log.step === 'error' && '❌'}
                    </div>
                    <div className="flex-1">
                      <div className={log.status === 'error' ? 'text-red-400' : log.status === 'success' ? 'text-green-400' : 'text-gray-300'}>
                        {log.message}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Loop Result */}
          {loopResult && (
            <div
              className={`bg-[#111] border rounded-xl p-6 ${
                loopResult.status === 'success'
                  ? 'border-[#23F7DD]/30'
                  : loopResult.status === 'no_tasks'
                  ? 'border-yellow-500/30'
                  : 'border-red-500/30'
              }`}
            >
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">
                  {loopResult.status === 'success'
                    ? '✅'
                    : loopResult.status === 'no_tasks'
                    ? '📭'
                    : '❌'}
                </span>
                <div>
                  {loopResult.status === 'success'
                    ? 'Loop completed successfully'
                    : loopResult.status === 'no_tasks'
                    ? 'No suitable tasks found'
                    : 'Loop encountered an error'}
                </div>
              </div>
              {loopResult.message && (
                <div className="text-sm text-gray-300">
                  {loopResult.message}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
