import Link from 'next/link';
import ProjectGrid from '@/components/ProjectGrid';

const QUICK_LINKS = [
  { href: '/agents',      icon: '🤖', label: 'Agents',      desc: 'Real-time agent communications & delegations' },
  { href: '/chat',       icon: '💬', label: 'Chat',        desc: 'AI chat with OpenRouter models' },
  { href: '/config',      icon: '⚙️', label: 'Config',      desc: 'User settings & API key management' },
  { href: '/activity',    icon: '📡', label: 'Activity',    desc: 'Real-time activity monitoring & logs' },
  { href: '/skills',      icon: '⚡', label: 'Skills',      desc: '25+ AI skills & free API integrations' },
  { href: '/api/health',  icon: '🛠️', label: 'API Tools',   desc: 'Health check & API monitoring' },
  { href: '/dashboard',   icon: '📊', label: 'Dashboard',   desc: 'Analytics & performance metrics' },
  { href: 'https://github.com/Gzeu/openclaw-hub', icon: '⭐', label: 'GitHub', desc: 'Source code & documentation' },
];

async function getProjects() {
  try {
    // Dynamic import so a missing DB env never crashes the module
    const { getAllProjects, getAllTags } = await import('@/lib/projects');
    const [projects, allTags] = await Promise.all([getAllProjects(), getAllTags()]);
    return { projects, allTags };
  } catch {
    // No DB configured or DB unreachable — render the page without project grid
    return { projects: [], allTags: [] };
  }
}

