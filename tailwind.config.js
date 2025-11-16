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
            white: "#ffffff",
          },
          icon: {
            accent: "#2563eb",
            muted: "#475569",
            secondary: "#cbd5f5",
            danger: "#dc2626",
            success: "#22c55e",
            warning: "#f59e0b",
            tip: "#bfdbfe",
          },
          button: {
            primary: "#2563eb",
            secondary: "#ffffff",
            secondaryBorder: "rgba(37, 99, 235, 0.3)",
          },
          status: {
            success: {
              bg: "rgba(34, 197, 94, 0.1)",
              text: "#22c55e",
            },
            warning: {
              bg: "rgba(245, 158, 11, 0.1)",
              text: "#f59e0b",
            },
            danger: {
              bg: "rgba(220, 38, 38, 0.15)",
              text: "#dc2626",
            },
            info: {
              bg: "rgba(37, 99, 235, 0.1)",
              text: "#2563eb",
            },
            gray: {
              bg: "rgba(107, 114, 128, 0.1)",
              text: "#6b7280",
            },
          },
          switch: {
            trackOff: "#cbd5f5",
            trackOn: "#2563eb",
            thumb: "#f8fafc",
          },
          tip: {
            background: "rgba(30, 58, 138, 0.9)",
            border: "rgba(30, 58, 138, 0.6)",
            heading: "#ffffff",
            body: "rgba(239, 246, 255, 0.9)",
            link: "#eff6ff",
          },
          vibe: {
            active: {
              bg: "rgba(37, 99, 235, 0.1)",
              border: "#2563eb",
            },
            inactive: {
              bg: "#ffffff",
              border: "rgba(37, 99, 235, 0.2)",
            },
          },
          chip: {
            active: {
              bg: "rgba(37, 99, 235, 0.1)",
              border: "#2563eb",
            },
            inactive: {
              bg: "#ffffff",
              border: "rgba(37, 99, 235, 0.2)",
            },
          },
          modal: {
            background: "#ffffff",
          },
          onboarding: {
            background: "#1e3a8a",
            circlePrimary: "rgba(37, 99, 235, 0.6)",
            circleSecondary: "rgba(59, 130, 246, 0.45)",
            cardBorder: "rgba(255, 255, 255, 0.15)",
            cardBackground: "rgba(255, 255, 255, 0.1)",
            iconWrapper: "rgba(37, 99, 235, 0.6)",
          },
          socialButton: {
            google: "#ffffff",
            googleBorder: "#d1d5db",
            googleText: "#374151",
            apple: "#000000",
            appleBorder: "#1f2937",
            appleText: "#ffffff",
          },
          divider: {
            line: "rgba(148, 163, 184, 0.25)",
            text: "#475569",
          },
          error: {
            text: "#dc2626",
            border: "#f87171",
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
            white: "#ffffff",
          },
          icon: {
            accent: "#60a5fa",
            muted: "#94a3b8",
            secondary: "#cbd5f5",
            danger: "#f87171",
            success: "#22c55e",
            warning: "#f59e0b",
            tip: "#93c5fd",
          },
          button: {
            primary: "#2563eb",
            secondary: "rgba(15, 23, 42, 0.9)",
            secondaryBorder: "rgba(94, 106, 128, 0.35)",
          },
          status: {
            success: {
              bg: "rgba(34, 197, 94, 0.15)",
              text: "#22c55e",
            },
            warning: {
              bg: "rgba(245, 158, 11, 0.15)",
              text: "#f59e0b",
            },
            danger: {
              bg: "rgba(248, 113, 113, 0.2)",
              text: "#f87171",
            },
            info: {
              bg: "rgba(37, 99, 235, 0.15)",
              text: "#60a5fa",
            },
            gray: {
              bg: "rgba(107, 114, 128, 0.15)",
              text: "#9ca3af",
            },
          },
          switch: {
            trackOff: "#1f2937",
            trackOn: "#2563eb",
            thumb: "#f1f5f9",
          },
          tip: {
            background: "rgba(15, 23, 42, 0.9)",
            border: "rgba(94, 106, 128, 0.35)",
            heading: "#e2e8f0",
            body: "#94a3b8",
            link: "#e2e8f0",
          },
          vibe: {
            active: {
              bg: "rgba(37, 99, 235, 0.2)",
              border: "#3b82f6",
            },
            inactive: {
              bg: "rgba(15, 23, 42, 0.9)",
              border: "rgba(94, 106, 128, 0.35)",
            },
          },
          chip: {
            active: {
              bg: "rgba(37, 99, 235, 0.2)",
              border: "#3b82f6",
            },
            inactive: {
              bg: "rgba(15, 23, 42, 0.9)",
              border: "rgba(94, 106, 128, 0.35)",
            },
          },
          modal: {
            background: "rgba(15, 23, 42, 0.9)",
          },
          onboarding: {
            background: "#020617",
            circlePrimary: "rgba(37, 99, 235, 0.35)",
            circleSecondary: "rgba(59, 130, 246, 0.35)",
            cardBorder: "rgba(94, 106, 128, 0.35)",
            cardBackground: "rgba(15, 23, 42, 0.8)",
            iconWrapper: "rgba(37, 99, 235, 0.3)",
          },
          socialButton: {
            google: "#252525",
            googleBorder: "#1f2937",
            googleText: "#ffffff",
            apple: "#ffffff",
            appleBorder: "#e5e7eb",
            appleText: "#111827",
          },
          divider: {
            line: "rgba(94, 106, 128, 0.35)",
            text: "#64748b",
          },
          error: {
            text: "#f87171",
            border: "#f87171",
          },
        },
      },
    },
  },
  plugins: [],
};
