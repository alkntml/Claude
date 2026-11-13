import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Gece modu (D61): ink tonları CSS değişkeni; .dark sınıfında ters çevrilir
        ink: Object.fromEntries([50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950].map((k) => [k, `rgb(var(--ink-${k}) / <alpha-value>)`])),
        // D156: krem marka ölçeği — açık tonlar krem dolgu (düğme, rozet, vurgu), koyu tonlar okunur karamel-kahve (bağlantı, yazı)
        brand: { 50: "#fdfaf3", 100: "#faf3e4", 200: "#f3e5c7", 300: "#e9d4a7", 400: "#dabe87", 500: "#c4a066", 600: "#8c6b3a", 700: "#6f5430", 800: "#574126", 900: "#3f2f1b", 950: "#2a1f12" },
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
        glow: "0 0 0 1px rgb(196 160 102 / 0.3), 0 10px 40px -10px rgb(140 107 58 / 0.35)",
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
