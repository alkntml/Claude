"use client";
import { LanguageSwitch, useT } from "@/i18n/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "@/components/l-link";
import { Logo } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/client";
import { createBrowser } from "@/lib/supabase/browser";
import { legalDoc, type LegalDocId } from "@/lib/legal/docs";

/**
 * Sözleşme onayı (D154). Kullanım Koşulları için ayrı ve zorunlu kabul kutusu; KVKK Aydınlatma Metni yalnızca bilgilendirmedir
 * (kabul/rıza kutusu yoktur, gösterildiği kaydedilir). Pazarlama izni istenmez (pazarlama iletisi gönderilmiyor).
 */
export function ConsentForm({ next, docs, email }: { next: string; docs: LegalDocId[]; email: string }) {
  const { t, locale } = useT();
  const router = useRouter();
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const all = docs.every((d) => checked[d]);

  async function submit() {
    if (!all) { setError(t("Devam etmek için Kullanım Koşulları’nı kabul edin.")); return; }
    setBusy(true); setError(null);
    try {
      await api("/api/legal/accept", { method: "POST", json: { accept: docs, notice: ["kvkk"] } });
      router.replace(next);
      router.refresh();
    } catch (e) { setError((e as Error).message); setBusy(false); }
  }
  async function signOut() {
    await createBrowser().auth.signOut().catch(() => {});
    window.location.href = "/";
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="mb-8 flex items-center justify-center gap-4"><Link href="/"><Logo variant="full" className="!h-14" /></Link><LanguageSwitch /></div>
        <div className="card p-6 sm:p-8">
          <h1 className="text-2xl font-semibold tracking-tight text-ink-900">{t("Devam etmeden önce")}</h1>
          <p className="mt-2 text-sm text-ink-500">{t("Academiana’yı kullanmak için güncel Kullanım Koşulları’nı kabul etmeniz gerekiyor. Belgeler yeni sekmede açılır.")}</p>
          {email && <p className="mt-1 text-xs text-ink-400">{t("Hesap")}: {email}</p>}
          <div className="mt-6 space-y-4">
            {docs.map((id) => {
              const d = legalDoc(id);
              return (
                <label key={id} className="flex items-start gap-3 rounded-xl border border-ink-100 p-3 text-[14px] text-ink-700">
                  <input type="checkbox" checked={!!checked[id]} onChange={(e) => setChecked((c) => ({ ...c, [id]: e.target.checked }))} className="mt-0.5 h-4 w-4 shrink-0 rounded border-ink-300 text-brand-600" />
                  <span><Link href={d.path} target="_blank" className="font-medium text-brand-700 hover:underline">{d.title[locale]}</Link> {t("metnini okudum ve kabul ediyorum.")} <span className="text-ink-400">({t("zorunlu")})</span></span>
                </label>
              );
            })}
            <p className="rounded-xl bg-ink-50 p-3 text-[13px] leading-relaxed text-ink-600">
              {t("Kişisel verilerinizin işlenmesi hakkında bilgi:")} <Link href="/kvkk" target="_blank" className="font-medium text-brand-700 hover:underline">{t("KVKK Aydınlatma Metni")}</Link>. {t("Bu metin bilgilendirme amaçlıdır; onay veya açık rıza yerine geçmez.")}{" "}
              {t("Diğer metinler:")} <Link href="/adil-kullanim" target="_blank" className="text-brand-700 hover:underline">{t("Adil Kullanım Politikası")}</Link> · <Link href="/cerez-politikasi" target="_blank" className="text-brand-700 hover:underline">{t("Çerez Politikası")}</Link> · <Link href="/akademik-durustluk" target="_blank" className="text-brand-700 hover:underline">{t("Akademik Dürüstlük")}</Link>
            </p>
          </div>
          {error && <p className="mt-4 rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
            <Button variant="ghost" onClick={signOut}>{t("Kabul etmeden çıkış yap")}</Button>
            <Button onClick={submit} loading={busy} disabled={!all}>{t("Kabul et ve devam et")}</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
