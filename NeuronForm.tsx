@import 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400;1,500&family=JetBrains+Mono:wght@300;400;500&family=Space+Grotesk:wght@300;400;500;600;700&family=Cinzel:wght@400;500;600;700&display=swap';
@import "tailwindcss";

@theme {
  --font-serif: 'Cormorant Garamond', Georgia, serif;
  --font-mono: 'JetBrains Mono', 'Courier New', monospace;
  --font-sans: 'Space Grotesk', system-ui, sans-serif;
  --font-display: 'Cormorant Garamond', serif;

  --color-bg: #04060d;
  --color-bg-alt: #070b18;
  --color-cyan-glow: #5ee3ff;
  --color-amber-glow: #ffb547;
  --color-rose-glow: #ff7a9c;
  --color-violet-glow: #b388ff;
  --color-green-glow: #6eeb9b;

  --color-text-primary: #eaf6ff;
  --color-text-secondary: #a8c0d8;
  --color-text-muted: #5a7088;
  --color-text-dark: #2a3a4a;

  --color-border-glow: rgba(94, 227, 255, 0.12);
}

@layer base {
  body {
    @apply bg-bg text-text-primary font-mono antialiased;
  }

  body::after {
    content: "";
    @apply fixed inset-0 pointer-events-none z-0;
    background: 
      radial-gradient(ellipse 80% 60% at 50% 40%, rgba(40, 120, 180, 0.1), transparent 70%),
      linear-gradient(to right, rgba(255,255,255,0.02) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(255,255,255,0.02) 1px, transparent 1px);
    background-size: 100% 100%, 40px 40px, 40px 40px;
  }
}

@layer components {
  .panel {
    @apply fixed bg-[rgba(10,16,30,0.85)] border border-border-glow backdrop-blur-xl z-40 shadow-2xl;
  }

  .btn-icon {
    @apply w-10 h-10 bg-[rgba(10,16,30,0.85)] border border-border-glow text-text-secondary flex items-center justify-center transition-all hover:border-[rgba(94,227,255,0.28)] hover:text-cyan-glow backdrop-blur-md cursor-pointer;
  }

  .modal-overlay {
    @apply fixed inset-0 bg-[rgba(4,6,13,0.88)] backdrop-blur-sm z-50 flex items-center justify-center p-4;
  }

  .input-base {
    @apply w-full bg-[rgba(4,6,13,0.5)] border border-border-glow text-text-primary font-mono text-sm px-4 py-2 outline-none transition-all focus:border-cyan-glow;
  }

  .perspective-1000 {
    perspective: 1000px;
  }

  .preserve-3d {
    transform-style: preserve-3d;
  }

  .backface-hidden {
    backface-visibility: hidden;
  }
}

/* Custom animations from original code */
@keyframes chkFlash {
  0% { transform: scale(1); }
  50% { transform: scale(1.4); box-shadow: 0 0 16px rgba(255, 181, 71, 0.6); }
  100% { transform: scale(1); }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

