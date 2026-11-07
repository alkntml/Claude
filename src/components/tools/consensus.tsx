"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Check, ExternalLink, Loader2, Plus, Scale, Search } from "lucide-react";
import Link from "@/components/l-link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/components/ui/cn";
import { useToast } from "@/components/ui/toast";
import { useT } from "@/i18n/client";
import { api } from "@/lib/client";
import { toSourceInput } from "@/lib/sources/to-input";

const EXAMPLES = [
  "Uyku süresi akademik başarıyı etkiler mi?",
  "Oyunlaştırma öğrenci motivasyonunu artırır mı?",
  "Sosyal medya kullanımı ergenlerde kaygıyla ilişkili mi?",
  "Ters yüz sınıf modeli başarıyı artırır mı?",
];
const STANCE: Record<string, { label: string; bar: string; chip: string }> = {
  yes: { label: "Evet", bar: "bg-emerald-500", chip: "bg-emerald-50 text-emerald-700" },
  possibly: { label: "Kısmen / koşullu", bar: "bg-lime-400", chip: "bg-lime-50 text-lime-800" },
  mixed: { label: "Karışık", bar: "bg-amber-400", chip: "bg-amber-50 text-amber-800" },
  no: { label: "Hayır", bar: "bg-rose-500", chip: "bg-rose-50 text-rose-700" },
};
const TYPE: Record<string, string> = { meta_analysis: "Meta-analiz", review: "Derleme", experimental: "Deneysel", observational: "Gözlemsel / ilişkisel", qualitative: "Nitel", other: "Diğer" };

/** “[2, 5]” atıf numaralarını makale bağlantısına çevirir */
function AnswerText({ text, onRef }: { text: string; onRef: (n: number) => void }) {
  const parts = text.split(/(\[\d+(?:\s*,\s*\d+)*\])/g);
  return <p className="text-[15.5px] leading-relaxed text-ink-800">{parts.map((p, i) => {
    const m = p.match(/^\[(.+)\]$/);
    if (!m) return <span key={i}>{p}</span>;
    return <sup key={i} className="mx-0.5">{m[1].split(",").map((x, k) => <button key={k} type="button" onClick={() => onRef(Number(x))} className="mx-px rounded bg-brand-50 px-1 text-[11px] font-semibold text-brand-700 hover:bg-brand-100">{x.trim()}</button>)}</sup>;
  })}</p>;
}

const authorShort = (a: any[]) => { const n = (a ?? []).map((x: any) => x.family ?? x.literal ?? "").filter(Boolean); return n.length > 2 ? `${n[0]} vd.` : n.join(" ve "); };

/**
 * Araştırmalar ne diyor? (D114). `projectId` verilirse (çalışma alanı) makaleler doğrudan o çalışmaya eklenir;
 * herkese açık sayfada giriş yapmış kullanıcı çalışmasını seçer, ziyaretçiye ücretsiz kayıt önerilir.
 */
