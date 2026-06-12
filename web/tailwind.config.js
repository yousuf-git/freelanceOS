/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
        },
        secondary: {
          50: '#ecfeff',
          100: '#cffafe',
          200: '#a5f3fc',
          300: '#67e8f9',
          400: '#22d3ee',
          500: '#06b6d4',
          600: '#0891b2',
          700: '#0e7490',
          800: '#155e75',
          900: '#164e63',
        },
        accent: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
      },
      fontFamily: {
        // Public / editorial marketing site
        serif: ['Fraunces', 'Georgia', 'serif'],
        // Dashboard product (FED.md)
        display: ['Satoshi', 'Sora', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      fontSize: {
        'money-sm': ['13px', { lineHeight: '1.4', fontWeight: '500' }],
        'money-base': ['15px', { lineHeight: '1.4', fontWeight: '500' }],
        'money-lg': ['20px', { lineHeight: '1.3', fontWeight: '600' }],
        'money-xl': ['24px', { lineHeight: '1.2', fontWeight: '700' }],
        'money-2xl': ['30px', { lineHeight: '1.1', fontWeight: '700' }],
        'money-3xl': ['36px', { lineHeight: '1', fontWeight: '700' }],
      },
      borderRadius: {
        card: '8px',
        modal: '12px',
      },
      boxShadow: {
        card: '0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.04)',
        'card-hover': '0 4px 6px -1px rgb(0 0 0 / 0.08), 0 2px 4px -2px rgb(0 0 0 / 0.05)',
        modal: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.08)',
      },
      keyframes: {
        pulse_value: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6', color: '#0f766e' },
        },
        slide_in: {
          from: { transform: 'translateY(-8px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        fade_in: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        danger_glow: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgb(220 38 38 / 0)' },
          '50%': { boxShadow: '0 0 0 4px rgb(220 38 38 / 0.15)' },
        },
      },
      animation: {
        pulse_value: 'pulse_value 0.4s cubic-bezier(0.2, 0, 0, 1)',
        slide_in: 'slide_in 250ms ease-out',
        fade_in: 'fade_in 200ms ease-out',
        danger_glow: 'danger_glow 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
