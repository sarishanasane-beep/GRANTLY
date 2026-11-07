/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: 'rgb(var(--background) / <alpha-value>)',
        surface: {
          DEFAULT: 'rgb(var(--surface) / <alpha-value>)',
          muted: 'rgb(var(--surface-muted) / <alpha-value>)',
          elevated: 'rgb(var(--surface-elevated) / <alpha-value>)',
        },
        primary: {
          DEFAULT: 'rgb(var(--primary) / <alpha-value>)',
          hover: 'rgb(var(--primary-hover) / <alpha-value>)',
          light: '#70F5C5',
          dark: '#00A87A',
        },
        secondary: {
          DEFAULT: 'rgb(var(--secondary) / <alpha-value>)',
          hover: 'rgb(var(--secondary-hover) / <alpha-value>)',
          light: '#EBD787',
          dark: '#B89F3A',
        },
        text: {
          DEFAULT: 'rgb(var(--text) / <alpha-value>)',
        },
        muted: {
          DEFAULT: 'rgb(var(--muted) / <alpha-value>)',
        },
        border: {
          DEFAULT: 'rgb(var(--border) / <alpha-value>)',
        },
        success: {
          DEFAULT: 'rgb(var(--success) / <alpha-value>)',
        },
        warning: {
          DEFAULT: 'rgb(var(--warning) / <alpha-value>)',
        },
        danger: {
          DEFAULT: 'rgb(var(--danger) / <alpha-value>)',
        },
        // Dedicated visual palette tokens
        grantly: {
          black: '#0B0F0D',
          dark: '#1F2A1F',
          forest: '#3E5A3F',
          sage: '#8CA98C',
          champagne: '#D9C7A3',
          gold: '#B08D57',
        },
        forest: {
          void: '#0B0F0D',
          depth: '#141C14',
          card: '#1F2A1F',
          cardHover: '#2D3E2E',
          border: '#263427',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'Sora', 'sans-serif'],
        accent: ['Sora', 'sans-serif'],
      },
      boxShadow: {
        'glow-emerald': '0 0 25px -5px rgba(16, 185, 129, 0.25)',
        'glow-gold': '0 0 25px -5px rgba(212, 175, 55, 0.25)',
        'inner-glow': 'inset 0 1px 1px 0 rgba(255, 255, 255, 0.08)',
        'card-dark': '0 10px 30px -10px rgba(0, 0, 0, 0.5), 0 0 1px 1px rgba(16, 185, 129, 0.1)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'forest-sheen': 'linear-gradient(135deg, rgba(16,185,129,0.15) 0%, rgba(212,175,55,0.05) 50%, rgba(4,13,10,0) 100%)',
        'gold-shimmer': 'linear-gradient(90deg, transparent, rgba(230,202,101,0.2), transparent)',
      },
      screens: {
        'xs': '360px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1440px',
      },
    },
  },
  plugins: [],
}
