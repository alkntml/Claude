"use client";
import { useSignedIn } from "@/components/use-signed-in";
import { ArrowRight, BadgeCheck, BarChart3, Check, ClipboardList, Compass, FileDown, FileText, GraduationCap, Info, Link2, MessageSquareReply, PenLine, Presentation, Quote, Search, ShieldCheck, Sigma, Table2, Type, Unlock } from "lucide-react";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import Link from "@/components/l-link";
import { cn } from "@/components/ui/cn";
import { useT } from "@/i18n/client";
import { contentLang, dateLocale } from "@/i18n/core";
import { renderChartSvg } from "@/lib/charts/svg";
import { CitationEngine, STYLE_IDS, STYLES } from "@/lib/citations/styles";
import type { CitationStyleId } from "@/lib/citations/types";
import { richToHtml } from "@/lib/citations/util";
import { BLUEPRINT, COHERENCE, DEFENSE, DRAFT, MATRIX, pick, QUALITY, QUALITY_AREAS, REVIEWER, sampleSources, SAMPLE_WORK, sampleDataset, SEARCH_RESULTS, SECTIONS, SURVEY, TITLES, VARS, type L2 } from "@/lib/samples";
import { buildChart } from "@/lib/stats/charts";
import { runAnalysis } from "@/lib/stats/apa";
import { pearson } from "@/lib/stats/tests";

const ICONS = { Link2, Compass, Type, Search, PenLine, Quote, Table2, ClipboardList, Sigma, BarChart3, ShieldCheck, FileText, MessageSquareReply, GraduationCap, Presentation, FileDown } as const;
const PLAN_LABEL = { free: "Ücretsiz pakette", basic: "Basic ve üstü", pro: "Pro ve üstü" } as const;

/** Basit Markdown tablo → HTML (istatistik motorunun APA tabloları için) */
function mdTable(md: string): string {
  const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const rows = md.split("\n").filter((l) => l.trim().startsWith("|") && !/^\|\s*-/.test(l.trim()));
  const cells = (l: string) => l.trim().replace(/^\||\|$/g, "").split("|").map((c) => esc(c.trim()).replace(/\*([^*]+)\*/g, "<i>$1</i>"));
  const [h, ...b] = rows;
  if (!h) return "";
  return `<table class="apa"><thead><tr>${cells(h).map((c) => `<th>${c}</th>`).join("")}</tr></thead><tbody>${b.map((r) => `<tr>${cells(r).map((c) => `<td>${c}</td>`).join("")}</tr>`).join("")}</tbody></table>`;
}

/**
 * Örnek çıktılar (D72): her hizmet için bir örnek. Tablo, grafik ve atıflar sitenin kendi motorlarıyla
 * kurgusal örnek veriden üretilir; metinler temsilidir.
 */
