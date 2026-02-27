import Link from 'next/link';
import { getAllProjects, getAllTags } from '@/lib/projects';
import ProjectGrid from '@/components/ProjectGrid';

const QUICK_LINKS = [
  { href: '/agents',      icon: '🤖', label: 'Agents',      desc: 'Manage & chat with AI agents' },
  { href: '/economy',     icon: '💸', label: 'Economy',     desc: 'Tasks, earnings & agent loop' },
  { href: '/marketplace', icon: '🛒', label: 'Marketplace', desc: 'Buy & sell agent skills' },
  { href: '/wallet',      icon: '💎', label: 'Wallet',      desc: 'MVX wallet & EGLD balance' },
  { href: '/activity',    icon: '📡', label: 'Activity',    desc: 'Real-time agent activity log' },
  { href: '/analyst',     icon: '🧠', label: 'Analyst',     desc: 'AI-powered code analysis' },
  { href: '/skills',      icon: '⚡', label: 'Skills',      desc: 'Skill catalog & matcher' },
  { href: '/tools',       icon: '🛠️', label: 'API Tools',   desc: 'Health check 75+ free APIs' },
];

export default async function Home() {
  const projects = await getAllProjects();
  const allTags = await getAllTags();

  return (
    <div className="min-h-screen">
      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        {/* Gradient orbs */}
        <div
          className="absolute top-[-120px] left-[-80px] w-[500px] h-[500px] rounded-full pointer-events-none animate-glow-pulse"
          style={{ background: 'radial-gradient(circle, rgba(124,92,252,0.12) 0%, transparent 70%)' }}
        />
        <div
          className="absolute top-[60px] right-[-60px] w-[380px] h-[380px] rounded-full pointer-events-none animate-glow-pulse"
          style={{ background: 'radial-gradient(circle, rgba(16,217,138,0.07) 0%, transparent 70%)', animationDelay: '1.5s' }}
        />

        <div className="relative max-w-[1440px] mx-auto px-6 pt-20 pb-16">
          {/* Badge */}
          <div className="flex justify-center mb-6 animate-fade-up">
            <span className="badge badge-accent px-3 py-1.5 text-xs">
              🚀 OpenClaw Ecosystem · v0.2.0
            </span>
          </div>

          {/* Headline */}
          <div className="text-center max-w-3xl mx-auto animate-fade-up" style={{ animationDelay: '0.08s' }}>
            <h1 className="text-5xl sm:text-6xl font-black tracking-tight text-white leading-[1.08] mb-4">
              The{' '}
              <span className="text-gradient">AI Agent</span>
              {' '}Hub for
              <br />
              <span className="text-gradient" style={{ filter: 'hue-rotate(40deg)' }}>OpenClaw</span>
            </h1>
            <p className="text-lg sm:text-xl max-w-xl mx-auto leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              Discover, deploy, and monetize AI agents. Built on{' '}
              <span style={{ color: '#a78bfa' }}>Next.js 15</span>,{' '}
              <span style={{ color: '#10d98a' }}>MongoDB</span> &{' '}
              <span style={{ color: '#22d3ee' }}>MultiversX</span>.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex items-center justify-center gap-3 mt-8 animate-fade-up" style={{ animationDelay: '0.16s' }}>
            <Link href="/agents" className="btn btn-primary">
              🤖 Open Agents
            </Link>
            <Link href="/economy" className="btn btn-ghost">
              💸 View Economy
            </Link>
            <a
              href="https://github.com/Gzeu/openclaw-hub"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-ghost"
            >
              ⭐ GitHub
            </a>
          </div>

          {/* Live Stats Row */}
          <div
            className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto mt-12 animate-fade-up"
            style={{ animationDelay: '0.24s' }}
          >
            {[
              { label: 'Projects',    value: String(projects.length), icon: '📦', color: '#a78bfa' },
              { label: 'Free APIs',   value: '75+',                   icon: '🔌', color: '#10d98a' },
              { label: 'Skills',      value: '15+',                   icon: '⚡', color: '#f59e0b' },
              { label: 'Network',     value: 'devnet',                icon: '🔗', color: '#22d3ee' },
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

      {/* ── QUICK NAVIGATION ─────────────────────────────────────────────── */}
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
              <span className="text-2xl transition-transform duration-200 group-hover:scale-110">
                {icon}
              </span>
              <span className="text-sm font-semibold text-white">{label}</span>
              <span className="text-[10px] leading-tight" style={{ color: 'var(--text-dim)' }}>
                {desc}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── DIVIDER ──────────────────────────────────────────────────────── */}
      <div className="max-w-[1440px] mx-auto px-6">
        <div className="flex items-center gap-3 mb-5">
          <span className="section-label">Projects · {projects.length} available</span>
          <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
          <span className="text-xs" style={{ color: 'var(--text-dim)' }}>Filter by tag below</span>
        </div>
      </div>

      {/* ── PROJECTS GRID ────────────────────────────────────────────────── */}
      <div className="max-w-[1440px] mx-auto px-6 pb-16">
        <ProjectGrid projects={projects} allTags={allTags} />
      </div>
    </div>
  );
}
