import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
        surface: {
          DEFAULT: "#ffffff",
          muted: "#f8fafc",
          subtle: "#f1f5f9",
          dark: "#0f172a",
          "dark-muted": "#1e293b",
          "dark-subtle": "#334155",
        },
        ink: {
          DEFAULT: "#0f172a",
          muted: "#475569",
          soft: "#94a3b8",
          dark: "#f1f5f9",
          "dark-muted": "#cbd5e1",
          "dark-soft": "#94a3b8",
        },
        line: {
          DEFAULT: "#e2e8f0",
          strong: "#cbd5e1",
          dark: "#334155",
          "dark-strong": "#475569",
        },
        accent: {
          DEFAULT: "#059669",
          hover: "#047857",
          soft: "#ecfdf5",
        },
        brand: {
          50: "#eef2ff",
          100: "#e0e7ff",
          200: "#c7d2fe",
          400: "#818cf8",
          500: "#6366f1",
          600: "#4f46e5",
          700: "#3730a3",
          800: "#312e81",
          900: "#1e1b4b",
        },
        warning: {
          DEFAULT: "#d97706",
          hover: "#b45309",
          soft: "#fffbeb",
        },
      },
      boxShadow: {
        soft: "0 1px 2px 0 rgb(15 23 42 / 0.04), 0 1px 3px 0 rgb(15 23 42 / 0.06)",
        card: "0 1px 2px 0 rgb(15 23 42 / 0.04)",
        pop: "0 10px 30px -10px rgb(15 23 42 / 0.2), 0 4px 12px -4px rgb(15 23 42 / 0.08)",
        brand: "0 8px 24px -8px rgb(79 70 229 / 0.35)",
      },
      borderRadius: {
        xl: "0.875rem",
        "2xl": "1.125rem",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(4px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in": "fade-in 150ms ease-out",
        "slide-up": "slide-up 200ms ease-out",
      },
    },
  },
  plugins: [],
};
export default config;