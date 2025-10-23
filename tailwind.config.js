/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./utils/**/*.{js,ts,jsx,tsx}",
    "./context/**/*.{js,ts,jsx,tsx}",
    "./hooks/**/*.{js,ts,jsx,tsx}"
  ],
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
        light: {
          background: "#f8fafc",
          surface: "rgba(255, 255, 255, 0.92)",
          card: "rgba(255, 255, 255, 0.92)",
          border: "rgba(148, 163, 184, 0.25)",
          accent: "rgba(59, 130, 246, 0.15)",
          input: {
            background: "rgba(255, 255, 255, 0.92)",
            placeholder: "#94a3b8",
          },
          text: {
            primary: "#0f172a",
            secondary: "#475569",
            accent: "#2563eb",
            accentMuted: "rgba(37, 99, 235, 0.75)",
          },
        },
        dark: {
          background: "#020617",
          surface: "rgba(15, 23, 42, 0.9)",
          card: "rgba(15, 23, 42, 0.9)",
          border: "rgba(94, 106, 128, 0.35)",
          accent: "rgba(37, 99, 235, 0.28)",
          input: {
            background: "rgba(30, 41, 59, 0.9)",
            placeholder: "#64748b",
          },
          text: {
            primary: "#e2e8f0",
            secondary: "#94a3b8",
            accent: "#93c5fd",
            accentMuted: "rgba(147, 197, 253, 0.85)",
          },
        },
      },
    },
  },
  plugins: [],
};
