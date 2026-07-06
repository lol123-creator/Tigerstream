import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Tiger Editorial palette - warm charcoal-brown ground, ember-orange
        // accent. Named after the site's own name rather than a generic
        // "primary/secondary" scheme.
        accent: {
          DEFAULT: '#D85A30', // ember
          hover: '#B84725',
        },
        surface: {
          DEFAULT: '#17140F', // ink (warm near-black, not cool/blue-black)
          card: '#221E17', // ink-card
        },
      },
      fontFamily: {
        // Display face for hero titles / big headings - a characterful
        // serif to give the editorial-magazine feel. Body/UI stays on
        // Inter (utility face) for readability at small sizes.
        display: ['var(--font-fraunces)', 'Georgia', 'serif'],
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(to top, rgb(23,20,15) 0%, transparent 60%)',
        'card-shine': 'linear-gradient(135deg, transparent 40%, rgba(255,255,255,0.04) 50%, transparent 60%)',
        // Signature element: the tiger-stripe divider. Used sparingly -
        // one accent bar under the nav, not repeated as decoration
        // throughout the site.
        'tiger-stripe':
          'repeating-linear-gradient(90deg, #D85A30 0px, #D85A30 18px, transparent 18px, transparent 26px)',
      },
      boxShadow: {
        glow: '0 0 20px rgba(216,90,48,0.15)',
        'glow-lg': '0 0 30px rgba(216,90,48,0.3)',
      },
    },
  },
  plugins: [],
};

export default config;
