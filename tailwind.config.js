/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        mono: ['"Share Tech Mono"', '"Courier New"', 'monospace'],
      },
      animation: {
        'flicker': 'flicker 3s infinite',
        'cardGlow': 'cardGlow 3s ease-in-out infinite',
        'timerPulse': 'timerPulse 1s ease-in-out infinite',
        'pulse-slow': 'pulse 4s ease-in-out infinite',
        'fade-in': 'fade-in 0.3s ease-out',
        'zoom-in': 'zoom-in 0.3s ease-out',
        'slide-in-from-bottom-5': 'slide-in-from-bottom-5 0.3s ease-out',
      },
      keyframes: {
        flicker: {
          '0%': { opacity: '0.9', textShadow: '3px 3px 0 #f0f, -2px -2px 0 #0ff' },
          '50%': { opacity: '1', textShadow: '2px 2px 0 #0ff, -1px -1px 0 #f0f' },
          '100%': { opacity: '0.9', textShadow: '3px 3px 0 #f0f, -2px -2px 0 #0ff' },
        },
        cardGlow: {
          '0%': { boxShadow: '0 0 20px rgba(0, 255, 255, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(0, 255, 255, 0.6)' },
          '100%': { boxShadow: '0 0 20px rgba(0, 255, 255, 0.3)' },
        },
        timerPulse: {
          '0%': { textShadow: '0 0 5px #0f0' },
          '50%': { textShadow: '0 0 15px #0f0' },
          '100%': { textShadow: '0 0 5px #0f0' },
        },
        pulse: {
          '0%': { transform: 'scale(1)', opacity: '0.3' },
          '50%': { transform: 'scale(1.3)', opacity: '0.6' },
          '100%': { transform: 'scale(1)', opacity: '0.3' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'zoom-in': {
          from: { transform: 'scale(0.95)', opacity: '0' },
          to: { transform: 'scale(1)', opacity: '1' },
        },
        'slide-in-from-bottom-5': {
          from: { transform: 'translate(-50%, 20px)', opacity: '0' },
          to: { transform: 'translate(-50%, 0)', opacity: '1' },
        },
      }
    },
  },
  plugins: [],
}
