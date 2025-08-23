/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ], theme: {
    extend: {
      colors: {
        primaryText: '#25314C', // custom global text color
      },
    },
  },
  plugins: [],
}

