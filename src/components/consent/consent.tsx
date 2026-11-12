"use client";
import { useT } from "@/i18n/client";
import { useEffect, useState } from "react";
import Link from "@/components/l-link";
import { Button } from "@/components/ui/button";
import { hasConsent, needsConsentBanner, readConsent, requiresConsent, TECHNOLOGIES, writeConsent, type ConsentCategory, type ConsentChoice } from "@/lib/consent";

function useConsent(): ConsentChoice | null {
  const [c, setC] = useState<ConsentChoice | null>(null);
  useEffect(() => {
    const read = () => setC(readConsent());
    read();
    window.addEventListener("acd-consent", read);
    return () => window.removeEventListener("acd-consent", read);
  }, []);
  return c;
}

/** İzin gerektiren bir teknolojiyi sarar: kullanıcı o kategoriye izin verene kadar içerik (ör. betik) hiç oluşturulmaz */
export function ConsentGate({ category, children }: { category: ConsentCategory; children: React.ReactNode }) {
  const c = useConsent();
  if (c == null || !hasConsent(category, c)) return null;
  return <>{children}</>;
}

/**
 * Çerez izin şeridi (D154): yalnızca envanterde önceden izin gerektiren bir teknoloji varsa görünür.
 * Bugün böyle bir teknoloji olmadığından hiçbir şey göstermez ve çerez yazmaz.
 */
export function ConsentBanner() {
  const { t } = useT();
  const c = useConsent();
  if (!needsConsentBanner() || c == null) return null;
  const cats = [...new Set(TECHNOLOGIES.map((x) => x.category).filter(requiresConsent))];
  if (cats.every((k) => typeof c[k] === "boolean")) return null;
  const set = (v: boolean) => writeConsent(Object.fromEntries(cats.map((k) => [k, v])));
  return (
    <div role="dialog" aria-live="polite" aria-label={t("Çerez tercihleri")} className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-2xl rounded-2xl border border-ink-100 bg-white p-4 shadow-lg sm:inset-x-6">
      <p className="text-sm text-ink-700">{t("Zorunlu olmayan çerezleri yalnızca izninizle kullanırız.")} <Link href="/cerez-politikasi" className="text-brand-700 hover:underline">{t("Çerez Politikası")}</Link></p>
      <div className="mt-3 flex flex-wrap justify-end gap-2">
        <Button variant="secondary" size="sm" onClick={() => set(false)}>{t("Yalnızca zorunlu")}</Button>
        <Button size="sm" onClick={() => set(true)}>{t("İzin ver")}</Button>
      </div>
    </div>
  );
}
