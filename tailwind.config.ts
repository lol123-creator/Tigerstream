import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Raisin Black -> Midnight Blue palette. `surface` is the
        // Raisin Black end - every bg-surface/from-surface/via-surface
        // utility across the app (sticky bars, hero fades, row edge
        // fades, cards) pulls from this single token, so changing it
        // here keeps everything visually consistent with the new page
        // gradient instead of hunting down each hardcoded hex.
        accent: {
          DEFAULT: '#7FB8D9',
          hover: '#5FA0C7',
        },
        surface: {
          DEFAULT: '#242124',
          card: '#2b282c',
        },
        midnight: '#003366',
      },
      fontFamily: {
        display: ['var(--font-jakarta)', 'system-ui', 'sans-serif'],
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(to top, rgb(36,33,36) 0%, transparent 60%)',
        'card-shine': 'linear-gradient(135deg, transparent 40%, rgba(255,255,255,0.03) 50%, transparent 60%)',
        'ambient-glow':
          'radial-gradient(60% 60% at 50% 40%, rgba(127,184,217,0.16) 0%, transparent 70%)',
        // The site-wide background: Raisin Black at the top easing
        // into Midnight Blue by the bottom of the page.
        'app-gradient':
          'linear-gradient(180deg, #242124 0%, #201f2c 30%, #12233c 65%, #003366 100%)',
      },
      boxShadow: {
        glow: '0 0 20px rgba(127,184,217,0.15)',
        'glow-lg': '0 0 30px rgba(127,184,217,0.28)',
      },
    },
  },
  plugins: [],
};

export default config;
