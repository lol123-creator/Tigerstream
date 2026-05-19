import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: '#0a0a0c',
          raised: '#121216',
          card: '#1a1a20',
        },
        accent: {
          DEFAULT: '#f59e0b',
          hover: '#fbbf24',
          muted: '#d97706',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'hero-gradient':
          'linear-gradient(to top, #0a0a0c 0%, transparent 45%, rgba(10,10,12,0.4) 100%)',
        'card-shine':
          'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, transparent 50%)',
      },
    },
  },
  plugins: [],
};

export default config;
