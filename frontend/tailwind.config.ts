import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Plus Jakarta Sans', 'sans-serif'],
        mono: ['DM Mono', 'monospace'],
        sans: ['Plus Jakarta Sans', 'sans-serif'],
      },
      colors: {
        verdi: {
          bg: 'var(--bg-primary)',
          card: 'var(--bg-secondary)',
          input: 'var(--bg-tertiary)',
          glass: 'var(--glass-bg)',
          border: 'var(--glass-border)',
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          muted: 'var(--text-muted)',
          accent: 'var(--accent)',
          glow: 'var(--accent-glow)',
          subtle: 'var(--accent-subtle)',
        },
        credit: {
          DEFAULT: 'var(--credit)',
          hover: 'var(--credit-hover)',
          glow: 'var(--credit-glow)',
          subtle: 'var(--credit-subtle)',
          border: 'var(--credit-border)',
        },
        mode: {
          car: 'var(--mode-car)',
          moto: 'var(--mode-motorcycle)',
          bus: 'var(--mode-bus)',
          electric: 'var(--mode-electric)',
          cycling: 'var(--mode-cycling)',
          walking: 'var(--mode-walking)',
        },
      },
      boxShadow: {
        glass: 'var(--glass-shadow)',
        glow: '0 0 20px var(--accent-glow)',
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        shimmer: 'shimmer 1.5s ease-in-out infinite',
        float: 'float 6s ease-in-out infinite',
        'gradient-mesh': 'gradient-mesh 8s ease-in-out infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 10px var(--accent-glow)' },
          '50%': { boxShadow: '0 0 25px var(--accent-glow), 0 0 50px var(--accent-glow)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'gradient-mesh': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
