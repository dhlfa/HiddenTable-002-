/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        midnight: '#05070D',
        'midnight-light': '#0E1426',
        'midnight-surface': '#151C2E',
        gold: '#C8A75B',
        'gold-light': '#E3C778',
        'gold-dark': '#8B6F3A',
        cream: '#ECE4D3',
        'cream-dark': '#D4C9B0',
        blue: '#24365F',
        'blue-light': '#3B5180',
        purple: '#3B2A5E',
        'purple-light': '#5A4080',
        'purple-dark': '#241A3D',
        muted: '#9CA3AF',
        'muted-dark': '#6B7280',
      },
      fontFamily: {
        cinzel: ['Cinzel', 'serif'],
        cormorant: ['Cormorant Garamond', 'serif'],
        inter: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        gold: '0 0 30px rgba(200, 167, 91, 0.3)',
        'gold-sm': '0 0 15px rgba(200, 167, 91, 0.2)',
        'gold-lg': '0 0 50px rgba(200, 167, 91, 0.4)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'glow-pulse': 'glowPulse 3s ease-in-out infinite',
        'candle-flicker': 'candleFlicker 1.5s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { opacity: '0', transform: 'translateY(20px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        glowPulse: { '0%, 100%': { opacity: '0.6' }, '50%': { opacity: '1' } },
        candleFlicker: {
          '0%, 100%': { transform: 'scaleY(1) scaleX(1) rotate(0deg)', opacity: '0.9' },
          '25%': { transform: 'scaleY(1.1) scaleX(0.9) rotate(-1deg)', opacity: '1' },
          '50%': { transform: 'scaleY(0.95) scaleX(1.05) rotate(1deg)', opacity: '0.85' },
          '75%': { transform: 'scaleY(1.05) scaleX(0.95) rotate(-0.5deg)', opacity: '0.95' },
        },
      },
    },
  },
  plugins: [],
};
