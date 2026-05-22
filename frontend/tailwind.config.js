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
        fin: {
          dark: '#0f172a',       // Slate 900
          cardDark: '#1e293b',   // Slate 800
          borderDark: '#334155', // Slate 700
          light: '#f8fafc',      // Slate 50
          cardLight: '#ffffff',
          borderLight: '#e2e8f0', // Slate 200
          emerald: '#10b981',    // Emerald 500
          emeraldHover: '#059669',
          violet: '#8b5cf6',     // Violet 500
          rose: '#f43f5e',       // Rose 500
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}
