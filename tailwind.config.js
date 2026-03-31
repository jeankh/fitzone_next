/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    
    "./app/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#09090b',
        surface: {
          DEFAULT: '#141416',
          elevated: '#18181b',
          muted: '#27272a',
        },
        brand: {
          DEFAULT: '#BF0536',
          light: '#FF1744',
          dark: '#8B0025',
          darker: '#6b001c',
        },
        accent: {
          purple: '#8b5cf6',
          green: '#22c55e',
          yellow: '#fbbf24',
        },
        text: {
          primary: '#ffffff',
          secondary: 'rgba(255, 255, 255, 0.6)',
          muted: 'rgba(255, 255, 255, 0.4)',
        },
        border: {
          DEFAULT: 'rgba(255, 255, 255, 0.06)',
          hover: 'rgba(255, 255, 255, 0.1)',
          active: 'rgba(191, 5, 54, 0.3)',
        }
      },
      fontFamily: {
        cairo: ['Cairo', 'sans-serif'],
        tajawal: ['Tajawal', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '24px',
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 2s infinite',
        'fade-in': 'fadeIn 0.6s ease-out forwards',
        'slide-up': 'slideUp 0.6s ease-out forwards',
        'scale-in': 'scaleIn 0.4s ease-out forwards',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 4px 24px rgba(37, 211, 102, 0.4)' },
          '50%': { boxShadow: '0 4px 32px rgba(37, 211, 102, 0.6), 0 0 0 8px rgba(37, 211, 102, 0.1)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
}
