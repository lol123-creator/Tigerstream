import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Frosted Minimal palette - neutral charcoal ground, one calm
        // sky-blue accent. Restraint is the point: no stripe motifs,
        // no warm/editorial tones - just clean, quiet, precise.
        accent: {
          DEFAULT: '#7FB8D9',
          hover: '#5FA0C7',
        },
        surface: {
          DEFAULT: '#121316',
          card: '#1A1B1F',
        },
      },
      fontFamily: {
        // Clean geometric sans for headings, used with tighter tracking
        // rather than a loud display face - matches the minimal brief.
        display: ['var(--font-jakarta)', 'system-ui', 'sans-serif'],
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(to top, rgb(18,19,22) 0%, transparent 60%)',
        'card-shine': 'linear-gradient(135deg, transparent 40%, rgba(255,255,255,0.03) 50%, transparent 60%)',
        // Signature element for this direction: a soft ambient glow,
        // not a bold motif - the "frosted" feeling comes from blur and
        // restraint rather than a graphic device.
        'ambient-glow':
          'radial-gradient(60% 60% at 50% 40%, rgba(127,184,217,0.16) 0%, transparent 70%)',
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
