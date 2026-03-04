import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Link from 'next/link';
import './globals.css';
import ConvexClientProvider from '@/components/ConvexProvider';
import MultiversXProvider from '@/components/MultiversXProvider';
import Navbar from '@/components/Navbar';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'OpenClaw Hub — AI Agent Ecosystem',
    template: '%s | OpenClaw Hub',
  },
  description:
    'The centralized discovery, management, and agent economy platform for the OpenClaw AI ecosystem — powered by Next.js 15, Convex, and MultiversX.',
  keywords: ['OpenClaw', 'AI agents', 'automation', 'orchestration', 'Next.js', 'TypeScript', 'MultiversX', 'EGLD'],
  authors: [{ name: 'George Pricop', url: 'https://github.com/Gzeu' }],
  creator: 'George Pricop',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://openclaw-hub-ashen.vercel.app',
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

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`dark ${inter.variable}`}>
      <body
        className="antialiased min-h-screen"
        style={{ background: 'var(--bg)', color: 'var(--text)', fontFamily: 'var(--font-inter, system-ui, sans-serif)' }}
      >
        <MultiversXProvider>
          <Navbar />
          <main style={{ minHeight: 'calc(100vh - 56px)' }}>
            <ConvexClientProvider>
              {children}
            </ConvexClientProvider>
          </main>
          <footer style={{ borderTop: '1px solid var(--border)' }} className="py-6 mt-16">
            <div className="max-w-[1440px] mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                <span>🦅</span>
                <span>OpenClaw Hub</span>
                <span style={{ color: 'var(--border)' }}>·</span>
                <span>v0.3.0</span>
                <span style={{ color: 'var(--border)' }}>·</span>
                <span>MIT</span>
              </div>
              <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--text-dim)' }}>
                <Link href="/profile" className="hover:text-white transition-colors">👤 Profile</Link>
                <Link href="/plugins" className="hover:text-white transition-colors">🧩 Plugins</Link>
                <Link href="/settings" className="hover:text-white transition-colors">⚙️ Settings</Link>
                <Link href="/qa" className="hover:text-white transition-colors">FAQ</Link>
                <a href="/skill.md" className="hover:text-white transition-colors">skill.md</a>
                <a href="/api/skills" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">API</a>
                <a href="https://github.com/Gzeu/openclaw-hub" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">GitHub</a>
              </div>
            </div>
          </footer>
        </MultiversXProvider>
      </body>
    </html>
  );
}