export default async function Home() {
  const { projects, allTags } = await getProjects();

  return (
    <div className="min-h-screen">

      {/* ── HERO ───────────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        {/* Ambient orbs */}
        <div
          className="absolute top-[-120px] left-[-80px] w-[500px] h-[500px] rounded-full pointer-events-none animate-glow-pulse"
          style={{ background: 'radial-gradient(circle, rgba(124,92,252,0.12) 0%, transparent 70%)' }}
        />
        <div
          className="absolute top-[60px] right-[-60px] w-[380px] h-[380px] rounded-full pointer-events-none animate-glow-pulse"
          style={{ background: 'radial-gradient(circle, rgba(16,217,138,0.07) 0%, transparent 70%)', animationDelay: '1.5s' }}
        />

        <div className="relative max-w-[1440px] mx-auto px-6 pt-20 pb-16">

          {/* Version badge */}
          <div className="flex justify-center mb-6 animate-fade-up">
            <span className="badge badge-accent px-3 py-1.5">
              🦾 OpenClaw Hub · v0.3.0
            </span>
          </div>

          {/* Headline */}
          <div className="text-center max-w-3xl mx-auto animate-fade-up" style={{ animationDelay: '0.08s' }}>
            <h1 className="text-5xl sm:text-6xl font-black tracking-tight leading-[1.08] mb-5" style={{ color: '#fff' }}>
              The{' '}
              <span className="text-gradient">AI Agent</span>
              {' '}Hub for
              <br />
              <span className="text-gradient" style={{ filter: 'hue-rotate(40deg)' }}>OpenClaw</span>
            </h1>
            <p className="text-lg sm:text-xl max-w-xl mx-auto leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              Real-time agent communications, configuration management, and activity monitoring. Built on{' '}
              <span style={{ color: '#a78bfa' }}>Next.js 15</span>,{' '}
              <span style={{ color: '#10d98a' }}>Convex</span> &amp;{' '}
              <span style={{ color: '#22d3ee' }}>TypeScript</span>.
            </p>
          </div>

          {/* CTA */}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-8 animate-fade-up" style={{ animationDelay: '0.16s' }}>
            <Link href="/agents" className="btn btn-primary">
              🤖 Explore Agents
            </Link>
            <Link href="/chat" className="btn btn-ghost">
              💬 Start Chat
            </Link>
            <Link href="/config" className="btn btn-ghost">
              ⚙️ Configure
            </Link>
            <a href="https://github.com/Gzeu/openclaw-hub" target="_blank" rel="noopener noreferrer" className="btn btn-ghost">
              ⭐ GitHub
            </a>
          </div>

          {/* Stats */}
          <div
            className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto mt-12 animate-fade-up"
            style={{ animationDelay: '0.24s' }}
          >
            {[
              { label: 'Models',    value: '5',           icon: '🤖', color: '#a78bfa' },
              { label: 'Skills',    value: '25+',         icon: '⚡', color: '#10d98a' },
              { label: 'APIs',      value: '75+',         icon: '🔌', color: '#f59e0b' },
              { label: 'Real-time', value: 'Live',        icon: '📡', color: '#22d3ee' },
            ].map((s) => (
              <div key={s.label} className="card p-4 text-center">
                <div className="text-2xl mb-1">{s.icon}</div>
                <div className="text-xl font-bold" style={{ color: s.color }}>{s.value}</div>
                <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── QUICK ACCESS ─────────────────────────────────────────────────────────── */}
      <section className="max-w-[1440px] mx-auto px-6 pb-10">
        <div className="flex items-center gap-3 mb-5">
          <span className="section-label">Quick Access</span>
          <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
          {QUICK_LINKS.map(({ href, icon, label, desc }) => (
            <Link
              key={href}
              href={href}
              className="card card-glow flex flex-col items-center justify-center gap-1.5 p-4 text-center group transition-all duration-200 hover:-translate-y-0.5"
            >
              <span className="text-2xl transition-transform duration-200 group-hover:scale-110">{icon}</span>
              <span className="text-sm font-semibold" style={{ color: '#fff' }}>{label}</span>
              <span className="text-[10px] leading-tight" style={{ color: 'var(--text-dim)' }}>{desc}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── FEATURES ───────────────────────────────────────────────────────────── */}
      <section className="max-w-[1440px] mx-auto px-6 pb-10">
        <div className="flex items-center gap-3 mb-5">
          <span className="section-label">Platform Features</span>
          <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="card p-6">
            <div className="text-3xl mb-3">🔐</div>
            <h3 className="text-lg font-semibold mb-2" style={{ color: '#fff' }}>WorkOS Authentication</h3>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Enterprise-grade authentication with WorkOS AuthKit, Google OAuth, and secure session management.
            </p>
          </div>
          
          <div className="card p-6">
            <div className="text-3xl mb-3">💬</div>
            <h3 className="text-lg font-semibold mb-2" style={{ color: '#fff' }}>AI Chat Interface</h3>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Real-time chat with OpenRouter models including Claude, GPT-4, and Llama. Perfect for writers and professionals.
            </p>
          </div>
          
          <div className="card p-6">
            <div className="text-3xl mb-3">🤖</div>
            <h3 className="text-lg font-semibold mb-2" style={{ color: '#fff' }}>Agent Communications</h3>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Real-time chat, agent delegations, message history, and multi-agent communication channels.
            </p>
          </div>
          
          <div className="card p-6">
            <div className="text-3xl mb-3">⚙️</div>
            <h3 className="text-lg font-semibold mb-2" style={{ color: '#fff' }}>Configuration Management</h3>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              User settings, encrypted API key storage, provider registry, and model configuration.
            </p>
          </div>
          
          <div className="card p-6">
            <div className="text-3xl mb-3">📡</div>
            <h3 className="text-lg font-semibold mb-2" style={{ color: '#fff' }}>Activity Logging</h3>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Real-time activity monitoring, audit trails, performance metrics, and filterable views.
            </p>
          </div>
          
          <div className="card p-6">
            <div className="text-3xl mb-3">⚡</div>
            <h3 className="text-lg font-semibold mb-2" style={{ color: '#fff' }}>Skills Integration</h3>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              25+ AI skills, free API integrations, OpenRouter, Groq, Gemini, and more.
            </p>
          </div>
          
          <div className="card p-6">
            <div className="text-3xl mb-3">📊</div>
            <h3 className="text-lg font-semibold mb-2" style={{ color: '#fff' }}>Real-time Dashboard</h3>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Live monitoring, performance metrics, cost tracking, and system health status.
            </p>
          </div>
        </div>
      </section>

      {/* ── PROJECTS ───────────────────────────────────────────────────────────────── */}
      <div className="max-w-[1440px] mx-auto px-6">
        <div className="flex items-center gap-3 mb-5">
          <span className="section-label">
            Projects{projects.length > 0 ? ` · ${projects.length} available` : ''}
          </span>
          <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
          {projects.length > 0 && (
            <span className="text-xs" style={{ color: 'var(--text-dim)' }}>Filter by tag below</span>
          )}
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-6 pb-16">
        {projects.length > 0 ? (
          <ProjectGrid projects={projects} allTags={allTags} />
        ) : (
          /* Empty state — shown when DB is not configured */
          <div className="text-center py-20">
            <span className="text-5xl">🤖</span>
            <p className="mt-4 font-semibold" style={{ color: '#fff' }}>Welcome to OpenClaw Hub!</p>
            <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>
              Explore AI agents, start chatting, and manage your configuration. Sign in with your Google account to access all features. Check the{' '}
              <a
                href="https://github.com/Gzeu/openclaw-hub"
                target="_blank"
                rel="noreferrer"
                style={{ color: '#a78bfa' }}
              >
                GitHub README
              </a>
              {' '}for documentation.
            </p>
            <div className="flex justify-center gap-3 mt-6">
              <Link href="/agents" className="btn btn-primary">
                🤖 Explore Agents
              </Link>
              <Link href="/chat" className="btn btn-ghost">
                💬 Start Chatting
              </Link>
              <Link href="/config" className="btn btn-ghost">
                ⚙️ Configure Settings
              </Link>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
