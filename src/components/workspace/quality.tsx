"use client";
import { motion } from "framer-motion";
import { AlertOctagon, ArrowLeft, BookOpenCheck, Info, Languages, ListChecks, Repeat2, ScanSearch, ShieldAlert, Sparkles, TriangleAlert } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/components/ui/cn";
import { Badge, Empty } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/toast";
import { api } from "@/lib/client";

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
const SEV = { error: { label: "Kritik", tone: "red" as const }, warning: { label: "Uyarı", tone: "amber" as const }, info: { label: "Bilgi", tone: "ink" as const } };

export function QualityView({ project, initial, stages }: { project: any; initial: any; stages: any[] }) {
  const toast = useToast();
  const [report, setReport] = useState<any>(initial);
  const [loading, setLoading] = useState(false);
  const [withAi, setWithAi] = useState(true);
  const stageByKey = Object.fromEntries(stages.map((s) => [s.key, s]));

  async function run() {
    setLoading(true);
    try { setReport((await api<{ report: any }>(`/api/projects/${project.id}/quality`, { method: "POST", json: { withAi } })).report); }
    catch (e) { toast({ tone: "error", title: "Kontrol yapılamadı", detail: (e as Error).message }); }
    finally { setLoading(false); }
  }

  const r = report?.report;
  const score = report?.score ?? 0;
  const groups = r ? Object.keys(CAT).map((k) => ({ k, items: r.issues.filter((i: any) => i.category === k) })).filter((g) => g.items.length) : [];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-8">
      <Link href={`/proje/${project.id}`} className="inline-flex items-center gap-1.5 text-sm text-ink-500 hover:text-ink-900"><ArrowLeft className="h-4 w-4" /> {project.title}</Link>
      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-4xl font-medium tracking-tight text-ink-950">Akademik kalite kontrolü</h1>
          <p className="mt-1 text-ink-500">Dil, tutarlılık, atıf ve kaynak kontrolleri. Kural tabanlı kontroller her zaman çalışır; yapay zekâ incelemesi mantıksal bütünlüğü değerlendirir.</p>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-ink-600"><input type="checkbox" checked={withAi} onChange={(e) => setWithAi(e.target.checked)} /> <Sparkles className="h-4 w-4 text-brand-500" /> Yapay zekâ incelemesi</label>
          <Button onClick={run} loading={loading}>{report ? "Yeniden kontrol et" : "Kontrolü başlat"}</Button>
        </div>
      </div>

      {!report && !loading && <div className="mt-10"><Empty icon={<ListChecks className="h-5 w-5" />} title="Henüz kontrol yapılmadı">Çalışmanızın tüm bölümleri ve kaynakları birlikte değerlendirilir.</Empty></div>}
      {loading && <div className="mt-10 grid gap-4 md:grid-cols-3">{[0, 1, 2].map((i) => <div key={i} className="skeleton h-32" />)}</div>}

      {r && !loading && (
        <>
          <div className="mt-8 grid gap-4 md:grid-cols-[260px_1fr]">
            <div className="card flex flex-col items-center justify-center p-6">
              <div className="relative">
                <svg width="150" height="150" className="-rotate-90"><circle cx="75" cy="75" r="64" strokeWidth="11" className="fill-none stroke-ink-100" /><motion.circle cx="75" cy="75" r="64" strokeWidth="11" strokeLinecap="round" className={cn("fill-none", score >= 80 ? "stroke-emerald-500" : score >= 60 ? "stroke-amber-400" : "stroke-rose-500")} style={{ strokeDasharray: 402 }} initial={{ strokeDashoffset: 402 }} animate={{ strokeDashoffset: 402 - (402 * score) / 100 }} transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }} /></svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center"><span className="text-4xl font-semibold">{score}</span><span className="text-xs text-ink-400">/ 100</span></div>
              </div>
              <p className="mt-3 text-center text-sm text-ink-500">{new Date(r.generatedAt).toLocaleString("tr-TR")}</p>
              {r.aiReview?.error && <p className="mt-2 text-center text-xs text-amber-700">{r.aiReview.error}</p>}
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {[["Kelime", r.stats.words], ["Metin içi atıf", r.stats.citations], ["Kaynak", r.stats.sources], ["Doğrulanmış kaynak", r.stats.verifiedSources], ["Yazılan bölüm", `${r.stats.stagesFilled}/${r.stats.stagesTotal}`], ["Sorun", r.issues.length]].map(([l, v]) => (
                <div key={l as string} className="card p-4"><p className="text-2xl font-semibold text-ink-900">{v}</p><p className="text-sm text-ink-500">{l}</p></div>
              ))}
            </div>
          </div>
          <div className="mt-4 flex items-start gap-2 rounded-2xl border border-ink-100 bg-white p-4 text-sm text-ink-600"><Info className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" /><span><b>İntihal kontrolü:</b> {r.plagiarism.note} “Tekrarlanan ifadeler” analizi yalnızca kendi metninizdeki tekrarları gösterir; intihal oranı değildir.</span></div>

          <div className="mt-8 space-y-6">
            {groups.length === 0 && <Empty icon={<ListChecks className="h-5 w-5" />} title="Sorun bulunamadı">Harika! Kural tabanlı kontrollerde sorun tespit edilmedi.</Empty>}
            {groups.map((g, gi) => {
              const C = CAT[g.k];
              return (
                <motion.section key={g.k} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: gi * 0.05 }}>
                  <h2 className="mb-2 flex items-center gap-2 font-semibold text-ink-900"><C.icon className="h-4 w-4 text-ink-500" /> {C.label} <span className="text-sm font-normal text-ink-400">({g.items.length})</span></h2>
                  <div className="card divide-y divide-ink-100">
                    {g.items.map((it: any) => (
                      <div key={it.id} className="flex items-start gap-3 p-4">
                        <Badge tone={SEV[it.severity as keyof typeof SEV].tone}>{SEV[it.severity as keyof typeof SEV].label}</Badge>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-ink-900">{it.title} {String(it.id).startsWith("ai-") && <Badge tone="violet" className="ml-1">AI</Badge>}</p>
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
    </div>
  );
}
/* eslint-enable @typescript-eslint/no-explicit-any */
