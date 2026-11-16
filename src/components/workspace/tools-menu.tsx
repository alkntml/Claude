"use client";
/**
 * Çalışma alanı araçları (D212): bütün özellikler tek, gruplu ve aranabilir menüde toplanır.
 * Gruplar: Zenit (yazım), Rasat (kaynaklar ve okuma), Mizan (denetim), Veri ve analiz, Teslim ve yayın, İçe aktarma.
 * Masaüstünde üst çubuktaki “Araçlar” geniş bir menü açar (arama kutusuyla); mobilde “Diğer” menüsünde gruplu satırlar.
 */
import { AnimatePresence, motion } from "framer-motion";
import {
  BarChart3, BookOpenText, Bot, ClipboardList, FileCheck2, FileUp, Filter, Gavel, Languages, Layers, LineChart, Lock, MessageSquareReply, Network,
  Newspaper, Presentation, Ruler, Scale, Search, ShieldCheck, Table2, Upload, Wand2, Wrench,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { BrandMark, type Signature } from "@/components/brand-mark";
import { Button } from "@/components/ui/button";
import { cn } from "@/components/ui/cn";
import { useT } from "@/i18n/client";
import { FEATURE_MIN_PLAN, PLAN_NAME, hasFeature, type FeatureId } from "@/lib/features";

export type ToolId =
  | "assistant" | "language" | "reviewer"
  | "find-sources" | "sources" | "multi" | "matrix" | "litmap" | "consensus" | "prisma"
  | "claims" | "fix" | "quality"
  | "analysis" | "chart" | "survey"
  | "format" | "journals" | "presentation" | "defense"
  | "hub" | "import";

/** Pakete bağlı araçlar; listede olmayanlar her pakette açıktır */
export const TOOL_FEATURE: Partial<Record<ToolId, FeatureId>> = { prisma: "prisma", litmap: "litmap", chart: "stats", analysis: "stats", survey: "surveys", reviewer: "reviewer", defense: "defense", multi: "matrix", matrix: "matrix" };

type Tool = { id: ToolId; label: string; hint: string; Icon: typeof Wrench; types?: string[] };
/** Arama için ek anahtar kelimeler (TR/EN/DE; çevrilmez, yalnızca eşleşme için) */
const KEYWORDS: Partial<Record<ToolId, string>> = {"assistant": "yaz taslak genişlet write draft expand yapay zeka ai", "language": "çeviri ingilizce translate english grammar dil bilgisi übersetzung", "reviewer": "hakem revizyon review revision reviewer gutachter", "find-sources": "kaynak bul literatür tarama search doi pubmed makale ekle literature quelle", "sources": "alıntı pdf oku sor soru quote read ask page sayfa zitat", "multi": "karşılaştır sentez compare synthesis paragraf vergleich", "matrix": "tablo özet table matrix", "litmap": "atıf ağı network citation graph harita map", "consensus": "uzlaşı consensus kanıt evidence", "prisma": "derleme sistematik systematic review screening eleme", "claims": "doğrula doğrulama iddia verify claim atıf citation kontrol check beleg", "fix": "kaynak gerekli missing citation düzelt fix", "quality": "kalite puan rapor score report jüri hakem dil kontrol check qualität", "analysis": "istatistik spss t testi anova regresyon stats statistik", "chart": "grafik şekil figure chart plot", "survey": "anket form survey questionnaire veri umfrage", "format": "biçim kapak kenar yazı tipi format cover margin font kılavuz", "journals": "dergi yayın journal publish ön yazı cover letter zeitschrift", "presentation": "sunum powerpoint pptx slayt slide savunma", "defense": "savunma jüri prova defense viva verteidigung", "hub": "içe aktar import zotero mendeley orcid word pdf bib ris", "import": "word docx içe aktar import"};
/** Büyük/küçük harf ve aksan duyarsız karşılaştırma (ı/i, ş/s, ü/u …) */
const norm = (x: string) => x.toLocaleLowerCase("tr").replace(/ı/g, "i").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
type Group = { id: string; title: string; mark?: Signature; tools: Tool[] };

const ARTICLE_TYPES = ["research_article", "journal_article", "literature_review", "grant_proposal"];

export const TOOL_GROUPS: Group[] = [
  { id: "zenit", title: "Yazım", mark: "Zenit", tools: [
    { id: "assistant", label: "Zenit asistanı", hint: "Bölümü yazdırın, genişletin, yeniden yazdırın; serbest istekler", Icon: Bot },
    { id: "language", label: "Dil ve çeviri", hint: "Akademik çeviri, dil denetimi, terim sözlüğü", Icon: Languages },
    { id: "reviewer", label: "Hakem yorumlarına cevap", hint: "Madde madde cevap mektubu", Icon: MessageSquareReply, types: ARTICLE_TYPES },
  ] },
  { id: "rasat", title: "Kaynaklar ve okuma", mark: "Rasat", tools: [
    { id: "find-sources", label: "Kaynak ara ve ekle", hint: "16 veri tabanında arama; DOI, PMID veya elle ekleme", Icon: Search },
    { id: "sources", label: "Oku, sor ve alıntıla", hint: "PDF’ten seçerek sayfa numaralı alıntı; kaynağa soru", Icon: BookOpenText },
    { id: "multi", label: "Birlikte analiz et", hint: "Makaleleri karşılaştırın; sentezi atıflarla ekleyin", Icon: Layers },
    { id: "matrix", label: "Literatür matrisi", hint: "Amaç, yöntem, örneklem ve bulgular tek tabloda", Icon: Table2 },
    { id: "litmap", label: "Literatür haritası", hint: "Kaynaklarınızın atıf ağı ve eksik temel çalışmalar", Icon: Network },
    { id: "consensus", label: "Araştırmalar ne diyor?", hint: "Gerçek makalelerin özetlerinden kaynaklı cevap", Icon: Scale },
    { id: "prisma", label: "Sistematik derleme (PRISMA)", hint: "Kayıt toplama, eleme ve PRISMA 2020 akış şeması", Icon: Filter, types: ["literature_review"] },
  ] },
  { id: "mizan", title: "Denetim", mark: "Mizan", tools: [
    { id: "claims", label: "İddia denetimi", hint: "Atıflı her cümle kaynağında destekleniyor mu? Pasaj ve sayfasıyla", Icon: ShieldCheck },
    { id: "fix", label: "Kaynak gerektiren ifadeleri düzelt", hint: "[KAYNAK GEREKLİ] ve desteklenmeyen iddialara kaynak bulur", Icon: Wand2 },
    { id: "quality", label: "Kalite kontrol ve puan", hint: "Dil, tutarlılık, atıf ve kaynak denetimi; jüri gözüyle inceleme", Icon: FileCheck2 },
  ] },
  { id: "data", title: "Veri ve analiz", tools: [
    { id: "analysis", label: "İstatistik analizi", hint: "t testi, ANOVA, korelasyon, regresyon…", Icon: BarChart3 },
    { id: "chart", label: "Grafik oluştur", hint: "Verinizden APA biçiminde şekil", Icon: LineChart },
    { id: "survey", label: "Anket oluştur", hint: "Bağlantıyla veri toplayın, analize aktarın", Icon: ClipboardList },
  ] },
  { id: "deliver", title: "Teslim ve yayın", tools: [
    { id: "format", label: "Biçim ve kapak ayarları", hint: "Kenar boşluğu, yazı tipi, kapak, içindekiler", Icon: Ruler },
    { id: "journals", label: "Dergi önerisi ve ön yazı", hint: "Çalışmanıza uygun dergiler ve editöre mektup", Icon: Newspaper, types: ARTICLE_TYPES },
    { id: "presentation", label: "Savunma sunumu (.pptx)", hint: "Çalışmanızdan sunum dosyası", Icon: Presentation },
    { id: "defense", label: "Savunma provası", hint: "Yapay zekâ jüri soruları ve geri bildirim", Icon: Gavel },
  ] },
  { id: "import", title: "İçe aktarma", tools: [
    { id: "hub", label: "Tüm çalışmayı veya kaynakları içe aktar", hint: "Word/PDF, Zotero, Mendeley, ORCID, DOI, .bib/.ris", Icon: Upload },
    { id: "import", label: "Word’den bu bölüme aktar", hint: "Belgeyi kaynakları ve atıflarıyla bölüme aktarın", Icon: FileUp },
  ] },
];

/** Çalışma türüne uygun araçlar grubunun başına alınır (ör. derlemede PRISMA, makalede hakem cevabı) */
function ordered(group: Group, workType: string): Tool[] {
  return [...group.tools].sort((a, b) => Number(!!b.types?.includes(workType)) - Number(!!a.types?.includes(workType)));
}

function GroupTitle({ g }: { g: Group }) {
  const { t } = useT();
  return (
    <p className="flex items-center gap-1.5 px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-400">
      {g.mark && <BrandMark name={g.mark} className="text-[12.5px] normal-case tracking-normal" />}
      {g.mark && <span aria-hidden>·</span>}
      {t(g.title)}
    </p>
  );
}

export function ToolsMenu({ onPick, workType, variant = "button", planId }: { onPick: (id: ToolId) => void; workType: string; variant?: "button" | "rows"; planId?: string }) {
  const { t } = useT();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);
  /** Kilitli araçta gerekli paketin adı (ör. “Pro”) */
  const lockOf = (id: ToolId) => { const f = TOOL_FEATURE[id]; return !f || hasFeature(planId, f) ? null : PLAN_NAME[FEATURE_MIN_PLAN[f]]; };
  const badge = (id: ToolId) => { const p = lockOf(id); return p ? <span className="ml-auto inline-flex shrink-0 items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700"><Lock className="h-3 w-3" />{p}</span> : null; };

  const groups = useMemo(() => {
    const needle = norm(q.trim());
    return TOOL_GROUPS.map((g) => ({
      ...g,
      tools: ordered(g, workType).filter((x) => !needle || needle.split(/\s+/).every((w) => norm([x.label, t(x.label), x.hint, t(x.hint), g.title, t(g.title), g.mark ?? "", KEYWORDS[x.id] ?? ""].join(" ")).includes(w))),
    })).filter((g) => g.tools.length > 0);
  }, [q, workType, t]);

  useEffect(() => {
    if (!open) { setQ(""); return; }
    const id = setTimeout(() => searchRef.current?.focus(), 30);
    const fn = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", fn);
    return () => { clearTimeout(id); window.removeEventListener("keydown", fn); };
  }, [open]);

  if (variant === "rows") {
    return (
      <div className="space-y-1">
        {TOOL_GROUPS.map((g) => (
          <div key={g.id}>
            <GroupTitle g={g} />
            <div className="grid gap-1.5">
              {ordered(g, workType).map(({ id, label, Icon }) => (
                <button key={id} onClick={() => onPick(id)} className="flex items-center gap-3 rounded-2xl border border-ink-100 px-4 py-3 text-left text-[15px] font-medium text-ink-800"><Icon className="h-5 w-5 text-brand-600" /> {t(label)}{badge(id)}</button>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }
  return (
    <div className="relative hidden lg:block">
      <Button size="sm" variant="ghost" className="!h-9 !text-[13.5px]" onClick={() => setOpen((o) => !o)} aria-expanded={open}><Wrench className="h-4 w-4" /> {t("Araçlar")}</Button>
      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
            <motion.div initial={{ opacity: 0, y: -6, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -6 }}
              className="absolute right-0 top-11 z-40 flex max-h-[min(78vh,720px)] w-[min(720px,calc(100vw-2rem))] flex-col rounded-2xl border border-ink-100 bg-white shadow-2xl">
              <div className="border-b border-ink-100 p-2.5">
                <label className="flex items-center gap-2 rounded-xl bg-ink-50 px-3">
                  <Search className="h-4 w-4 shrink-0 text-ink-400" />
                  <input ref={searchRef} value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("Özellik ara: ör. alıntı, çeviri, PRISMA, grafik…")} aria-label={t("Özellik ara")}
                    className="h-10 min-w-0 flex-1 bg-transparent text-[14px] text-ink-800 outline-none placeholder:text-ink-400"
                    onKeyDown={(e) => { if (e.key === "Enter") { const first = groups[0]?.tools[0]; if (first) { setOpen(false); onPick(first.id); } } }} />
                </label>
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto p-1.5">
                {groups.length === 0 && <p className="px-3 py-6 text-center text-[13px] text-ink-500">{t("Bu aramayla eşleşen özellik yok.")}</p>}
                <div className="gap-x-2 sm:columns-2">
                  {groups.map((g) => (
                    <div key={g.id} className="min-w-0 break-inside-avoid pb-1">
                      <GroupTitle g={g} />
                      {g.tools.map(({ id, label, hint, Icon }) => (
                        <button key={id} onClick={() => { setOpen(false); onPick(id); }} className="flex w-full items-start gap-3 rounded-xl px-3 py-2 text-left transition hover:bg-ink-50">
                          <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", g.mark ? "text-brand-600" : "text-ink-500")} />
                          <span className="min-w-0 flex-1"><span className="block text-[13.5px] font-medium text-ink-800">{t(label)}</span><span className="block text-[12px] leading-snug text-ink-500">{t(hint)}</span></span>{badge(id)}
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
