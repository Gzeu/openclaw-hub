import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ConvexClientProvider from "@/providers/ConvexClientProvider";
import MultiversXProvider from "@/providers/MultiversXProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "OpenClaw Hub",
  description: "AI Agent Orchestration & Crypto Escrow",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ConvexClientProvider>
          <MultiversXProvider>
            <main className="min-h-screen bg-gray-50 text-gray-900">
              {/* Vom adăuga header-ul cu butonul de login aici în pasul următor */}
              {children}
            </main>
          </MultiversXProvider>
        </ConvexClientProvider>
      </body>
    </html>
  );
}
