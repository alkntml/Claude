"use client";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { useT } from "@/i18n/client";

export const THEME_KEY = "academiana-theme";

/** İlk boyamadan önce çalışan betik: yalnızca kullanıcı gece modunu seçtiyse koyu açılır; varsayılan gündüz modu (D169; eskiden sistem ayarı izleniyordu, D61) */
export const THEME_SCRIPT = `try{if(localStorage.getItem("${THEME_KEY}")==="dark")document.documentElement.classList.add("dark")}catch(e){}`;

/** Gece / gündüz modu düğmesi */
export function ThemeToggle({ className = "", label = false }: { className?: string; label?: boolean }) {
  const { t } = useT();
  const [dark, setDark] = useState(false);
  useEffect(() => { setDark(document.documentElement.classList.contains("dark")); }, []);
  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    try { localStorage.setItem(THEME_KEY, next ? "dark" : "light"); } catch { /* gizli pencere */ }
  }
  const text = dark ? t("Gündüz modu") : t("Gece modu");
  return (
    <button type="button" onClick={toggle} aria-label={text} title={text} className={`inline-flex items-center gap-2 rounded-lg p-2 text-ink-500 transition hover:bg-ink-100 hover:text-ink-900 ${className}`}>
      {dark ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
      {label && <span className="text-sm">{text}</span>}
    </button>
  );
}
