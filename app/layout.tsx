import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Link from 'next/link';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: 'OpenClaw Hub — Discover AI Agent Projects',
    template: '%s | OpenClaw Hub',
  },
  description:
    'The centralized discovery and management platform for OpenClaw AI agent projects. Browse featured projects, explore by tags, and get started with the OpenClaw ecosystem.',
  keywords: ['OpenClaw', 'AI agents', 'automation', 'orchestration', 'Next.js', 'TypeScript', 'MultiversX', 'EGLD'],
  authors: [{ name: 'George Pricop', url: 'https://github.com/Gzeu' }],
  creator: 'George Pricop',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://openclaw-hub.vercel.app',
    siteName: 'OpenClaw Hub',
    title: 'OpenClaw Hub — Discover AI Agent Projects',
    description:
      'The centralized discovery and management platform for OpenClaw AI agent projects.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'OpenClaw Hub — Discover AI Agent Projects',
    description:
      'The centralized discovery and management platform for OpenClaw AI agent projects.',
    creator: '@Gzeu',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <nav className="border-b border-gray-800 bg-gray-950 px-6 py-3 flex items-center gap-6 text-sm">
          <Link href="/" className="font-bold text-white text-base mr-4">
            🦅 OpenClaw Hub
          </Link>
          <Link href="/agents" className="text-gray-400 hover:text-white transition-colors">
            Agents
          </Link>
          <Link href="/economy" className="text-gray-400 hover:text-white transition-colors">
            Economy
          </Link>
          <Link href="/wallet" className="text-gray-400 hover:text-white transition-colors">
            Wallet
          </Link>
          <Link href="/activity" className="text-gray-400 hover:text-white transition-colors">
            Activity
          </Link>
          <Link href="/analyst" className="text-gray-400 hover:text-white transition-colors">
            Analyst
          </Link>
          <Link href="/project" className="text-gray-400 hover:text-white transition-colors">
            Projects
          </Link>
          <div className="ml-auto flex items-center gap-4">
            <a
              href="/skill.md"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-green-400 hover:text-green-300 border border-green-800 hover:border-green-600 px-2 py-1 rounded transition-colors"
            >
              skill.md
            </a>
            <a
              href="https://github.com/Gzeu/openclaw-hub"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-gray-300 transition-colors"
            >
              GitHub
            </a>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}
