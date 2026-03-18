/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        nova: {
          950: "#040308",
          900: "#08060f",
          800: "#120d1f",
          700: "#1d1530",
          600: "#2a1f45",
          500: "#3d2d68",
          400: "#5b44a0",
          300: "#7b61c8",
          200: "#a28ce6",
        },
        gold: {
          500: "#ffaa00",
          400: "#ffbf33",
          300: "#ffd966",
        },
      },
      fontFamily: {
        display: ["Syne", "sans-serif"],
      },
    },
  },
  plugins: [],
}
