"use client";
import { useT } from "@/i18n/client";
import { motion } from "framer-motion";
import { AlertOctagon, ArrowLeft, BookOpenCheck, Check, CheckCircle2, ChevronDown, CircleDashed, Info, Languages, ListChecks, Repeat2, ScanSearch, ShieldAlert, Sparkles, TriangleAlert, XCircle } from "lucide-react";
import Link from "next/link";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/components/ui/cn";
import { Badge, Empty } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/toast";
import { api } from "@/lib/client";
import type { CheckItem } from "@/lib/quality/checklist";
import { CHAIN_LEVEL_LABEL, type ChainItem } from "@/lib/quality/consistency-chain";
import { penaltyByCategory, SEVERITY_WEIGHTS } from "@/lib/quality/score";

/* eslint-disable @typescript-eslint/no-explicit-any */
const CAT: Record<string, { label: string; icon: any }> = {
  language: { label: "Akademik dil ve anlatım", icon: Languages },
  consistency: { label: "Bilimsel tutarlılık", icon: ScanSearch },
  alignment: { label: "Soru–yöntem–hipotez uyumu", icon: ListChecks },
  citations: { label: "Atıf ve kaynakça", icon: BookOpenCheck },
  sources: { label: "Kaynak doğrulanabilirliği", icon: ShieldAlert },
  structure: { label: "Eksik bölümler ve yapı", icon: AlertOctagon },
  repetition: { label: "Tekrarlanan ifadeler", icon: Repeat2 },
  data: { label: "Kullanıcı verisi gereken alanlar", icon: TriangleAlert },
};
// D171: uyarı seviyeleri Kritik / Önemli / İyileştirme (yalnızca etiket; puan ağırlıkları değişmez)
const SEV = { error: { label: "Kritik", tone: "red" as const }, warning: { label: "Önemli", tone: "amber" as const }, info: { label: "İyileştirme", tone: "ink" as const } };
const CHAIN_TONE = { critical: "red" as const, important: "amber" as const, improvement: "ink" as const };

