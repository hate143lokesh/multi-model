/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        construct: {
          dark: '#0B0F19',
          card: '#111827',
          panel: '#1F2937',
          border: '#374151',
          accent: '#F97316', // Safety Orange
          gold: '#F59E0B',   // Construction Yellow
          cyan: '#06B6D4',
          emerald: '#10B981',
          rose: '#EF4444',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      }
    },
  },
  plugins: [],
}
