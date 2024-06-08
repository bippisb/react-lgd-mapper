/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "amaranth": "#CE4257",
        "amaranth-lighter": "#D96D7D",
        "amaranth-stronger": "#C33248",
        "amaranth-strongest": "#A22A3C",
        "raspberry-rose": "#A53860",
        "raspberry-rose-lighter": "#C14975",
      }
    },
  },
  plugins: [],
}

