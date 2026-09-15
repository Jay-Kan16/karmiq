/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#effcf4",
          100: "#dff9e8",
          200: "#bff2d1",
          300: "#8ee6b3",
          400: "#50d78c",
          500: "#20bf6b",
          600: "#16a85b",
          700: "#12874b",
          800: "#126b3e",
          900: "#105835"
        }
      },
      boxShadow: {
        soft: "0 10px 35px rgba(15, 23, 42, 0.07)"
      }
    }
  },
  plugins: []
};