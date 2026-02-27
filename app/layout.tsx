import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: 'OpenClaw Hub — Discover AI Agent Projects',
    template: '%s | OpenClaw Hub',
  },
  description:
    'The centralized discovery and management platform for OpenClaw AI agent projects. Browse featured projects, explore by tags, and get started with the OpenClaw ecosystem.',
  keywords: ['OpenClaw', 'AI agents', 'automation', 'orchestration', 'Next.js', 'TypeScript'],
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
      <body className={inter.className}>{children}</body>
    </html>
  );
}