export function SamplesView({ signedIn: initialSignedIn }: { signedIn: boolean }) {
  const signedIn = useSignedIn(initialSignedIn);
  const { t, locale } = useT();
  // Motor çıktıları (istatistik, grafik, atıf) yalnızca TR/EN; Almancada İngilizce motor + Almanca metinler (D143)
  const l = contentLang(locale);
  const de = locale === "de";
  const p = (x: L2) => pick(x, locale);
  const [style, setStyle] = useState<CitationStyleId>("apa7");
  const V = VARS[l];

  const data = useMemo(() => {
    const rows = sampleDataset(l);
    const alpha = runAnalysis(rows, { kind: "alpha", items: ["AE1", "AE2", "AE3", "AE4", "AE5"], scale: V.ert }, l);
    const ttest = runAnalysis(rows, { kind: "ttest_ind", dv: V.ert, group: V.g }, l);
    const corr = runAnalysis(rows, { kind: "correlation", vars: [V.sm, V.ert, V.uyku], method: "pearson" }, l);
    const col = (name: string) => { const i = rows[0].indexOf(name); return rows.slice(1).map((r) => Number(r[i])); };
    const r1 = pearson(col(V.sm), col(V.ert)).r, r2 = pearson(col(V.ert), col(V.uyku)).r;
    const chart = renderChartSvg(buildChart(rows, { kind: "scatter", x: V.sm, y: V.ert, fit: true }, l), { width: 900, height: 520, locale: l });
    return { alpha, ttest, corr, r1, r2, chart, n: rows.length - 1 };
  }, [l, V]);

  const order = ["s1", "s2", "s3", "s4"];
  const sources = useMemo(() => sampleSources(locale), [locale]);
  const engine = useMemo(() => new CitationEngine(style, sources, { locale: l, citedOrder: order }), [style, l, sources]); // eslint-disable-line react-hooks/exhaustive-deps
  // D190: dipnotlu stilde (ISNAD 2 dipnotlu) atıf üst simge numaradır; notlar paragrafın altında listelenir
  const noteStyle = engine.meta.family === "note";
  const notes: string[] = [];
  const noteSeen = new Set<string>();
  const cite = (ids: string[]) => {
    if (!noteStyle) return `<span class="sample-cite">${richToHtml(engine.cite(ids))}</span>`;
    const seen = new Set(noteSeen);
    ids.forEach((id) => noteSeen.add(id));
    notes.push(richToHtml(engine.note(ids, {}, (id) => !seen.has(id))));
    return `<sup class="sample-cite">${notes.length}</sup>`;
  };
  // D190: dipnotlu stilde numara noktalama işaretinden sonra, boşluksuz gelir (…ilişkilidir.¹)
  const withCites = (text: string) => (noteStyle ? text.replace(/\s*\{c:([\w,]+)\}([.,;:]?)/g, (_, ids: string, punct: string) => `${punct}${cite(ids.split(","))}`) : text.replace(/\{c:([\w,]+)\}/g, (_, ids: string) => cite(ids.split(",")))).replace(/\[(KAYNAK GEREKLİ|CITATION NEEDED|QUELLE ERFORDERLICH)\]/g, `<span class="sample-flag">[$1]</span>`);
  const bib = engine.bibliography();
  const src = (id: string) => sources.find((s) => s.id === id)!;
  const r2s = (r: number) => r.toFixed(2).replace(/^(-?)0\./, "$1.");

  const body: Record<string, React.ReactNode> = {
    kurgu: (
      <div className="grid gap-4 md:grid-cols-[1.2fr_1fr]">
        <div className="space-y-2.5">
          {BLUEPRINT.fields.map((f) => <div key={f.k.tr} className="rounded-xl border border-ink-100 p-3"><p className="text-[12px] font-semibold uppercase tracking-wide text-ink-400">{p(f.k)}</p><p className="mt-0.5 text-[14px] text-ink-800">{p(f.v)}</p></div>)}
          <div className="rounded-xl border border-ink-100 p-3"><p className="text-[12px] font-semibold uppercase tracking-wide text-ink-400">{t("Araştırma soruları")}</p><ol className="mt-1 list-decimal space-y-0.5 pl-5 text-[14px] text-ink-800">{BLUEPRINT.questions.map((q) => <li key={q.tr}>{p(q)}</li>)}</ol></div>
        </div>
        <div>
          <p className="mb-2 text-[13px] font-semibold text-ink-800">{t("Bölüm bölüm yol haritası · toplam {n} kelime", { n: BLUEPRINT.total.toLocaleString(dateLocale(locale)) })}</p>
          <ol className="space-y-2 border-l-2 border-brand-100 pl-4">
            {BLUEPRINT.chapters.map((c, i) => (
              <li key={c.t.tr} className="relative rounded-xl border border-ink-100 p-2.5">
                <span className="absolute -left-[27px] top-3 flex h-5 w-5 items-center justify-center rounded-full bg-brand-600 text-[10px] font-semibold text-white">{i + 1}</span>
                <div className="flex items-center justify-between gap-2 text-[13.5px]"><span className="font-medium text-ink-900">{p(c.t)}</span><span className="shrink-0 rounded-full bg-brand-50 px-2 py-0.5 text-[11.5px] font-medium text-brand-700">~{c.w.toLocaleString(dateLocale(locale))} {t("kelime")}</span></div>
                <div className="mt-1.5 h-1.5 rounded-full bg-ink-100"><div className="h-1.5 rounded-full bg-brand-500" style={{ width: `${(c.w / 7000) * 100}%` }} /></div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    ),
    baslik: (
      <ul className="space-y-2">
        {TITLES.map((x, i) => (
          <li key={x.t.tr} className={cn("flex items-start gap-3 rounded-2xl border p-3.5", i === 0 ? "border-brand-300 bg-brand-50/60" : "border-ink-100")}>
            <span className={cn("mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border", i === 0 ? "border-brand-600 bg-brand-600 text-white" : "border-ink-300")}>{i === 0 && <Check className="h-3 w-3" />}</span>
            <span><span className="block font-serif text-[16px] font-medium leading-snug text-ink-950">{p(x.t)}</span><span className="mt-0.5 block text-[12.5px] text-ink-500">{p(x.n)}</span></span>
          </li>
        ))}
      </ul>
    ),
    kaynak: (
      <div className="space-y-2.5">
        <div className="flex flex-wrap items-center gap-2 rounded-xl bg-ink-50 px-3 py-2 text-[13px] text-ink-600"><Search className="h-4 w-4 text-ink-400" /> <span className="font-medium text-ink-800">{l === "en" ? "social media use academic procrastination sleep quality" : "sosyal medya kullanımı akademik erteleme uyku kalitesi"}</span><span className="ml-auto text-[12px] text-ink-400">{t("OpenAlex · Crossref · PubMed · DergiPark · TR Dizin…")}</span></div>
        {SEARCH_RESULTS.map((r) => {
          const s = src(r.id);
          const acc = r.access === "full_text" ? { label: t("Tam metin okundu"), cls: "bg-emerald-50 text-emerald-700" } : r.access === "abstract" ? { label: t("Özet okundu"), cls: "bg-sky-50 text-sky-700" } : { label: t("Yalnızca künye"), cls: "bg-amber-50 text-amber-800" };
          return (
            <div key={r.id} className="rounded-2xl border border-ink-100 p-3.5">
              <p className="text-[14.5px] font-medium text-ink-900">{s.title}</p>
              <p className="mt-0.5 text-[12.5px] text-ink-500">{s.authors.map((a) => a.family).join(", ")} · {s.year}{s.containerTitle ? ` · ${s.containerTitle}` : ""}</p>
              <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[11.5px]">
                <span className={cn("rounded-full px-2 py-0.5 font-medium", acc.cls)}>{acc.label}</span>
                {r.verified ? <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 font-medium text-emerald-700"><BadgeCheck className="h-3 w-3" /> {t("Doğrulandı")}</span> : <span className="rounded-full bg-ink-100 px-2 py-0.5 font-medium text-ink-600">{t("Tanımlayıcı yok")}</span>}
                {r.access === "full_text" && <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2 py-0.5 font-medium text-brand-700"><Unlock className="h-3 w-3" /> {t("Açık erişim")}</span>}
                {r.cites > 0 && <span className="rounded-full bg-ink-100 px-2 py-0.5 text-ink-600">{t("{n} atıf", { n: r.cites })}</span>}
                <span className="text-ink-400">{r.db === "Elle eklendi" ? t("Elle eklendi") : r.db}</span>
              </div>
            </div>
          );
        })}
      </div>
    ),
    yazim: (
      <div>
        <h4 className="font-serif text-xl text-ink-950">{p(DRAFT.heading)}</h4>
        {DRAFT.paras.map((x) => <p key={x.tr} className="mt-3 font-serif text-[16px] leading-8 text-ink-800" dangerouslySetInnerHTML={{ __html: withCites(p(x)) }} />)}
        <div className="mt-4 rounded-xl bg-amber-50 p-3 text-[13px] text-amber-900">{t("Kaynağı olmayan iddia uydurulmaz: sistem “[KAYNAK GEREKLİ]” diye işaretler ve bu konu için kaynak aramayı önerir.")}</div>
      </div>
    ),
    atif: (
      <div>
        <div className="mb-3 flex flex-wrap gap-1.5">
          {STYLE_IDS.map((id) => <button key={id} type="button" onClick={() => setStyle(id)} className={cn("rounded-full border px-3 py-1 text-[12.5px] font-medium transition", style === id ? "border-ink-900 bg-ink-900 text-white" : "border-ink-200 text-ink-600 hover:border-ink-300")}>{STYLES[id].label}</button>)}
        </div>
        <p className="text-[12px] font-semibold uppercase tracking-wide text-ink-400">{noteStyle ? t("Dipnotlu atıf") : t("Metin içi atıf")}</p>
        <p className="mt-1 font-serif text-[15.5px] leading-7 text-ink-800" dangerouslySetInnerHTML={{ __html: (notes.length = 0, noteSeen.clear(), withCites(p(DRAFT.paras[0]))) }} />
        {noteStyle && notes.length > 0 && <ol className="mt-2 space-y-1 border-t border-ink-100 pt-2 font-serif text-[13px] leading-6 text-ink-700">{notes.map((n, k) => <li key={k}><span className="mr-1">{k + 1}.</span><span dangerouslySetInnerHTML={{ __html: n }} /></li>)}</ol>}
        <p className="mt-4 text-[12px] font-semibold uppercase tracking-wide text-ink-400">{STYLES[style].bibliographyTitle[l]}</p>
        <ol className="mt-1 space-y-1.5">
          {bib.map((b) => <li key={b.id} className="pl-6 -indent-6 font-serif text-[15px] leading-7 text-ink-800">{b.number ? <span className="mr-1">[{b.number}]</span> : null}<span dangerouslySetInnerHTML={{ __html: richToHtml(b.rich) }} /></li>)}
        </ol>
      </div>
    ),
    matris: (
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-[13px]">
          <thead><tr className="border-b border-ink-200 text-[12px] uppercase tracking-wide text-ink-400">{[t("Kaynak"), t("Amaç"), t("Örneklem"), t("Yöntem"), t("Temel bulgu")].map((h) => <th key={h} className="py-2 pr-3 font-semibold">{h}</th>)}</tr></thead>
          <tbody>{MATRIX.map((m) => { const s = src(m.src); return <tr key={m.src} className="border-b border-ink-100 align-top text-ink-700"><td className="py-2.5 pr-3 font-medium text-ink-900" dangerouslySetInnerHTML={{ __html: richToHtml(new CitationEngine("apa7", sources, { locale: l }).cite([s.id])) }} /><td className="py-2.5 pr-3">{p(m.aim)}</td><td className="py-2.5 pr-3">{p(m.sample)}</td><td className="py-2.5 pr-3">{p(m.method)}</td><td className="py-2.5 pr-3">{p(m.finding)}</td></tr>; })}</tbody>
        </table>
      </div>
    ),
    anket: (
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2"><p className="font-semibold text-ink-900">{p(SURVEY.title)}</p><span className="rounded-full bg-ink-100 px-2 py-0.5 text-[12px] text-ink-600">{t("~{n} dk", { n: SURVEY.minutes })}</span></div>
        {SURVEY.blocks.map((b, i) => (
          <div key={b.code} className="rounded-2xl border border-ink-100 p-3.5">
            <div className="flex items-center gap-2 text-[12px]"><span className="flex h-6 w-6 items-center justify-center rounded-full bg-ink-100 font-semibold text-ink-600">{i + 1}</span><span className="rounded-full bg-brand-50 px-2 py-0.5 font-medium text-brand-700">{b.kind === "likert" ? t("Likert ölçeği") : b.kind === "number" ? t("Sayı") : t("Tek seçimli")}</span><code className="ml-auto text-ink-400">{b.code}</code></div>
            <p className="mt-2 text-[14px] text-ink-900">{p(b.q)}</p>
            {"items" in b && b.items ? (
              <ol className="mt-2 space-y-1 text-[13.5px] text-ink-700">{b.items.map((it, k) => <li key={it.tr} className="flex gap-2"><code className="w-9 shrink-0 text-[12px] text-ink-400">{b.code}{k + 1}</code><span>{p(it)}</span>{b.reverse?.includes(k) && <span className="ml-auto shrink-0 rounded-full bg-violet-50 px-2 py-0.5 text-[11px] font-medium text-violet-700">{t("ters madde")}</span>}</li>)}</ol>
            ) : <p className="mt-1 text-[13px] text-ink-500">{p(b.opts!)}</p>}
          </div>
        ))}
      </div>
    ),
    istatistik: (
      <div className="space-y-6">
        {[data.alpha, data.corr, data.ttest].map((r, i) => (
          <div key={r.title}>
            <p className="text-[13px] font-semibold text-ink-900">{t("Tablo {n}", { n: i + 1 })}</p>
            <p className="font-serif text-[14.5px] italic text-ink-800">{r.title}</p>
            <div className="mt-2 overflow-x-auto" dangerouslySetInnerHTML={{ __html: mdTable(r.table) }} />
            {r.notes.length > 0 && <p className="mt-1 text-[12px] text-ink-500">{r.notes.join(" ")}</p>}
            <p className="mt-2 font-serif text-[15px] leading-7 text-ink-800">{r.text}</p>
          </div>
        ))}
      </div>
    ),
    grafik: (
      <div>
        <p className="text-[13px] font-semibold text-ink-900">{t("Şekil 1")}</p>
        <p className="font-serif text-[14.5px] italic text-ink-800">{t("{x} ile {y} arasındaki ilişki", { x: V.sm, y: V.ert })}</p>
        <div className="mt-2 overflow-hidden rounded-xl border border-ink-100 bg-[rgb(255_255_255)] p-2 [&_svg]:h-auto [&_svg]:w-full" dangerouslySetInnerHTML={{ __html: data.chart }} />
      </div>
    ),
    butunluk: (
      <div className="space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[460px] text-center text-[13px]">
            <thead><tr className="text-[12px] font-semibold text-ink-500"><th className="py-1.5 text-left font-semibold">{t("Bölüm")}</th>{COHERENCE.cols.map((c) => <th key={c.tr} className="py-1.5 font-semibold">{p(c)}</th>)}</tr></thead>
            <tbody>
              {COHERENCE.rows.map((r, i) => (
                <tr key={r.s.tr} className="border-t border-ink-100">
                  <td className="py-2 text-left font-medium text-ink-800">{p(r.s)}</td>
                  {[...r.v].map((m, j) => (
                    <td key={j} className="py-2">
                      <motion.span initial={{ scale: 0.5, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.06 * (i * 4 + j), duration: 0.3 }}
                        className={cn("inline-flex h-7 w-7 items-center justify-center rounded-full text-[13px] font-bold", m === "✓" ? "bg-emerald-50 text-emerald-600" : m === "!" ? "bg-amber-100 text-amber-700 ring-2 ring-amber-200" : "bg-ink-50 text-ink-300")}>{m}</motion.span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-[12px] text-ink-400">✓ {t("karşılanıyor")} · ! {t("eksik")} · · {t("bu bölümün işi değil")}</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-amber-100 bg-amber-50/60 p-3 text-[13.5px] text-ink-800"><p className="text-[11px] font-semibold uppercase tracking-wide text-amber-700">{t("Tutarlılık zinciri")}</p><p className="mt-1">{p(COHERENCE.issue)}</p></div>
          <div className="rounded-xl border border-brand-100 bg-brand-50/50 p-3 text-[13.5px] text-ink-800"><p className="text-[11px] font-semibold uppercase tracking-wide text-brand-700">{t("Önerilen düzeltme")}</p><p className="mt-1">{p(COHERENCE.fix)}</p></div>
        </div>
      </div>
    ),
    kalite: (
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="flex shrink-0 flex-col gap-3 sm:w-56">
          <div className="flex flex-col items-center justify-center rounded-2xl bg-emerald-50 px-6 py-4 text-emerald-700"><span className="text-4xl font-semibold">{QUALITY.score}</span><span className="text-[12px] font-medium">{t("Kalite skoru")}</span></div>
          <div className="space-y-2">
            {QUALITY_AREAS.map((x, i) => (
              <div key={x.a.tr} className="text-[12px] text-ink-600">
                <div className="flex justify-between"><span>{p(x.a)}</span><b className="tabular-nums text-ink-800">{x.v}</b></div>
                <div className="mt-0.5 h-1.5 rounded-full bg-ink-100"><motion.div className="h-1.5 rounded-full bg-emerald-500" initial={{ width: 0 }} whileInView={{ width: `${x.v}%` }} viewport={{ once: true }} transition={{ delay: 0.12 * i, duration: 0.8, ease: "easeOut" }} /></div>
              </div>
            ))}
          </div>
        </div>
        <ul className="flex-1 space-y-2">
          {QUALITY.items.map((x) => <li key={x.t.tr} className={cn("rounded-xl border p-3 text-[13.5px]", x.tone === "amber" ? "border-amber-100 bg-amber-50/60" : x.tone === "green" ? "border-emerald-100 bg-emerald-50/60" : "border-ink-100")}><p className="font-medium text-ink-900">{p(x.t)}</p><p className="text-ink-500">{p(x.d)}</p></li>)}
        </ul>
      </div>
    ),
    ozet: (
      <div className={cn("grid gap-4", l === "tr" && !de && "md:grid-cols-2")}>
        {/* D168: Türkçe özet yalnızca Türkçe sitede gösterilir */}
        {l === "tr" && !de && <div>
          <p className="font-serif text-lg text-ink-950">Özet</p>
          <p className="mt-2 font-serif text-[14.5px] leading-7 text-ink-800">Bu çalışmada üniversite öğrencilerinde sosyal medya kullanım süresi, akademik erteleme ve uyku kalitesi arasındaki ilişkiler incelenmiştir. İlişkisel tarama modelindeki araştırmaya {data.n} lisans öğrencisi katılmıştır. Akademik erteleme ölçeğinin iç tutarlılığı yüksektir (α = .89). Sosyal medya kullanım süresi ile akademik erteleme arasında pozitif (r = {r2s(data.r1)}), akademik erteleme ile uyku kalitesi arasında negatif (r = {r2s(data.r2)}) anlamlı ilişkiler bulunmuştur. Erteleme puanları cinsiyete göre anlamlı biçimde farklılaşmamaktadır.</p>
          <p className="mt-2 text-[13.5px] text-ink-700"><b>Anahtar Kelimeler:</b> sosyal medya, akademik erteleme, uyku kalitesi, üniversite öğrencileri</p>
        </div>}
        <div>
          <p className="font-serif text-lg text-ink-950">Abstract</p>
          <p className="mt-2 font-serif text-[14.5px] leading-7 text-ink-800">This study examined the relationships between social media use, academic procrastination and sleep quality among university students. A total of {data.n} undergraduates took part in this correlational survey. The procrastination scale showed high internal consistency (α = .89). Social media use was positively related to academic procrastination (r = {r2s(data.r1)}), and procrastination was negatively related to sleep quality (r = {r2s(data.r2)}). Procrastination scores did not differ significantly by gender.</p>
          <p className="mt-2 text-[13.5px] text-ink-700"><b>Keywords:</b> social media, academic procrastination, sleep quality, university students</p>
        </div>
      </div>
    ),
    hakem: (
      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px] text-left text-[13.5px]">
          <thead><tr className="border-b border-ink-200 text-[12px] uppercase tracking-wide text-ink-400"><th className="py-2 pr-3 font-semibold">{t("Hakem yorumu")}</th><th className="py-2 pr-3 font-semibold">{t("Yanıtımız")}</th><th className="py-2 font-semibold">{t("Değişiklik")}</th></tr></thead>
          <tbody>{REVIEWER.map((x) => <tr key={x.c.tr} className="border-b border-ink-100 align-top"><td className="py-2.5 pr-3 italic text-ink-600">“{p(x.c)}”</td><td className="py-2.5 pr-3 text-ink-800">{p(x.r)}</td><td className="py-2.5 text-[12.5px] font-medium text-brand-700">{p(x.where)}</td></tr>)}</tbody>
        </table>
      </div>
    ),
    savunma: (
      <div className="space-y-3">
        <div className="rounded-2xl bg-ink-900 p-4 text-white"><p className="text-[11px] font-semibold uppercase tracking-wider text-white/60">{t("Jüri sorusu")}</p><p className="mt-1 text-[15px]">{p(DEFENSE.q)}</p></div>
        <div className="ml-6 rounded-2xl border border-ink-100 p-4"><p className="text-[11px] font-semibold uppercase tracking-wider text-ink-400">{t("Sizin cevabınız")}</p><p className="mt-1 text-[14.5px] text-ink-800">{p(DEFENSE.a)}</p></div>
        <div className="rounded-2xl border border-brand-100 bg-brand-50/50 p-4">
          <div className="flex items-center gap-2"><p className="text-[11px] font-semibold uppercase tracking-wider text-brand-700">{t("Değerlendirme")}</p><span className="ml-auto rounded-full bg-white px-2.5 py-0.5 text-[13px] font-semibold text-ink-900 ring-1 ring-ink-100">{DEFENSE.score}/10</span></div>
          <p className="mt-2 text-[14px] text-ink-800"><b className="text-emerald-700">{t("Güçlü yan:")}</b> {p(DEFENSE.good)}</p>
          <p className="mt-1 text-[14px] text-ink-800"><b className="text-amber-700">{t("Geliştirin:")}</b> {p(DEFENSE.improve)}</p>
        </div>
      </div>
    ),
    sunum: (
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { h: p(SAMPLE_WORK.title), s: t("Yüksek lisans tezi savunması"), dark: true },
          { h: t("Araştırma soruları"), list: BLUEPRINT.questions.map(p) },
          { h: t("Temel bulgular"), list: [`${V.sm} ↔ ${V.ert}: r = ${r2s(data.r1)}`, `${V.ert} ↔ ${V.uyku}: r = ${r2s(data.r2)}`, t("Cinsiyete göre anlamlı fark yok")] },
        ].map((sl, i) => (
          <div key={i} className={cn("flex aspect-[16/9] flex-col justify-center rounded-xl p-3 shadow-soft ring-1 ring-ink-100", sl.dark ? "bg-ink-900 text-white" : "bg-white text-ink-900")}>
            <p className={cn("font-serif leading-tight", sl.dark ? "text-[12.5px]" : "text-[13px] font-semibold")}>{sl.h}</p>
            {sl.s && <p className="mt-1 text-[10px] text-white/60">{sl.s}</p>}
            {sl.list && <ul className="mt-1.5 list-disc space-y-0.5 pl-3.5 text-[9.5px] leading-snug text-ink-600">{sl.list.map((x) => <li key={x}>{x}</li>)}</ul>}
          </div>
        ))}
      </div>
    ),
    cikti: (
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex aspect-[1/1.414] flex-col items-center justify-between rounded-lg bg-[rgb(255_255_255)] p-6 text-center font-serif text-[rgb(20_20_20)] shadow-soft ring-1 ring-ink-100">
          <div className="flex flex-col items-center gap-1 text-[8.5px] uppercase leading-snug tracking-wide">
            <span className="mb-1 flex h-9 w-9 items-center justify-center rounded-full border border-dashed border-[rgb(150_150_150)] font-sans text-[6.5px] normal-case text-[rgb(130_130_130)]">{t("Logo")}</span>
            {l === "tr" && !de && <p>T.C.</p>}
            <p className="font-semibold">{de ? "[Name der Universität]" : l === "en" ? "[University name]" : "[Üniversite adı]"}</p>
            <p>{de ? "Institut für Erziehungswissenschaften" : l === "en" ? "Graduate School of Educational Sciences" : "Eğitim Bilimleri Enstitüsü"}</p>
            <p>{de ? "Abteilung Bildungswissenschaften" : l === "en" ? "Department of Educational Sciences" : "Eğitim Bilimleri Anabilim Dalı"}</p>
          </div>
          <p className="text-[12.5px] font-semibold uppercase leading-snug">{p(SAMPLE_WORK.title)}</p>
          <div className="text-[9px]"><p className="font-semibold">{de ? "MASTERARBEIT" : l === "en" ? "MASTER’S THESIS" : "YÜKSEK LİSANS TEZİ"}</p><p className="mt-2">{de ? "Juni 2026" : l === "en" ? "June 2026" : "Haziran 2026"}</p></div>
        </div>
        <div className="flex aspect-[1/1.414] flex-col rounded-lg bg-[rgb(255_255_255)] p-6 text-[rgb(20_20_20)] shadow-soft ring-1 ring-ink-100">
          <p className="mb-3 text-center font-serif text-[12px] font-semibold">{de ? "INHALTSVERZEICHNIS" : l === "en" ? "CONTENTS" : "İÇİNDEKİLER"}</p>
          <ul className="space-y-1 font-serif text-[9.5px]">
            {[[de || l === "en" ? "Abstract" : "Özet", "iv"], [de ? "Tabellenverzeichnis" : l === "en" ? "List of Tables" : "Tablolar Listesi", "vi"], [de ? "Abbildungsverzeichnis" : l === "en" ? "List of Figures" : "Şekiller Listesi", "vii"], ...BLUEPRINT.chapters.map((c, i) => [i ? `${i}. ${p(c.t)}` : p(c.t), String([1, 9, 31, 42, 57, 68][i])]), [de ? "Literaturverzeichnis" : l === "en" ? "References" : "Kaynakça", "72"]].map(([a, b]) => <li key={a} className="flex gap-1"><span>{a}</span><span className="flex-1 border-b border-dotted border-[rgb(160_160_160)]" /><span>{b}</span></li>)}
          </ul>
        </div>
      </div>
    ),
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[230px_1fr]">
      {/* Gezinme */}
      <nav className="min-w-0 lg:sticky lg:top-28 lg:h-fit" aria-label={t("Örnekler")}>
        <ul className="-mx-6 flex gap-1.5 overflow-x-auto px-6 pb-1 lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0">
          {SECTIONS.map((s) => { const I = ICONS[s.icon as keyof typeof ICONS]; return <li key={s.id} className="shrink-0"><a href={`#${s.id}`} className="flex items-center gap-2 whitespace-nowrap rounded-xl px-3 py-2 text-[13.5px] text-ink-600 ring-1 ring-ink-100 transition hover:bg-white hover:text-ink-900 lg:ring-0"><I className="h-4 w-4 shrink-0 text-brand-600" /> {p(s.title)}</a></li>; })}
        </ul>
      </nav>

      <div className="min-w-0 space-y-12">
        <div className="flex items-start gap-2 rounded-2xl border border-brand-100 bg-brand-50/60 p-4 text-[13.5px] text-ink-700">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
          <span>{t("Tüm örnekler aynı kurgusal çalışma üzerindendir: “{title}”. Kaynaklar, yazarlar ve veriler temsilidir. İstatistik tabloları, grafik ve atıf biçimleri elle yazılmamıştır; sistemin kendi araçlarıyla bu örnek veriden üretilmiştir. Kendi çalışmanızda içerik, sizin kaynaklarınızdan ve verinizden gelir.", { title: p(SAMPLE_WORK.title) })}</span>
        </div>
        {SECTIONS.map((s) => {
          const I = ICONS[s.icon as keyof typeof ICONS];
          return (
            <section key={s.id} id={s.id} className="scroll-mt-28">
              <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-600"><I className="h-5 w-5" /></span>
                <h2 className="font-serif text-2xl font-medium text-ink-950">{p(s.title)}</h2>
                <span className={cn("rounded-full px-2.5 py-0.5 text-[11.5px] font-semibold", s.plan === "free" ? "bg-emerald-50 text-emerald-700" : s.plan === "basic" ? "bg-sky-50 text-sky-700" : "bg-violet-50 text-violet-700")}>{t(PLAN_LABEL[s.plan])}</span>
              </div>
              <p className="mb-3 text-[14.5px] text-ink-500">{p(s.what)}</p>
              <div className="rounded-3xl border border-ink-100 bg-white p-5 shadow-soft sm:p-6">{body[s.id]}</div>
            </section>
          );
        })}
        <div className="rounded-3xl bg-ink-900 p-8 text-center text-white">
          <p className="font-serif text-2xl">{t("Aynısını kendi çalışmanız için yapın.")}</p>
          <p className="mt-2 text-white/70">{t("Ücretsiz başlayın; kurgudan kaynakçaya kadar her adım bir arada.")}</p>
          <Link href={signedIn ? "/yeni" : "/kayit"} className="mt-5 inline-flex h-11 items-center gap-2 rounded-2xl bg-white px-6 text-sm font-medium text-ink-900 transition hover:-translate-y-0.5">{t("Ücretsiz başla")} <ArrowRight className="h-4 w-4" /></Link>
        </div>
      </div>
    </div>
  );
}
