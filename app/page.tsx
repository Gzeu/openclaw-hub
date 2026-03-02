'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useQuery } from 'convex/react'
import { api } from '../convex/_generated/api'

export default function Home() {
  const tasks = useQuery(api.tasks.getTasks, {})
  const activeAgents = useQuery(api.agents.getActiveAgents, {})

  const QUICK_LINKS = [
    { href: '/agents',      icon: '🤖', label: 'Agents',      desc: 'Real-time agent communications & delegations' },
    { href: '/chat',       icon: '💬', label: 'Chat',        desc: 'AI chat with OpenRouter models' },
    { href: '/config',      icon: '⚙️', label: 'Config',      desc: 'User settings & API key management' },
    { href: '/activity',    icon: '📡', label: 'Activity',    desc: 'Real-time activity monitoring & logs' },
    { href: '/skills',      icon: '⚡', label: 'Skills',      desc: '25+ AI skills & free API integrations' },
    { href: '/api/health',  icon: '🛠️', label: 'API Tools',   desc: 'Health check & API monitoring' },
    { href: '/economy',     icon: '💰', label: 'Economy',     desc: 'Agent marketplace & task economy' },
    { href: '/registry',    icon: '📋', label: 'Registry',    desc: 'Agent registry & profiles' },
  ]

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <div className="border-b border-[#1a1a1a]">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">🦅 OpenClaw Hub</h1>
              <p className="text-gray-400">AI Agent Platform & Automation Framework</p>
            </div>
            <Link 
              href="/agents"
              className="bg-[#23F7DD] text-black px-6 py-3 rounded-lg font-medium hover:bg-[#23F7DD]/90 transition-colors"
            >
              Launch Agents →
            </Link>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-[#111] border border-[#1e1e1e] rounded-xl p-6">
            <div className="text-2xl mb-2">🤖</div>
            <div className="text-2xl font-bold text-[#23F7DD]">
              {activeAgents?.length || 0}
            </div>
            <div className="text-xs text-gray-500">Active Agents</div>
          </div>
          <div className="bg-[#111] border border-[#1e1e1e] rounded-xl p-6">
            <div className="text-2xl mb-2">⚡</div>
            <div className="text-2xl font-bold text-[#23F7DD]">
              {tasks?.length || 0}
            </div>
            <div className="text-xs text-gray-500">Tasks Running</div>
          </div>
          <div className="bg-[#111] border border-[#1e1e1e] rounded-xl p-6">
            <div className="text-2xl mb-2">🔗</div>
            <div className="text-2xl font-bold text-[#23F7DD]">25+</div>
            <div className="text-xs text-gray-500">AI Skills</div>
          </div>
          <div className="bg-[#111] border border-[#1e1e1e] rounded-xl p-6">
            <div className="text-2xl mb-2">🌐</div>
            <div className="text-2xl font-bold text-[#23F7DD]">Multi</div>
            <div className="text-xs text-gray-500">Protocol Support</div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="mb-12">
          <h2 className="text-xl font-semibold mb-6">Quick Access</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {QUICK_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="bg-[#111] border border-[#1e1e1e] rounded-xl p-6 hover:border-[#23F7DD]/50 transition-colors group"
              >
                <div className="text-2xl mb-3">{link.icon}</div>
                <h3 className="font-semibold text-white mb-2 group-hover:text-[#23F7DD] transition-colors">
                  {link.label}
                </h3>
                <p className="text-sm text-gray-400">{link.desc}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* Features */}
        <div className="mb-12">
          <h2 className="text-xl font-semibold mb-6">Platform Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-[#111] border border-[#1e1e1e] rounded-xl p-6">
              <h3 className="font-semibold text-white mb-4">🤖 Agent Management</h3>
              <ul className="space-y-2 text-gray-400">
                <li>• Real-time agent communication</li>
                <li>• Task delegation & automation</li>
                <li>• Multi-protocol support (MCP, A2A, OASF)</li>
                <li>• Agent registry & profiles</li>
              </ul>
            </div>
            <div className="bg-[#111] border border-[#1e1e1e] rounded-xl p-6">
              <h3 className="font-semibold text-white mb-4">⚡ AI Integration</h3>
              <ul className="space-y-2 text-gray-400">
                <li>• 25+ AI skills & tools</li>
                <li>• OpenRouter model support</li>
                <li>• Custom agent creation</li>
                <li>• Workflow automation</li>
              </ul>
            </div>
            <div className="bg-[#111] border border-[#1e1e1e] rounded-xl p-6">
              <h3 className="font-semibold text-white mb-4">🔗 Blockchain Ready</h3>
              <ul className="space-y-2 text-gray-400">
                <li>• MultiversX integration</li>
                <li>• ERC-8004 agent registry</li>
                <li>• Smart contract interactions</li>
                <li>• DeFi protocol support</li>
              </ul>
            </div>
            <div className="bg-[#111] border border-[#1e1e1e] rounded-xl p-6">
              <h3 className="font-semibold text-white mb-4">📊 Monitoring</h3>
              <ul className="space-y-2 text-gray-400">
                <li>• Real-time activity logs</li>
                <li>• Agent health monitoring</li>
                <li>• Performance analytics</li>
                <li>• API health checks</li>
              </ul>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-[#23F7DD]/20 to-[#23F7DD]/10 border border-[#23F7DD]/30 rounded-xl p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Ready to Build AI Agents?</h2>
          <p className="text-gray-400 mb-6">
            Start creating intelligent automation systems with OpenClaw Hub's comprehensive agent platform.
          </p>
          <div className="flex gap-4 justify-center">
            <Link 
              href="/agents"
              className="bg-[#23F7DD] text-black px-6 py-3 rounded-lg font-medium hover:bg-[#23F7DD]/90 transition-colors"
            >
              Get Started
            </Link>
            <Link 
              href="https://github.com/Gzeu/openclaw-hub"
              className="border border-[#23F7DD] text-[#23F7DD] px-6 py-3 rounded-lg font-medium hover:bg-[#23F7DD]/10 transition-colors"
            >
              View Documentation
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
