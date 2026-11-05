"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Loader2, Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/components/ui/cn";
import { useT } from "@/i18n/client";
import type { CitationItem, CitationStyleId, ItemType } from "@/lib/citations/types";
import { detectFormat, parseReferences } from "@/lib/sources/bib";
import { parseReference } from "@/lib/import/references";
import { Bibliography, itemId, SignupCta, StylePicker, useToolPing } from "./shared";

const toItem = (r: any): CitationItem => ({
  id: itemId(), type: (r.type ?? "article-journal") as ItemType, title: r.title ?? "", authors: r.authors ?? [], editors: r.editors, year: r.year ?? null,
  containerTitle: r.containerTitle ?? null, volume: r.volume ?? null, issue: r.issue ?? null, pages: r.pages ?? null, publisher: r.publisher ?? null,
  publisherPlace: r.publisherPlace ?? null, edition: r.edition ?? null, doi: r.doi ?? null, url: r.url ?? null, isbn: r.isbn ?? null,
});

async function lookup(items: string[], tool: "bibliography" | "convert"): Promise<(any | null)[]> {
  const res = await fetch("/api/public/tools/lookup", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ items, tool }) });
  const j = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(j.error ?? "Hata");
  return j.records ?? [];
}

function LangPicker({ value, onChange }: { value: "tr" | "en"; onChange: (v: "tr" | "en") => void }) {
  const { t } = useT();
  return (
    <label className="block"><span className="label">{t("Kaynakça dili")}</span>
      <select className="input" value={value} onChange={(e) => onChange(e.target.value as "tr" | "en")}><option value="tr">{t("Türkçe (ve, vd., erişim)")}</option><option value="en">{t("İngilizce (and, et al.)")}</option></select>
    </label>
  );
}

/** Kaynakça oluşturucu (D90): DOI/başlık → kayıt otoritesi; elle giriş. Yapay zekâ yok. */
export function BibliographyTool() {
  const { t } = useT();
  const ping = useToolPing("bibliography");
  const [mode, setMode] = useState<"auto" | "manual">("auto");
  const [text, setText] = useState("");
  const [items, setItems] = useState<CitationItem[]>([]);
  const [style, setStyle] = useState<CitationStyleId>("apa7");
  const [lang, setLang] = useState<"tr" | "en">("tr");
  const [busy, setBusy] = useState(false);
  const [missing, setMissing] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [m, setM] = useState({ type: "article-journal", authors: "", year: "", title: "", container: "", volume: "", issue: "", pages: "", publisher: "", doi: "" });

  async function find() {
    const lines = text.split("\n").map((l) => l.trim()).filter((l) => l.length > 3).slice(0, 25);
    if (!lines.length) return;
    setBusy(true); setError(""); setMissing([]);
    try {
      const recs = await lookup(lines, "bibliography");
      setItems((l) => [...l, ...recs.filter(Boolean).map(toItem)]);
      setMissing(lines.filter((_, i) => !recs[i]));
      setText("");
    } catch (e) { setError((e as Error).message); } finally { setBusy(false); }
  }
  function addManual() {
    if (!m.title.trim()) return;
    ping();
    const authors = m.authors.split(/;|\n/).map((a) => a.trim()).filter(Boolean).map((a) => { const [family, given] = a.split(",").map((x) => x.trim()); return given ? { family, given } : { family }; });
    setItems((l) => [...l, { id: itemId(), type: m.type as ItemType, title: m.title.trim(), authors, year: Number(m.year) || null, containerTitle: m.container || null, volume: m.volume || null, issue: m.issue || null, pages: m.pages || null, publisher: m.publisher || null, doi: m.doi || null }]);
    setM({ ...m, authors: "", year: "", title: "", container: "", volume: "", issue: "", pages: "", doi: "" });
  }
  const inp = (k: keyof typeof m, label: string, ph = "") => <label className="block"><span className="label">{label}</span><input className="input" value={m[k]} placeholder={ph} onChange={(e) => setM({ ...m, [k]: e.target.value })} /></label>;
  return (
    <div className="space-y-6">
      <div className="card space-y-4 p-5">
        <div className="flex flex-wrap gap-1 rounded-xl bg-ink-100 p-1" role="tablist">
          {([["auto", "DOI veya başlıkla"], ["manual", "Elle gir"]] as const).map(([k, l]) => <button key={k} role="tab" aria-selected={mode === k} onClick={() => setMode(k)} className={cn("flex-1 rounded-lg px-3 py-1.5 text-[13px] font-medium", mode === k ? "bg-white text-ink-900 shadow-sm" : "text-ink-500")}>{t(l)}</button>)}
        </div>
        {mode === "auto" ? (
          <>
            <textarea className="input min-h-[120px]" value={text} onChange={(e) => setText(e.target.value)} placeholder={t("Her satıra bir DOI (ör. 10.1037/0000165-000) veya yayın başlığı yazın. En fazla 25 satır.")} />
            <div className="flex flex-wrap items-center gap-3"><Button onClick={find} disabled={busy || !text.trim()}>{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} {t("Bul ve ekle")}</Button><span className="text-xs text-ink-500">{t("Künyeler Crossref, DataCite ve OpenAlex kayıtlarından alınır; yapay zekâ kullanılmaz.")}</span></div>
            {missing.length > 0 && <div className="rounded-xl bg-amber-50 p-3 text-[13px] text-amber-900"><b>{t("Bulunamayanlar")}:</b> {missing.join(" · ")} <span className="block text-xs">{t("Bunları “Elle gir” sekmesinden ekleyebilirsiniz.")}</span></div>}
            {error && <p className="text-sm text-rose-600">{error}</p>}
          </>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block"><span className="label">{t("Tür")}</span><select className="input" value={m.type} onChange={(e) => setM({ ...m, type: e.target.value })}><option value="article-journal">{t("Dergi makalesi")}</option><option value="book">{t("Kitap")}</option><option value="chapter">{t("Kitap bölümü")}</option><option value="thesis">{t("Tez")}</option><option value="report">{t("Rapor")}</option><option value="webpage">{t("Web sayfası")}</option></select></label>
            {inp("authors", t("Yazarlar"), t("Soyad, A.; Soyad, B."))}
            {inp("year", t("Yıl"))}
            {inp("title", t("Başlık"))}
            {inp("container", m.type === "chapter" ? t("Kitap adı") : t("Dergi adı"))}
            {inp("publisher", t("Yayınevi / kurum"))}
            {inp("volume", t("Cilt"))}
            {inp("issue", t("Sayı"))}
            {inp("pages", t("Sayfalar"), "12-34")}
            {inp("doi", "DOI")}
            <div className="sm:col-span-2"><Button onClick={addManual} disabled={!m.title.trim()}><Plus className="h-4 w-4" /> {t("Kaynağı ekle")}</Button></div>
          </div>
        )}
      </div>
      {items.length > 0 && (
        <>
          <div className="grid gap-3 sm:grid-cols-2"><StylePicker value={style} onChange={setStyle} /><LangPicker value={lang} onChange={setLang} /></div>
          <Bibliography items={items} style={style} locale={lang} onRemove={(id) => setItems((l) => l.filter((x) => x.id !== id))} />
          <SignupCta text={t("Academiana’da kaynaklarınız çalışmanızla birlikte saklanır; metne eklediğiniz her atıf kaynakçaya kendiliğinden girer ve stil değişince hepsi birlikte güncellenir.")} />
        </>
      )}
    </div>
  );
}

