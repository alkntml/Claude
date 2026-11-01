"use client";
import { ArrowDownRight, ArrowRight, ArrowUpRight, Compass, Lightbulb, Minus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/toast";
import { useT } from "@/i18n/client";
import { api } from "@/lib/client";
import type { TopicExploration } from "@/lib/topics";
import type { TopicIdea } from "@/lib/topics-server";

const pct = (x: number | null) => (x === null ? "—" : `${x > 0 ? "+" : ""}${Math.round(x * 100)}%`);

export function TopicExplorer() {
  const { t, locale } = useT();
  const toast = useToast();
  const [query, setQuery] = useState("");
  const [level, setLevel] = useState("Yüksek lisans");
  const [discipline, setDiscipline] = useState("");
  const [busy, setBusy] = useState(false);
  const [res, setRes] = useState<{ data: TopicExploration; ideas: TopicIdea[]; ideasError?: boolean } | null>(null);

  async function run() {
    setBusy(true);
    try { setRes(await api(`/api/topics/explore`, { method: "POST", json: { query, level: t(level), discipline, language: locale } })); }
    catch (e) { toast({ tone: "error", title: t("Analiz yapılamadı"), detail: (e as Error).message }); } finally { setBusy(false); }
  }
  const d = res?.data;
  const maxY = d ? Math.max(1, ...d.years.map((y) => y.count)) : 1;
  const thisYear = new Date().getFullYear();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-medium tracking-tight text-ink-950">{t("Tez konusu bulma")}</h1>
        <p className="mt-1.5 max-w-3xl text-ink-500">{t("Bir alan veya anahtar kelime yazın: OpenAlex’teki gerçek yayın kayıtlarından yıllara göre eğilimi, yükselen alt konuları ve Türkiye’de ne kadar çalışıldığını görün. Yapay zekâ bu verilere dayanarak konu önerileri çıkarır.")}</p>
      </div>
      <form onSubmit={(e) => { e.preventDefault(); if (query.trim().length >= 3) run(); }} className="card grid gap-3 p-5 md:grid-cols-[1fr_180px_220px_auto]">
        <input className="input" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t("ör. lithium-ion battery degradation (İngilizce daha çok sonuç verir)")} />
        <select className="input" value={level} onChange={(e) => setLevel(e.target.value)}>{["Lisans", "Yüksek lisans", "Doktora"].map((l) => <option key={l} value={l}>{t(l)}</option>)}</select>
        <input className="input" value={discipline} onChange={(e) => setDiscipline(e.target.value)} placeholder={t("Bilim dalı (isteğe bağlı)")} />
        <Button type="submit" loading={busy} disabled={query.trim().length < 3}><Compass className="h-4 w-4" /> {t("Keşfet")}</Button>
      </form>

      {d && (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="card p-5"><p className="text-sm text-ink-500">{t("Son 12 yılda kayıt")}</p><p className="mt-1 text-3xl font-semibold text-ink-900">{d.total.toLocaleString(locale)}</p></div>
            <div className="card p-5"><p className="text-sm text-ink-500">{t("Son 3 yıl, önceki 3 yıla göre")}</p><p className={`mt-1 text-3xl font-semibold ${d.trend.change !== null && d.trend.change > 0.1 ? "text-emerald-600" : d.trend.change !== null && d.trend.change < -0.1 ? "text-rose-600" : "text-ink-900"}`}>{pct(d.trend.change)}</p><p className="text-xs text-ink-400">{d.trend.prev3.toLocaleString(locale)} → {d.trend.recent3.toLocaleString(locale)}</p></div>
            <div className="card p-5"><p className="text-sm text-ink-500">{t("Türkiye’den yayınlar")}</p><p className="mt-1 text-3xl font-semibold text-ink-900">{d.turkey.total.toLocaleString(locale)}</p><p className="text-xs text-ink-400">{d.turkey.share !== null ? t("tüm kayıtların %{p}’i", { p: (d.turkey.share * 100).toFixed(1) }) : ""} · {t("Türkçe: {n}", { n: d.turkey.turkish.toLocaleString(locale) })}</p></div>
          </div>

          <div className="card p-5">
            <p className="font-semibold text-ink-900">{t("Yıllara göre yayın sayısı")}</p>
            <div className="mt-4 flex h-40 items-end gap-1.5">
              {d.years.map((y) => (
                <div key={y.year} className="flex flex-1 flex-col items-center gap-1" title={`${y.year}: ${y.count}`}>
                  <div className={`w-full rounded-t ${y.year === thisYear ? "bg-brand-200" : "bg-brand-500"}`} style={{ height: `${(y.count / maxY) * 100}%`, minHeight: y.count ? 2 : 0 }} />
                  <span className="text-[10.5px] text-ink-400">{String(y.year).slice(2)}</span>
                </div>
              ))}
            </div>
            <p className="mt-2 text-xs text-ink-400">{t("İçinde bulunulan yıl henüz tamamlanmadığı için açık renkle gösterilir.")}</p>
          </div>

          {d.subtopics.length > 0 && (
            <div className="card overflow-x-auto p-5">
              <p className="font-semibold text-ink-900">{t("Alt konular ve eğilimleri")}</p>
              <table className="mt-3 w-full text-[13.5px]">
                <thead><tr className="text-left text-xs text-ink-500"><th className="pb-2">{t("Alt konu")}</th><th className="pb-2 text-right">{t("Önceki 3 yıl")}</th><th className="pb-2 text-right">{t("Son 3 yıl")}</th><th className="pb-2 text-right">{t("Değişim")}</th></tr></thead>
                <tbody>
                  {d.subtopics.map((s) => (
                    <tr key={s.id} className="border-t border-ink-100">
                      <td className="py-2 pr-3 text-ink-800">{s.name}</td>
                      <td className="py-2 text-right text-ink-600">{s.earlier.toLocaleString(locale)}</td>
                      <td className="py-2 text-right text-ink-600">{s.recent.toLocaleString(locale)}</td>
                      <td className="py-2 text-right">{s.growth === null ? <span className="text-ink-400">{t("yeni / az veri")}</span> : <span className={`inline-flex items-center gap-0.5 ${s.growth > 0.2 ? "text-emerald-600" : s.growth < -0.2 ? "text-rose-600" : "text-ink-500"}`}>{s.growth > 0.2 ? <ArrowUpRight className="h-3.5 w-3.5" /> : s.growth < -0.2 ? <ArrowDownRight className="h-3.5 w-3.5" /> : <Minus className="h-3.5 w-3.5" />}{pct(s.growth)}</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {res.ideas.length > 0 && (
            <div className="space-y-3">
              <p className="flex items-center gap-2 font-semibold text-ink-900"><Lightbulb className="h-4 w-4 text-amber-500" /> {t("Verilere dayalı konu önerileri")}</p>
              <div className="grid gap-3 lg:grid-cols-2">
                {res.ideas.map((idea, i) => (
                  <div key={i} className="card space-y-2 p-5 text-[13.5px]">
                    <p className="font-serif text-lg font-medium leading-snug text-ink-950">{idea.title}</p>
                    <p className="text-ink-700"><b>{t("Araştırma sorusu:")}</b> {idea.question}</p>
                    <p className="text-ink-600"><b>{t("Neden:")}</b> {idea.rationale}</p>
                    <p className="text-ink-600"><b>{t("Yöntem:")}</b> {idea.method}</p>
                    <p className="text-ink-600"><b>{t("Kapsam:")}</b> {idea.scope}</p>
                    <Link href={`/yeni?tur=thesis&konu=${encodeURIComponent(`${idea.title}\n\n${idea.question}`)}`} className="inline-flex items-center gap-1 pt-1 font-medium text-brand-700 hover:underline">{t("Bu konuyla tez başlat")} <ArrowRight className="h-3.5 w-3.5" /></Link>
                  </div>
                ))}
              </div>
              <p className="text-xs text-ink-400">{t("Öneriler bir başlangıç noktasıdır. Konuyu seçmeden önce danışmanınızla görüşün ve “Kaynak araştırması” ile literatürü ayrıntılı tarayın; veriler arama kelimelerine bağlıdır.")}</p>
            </div>
          )}
          {res.ideasError && <p className="text-sm text-amber-700">{t("Konu önerileri şu anda oluşturulamadı; istatistikler yine de gerçek verilere dayanır.")}</p>}

          {d.topWorks.length > 0 && (
            <div className="card p-5">
              <p className="font-semibold text-ink-900">{t("Son 5 yılın en çok atıf alan çalışmaları")}</p>
              <ul className="mt-3 space-y-2 text-[13.5px]">
                {d.topWorks.map((w, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Badge>{w.cited.toLocaleString(locale)}</Badge>
                    <span className="min-w-0 text-ink-700">{w.doi ? <a href={`https://doi.org/${w.doi}`} target="_blank" rel="noopener noreferrer" className="hover:text-brand-700 hover:underline">{w.title}</a> : w.title} <span className="text-ink-400">({w.year ?? "t.y."}{w.venue ? `, ${w.venue}` : ""})</span></span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
}
