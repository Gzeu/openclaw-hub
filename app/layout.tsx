import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Link from 'next/link';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: {
    default: 'OpenClaw Hub — AI Agent Ecosystem',
    template: '%s | OpenClaw Hub',
  },
  description:
    'The centralized discovery, management, and agent economy platform for the OpenClaw AI ecosystem — powered by Next.js 15, MongoDB, and MultiversX.',
  keywords: ['OpenClaw', 'AI agents', 'automation', 'orchestration', 'Next.js', 'TypeScript', 'MultiversX', 'EGLD'],
  authors: [{ name: 'George Pricop', url: 'https://github.com/Gzeu' }],
  creator: 'George Pricop',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://openclaw-hub.vercel.app',
    siteName: 'OpenClaw Hub',
    title: 'OpenClaw Hub — AI Agent Ecosystem',
    description: 'Centralized discovery & management for OpenClaw AI agents.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'OpenClaw Hub — AI Agent Ecosystem',
    description: 'Centralized discovery & management for OpenClaw AI agents.',
    creator: '@Gzeu',
  },
  robots: { index: true, follow: true },
};

const NAV_LINKS = [
  { href: '/agents',      label: 'Agents',      icon: '🤖' },
  { href: '/economy',     label: 'Economy',     icon: '💸' },
  { href: '/marketplace', label: 'Market',      icon: '🛒' },
  { href: '/wallet',      label: 'Wallet',      icon: '💎' },
  { href: '/activity',    label: 'Activity',    icon: '📡' },
  { href: '/analyst',     label: 'Analyst',     icon: '🧠' },
  { href: '/skills',      label: 'Skills',      icon: '⚡' },
  { href: '/tools',       label: 'Tools',       icon: '🛠️' },
];

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} antialiased`}>
        {/* ── Sticky Nav ─────────────────────────────────────────────── */}
        <header
          style={{ background: 'rgba(8,9,14,0.85)', borderBottom: '1px solid var(--border)' }}
          className="sticky top-0 z-50 backdrop-blur-md"
        >
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 h-14 flex items-center gap-2">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-2 mr-4 group shrink-0"
            >
              <span className="text-2xl transition-transform group-hover:scale-110 duration-200">
                🦅
              </span>
              <span className="font-bold text-white tracking-tight hidden sm:block">
                OpenClaw
                <span className="text-gradient ml-1">Hub</span>
              </span>
            </Link>

            {/* Nav links */}
            <nav className="flex items-center gap-0.5 flex-1 overflow-x-auto no-scrollbar">
              {NAV_LINKS.map(({ href, label, icon }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-150"
                  style={{ color: 'var(--text-muted)' }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)';
                    (e.currentTarget as HTMLElement).style.color = 'var(--text)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.background = 'transparent';
                    (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)';
                  }}
                >
                  <span className="text-base leading-none">{icon}</span>
                  <span className="hidden md:inline">{label}</span>
                </Link>
              ))}
            </nav>

            {/* Right side */}
            <div className="flex items-center gap-2 ml-2 shrink-0">
              <a
                href="/skill.md"
                target="_blank"
                rel="noopener noreferrer"
                className="badge badge-green text-xs hidden sm:inline-flex"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-green-400"/>
                skill.md
              </a>
              <a
                href="https://github.com/Gzeu/openclaw-hub"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-ghost py-1.5 px-3 text-xs"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
                </svg>
                <span className="hidden sm:inline">GitHub</span>
              </a>
            </div>
          </div>
        </header>

        {/* ── Page content ───────────────────────────────────────────── */}
        <main>
          {children}
        </main>

        {/* ── Footer ─────────────────────────────────────────────────── */}
        <footer
          style={{ borderTop: '1px solid var(--border)' }}
          className="py-6 mt-16"
        >
          <div className="max-w-[1440px] mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
              <span>🦅</span>
              <span>OpenClaw Hub</span>
              <span style={{ color: 'var(--border)' }}>·</span>
              <span>v0.2.0</span>
            </div>
            <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--text-dim)' }}>
              <a href="/skill.md" className="hover:text-white transition-colors">skill.md</a>
              <a href="/FREE_APIS" className="hover:text-white transition-colors">Free APIs</a>
              <a href="https://github.com/Gzeu/openclaw-hub" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">GitHub</a>
              <span>MIT License</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
