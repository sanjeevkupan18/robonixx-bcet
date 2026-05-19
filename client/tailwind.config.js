/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        space: {
          950: '#05080F',
          900: '#0B0F1A',
          800: '#111827',
          700: '#1F2A44',
          600: '#263354',
          500: '#2E3D65',
        },
        primary: {
          DEFAULT: '#5DADE2',
          light: '#85C1E9',
          dark: '#2E86C1',
        },
        accent: {
          DEFAULT: '#A29BFE',
          light: '#C4B0FF',
          dark: '#6C63FF',
        },
        glow: {
          blue: 'rgba(93,173,226,0.15)',
          violet: 'rgba(162,155,254,0.15)',
        },
      },
      fontFamily: {
        display: ['"Orbitron"', 'monospace'],
        body: ['"Syne"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      backgroundImage: {
        'grid-pattern': 'linear-gradient(rgba(93,173,226,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(93,173,226,0.05) 1px, transparent 1px)',
        'hero-gradient': 'radial-gradient(ellipse at 20% 50%, rgba(93,173,226,0.15) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(162,155,254,0.12) 0%, transparent 50%), radial-gradient(ellipse at 50% 80%, rgba(162,155,254,0.08) 0%, transparent 50%)',
        'card-gradient': 'linear-gradient(135deg, rgba(31,42,68,0.8) 0%, rgba(11,15,26,0.9) 100%)',
      },
      backgroundSize: {
        'grid': '40px 40px',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'float-delayed': 'float 6s ease-in-out 2s infinite',
        'spin-slow': 'spin 20s linear infinite',
        'glow-pulse': 'glowPulse 3s ease-in-out infinite',
        'circuit-flow': 'circuitFlow 4s linear infinite',
        'scan-line': 'scanLine 2s linear infinite',
        'flicker': 'flicker 0.15s infinite',
        'meteor': 'meteor 5s linear infinite',
        'typewriter': 'typewriter 3s steps(40) forwards',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(93,173,226,0.3), 0 0 60px rgba(93,173,226,0.1)' },
          '50%': { boxShadow: '0 0 40px rgba(93,173,226,0.6), 0 0 80px rgba(93,173,226,0.2)' },
        },
        circuitFlow: {
          '0%': { strokeDashoffset: '1000' },
          '100%': { strokeDashoffset: '0' },
        },
        scanLine: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        flicker: {
          '0%, 19%, 21%, 23%, 25%, 54%, 56%, 100%': { opacity: '1' },
          '20%, 24%, 55%': { opacity: '0.4' },
        },
        meteor: {
          '0%': { transform: 'rotate(215deg) translateX(0)', opacity: '1' },
          '70%': { opacity: '1' },
          '100%': { transform: 'rotate(215deg) translateX(-500px)', opacity: '0' },
        },
        typewriter: {
          from: { width: '0' },
          to: { width: '100%' },
        },
      },
      boxShadow: {
        'glow-blue': '0 0 20px rgba(93,173,226,0.4), 0 0 60px rgba(93,173,226,0.1)',
        'glow-violet': '0 0 20px rgba(162,155,254,0.4), 0 0 60px rgba(162,155,254,0.1)',
        'glow-sm': '0 0 10px rgba(93,173,226,0.3)',
        'glass': '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)',
        'card': '0 4px 24px rgba(0,0,0,0.4)',
      },
      backdropBlur: {
        xs: '2px',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
    },
  },
  plugins: [],
};
