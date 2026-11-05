"use client";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

/**
 * Sayfa görüntüleme sayacı (D90): çerez kullanmaz, kişisel veri göndermez. Tarayıcıda “izleme yapma”
 * (Do Not Track / Global Privacy Control) açıksa hiç çalışmaz.
 */
export function Analytics() {
  const path = usePathname();
  const last = useRef<string | null>(null);
  useEffect(() => {
    if (!path || last.current === path) return;
    last.current = path;
    const nav = navigator as Navigator & { globalPrivacyControl?: boolean };
    if (nav.doNotTrack === "1" || nav.globalPrivacyControl) return;
    const q = new URLSearchParams(window.location.search);
    const body = JSON.stringify({
      path, referrer: document.referrer || null, locale: document.documentElement.lang,
      utm_source: q.get("utm_source"), utm_medium: q.get("utm_medium"), utm_campaign: q.get("utm_campaign"),
    });
    fetch("/api/public/track", { method: "POST", headers: { "Content-Type": "application/json" }, body, keepalive: true }).catch(() => {});
  }, [path]);
  return null;
}
