/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#09090B',
        panel: '#121216',
        elevated: '#18181F',
        border: '#27272F',
        primary: '#8B5CF6',
        secondary: '#6366F1',
        success: '#22C55E',
        warning: '#F59E0B',
        error: '#EF4444',
      },
      boxShadow: {
        soft: '0 10px 25px rgba(15, 23, 42, 0.35)',
      },
    },
  },
  plugins: [],
}