/** Atıf stili dönüştürücü (D90): yapıştırılan kaynakça veya BibTeX/RIS → seçilen stil. Yapay zekâ yok. */
export function ConvertTool() {
  const { t } = useT();
  const ping = useToolPing("convert");
  const [text, setText] = useState("");
  const [items, setItems] = useState<CitationItem[]>([]);
  const [style, setStyle] = useState<CitationStyleId>("isnad");
  const [lang, setLang] = useState<"tr" | "en">("tr");
  const [complete, setComplete] = useState(true);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");

  async function convert() {
    setBusy(true); setNote("");
    try {
      const fmt = detectFormat(text);
      let list: CitationItem[];
      let lines: string[] = [];
      if (fmt) list = parseReferences(text, fmt).refs.map(toItem);
      else {
        // Her kaynak yeni satırda başlar; küçük harfle veya noktalamayla başlayan satır öncekinin devamıdır
        for (const raw of text.split("\n")) {
          const l = raw.replace(/^\s*(\[\d+\]|\d+[.)])\s*/, "").trim();
          if (!l) continue;
          if (lines.length && /^[\p{Ll}(,.;:&–-]/u.test(l)) lines[lines.length - 1] += ` ${l}`;
          else lines.push(l);
        }
        lines = lines.map((l) => l.replace(/\s+/g, " ")).filter((l) => l.length > 15).slice(0, 25);
        list = lines.map((l) => { const p = parseReference(l); return { id: itemId(), type: "article-journal", title: p.title, authors: p.authors, year: p.year, containerTitle: p.container, doi: p.doi } as CitationItem; });
        // Ayrıştırma her biçimde kusursuz olmaz: DOI veya başlıkla resmî kayıttan tamamlanır
        if (complete && lines.length) {
          const recs = await lookup(lines, "convert").catch(() => [] as any[]);
          let fixed = 0;
          list = list.map((it, i) => { if (recs[i]) { fixed++; return toItem(recs[i]); } return it; });
          setNote(t("{a}/{b} kaynak resmî kayıttan tamamlandı; diğerleri yazdığınız metinden ayrıştırıldı, kontrol edin.", { a: fixed, b: list.length }));
        } else setNote(t("Kaynaklar yazdığınız metinden ayrıştırıldı; sonucu kontrol edin."));
      }
      if (!complete || fmt) ping();
      setItems(list);
    } finally { setBusy(false); }
  }
  return (
    <div className="space-y-6">
      <div className="card space-y-4 p-5">
        <textarea className="input min-h-[200px]" value={text} onChange={(e) => setText(e.target.value)} placeholder={t("Kaynakçanızı yapıştırın (her kaynak ayrı satırda). Zotero, Mendeley veya EndNote’tan alınan BibTeX/RIS da olur.")} />
        <div className="grid gap-3 sm:grid-cols-3"><StylePicker value={style} onChange={setStyle} /><LangPicker value={lang} onChange={setLang} />
          <label className="flex items-end gap-2 pb-2 text-[13px] text-ink-700"><input type="checkbox" checked={complete} onChange={(e) => setComplete(e.target.checked)} /> {t("Eksik bilgileri resmî kayıttan tamamla (önerilir)")}</label>
        </div>
        <Button onClick={convert} disabled={busy || text.trim().length < 15}>{busy && <Loader2 className="h-4 w-4 animate-spin" />} {t("Dönüştür")}</Button>
        {note && <p className="text-[13px] text-ink-600">{note}</p>}
      </div>
      {items.length > 0 && <Bibliography items={items} style={style} locale={lang} onRemove={(id) => setItems((l) => l.filter((x) => x.id !== id))} />}
    </div>
  );
}
