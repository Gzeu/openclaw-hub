'use client'

import { useRef, useState } from 'react'

interface ChartResult {
  type: string
  title: string
  imageBase64?: string
}

interface AnalysisResult {
  sandboxId: string
  summary: string
  charts: ChartResult[]
  stdout: string
  error?: string
  executionTime: number
}

export default function AnalystPage() {
  const [file, setFile] = useState<File | null>(null)
  const [prompt, setPrompt] = useState('Give me a full statistical analysis and identify trends')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const run = async () => {
    if (!file || loading) return
    setLoading(true)
    setError(null)
    setResult(null)
    const form = new FormData()
    form.append('file', file)
    form.append('prompt', prompt)
    try {
      const res = await fetch('/api/analyst', { method: 'POST', body: form })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setResult(data)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Topbar */}
      <header className="border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center gap-4">
          <a href="/" className="flex items-center gap-2">
            <span className="text-xl">🦾</span>
            <span className="font-bold tracking-tight">OpenClaw Hub</span>
          </a>
          <nav className="flex gap-1">
            {[['/', 'Projects'], ['/agents', 'Agents'], ['/analyst', 'AI Analyst'], ['/activity', 'Activity']].map(([href, label]) => (
              <a key={href} href={href}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  href === '/analyst' ? 'bg-amber-600/20 text-amber-300' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                }`}>
                {label}
              </a>
            ))}
          </nav>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">📊 AI Analyst</h1>
          <p className="text-zinc-400">Upload a CSV — agents analyze it in an E2B sandbox and generate interactive charts.</p>
        </div>

        {/* Upload card */}
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 mb-8">
          <div
            onClick={() => inputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors mb-5 ${
              file ? 'border-amber-500/50 bg-amber-500/5' : 'border-zinc-700 hover:border-zinc-500'
            }`}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
            {file ? (
              <>
                <p className="text-2xl mb-1">📄</p>
                <p className="font-semibold text-amber-300">{file.name}</p>
                <p className="text-xs text-zinc-500">{Math.round(file.size / 1024)} KB</p>
              </>
            ) : (
              <>
                <p className="text-4xl mb-2">📂</p>
                <p className="text-zinc-400">Drop CSV here or click to browse</p>
                <p className="text-xs text-zinc-600 mt-1">Analyzed securely in E2B sandbox</p>
              </>
            )}
          </div>

          <div className="flex gap-3">
            <input
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="What do you want to know?"
              className="flex-1 bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500 transition-colors"
            />
            <button
              onClick={run}
              disabled={!file || loading}
              className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-40 disabled:cursor-not-allowed text-sm font-semibold text-white transition-colors"
            >
              {loading ? 'Analyzing...' : '▶ Analyze'}
            </button>
          </div>
        </div>

        {/* Loading skeleton */}
        {loading && (
          <div className="space-y-4">
            <div className="h-32 bg-zinc-900 rounded-2xl animate-pulse" />
            <div className="grid grid-cols-2 gap-4">
              <div className="h-48 bg-zinc-900 rounded-2xl animate-pulse" />
              <div className="h-48 bg-zinc-900 rounded-2xl animate-pulse" />
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-900/20 border border-red-800 rounded-xl p-4 text-red-300 text-sm">
            ⚠️ {error}
          </div>
        )}

        {result && (
          <>
            {/* Stats bar */}
            <div className="flex gap-4 mb-6">
              {[
                { label: 'Sandbox', value: result.sandboxId.slice(0, 12) + '...', icon: '⚡' },
                { label: 'Time', value: `${result.executionTime}ms`, icon: '⏱️' },
                { label: 'Charts', value: result.charts.length, icon: '📊' },
              ].map((s) => (
                <div key={s.label} className="flex-1 bg-zinc-900/60 border border-zinc-800 rounded-xl px-4 py-3">
                  <p className="text-xs text-zinc-500">{s.icon} {s.label}</p>
                  <p className="font-mono text-sm text-white mt-0.5">{s.value}</p>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 mb-6">
              <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-3">Dataset Summary</p>
              <pre className="text-xs text-zinc-300 whitespace-pre-wrap font-mono overflow-auto">
                {result.summary}
              </pre>
            </div>

            {/* Charts */}
            {result.charts.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {result.charts.map((chart, i) => (
                  <div key={i} className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4">
                    <p className="text-xs font-semibold text-zinc-400 mb-3">📈 {chart.title}</p>
                    {chart.imageBase64 && (
                      <img
                        src={`data:image/png;base64,${chart.imageBase64}`}
                        alt={chart.title}
                        className="w-full rounded-lg"
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
