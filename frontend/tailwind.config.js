/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./index.html",
  ],
  theme: {
    extend: {
      fontFamily: {
        eloquia: ['Eloquia Text', 'sans-serif'], // Add Eloquia Text font
      },
      backgroundImage: {
        'standard-blue': 'linear-gradient(94deg, #60a5fa 7.46%, #93c5fd 103.56%)',
        'premium-blue': 'linear-gradient(94deg, #1e40af 7.46%, #3b82f6 103.56%)',
        'custom-image': "url('./public/images/bg-base.webp')",
      },
      scrollbar:{
        width: '8px',
        track: 'bg-gray-100',
        thumb: 'bg-gray-500 rounded-md',}
    },
  },
  plugins: [require('tailwind-scrollbar'),],
  variants: {
    scrollbar: ['rounded'], // Allows rounded scrollbar styling
  },
}