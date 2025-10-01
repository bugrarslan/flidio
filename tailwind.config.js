/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#f0f9ff",
          500: "#3b82f6",
          600: "#2563eb",
          900: "#1e3a8a",
        },
        secondary: {
          50: "#f8fafc",
          500: "#64748b",
          600: "#475569",
        },
        dark: {
          primary: {},
          secondary: {}
        }
      },
    },
  },
  plugins: [],
};