export function ConsensusTool({ projectId, onAdded, signedIn }: { projectId?: string; onAdded?: (rows: any[]) => void; signedIn?: boolean }) {
  const { t } = useT();
  const toast = useToast();
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);
  const [r, setR] = useState<any | null>(null);
  const [projects, setProjects] = useState<{ id: string; title: string }[]>([]);
  const [target, setTarget] = useState(projectId ?? "");
  const [added, setAdded] = useState<Set<number>>(new Set());
  const [adding, setAdding] = useState<number | "all" | null>(null);

  useEffect(() => {
    if (projectId || !signedIn) return;
    api<{ projects: any[] }>("/api/projects").then((x) => { setProjects(x.projects.map((p) => ({ id: p.id, title: p.title }))); if (x.projects[0]) setTarget(x.projects[0].id); }).catch(() => {});
  }, [projectId, signedIn]);

  async function ask(question = q) {
    if (question.trim().length < 8 || busy) return;
    setQ(question); setBusy(true); setR(null); setAdded(new Set());
    try { setR(await api<any>("/api/public/tools/consensus", { method: "POST", json: { question } })); }
    catch (e) { toast({ tone: "error", title: t("Cevap alınamadı"), detail: (e as Error).message }); }
    finally { setBusy(false); }
  }
  async function add(papers: any[], key: number | "all") {
    if (!target) return;
    setAdding(key);
    try {
      const { sources } = await api<{ sources: any[] }>(`/api/projects/${target}/sources`, { method: "POST", json: { sources: papers.map((p) => toSourceInput(p.record)) } });
      setAdded((s) => new Set([...s, ...papers.map((p) => p.n)]));
      onAdded?.(sources);
      toast({ tone: "success", title: t("{n} makale çalışmaya eklendi", { n: papers.length }) });
    } catch (e) { toast({ tone: "error", title: t("Eklenemedi"), detail: (e as Error).message }); }
    finally { setAdding(null); }
  }
  const scrollTo = (n: number) => document.getElementById(`paper-${n}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
  const canAdd = !!target;
  const relevant = (r?.papers ?? []).filter((p: any) => p.relevant && !added.has(p.n));

  return (
    <div className="space-y-6">
      <form onSubmit={(e) => { e.preventDefault(); ask(); }} className="card space-y-3 p-4">
        <label htmlFor="consensus-q" className="label">{t("Araştırma sorunuz")}</label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input id="consensus-q" className="input flex-1" value={q} onChange={(e) => setQ(e.target.value)} maxLength={300} placeholder={t("Ör. Uyku süresi akademik başarıyı etkiler mi?")} />
          <Button type="submit" loading={busy} disabled={q.trim().length < 8}><Search className="h-4 w-4" /> {t("Sor")}</Button>
        </div>
        {!r && !busy && <div className="flex flex-wrap gap-1.5">{EXAMPLES.map((x) => <button key={x} type="button" onClick={() => ask(t(x))} className="rounded-full border border-ink-200 px-3 py-1 text-[12.5px] text-ink-600 hover:border-brand-300 hover:text-brand-700">{t(x)}</button>)}</div>}
        {busy && <p className="flex items-center gap-2 text-[13px] text-ink-500"><Loader2 className="h-4 w-4 animate-spin" /> {t("Veri tabanlarında makaleler aranıyor ve özetleri okunuyor… (20–40 sn)")}</p>}
      </form>

      {r && r.papers.length === 0 && (
        <p className="card p-5 text-[14px] text-ink-600">{t("Bu soruyla ilgili, özeti okunabilen yeterli makale bulunamadı. Soruyu daha genel veya İngilizce terimlerle yeniden deneyin.")}</p>
      )}

      {r && r.papers.length > 0 && (
        <>
          <section className="card space-y-4 p-5">
            <div className="flex items-center gap-2 text-[13px] font-semibold uppercase tracking-wide text-brand-700"><Scale className="h-4 w-4" /> {t("Kısa cevap")}</div>
            {r.answer ? <AnswerText text={r.answer} onRef={scrollTo} /> : <p className="text-ink-500">{t("Cevap oluşturulamadı.")}</p>}
            {r.meter && (
              <div>
                <p className="mb-1.5 text-[13px] font-medium text-ink-700">{t("Uzlaşı göstergesi: {n} ilgili çalışmanın sonucu", { n: r.meter.total })}</p>
                <div className="flex h-3 overflow-hidden rounded-full bg-ink-100" role="img" aria-label={(["yes", "possibly", "mixed", "no"] as const).map((k) => `${t(STANCE[k].label)} ${r.meter[k]}`).join(", ")}>
                  {(["yes", "possibly", "mixed", "no"] as const).map((k) => r.meter[k] > 0 && <span key={k} className={STANCE[k].bar} style={{ width: `${(r.meter[k] / r.meter.total) * 100}%` }} />)}
                </div>
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[12.5px] text-ink-600">
                  {(["yes", "possibly", "mixed", "no"] as const).map((k) => <span key={k} className="inline-flex items-center gap-1.5"><span className={cn("h-2.5 w-2.5 rounded-full", STANCE[k].bar)} />{t(STANCE[k].label)}: <b className="tabular-nums">{r.meter[k]}</b> (%{Math.round((r.meter[k] / r.meter.total) * 100)})</span>)}
                </div>
              </div>
            )}
            <ul className="space-y-1 rounded-xl bg-ink-50 p-3 text-[12.5px] text-ink-600">
              <li>{t("Cevap yalnızca aşağıdaki {n} makalenin özetlerine dayanır; tam metinler okunmadı.", { n: r.papers.length })}</li>
              {r.caveats.map((c: string, i: number) => <li key={i}>{c}</li>)}
              <li>{t("Bu bir literatür taraması değildir; tezinizde kullanmadan önce makaleleri okuyun.")}</li>
            </ul>
          </section>

          <section className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-serif text-xl font-medium text-ink-950">{t("Dayandığı makaleler")}</h2>
              {canAdd && relevant.length > 0 && <Button size="sm" variant="secondary" loading={adding === "all"} onClick={() => add(relevant, "all")}><Plus className="h-4 w-4" /> {t("İlgili olanların hepsini ekle ({n})", { n: relevant.length })}</Button>}
            </div>
            {!projectId && signedIn && projects.length > 0 && (
              <label className="flex flex-wrap items-center gap-2 text-[13px] text-ink-600">{t("Eklenecek çalışma:")}
                <select className="input !w-auto !py-1.5" value={target} onChange={(e) => setTarget(e.target.value)}>{projects.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}</select>
              </label>
            )}
            {!signedIn && !projectId && <p className="rounded-xl bg-brand-50 p-3 text-[13px] text-brand-800">{t("Ücretsiz hesapla bu makaleleri tek tıkla çalışmanıza ekleyebilir, künyelerini otomatik kaynakçaya dönüştürebilirsiniz.")} <Link href="/kayit" className="font-semibold underline">{t("Ücretsiz kaydol")}</Link></p>}
            <ol className="space-y-2.5">
              {r.papers.map((p: any) => {
                const link = p.record.doi ? `https://doi.org/${p.record.doi}` : p.record.url;
                return (
                  <li key={p.n} id={`paper-${p.n}`} className={cn("card p-4", !p.relevant && "opacity-70")}>
                    <div className="flex items-start gap-3">
                      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-ink-100 text-[12px] font-semibold text-ink-700">{p.n}</span>
                      <div className="min-w-0 flex-1 space-y-1.5">
                        <p className="font-medium leading-snug text-ink-950">{link ? <a href={link} target="_blank" rel="noopener noreferrer" className="hover:underline">{p.record.title} <ExternalLink className="inline h-3 w-3 text-ink-400" /></a> : p.record.title}</p>
                        <p className="text-[12.5px] text-ink-500">{[authorShort(p.record.authors), p.record.year, p.record.containerTitle].filter(Boolean).join(" · ")}</p>
                        {p.finding && <p className="text-[13.5px] leading-relaxed text-ink-700">{p.finding}</p>}
                        <div className="flex flex-wrap items-center gap-1.5 text-[11.5px]">
                          {p.stance && <span className={cn("rounded-full px-2 py-0.5 font-semibold", STANCE[p.stance].chip)}>{t(STANCE[p.stance].label)}</span>}
                          <span className="rounded-full bg-ink-100 px-2 py-0.5 text-ink-600">{t(TYPE[p.studyType] ?? "Diğer")}</span>
                          {!p.relevant && <span className="rounded-full bg-ink-100 px-2 py-0.5 text-ink-500">{t("Dolaylı ilgili")}</span>}
                          {p.record.citedByCount > 0 && <span className="text-ink-400">{t("{n} atıf", { n: p.record.citedByCount })}</span>}
                        </div>
                      </div>
                      {canAdd && (added.has(p.n)
                        ? <span className="inline-flex shrink-0 items-center gap-1 text-[12.5px] font-medium text-emerald-700"><Check className="h-4 w-4" /> {t("Eklendi")}</span>
                        : <Button size="sm" variant="soft" loading={adding === p.n} onClick={() => add([p], p.n)}><Plus className="h-3.5 w-3.5" /> {t("Ekle")}</Button>)}
                    </div>
                  </li>
                );
              })}
            </ol>
          </section>
        </>
      )}
    </div>
  );
}