export function QualityView({ project, initial, stages, checklist = [], chain = [], dismissed: dismissed0 = [] }: { project: any; initial: any; stages: any[]; checklist?: CheckItem[]; chain?: ChainItem[]; dismissed?: string[] }) {
  const { t } = useT();
  const toast = useToast();
  const [report, setReport] = useState<any>(initial);
  const [loading, setLoading] = useState(false);
  const [withAi, setWithAi] = useState(true);
  const stageByKey = Object.fromEntries(stages.map((s) => [s.key, s]));
  // D173 (referans 10.2): kullanıcı bir öneriyi reddedebilir; tercih projeye kaydedilir (ortak yazarlar da görür), geri alınabilir
  const [dismissed, setDismissed] = useState<string[]>(dismissed0);
  const [showDismissed, setShowDismissed] = useState(false);
  const chainKey = (c: ChainItem) => `${c.title}|${c.stageKey ?? ""}`;
  async function setDismiss(next: string[]) {
    const prev = dismissed;
    setDismissed(next);
    try { await api(`/api/projects/${project.id}`, { method: "PATCH", json: { context: { dismissedChecks: next.slice(-200) } } }); }
    catch (e) { setDismissed(prev); toast({ tone: "error", title: t("Kaydedilemedi"), detail: (e as Error).message }); }
  }
  const visibleChain = chain.filter((c) => !dismissed.includes(chainKey(c)));
  const hiddenChain = chain.filter((c) => dismissed.includes(chainKey(c)));

  // D178: kontrol bitince ekran doğrudan sonuca gider
  const resultRef = useRef<HTMLDivElement | null>(null);
  async function run() {
    setLoading(true);
    try {
      setReport((await api<{ report: any }>(`/api/projects/${project.id}/quality`, { method: "POST", json: { withAi } })).report);
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
    }
    catch (e) { toast({ tone: "error", title: t("Kontrol yapılamadı"), detail: (e as Error).message }); }
    finally { setLoading(false); }
  }

  const r = report?.report;
  const score = report?.score ?? 0;
  const lost: Record<string, number> = r ? penaltyByCategory(r.issues) : {};
  const maxLost = Math.max(1, ...Object.values(lost));
  const [showMethod, setShowMethod] = useState(false);
  const groups = r ? Object.keys(CAT).map((k) => ({ k, items: r.issues.filter((i: any) => i.category === k) })).filter((g) => g.items.length) : [];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-8">
      <Link href={`/proje/${project.id}`} className="inline-flex items-center gap-1.5 text-sm text-ink-500 hover:text-ink-900"><ArrowLeft className="h-4 w-4" /> {project.title}</Link>
      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-4xl font-medium tracking-tight text-ink-950">{t("Akademik kalite kontrolü")}</h1>
          <p className="mt-1 text-ink-500">{t("Dil, tutarlılık, atıf ve kaynak kontrolleri. Kural tabanlı kontroller her zaman çalışır; yapay zekâ incelemesi mantıksal bütünlüğü değerlendirir.")}</p>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-ink-600"><input type="checkbox" checked={withAi} onChange={(e) => setWithAi(e.target.checked)} /> <Sparkles className="h-4 w-4 text-brand-500" /> {t("Yapay zekâ incelemesi")}</label>
          <Button onClick={run} loading={loading}>{report ? t("Yeniden kontrol et") : t("Kontrolü başlat")}</Button>
        </div>
      </div>

      {!report && !loading && <div className="mt-10"><Empty icon={<ListChecks className="h-5 w-5" />} title={t("Henüz kontrol yapılmadı")}>{t("Çalışmanızın tüm bölümleri ve kaynakları birlikte değerlendirilir.")}</Empty></div>}
      {loading && <div className="mt-10 grid gap-4 md:grid-cols-3">{[0, 1, 2].map((i) => <div key={i} className="skeleton h-32" />)}</div>}

      {r && !loading && (
        <>
          <div ref={resultRef} className="mt-8 grid scroll-mt-6 gap-4 md:grid-cols-[260px_1fr]">
            <div className="card flex flex-col items-center justify-center p-6">
              <div className="relative">
                <svg width="150" height="150" className="-rotate-90"><circle cx="75" cy="75" r="64" strokeWidth="11" className="fill-none stroke-ink-100" /><motion.circle cx="75" cy="75" r="64" strokeWidth="11" strokeLinecap="round" className={cn("fill-none", score >= 80 ? "stroke-emerald-500" : score >= 60 ? "stroke-amber-400" : "stroke-rose-500")} style={{ strokeDasharray: 402 }} initial={{ strokeDashoffset: 402 }} animate={{ strokeDashoffset: 402 - (402 * score) / 100 }} transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }} /></svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center"><span className="text-4xl font-semibold">{score}</span><span className="text-xs text-ink-400">/ 100</span></div>
              </div>
              <p className="mt-3 text-center text-sm text-ink-500">{new Date(r.generatedAt).toLocaleString("tr-TR")}</p>
              {r.aiReview?.error && <p className="mt-2 text-center text-xs text-amber-700">{r.aiReview.error}</p>}
            </div>
            <div className="card p-5">
              <h2 className="text-sm font-semibold text-ink-900">{t("Kategorilere göre sonuç")}</h2>
              <p className="text-[12.5px] text-ink-500">{t("Her kategoride düşülen puan; çubuk ne kadar kısaysa o kadar iyi.")}</p>
              <ul className="mt-3 space-y-2" role="list">
                {Object.keys(CAT).map((k) => {
                  const v = lost[k] ?? 0;
                  const n = r.issues.filter((i: any) => i.category === k).length;
                  const C = CAT[k];
                  return (
                    <li key={k} className="grid grid-cols-[minmax(0,11rem)_1fr_auto] items-center gap-3 text-[13px]" title={n ? t("{n} bulgu, −{v} puan", { n, v }) : t("Sorun bulunmadı")}>
                      <span className="flex min-w-0 items-center gap-1.5 truncate text-ink-700"><C.icon className="h-3.5 w-3.5 shrink-0 text-ink-400" />{t(C.label)}</span>
                      <span className="h-2.5 rounded-full bg-ink-100">{v > 0 && <motion.span className="block h-2.5 rounded-full bg-brand-500" initial={{ width: 0 }} animate={{ width: `${Math.max(4, (v / maxLost) * 100)}%` }} transition={{ duration: 0.8 }} />}</span>
                      {v > 0 ? <span className="w-16 text-right font-medium tabular-nums text-ink-800">−{v}</span> : <span className="flex w-16 items-center justify-end gap-1 text-emerald-700"><CheckCircle2 className="h-3.5 w-3.5" />{t("Tamam")}</span>}
                    </li>
                  );
                })}
              </ul>
              <div className="mt-4 grid grid-cols-3 gap-2 border-t border-ink-100 pt-3">
                {(["error", "warning", "info"] as const).map((sv) => {
                  const I = sv === "error" ? XCircle : sv === "warning" ? TriangleAlert : Info;
                  return <div key={sv} className="flex items-center gap-2"><I className={cn("h-4 w-4", sv === "error" ? "text-rose-600" : sv === "warning" ? "text-amber-600" : "text-ink-400")} /><span className="text-lg font-semibold tabular-nums text-ink-900">{r.issues.filter((i: any) => i.severity === sv).length}</span><span className="text-[12px] text-ink-500">{t(SEV[sv].label)}</span></div>;
                })}
              </div>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
            {[[t("Kelime"), r.stats.words], [t("Metin içi atıf"), r.stats.citations], [t("Kaynak"), r.stats.sources], [t("Doğrulanmış kaynak"), r.stats.verifiedSources], [t("Yazılan bölüm"), `${r.stats.stagesFilled}/${r.stats.stagesTotal}`]].map(([l, v]) => (
              <div key={l as string} className="card p-3"><p className="text-xl font-semibold text-ink-900">{v}</p><p className="text-[12.5px] text-ink-500">{l}</p></div>
            ))}
          </div>

          {/* D178: rapor neyin doğru olduğunu da söyler */}
          <section className="mt-6 card p-5">
            <h2 className="flex items-center gap-2 font-semibold text-ink-900"><CheckCircle2 className="h-4 w-4 text-emerald-600" /> {t("Doğru olanlar")}</h2>
            <ul className="mt-2 grid gap-1.5 text-[13.5px] text-ink-700 sm:grid-cols-2">
              {Object.keys(CAT).filter((k) => !r.issues.some((i: any) => i.category === k)).map((k) => <li key={k} className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" /><span><b className="font-medium">{t(CAT[k].label)}:</b> {t("sorun bulunmadı")}</span></li>)}
              {checklist.filter((c) => c.status === "ok").map((c) => <li key={c.id} className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" /><span>{t(c.label)}</span></li>)}
              {(r.aiReview?.strengths ?? []).slice(0, 4).map((x: string, i: number) => <li key={`s${i}`} className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" /><span>{x}</span></li>)}
            </ul>
          </section>
          <div className="mt-4 rounded-2xl border border-ink-100 bg-white">
            <button onClick={() => setShowMethod((v) => !v)} className="flex w-full items-center gap-2 p-4 text-left text-sm font-semibold text-ink-800"><Info className="h-4 w-4 text-brand-500" /> {t("Puan nasıl hesaplanır?")}<ChevronDown className={cn("ml-auto h-4 w-4 transition", showMethod && "rotate-180")} /></button>
            {showMethod && (
              <div className="space-y-3 border-t border-ink-100 p-4 text-sm leading-relaxed text-ink-600">
                <p>{t("Puan 100’den başlar; kural tabanlı her bulgu önemine göre puan düşürür: Kritik {e}, Önemli {w}, İyileştirme {i} puan. Bazı küçük bulgular (ör. çift boşluk) daha düşük ağırlıkla sayılır. Puan 0–100 arasında sınırlanır.", { e: SEVERITY_WEIGHTS.error, w: SEVERITY_WEIGHTS.warning, i: SEVERITY_WEIGHTS.info })}</p>
                <p>{t("Yapay zekâ jürisinin bulguları listede “AI” etiketiyle gösterilir ama puanı değiştirmez; böylece aynı metin her kontrolde aynı puanı alır ve puan karşılaştırılabilir kalır.")}</p>
                <p>{t("Puan; atıf–kaynakça tutarlılığını, kaynakların doğrulanabilirliğini, eksik bölümleri, akademik dil kurallarını ve tekrarları ölçer. Bilimsel değeri, özgünlüğü veya intihal oranını ölçmez; bir jüri ya da hakem değerlendirmesinin yerine geçmez.")}</p>
                {Object.keys(lost).length > 0 && (
                  <div>
                    <p className="font-medium text-ink-800">{t("Bu kontrolde düşülen puanlar")}</p>
                    <ul className="mt-1 grid gap-1 sm:grid-cols-2">{Object.entries(lost).sort((a, b) => b[1] - a[1]).map(([k, v]) => <li key={k} className="flex justify-between rounded-lg bg-ink-50 px-2.5 py-1"><span>{t(CAT[k]?.label ?? k)}</span><b className="tabular-nums">−{v}</b></li>)}</ul>
                  </div>
                )}
                <Link href="/yontem" className="inline-block font-medium text-brand-700 hover:underline">{t("Yöntem ve şeffaflık sayfası →")}</Link>
              </div>
            )}
          </div>
          <div className="mt-4 flex items-start gap-2 rounded-2xl border border-ink-100 bg-white p-4 text-sm text-ink-600"><Info className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" /><span><b>{t("İntihal kontrolü:")}</b> {r.plagiarism.note} “Tekrarlanan ifadeler” analizi yalnızca kendi metninizdeki tekrarları gösterir; intihal oranı değildir.</span></div>

          <div className="mt-8 space-y-6">
            {groups.length === 0 && <Empty icon={<ListChecks className="h-5 w-5" />} title={t("Sorun bulunamadı")}>{t("Harika! Kural tabanlı kontrollerde sorun tespit edilmedi.")}</Empty>}
            {checklist.some((c) => c.status !== "ok") && (
              <section>
                <h2 className="mb-2 flex items-center gap-2 font-semibold text-ink-900"><ListChecks className="h-4 w-4 text-ink-500" /> {t("Teslim öncesi eksikler")} <span className="text-sm font-normal text-ink-400">({checklist.filter((c) => c.status !== "ok").length})</span></h2>
                <div className="card divide-y divide-ink-100">
                  {checklist.filter((c) => c.status !== "ok").map((c) => {
                    const I = c.status === "fail" ? XCircle : c.status === "warn" ? TriangleAlert : CircleDashed;
                    return (
                      <div key={c.id} className="flex items-start gap-3 p-4">
                        <I className={cn("mt-0.5 h-5 w-5 shrink-0", c.status === "fail" ? "text-rose-600" : c.status === "warn" ? "text-amber-600" : "text-ink-400")} />
                        <div className="min-w-0 flex-1"><p className="font-medium text-ink-900">{t(c.label)}</p><p className="text-sm text-ink-600">{t(c.detail, c.vars)}</p></div>
                        {c.stageId && <Link href={`/proje/${project.id}?bolum=${c.stageId}`} className="shrink-0 text-sm font-medium text-brand-600">{t("Düzelt →")}</Link>}
                      </div>
                    );
                  })}
                </div>
              </section>
            )}
            {groups.map((g, gi) => {
              const C = CAT[g.k];
              return (
                <motion.section key={g.k} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: gi * 0.05 }}>
                  <h2 className="mb-2 flex items-center gap-2 font-semibold text-ink-900"><C.icon className="h-4 w-4 text-ink-500" /> {t(C.label)} <span className="text-sm font-normal text-ink-400">({g.items.length})</span></h2>
                  <div className="card divide-y divide-ink-100">
                    {g.items.map((it: any) => (
                      <div key={it.id} className="flex items-start gap-3 p-4">
                        <Badge tone={SEV[it.severity as keyof typeof SEV].tone}>{t(SEV[it.severity as keyof typeof SEV].label)}</Badge>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-ink-900">{it.title} {String(it.id).startsWith("ai-") && <Badge tone="violet" className="ml-1">{t("AI")}</Badge>}</p>
                          <p className="mt-0.5 text-sm text-ink-600">{it.detail}</p>
                          {it.excerpt && <p className="mt-1.5 rounded-lg bg-ink-50 px-2.5 py-1.5 font-serif text-[13px] italic text-ink-600">“{it.excerpt}”</p>}
                        </div>
                        {it.stageKey && stageByKey[it.stageKey] && <Link href={`/proje/${project.id}?bolum=${stageByKey[it.stageKey].id}`} className="shrink-0 text-sm font-medium text-brand-600">{stageByKey[it.stageKey].title} →</Link>}
                      </div>
                    ))}
                  </div>
                </motion.section>
              );
            })}
          </div>
        </>
      )}

      {(visibleChain.length > 0 || hiddenChain.length > 0) && (
        <section className="mt-10">
          <h2 className="flex items-center gap-2 font-semibold text-ink-900"><ScanSearch className="h-4 w-4 text-brand-600" /> {t("Akademik tutarlılık zinciri")}</h2>
          <p className="mt-1 text-sm text-ink-500">{t("Problem, soru, yöntem, örneklem, analiz, bulgu ve tartışma arasındaki bağlantılar. Bu öneriler puanı etkilemez ve otomatik düzeltme yapılmaz; kabul edip etmemek size kalmıştır.")}</p>
          <ul className="card mt-3 divide-y divide-ink-100">
            {visibleChain.length === 0 && <li className="p-3.5 text-sm text-ink-500">{t("Gösterilecek öneri yok.")}</li>}
            {visibleChain.map((c) => (
              <li key={c.id} className="flex items-start gap-3 p-3.5">
                <Badge tone={CHAIN_TONE[c.level]}>{t(CHAIN_LEVEL_LABEL[c.level])}</Badge>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-ink-900">{t(c.title)}</p>
                  <p className="text-sm text-ink-600"><b className="font-medium">{t("Kanıt:")}</b> {t(c.evidence, c.vars ? { ...c.vars, s: t(String(c.vars.s ?? "")) } : undefined)}</p>
                  <p className="text-sm text-ink-600"><b className="font-medium">{t("Öneri:")}</b> {t(c.suggestion)}</p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  {c.stageKey && stageByKey[c.stageKey] && <Link href={`/proje/${project.id}?bolum=${stageByKey[c.stageKey].id}`} className="text-sm font-medium text-brand-600">{t("Düzelt →")}</Link>}
                  <button onClick={() => setDismiss([...dismissed, chainKey(c)])} className="text-[12px] text-ink-400 hover:text-ink-700">{t("Bu öneriyi reddet")}</button>
                </div>
              </li>
            ))}
          </ul>
          {hiddenChain.length > 0 && (
            <div className="mt-2 text-[12.5px] text-ink-500">
              <button onClick={() => setShowDismissed((v) => !v)} className="font-medium text-brand-700 hover:underline">{t("Reddedilen öneriler ({n})", { n: hiddenChain.length })}</button>
              {showDismissed && <ul className="mt-1 space-y-1">{hiddenChain.map((c) => <li key={c.id} className="flex items-center gap-2"><span>{t(c.title)}</span><button onClick={() => setDismiss(dismissed.filter((x) => x !== chainKey(c)))} className="text-brand-700 hover:underline">{t("Geri al")}</button></li>)}</ul>}
            </div>
          )}
        </section>
      )}

    </div>
  );
}
/* eslint-enable @typescript-eslint/no-explicit-any */
