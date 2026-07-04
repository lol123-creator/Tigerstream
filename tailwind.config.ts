import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        accent: {
          DEFAULT: '#f59e0b',
          hover: '#d97706',
        },
        surface: {
          DEFAULT: '#0f1014',
          card: '#1a1b23',
        },
      },
      fontFamily: {
        display: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(to top, rgb(15,16,20) 0%, transparent 60%)',
        'card-shine': 'linear-gradient(135deg, transparent 40%, rgba(255,255,255,0.04) 50%, transparent 60%)',
      },
      boxShadow: {
        glow: '0 0 20px rgba(245,158,11,0.15)',
        'glow-lg': '0 0 30px rgba(245,158,11,0.3)',
      },
    },
  },
  plugins: [],
};

export default config;
