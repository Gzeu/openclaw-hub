'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log to an error reporting service in production
    console.error('[OpenClaw Error]', error)
  }, [error])

  return (
    <div
      className="min-h-screen flex items-center justify-center px-6"
      style={{ background: 'var(--bg)' }}
    >
      <div className="text-center max-w-md animate-fade-up">
        {/* Icon */}
        <div className="text-6xl mb-6">💥</div>

        {/* Title */}
        <h1 className="text-2xl font-black text-white mb-2">Something went wrong</h1>
        <p className="text-sm mb-2" style={{ color: 'var(--text-muted)' }}>
          An unexpected error occurred. The team has been notified.
        </p>

        {/* Error digest */}
        {error.digest && (
          <p className="text-[10px] mono mb-6 px-3 py-1.5 rounded-lg inline-block" style={{ background: 'var(--bg-card)', color: 'var(--text-dim)', border: '1px solid var(--border)' }}>
            digest: {error.digest}
          </p>
        )}

        {/* Dev error message */}
        {process.env.NODE_ENV === 'development' && (
          <pre
            className="text-left text-[11px] mono p-4 rounded-xl mb-6 overflow-auto max-h-40"
            style={{ background: 'rgba(244,63,94,0.08)', color: 'var(--red)', border: '1px solid rgba(244,63,94,0.25)' }}
          >
            {error.message}
            {error.stack ? `\n\n${error.stack}` : ''}
          </pre>
        )}

        {/* Actions */}
        <div className="flex items-center justify-center gap-3">
          <button onClick={reset} className="btn btn-primary">
            🔄 Try again
          </button>
          <Link href="/" className="btn btn-ghost">
            🏠 Go home
          </Link>
        </div>

        {/* Help */}
        <p className="text-xs mt-6" style={{ color: 'var(--text-dim)' }}>
          Persistent issue?{' '}
          <a
            href="https://github.com/Gzeu/openclaw-hub/issues"
            target="_blank"
            rel="noreferrer"
            style={{ color: '#a78bfa' }}
          >
            Open an issue on GitHub ↗
          </a>
        </p>
      </div>
    </div>
  )
}
