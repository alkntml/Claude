"use client";
import { ArrowLeft, BookOpen, Download, FileText, Lock, MessageCircle, Sparkles } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/icons";
import { useT } from "@/i18n/client";
import { openUpgrade } from "@/lib/client";
import { DOWNLOAD_PRICE_TL, whatsappLink } from "@/lib/pricing";

interface Props {
  project: { id: string; title: string; work_type: string };
  /** Metinler sunucuda karartılmıştır (anlamsız harfler); asıl içerik bu sayfada yoktur */
  stages: { id: string; title: string; key: string; word_count: number; text: string }[];
  sources: { id: string; title: string; year: number | null; authors: unknown[] }[];
  reasons: string[];
  /** Yönetici “mevcut çalışmayı indir” hakkı tanımladıysa */
  pass: boolean;
  email: string;
  memberNo?: string;
}

const REASON: Record<string, string> = { ai_requests: "yapay zekâ kullanım hakkınız", tokens: "yapay zekâ kullanım hakkınız", cost: "yapay zekâ kullanım hakkınız", source_searches: "kaynak tarama hakkınız" };

/**
 * Kilitli çalışma görünümü (D50): aylık kullanım hakkı dolunca çalışma ve kaynaklar buğulu gösterilir.
 * İki seçenek: mevcut çalışmayı tek seferlik ücretle indirmek (WhatsApp) veya abone olup devam etmek.
 */
export function LockedProject({ project, stages, sources, reasons, pass, email, memberNo = "" }: Props) {
  const { t } = useT();
  const what = [...new Set(reasons.map((r) => REASON[r]).filter(Boolean))].map((x) => t(x)).join(t(" ve "));
  const downloadHref = whatsappLink(t("Merhaba, Academiana’da mevcut çalışmamı indirmek istiyorum ({price} TL).\nÇalışma: {title}\nÇalışma kodu: {id}\nÜye no: {no}\nHesap e-postam: {email}", { price: DOWNLOAD_PRICE_TL, title: project.title, id: project.id, email, no: memberNo }));
  const written = stages.filter((s) => s.text.trim());

  return (
    <div className="relative min-h-screen bg-ink-50/60">
      <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-ink-100 bg-white/90 px-4 py-3 backdrop-blur">
        <Link href="/panel" className="rounded-lg p-1.5 text-ink-500 hover:bg-ink-100" aria-label={t("Panele dön")}><ArrowLeft className="h-4 w-4" /></Link>
        <Logo />
        <span className="ml-2 truncate font-medium text-ink-800">{project.title}</span>
        <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700"><Lock className="h-3 w-3" /> {t("Kilitli")}</span>
      </header>

      {/* Buğulu içerik: metinler sunucuda karartıldı; seçilemez, kopyalanamaz */}
      <div aria-hidden className="pointer-events-none mx-auto grid max-w-6xl select-none gap-6 px-4 py-8 blur-[6px] lg:grid-cols-[1fr_300px]">
        <div className="space-y-6 rounded-3xl bg-white p-8 shadow-soft">
          {(written.length ? written : stages).map((s) => (
            <section key={s.id}>
              <h2 className="font-serif text-2xl text-ink-900">{s.title}</h2>
              <p className="mt-3 whitespace-pre-line font-serif text-[16px] leading-8 text-ink-700">{s.text || "…………………… …………… ………………… ………"}</p>
            </section>
          ))}
        </div>
        <aside className="space-y-2 rounded-3xl bg-white p-5 shadow-soft">
          <p className="flex items-center gap-2 font-semibold text-ink-900"><BookOpen className="h-4 w-4" /> {t("Kaynaklar")}</p>
          {sources.slice(0, 30).map((s) => <div key={s.id} className="rounded-xl border border-ink-100 p-3 text-sm text-ink-700">{s.title}{s.year ? ` (${s.year})` : ""}</div>)}
        </aside>
      </div>

      {/* Seçenekler */}
      <div className="fixed inset-0 z-20 flex items-center justify-center bg-ink-950/20 p-4">
        <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl sm:p-8">
          <div className="flex items-center gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 text-amber-600"><Lock className="h-5 w-5" /></span><div><h1 className="text-xl font-semibold text-ink-900">{t("Bu ayki kullanım hakkınız doldu")}</h1><p className="text-sm text-ink-500">{what ? t("Bu ay {what} doldu; çalışmanız ve kaynaklarınız kilitlendi.", { what }) : t("Çalışmanız ve kaynaklarınız kilitlendi.")}</p></div></div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="flex flex-col rounded-2xl border border-ink-100 p-5">
              <p className="flex items-center gap-2 font-semibold text-ink-900"><FileText className="h-4 w-4 text-brand-600" /> {t("Mevcut çalışmayı indir")}</p>
              {pass ? (
                <>
                  <p className="mt-1 flex-1 text-sm text-emerald-700">{t("İndirme hakkınız tanımlandı. Çalışmanızı aşağıdan indirebilirsiniz.")}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {(["docx", "pdf", "txt"] as const).map((f) => <a key={f} href={`/api/projects/${project.id}/export?format=${f}`} className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-ink-900 px-4 text-sm font-medium text-white hover:bg-ink-800"><Download className="h-4 w-4" />{f === "docx" ? "Word" : f.toUpperCase()}</a>)}
                  </div>
                </>
              ) : (
                <>
                  <p className="mt-1 text-3xl font-semibold text-ink-900">{DOWNLOAD_PRICE_TL} TL</p>
                  <p className="mt-1 flex-1 text-sm text-ink-500">{t("Bu çalışmanın Word / PDF dosyasını tek seferlik indirme hakkı. Ödeme WhatsApp üzerinden alınır; ödemeniz onaylanınca indirme düğmeleri burada açılır.")}</p>
                  <a href={downloadHref} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-ink-200 bg-white px-4 text-sm font-medium text-ink-900 hover:bg-ink-50"><MessageCircle className="h-4 w-4" /> {t("Mevcut çalışmayı indir — {price} TL", { price: DOWNLOAD_PRICE_TL })}</a>
                </>
              )}
            </div>
            <div className="flex flex-col rounded-2xl border-2 border-brand-400 bg-brand-50/40 p-5">
              <p className="flex items-center gap-2 font-semibold text-ink-900"><Sparkles className="h-4 w-4 text-amber-500" /> {t("Abone ol, kaldığın yerden devam et")}</p>
              <p className="mt-1 flex-1 text-sm text-ink-600">{t("Paketinizi yükselttiğinizde çalışmanız, kaynaklarınız ve tüm araçlar hemen açılır; indirme de pakete dahildir.")}</p>
              <button type="button" onClick={() => openUpgrade({ code: "work_locked", projectId: project.id, projectTitle: project.title })} className="mt-4 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-ink-900 px-4 text-sm font-medium text-white hover:bg-ink-800">{t("Abonelik seçeneklerini gör")}</button>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap items-center justify-between gap-2 text-xs text-ink-400">
            <span>{t("Çalışmanız silinmez; kilit, paketiniz yükseltildiğinde veya yeni ayda hakkınız yenilendiğinde kalkar.")}</span>
            <Link href="/panel" className="font-medium text-ink-600 hover:underline">{t("Panele dön")}</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
