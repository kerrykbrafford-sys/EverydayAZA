/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#1c4a36',
          light: '#e9f0ec',
          gold: '#e4a94a',
          cream: '#faf3e6',
        },
      },
      fontFamily: {
        display: ['Playfair Display', 'serif'],
        body: ['Plus Jakarta Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
