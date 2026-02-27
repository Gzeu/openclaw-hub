import Link from 'next/link'

const QUICK_LINKS = [
  { href: '/',            icon: '🏠', label: 'Home' },
  { href: '/agents',      icon: '🤖', label: 'Agents' },
  { href: '/economy',     icon: '💸', label: 'Economy' },
  { href: '/skills',      icon: '⚡',    label: 'Skills' },
  { href: '/tools',       icon: '🛠️', label: 'Tools' },
  { href: '/qa',          icon: '💬', label: 'FAQ' },
]

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-6"
      style={{ background: 'var(--bg)' }}
    >
      <div className="text-center max-w-lg animate-fade-up">

        {/* Big 404 */}
        <div className="relative inline-block mb-6">
          <span
            className="text-[120px] font-black leading-none select-none"
            style={{
              background: 'linear-gradient(135deg, rgba(124,92,252,0.3) 0%, rgba(34,211,238,0.15) 100%)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            404
          </span>
          <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-5xl pointer-events-none">
            🦅
          </span>
        </div>

        <h1 className="text-2xl font-black text-white mb-2">Page not found</h1>
        <p className="text-sm mb-8" style={{ color: 'var(--text-muted)' }}>
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>

        {/* Quick nav */}
        <div className="grid grid-cols-3 gap-2 mb-8">
          {QUICK_LINKS.map(({ href, icon, label }) => (
            <Link
              key={href}
              href={href}
              className="card flex flex-col items-center gap-1.5 py-3 px-2 text-center transition-all duration-200 hover:-translate-y-0.5 card-glow"
            >
              <span className="text-xl">{icon}</span>
              <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>{label}</span>
            </Link>
          ))}
        </div>

        <Link href="/" className="btn btn-primary">
          ← Back to OpenClaw Hub
        </Link>
      </div>
    </div>
  )
}
