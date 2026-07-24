@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --font-display: 'Segoe UI', system-ui, sans-serif;
  --font-sans: 'Segoe UI', system-ui, sans-serif;
}

html {
  scroll-behavior: smooth;
}

body {
  @apply text-white antialiased;
  background-color: #1c1a1e;
  position: relative;
}

/* Screen-locked gradient. This is a `position: fixed` pseudo-element,
   not a body background-image - it always covers the full viewport
   no matter how far you scroll or how tall the page is, so there's
   never a flat/gray stretch below the fold. Sized to 120% (inset:
   -10%) and given a slow drift animation so it moves without ever
   exposing an edge. Sits at z-index -1, behind all real content. */
body::before {
  content: '';
  position: fixed;
  inset: -10%;
  z-index: -1;
  pointer-events: none;
  background-image:
    radial-gradient(ellipse 60% 50% at 20% 20%, rgba(0, 51, 102, 0.55), transparent 60%),
    radial-gradient(ellipse 55% 45% at 80% 25%, rgba(127, 184, 217, 0.20), transparent 60%),
    radial-gradient(ellipse 60% 55% at 25% 80%, rgba(0, 51, 102, 0.50), transparent 60%),
    radial-gradient(ellipse 55% 50% at 88% 85%, rgba(36, 33, 36, 0.65), transparent 60%),
    linear-gradient(135deg, #242124 0%, #1a2436 35%, #123058 65%, #003366 100%);
  background-repeat: no-repeat;
  animation: gradientDrift 22s ease-in-out infinite alternate;
}

@keyframes gradientDrift {
  0% { transform: translate3d(0, 0, 0) scale(1.05); }
  50% { transform: translate3d(-2.5%, 1.5%, 0) scale(1.08); }
  100% { transform: translate3d(2%, -1.5%, 0) scale(1.05); }
}

.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

@keyframes dropdown-in {
  from {
    opacity: 0;
    transform: translateY(-4px) scale(0.96);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.animate-dropdown-in {
  animation: dropdown-in 0.15s ease-out forwards;
}

@keyframes season-dropdown-in {
  from {
    opacity: 0;
    transform: translateY(-8px) scaleY(0.95);
    filter: blur(4px);
  }
  60% {
    opacity: 1;
    filter: blur(0px);
  }
  to {
    opacity: 1;
    transform: translateY(0) scaleY(1);
    filter: blur(0px);
  }
}

.animate-season-dropdown {
  animation: season-dropdown-in 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}


@keyframes fadeSlide {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-fadeIn {
  animation: fadeIn 0.3s ease-out both;
}

/* Hero: slow background drift so the backdrop feels alive */
@keyframes kenburns {
  from { transform: scale(1) translate(0, 0); }
  to { transform: scale(1.05) translate(-1%, -1%); }
}

/* Hero: staggered text entrance, each element passes its own delay
   via inline style */
@keyframes heroRise {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Intro splash: wordmark reveal + underline draw-in */
@keyframes introReveal {
  from { opacity: 0; transform: translateY(10px) scale(0.98); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

@keyframes introLine {
  from { opacity: 0; transform: scaleX(0); }
  to { opacity: 1; transform: scaleX(1); }
}

/* Scroll-reveal: used on the genres page (and reusable elsewhere).
   A parent gets `.reveal-grid`, direct children fade + rise into
   place once `.is-visible` is toggled on by IntersectionObserver.
   Each child can set `--i` inline for a staggered delay. */
.reveal-grid > * {
  opacity: 0;
  transform: translateY(22px);
  transition: opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1),
    transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
  transition-delay: calc(var(--i, 0) * 45ms);
}

.reveal-grid.is-visible > * {
  opacity: 1;
  transform: translateY(0);
}

@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }

  .reveal-grid > * {
    opacity: 1;
    transform: none;
  }

  body::before {
    animation: none;
  }

  .reveal-grid > * {
    opacity: 1;
    transform: none;
  }
}
