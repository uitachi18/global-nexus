/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'nexus-bg-dark': '#0D0D0D',
        'nexus-bg-light': '#1A1A1A',
        'nexus-neon-lime': '#CCFF00',
        'nexus-red': '#FF3333',
        'nexus-yellow': '#FFCC00',
      },
      fontFamily: {
        sans: ['Space Grotesk', 'Orbitron', 'Syncopate', 'sans-serif'],
      },
      backgroundImage: {
        'neon-border': 'linear-gradient(to right, #CCFF00, #CCFF00)',
      }
    },
  },
  plugins: [],
}
