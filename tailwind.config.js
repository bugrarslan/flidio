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
        "background-light": "#f8fafc",
        "background-dark": "#020617",
        "card-light": "rgba(255, 255, 255, 0.92)",
        "card-dark": "rgba(15, 23, 42, 0.9)",
        "border-light": "rgba(148, 163, 184, 0.25)",
        "border-dark": "rgba(94, 106, 128, 0.35)",
        "text-primary-light": "#0f172a",
        "text-primary-dark": "#e2e8f0",
        "text-secondary-light": "#475569",
        "text-secondary-dark": "#94a3b8",
        "accent-light": "rgba(59, 130, 246, 0.15)",
        "accent-dark": "rgba(37, 99, 235, 0.28)",
        "input-background-light": "rgba(255, 255, 255, 0.92)",
        "input-background-dark": "rgba(30, 41, 59, 0.9)",
        "input-placeholder-light": "#94a3b8",
        "input-placeholder-dark": "#64748b",
        "accent-text-light": "#2563eb",
        "accent-text-dark": "#93c5fd",
        "accent-text-muted-light": "rgba(37, 99, 235, 0.75)",
        "accent-text-muted-dark": "rgba(147, 197, 253, 0.85)",
      },
    },
  },
  plugins: [],
};
