/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      boxShadow: {
        glow: '0 0 0 1px rgba(139, 92, 246, 0.2), 0 20px 60px rgba(96, 165, 250, 0.12)',
      },
      colors: {
        ink: '#08090D',
        panel: '#11131B',
        accent: '#8B5CF6',
        accentSoft: '#60A5FA',
        border: '#272936',
      },
    },
  },
  plugins: [],
};
