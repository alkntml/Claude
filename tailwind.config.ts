import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        ink: { 50: "#f6f7fb", 100: "#eceef6", 200: "#d6daea", 300: "#b0b7d3", 400: "#8089b0", 500: "#5c6590", 600: "#454d74", 700: "#353b5c", 800: "#232740", 900: "#151829", 950: "#0b0d18" },
        brand: { 50: "#eef4ff", 100: "#dbe7ff", 200: "#bcd2ff", 300: "#8db3ff", 400: "#5a89fb", 500: "#3a64f2", 600: "#2747dc", 700: "#2038b2", 800: "#20338c", 900: "#1f2f6f" },
        amberx: { 400: "#f5b84b", 500: "#e89e1f" },
        sage: { 400: "#4fc7a1", 500: "#23a983" },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "Georgia", "serif"],
      },
      borderRadius: { "2xl": "1.1rem", "3xl": "1.6rem" },
      boxShadow: {
        soft: "0 1px 2px rgb(16 24 40 / 0.04), 0 8px 24px -6px rgb(16 24 40 / 0.10)",
        glow: "0 0 0 1px rgb(58 100 242 / 0.25), 0 10px 40px -10px rgb(58 100 242 / 0.45)",
      },
      keyframes: {
        shimmer: { "0%": { backgroundPosition: "-400px 0" }, "100%": { backgroundPosition: "400px 0" } },
      },
      animation: { shimmer: "shimmer 1.6s linear infinite" },
    },
  },
  plugins: [],
} satisfies Config;
