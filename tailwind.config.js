/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          0: '#000000',
          50: '#0a0a0a',
          100: '#111111',
          150: '#1a1a1a',
          200: '#222222',
        },
        text: {
          primary: '#f0f0f0',
          secondary: '#888888',
        },
        line: {
          subtle: 'rgba(255,255,255,0.10)',
          softer: 'rgba(255,255,255,0.08)',
          stronger: 'rgba(255,255,255,0.15)',
        },
        accent: {
          steel: '#2a3a4a',
          silver: '#aaaaaa',
        },
        neon: {
          // legacy (kept for backward compat)
          cyan: '#22d3ee',
          blue: '#60a5fa',
          purple: '#a78bfa',
        },
        // Pantone-inspired palette (2024 refresh)
        peri: {
          DEFAULT: '#7e7bd9',  // 17-3938 Very Peri
          50: '#f1f0fb',
          100: '#dad8f3',
          200: '#b3b1e6',
          300: '#8d8bda',
          400: '#7e7bd9',
          500: '#6663b8',
          600: '#534f96',
          700: '#403d72',
          800: '#2c2a4e',
          900: '#191728',
        },
        mango: {
          DEFAULT: '#d69c2f',  // 13-0859 Mango Mojito
          400: '#e6b554',
          500: '#d69c2f',
          600: '#a87822',
        },
        ink: {
          0: '#000000',
          50: '#0a0d12',  // new bg base (Black 6 inspired)
          100: '#0f1218',
          150: '#161922',
          200: '#1f2230',
        },
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(255,255,255,0.10), 0 0 32px rgba(255,255,255,0.10)',
        glowStrong:
          '0 0 0 1px rgba(255,255,255,0.14), 0 0 40px rgba(255,255,255,0.14), 0 0 90px rgba(42,58,74,0.20)',
        neon:
          '0 0 0 1px rgba(34,211,238,0.18), 0 0 34px rgba(96,165,250,0.20), 0 0 90px rgba(167,139,250,0.16)',
      },
      backgroundImage: {
        'soft-radial':
          'radial-gradient(800px circle at 10% 10%, rgba(42,58,74,0.22), transparent 55%), radial-gradient(700px circle at 90% 30%, rgba(255,255,255,0.08), transparent 60%), radial-gradient(600px circle at 70% 90%, rgba(42,58,74,0.18), transparent 55%)',
        'grid-faint':
          'linear-gradient(to right, rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.06) 1px, transparent 1px)',
      },
      keyframes: {
        floaty: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        blink: {
          '0%, 49%': { opacity: '1' },
          '50%, 100%': { opacity: '0' },
        },
        drift: {
          '0%': { transform: 'translate3d(-3%, -2%, 0) scale(1)' },
          '50%': { transform: 'translate3d(3%, 2%, 0) scale(1.05)' },
          '100%': { transform: 'translate3d(-3%, -2%, 0) scale(1)' },
        },
      },
      animation: {
        floaty: 'floaty 6s ease-in-out infinite',
        shimmer: 'shimmer 10s ease-in-out infinite',
        blink: 'blink 1s step-end infinite',
        drift: 'drift 14s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
