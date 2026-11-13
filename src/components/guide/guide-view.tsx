"use client";
/** Kullanım rehberi görünümü (D142): arama, bölüm içindekiler, adım adım makaleler ve paket rozetleri. */
import { BookOpen, ChevronDown, Download, FileText, FlaskConical, Lightbulb, MapPin, PenLine, Rocket, Search, ShieldCheck, User, Users, Wrench } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { cn } from "@/components/ui/cn";
import { useT } from "@/i18n/client";
import { FEATURE_MIN_PLAN } from "@/lib/features";
import type { Locale } from "@/i18n/core";
import { GUIDE, QUICK_START, guideText, type GuideIcon, type L } from "@/lib/guide";

const ICONS: Record<GuideIcon, typeof Rocket> = { rocket: Rocket, file: FileText, pen: PenLine, book: BookOpen, shield: ShieldCheck, flask: FlaskConical, users: Users, download: Download, user: User, wrench: Wrench };
const PLAN_NAME: Record<string, string> = { basic: "Basic", pro: "Pro", premium: "Premium" };
const fold = (s: string) => s.toLocaleLowerCase("tr").normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/ı/g, "i");

export function GuideView({ locale }: { locale: Locale }) {
  const { t } = useT();
  const L = (x: L) => guideText(x, locale);
  const [q, setQ] = useState("");
  const [openIds, setOpenIds] = useState<Set<string>>(new Set());

  // Adresteki #bolum-makale çıpasıyla doğrudan ilgili makaleyi aç
  useEffect(() => {
    const h = decodeURIComponent(window.location.hash.slice(1));
    if (!h) return;
    setOpenIds(new Set([h]));
    setTimeout(() => document.getElementById(h)?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
  }, []);

  const query = fold(q.trim());
  const chapters = useMemo(() => GUIDE.map((c) => ({
    ...c,
    articles: c.articles.filter((a) => !query || fold([a.title, a.where, ...a.steps, a.tip].filter(Boolean).map((x) => L(x as L)).join(" ")).includes(query)),
  })).filter((c) => c.articles.length), [query]); // eslint-disable-line react-hooks/exhaustive-deps
  const total = chapters.reduce((n, c) => n + c.articles.length, 0);
  const toggle = (id: string) => setOpenIds((s) => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n; });

  return (
    <div className="grid gap-10 lg:grid-cols-[240px_minmax(0,1fr)]">
      <aside className="hidden lg:block">
        <nav className="sticky top-28 space-y-1 text-[13.5px]" aria-label={t("Rehber bölümleri")}>
          <a href="#hizli-baslangic" className="block rounded-lg px-3 py-1.5 font-medium text-brand-700 hover:bg-brand-50">{t("Hızlı başlangıç")}</a>
          {GUIDE.map((c) => { const I = ICONS[c.icon]; return (
            <a key={c.id} href={`#${c.id}`} className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-ink-600 hover:bg-ink-100/70 hover:text-ink-900"><I className="h-4 w-4 text-ink-400" />{L(c.title)}</a>
          ); })}
        </nav>
      </aside>

      <div className="min-w-0 space-y-10">
        <section id="hizli-baslangic" className="scroll-mt-28 rounded-3xl border border-brand-100 bg-gradient-to-b from-brand-50/80 to-white p-5 sm:p-7">
          <p className="text-[12px] font-semibold uppercase tracking-wider text-brand-700">{t("Yeni misiniz? Buradan başlayın")}</p>
          <h2 className="mt-1 font-serif text-2xl font-semibold tracking-tight text-ink-900">{t("6 adımda ilk çalışmanız")}</h2>
          <ol className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {QUICK_START.map((x, i) => (
              <li key={i} className="flex gap-3 rounded-2xl border border-ink-100 bg-white p-4">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-600 text-[13px] font-semibold text-white">{i + 1}</span>
                <span className="min-w-0"><span className="block font-medium text-ink-900">{L(x.title)}</span><span className="mt-0.5 block text-[13.5px] leading-relaxed text-ink-600">{L(x.text)}</span></span>
              </li>
            ))}
          </ol>
          <p className="mt-4 flex items-start gap-2 text-[13.5px] text-ink-600"><Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />{t("Çalışma alanında sağ üstteki “?” simgesi, ekran üzerinde adım adım gezdiren “Rehberli tur”u başlatır. Asistana “Nereden grafik oluşturabilirim?” gibi kullanım soruları da sorabilirsiniz.")}</p>
        </section>

        <div className="sticky top-20 z-10 -mx-1 bg-[rgb(var(--bg))]/90 px-1 py-2 backdrop-blur">
          <label className="flex items-center gap-2 rounded-2xl border border-ink-200 bg-white px-4 py-2.5 shadow-soft focus-within:border-brand-400">
            <Search className="h-4 w-4 text-ink-400" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("Rehberde ara: ör. grafik, PDF, ortak yazar, kaynakça…")} aria-label={t("Rehberde ara")} className="min-w-0 flex-1 bg-transparent text-[15px] text-ink-900 outline-none" />
            {q && <span className="shrink-0 text-[12.5px] text-ink-500">{t("{n} sonuç", { n: total })}</span>}
          </label>
        </div>

        {chapters.length === 0 && <p className="rounded-2xl bg-ink-50 p-5 text-ink-600">{t("Aramanızla eşleşen konu bulunamadı. Farklı bir kelime deneyin veya Sık sorulan sorular sayfasına bakın.")}</p>}

        {chapters.map((c) => { const I = ICONS[c.icon]; return (
          <section key={c.id} id={c.id} className="scroll-mt-28">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-50 text-brand-700"><I className="h-5 w-5" /></span>
              <div><h2 className="!mt-0 font-serif text-2xl font-semibold tracking-tight text-ink-900">{L(c.title)}</h2><p className="text-[14px] text-ink-500">{L(c.intro)}</p></div>
            </div>
            <div className="mt-4 divide-y divide-ink-100 overflow-hidden rounded-2xl border border-ink-100 bg-white">
              {c.articles.map((a) => {
                const id = `${c.id}-${a.id}`;
                const open = !!query || openIds.has(id);
                const plan = a.plan ? FEATURE_MIN_PLAN[a.plan] : null;
                return (
                  <article key={a.id} id={id} className="scroll-mt-28">
                    <button onClick={() => toggle(id)} aria-expanded={open} className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition hover:bg-ink-50/70 sm:px-5">
                      <span className="min-w-0 flex-1 font-medium text-ink-900">{L(a.title)}</span>
                      {plan && plan !== "free" && <span className="shrink-0 rounded-full bg-violet-50 px-2 py-0.5 text-[11px] font-semibold text-violet-700">{t("{p} ve üstü", { p: PLAN_NAME[plan] ?? plan })}</span>}
                      <ChevronDown className={cn("h-4 w-4 shrink-0 text-ink-400 transition", open && "rotate-180")} />
                    </button>
                    {open && (
                      <div className="px-4 pb-5 sm:px-5">
                        {a.where && <p className="mb-3 inline-flex items-start gap-1.5 rounded-lg bg-ink-50 px-2.5 py-1.5 text-[13px] text-ink-700"><MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-600" /><span><b className="font-semibold">{t("Nerede:")}</b> {L(a.where)}</span></p>}
                        <ol className="space-y-2">
                          {a.steps.map((st, i) => (
                            <li key={i} className="flex gap-3 text-[14.5px] leading-relaxed text-ink-700">
                              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-ink-900 text-[11px] font-semibold text-white">{i + 1}</span>
                              <span className="min-w-0">{L(st)}</span>
                            </li>
                          ))}
                        </ol>
                        {a.tip && <p className="mt-3 flex gap-2 rounded-xl border border-amber-200 bg-amber-50/70 p-3 text-[13.5px] leading-relaxed text-amber-900"><Lightbulb className="mt-0.5 h-4 w-4 shrink-0" />{L(a.tip)}</p>}
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          </section>
        ); })}
      </div>
    </div>
  );
}
