import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Gece modu (D61): ink tonları CSS değişkeni; .dark sınıfında ters çevrilir
        ink: Object.fromEntries([50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950].map((k) => [k, `rgb(var(--ink-${k}) / <alpha-value>)`])),
        brand: { 50: "#eef2ff", 100: "#e0e7ff", 200: "#c7d2fe", 300: "#a5b4fc", 400: "#818cf8", 500: "#6366f1", 600: "#4f46e5", 700: "#4338ca", 800: "#3730a3", 900: "#312e81" },
        amberx: { 400: "#f5b84b", 500: "#e89e1f" },
        sage: { 400: "#4fc7a1", 500: "#23a983" },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "Georgia", "serif"],
      },
      borderRadius: { "2xl": "1.1rem", "3xl": "1.6rem" },
      boxShadow: {
        // D148: daha hafif gölge (ince çizgi + çok yumuşak derinlik)
        soft: "0 1px 2px rgb(16 24 40 / 0.04), 0 4px 14px -6px rgb(16 24 40 / 0.06)",
        glow: "0 0 0 1px rgb(99 102 241 / 0.25), 0 10px 40px -10px rgb(99 102 241 / 0.45)",
      },
      keyframes: {
        shimmer: { "0%": { backgroundPosition: "-400px 0" }, "100%": { backgroundPosition: "400px 0" } },
        rise: { "0%": { opacity: "0", transform: "translateY(14px)" }, "100%": { opacity: "1", transform: "none" } },
        drift: { "0%, 100%": { transform: "translate3d(0,0,0)" }, "50%": { transform: "translate3d(40px,30px,0)" } },
        progress: { "0%": { transform: "translateX(-100%)" }, "100%": { transform: "translateX(250%)" } },
      },
      animation: {
        shimmer: "shimmer 1.6s linear infinite",
        // Yalnızca CSS: sayfa JavaScript yüklenmeden görünür ve canlanır (D57)
        rise: "rise .6s cubic-bezier(.22,1,.36,1) both",
        drift: "drift 20s ease-in-out infinite",
        progress: "progress 1.1s ease-in-out infinite",
      },
    },
  },
  plugins: [],
} satisfies Config;
