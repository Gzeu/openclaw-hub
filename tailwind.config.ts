import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {},
  },
  // Safelist critical utility classes used in inline styles / dynamic classes
  safelist: [
    'animate-fade-up',
    'animate-glow-pulse',
    'animate-float',
    'card', 'card-glow',
    'btn', 'btn-primary', 'btn-ghost',
    'badge', 'badge-green', 'badge-accent', 'badge-amber', 'badge-red', 'badge-cyan',
    'input',
    'section-label',
    'text-gradient',
    'skeleton',
    'mono',
  ],
  plugins: [],
};

export default config;
