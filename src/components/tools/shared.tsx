"use client";
import { Check, ClipboardCopy } from "lucide-react";
import { useCallback, useMemo, useRef, useState } from "react";
import Link from "@/components/l-link";
import { cn } from "@/components/ui/cn";
import { useT } from "@/i18n/client";
import { CitationEngine, STYLE_IDS, STYLES } from "@/lib/citations/styles";
import type { CitationItem, CitationStyleId } from "@/lib/citations/types";
import { richToHtml, richToPlain } from "@/lib/citations/util";

/** Aracın ilk gerçek kullanımında bir kez sayaç (D90; maliyet yok, kişisel veri yok) */
export function useToolPing(tool: "sample_size" | "alpha" | "survey_builder" | "convert" | "bibliography") {
  const done = useRef(false);
  return useCallback(() => {
    if (done.current) return;
    done.current = true;
    fetch("/api/public/tools/use", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ tool }), keepalive: true }).catch(() => {});
  }, [tool]);
}

export function StylePicker({ value, onChange, id = "style" }: { value: CitationStyleId; onChange: (s: CitationStyleId) => void; id?: string }) {
  const { t } = useT();
  return (
    <label className="block">
      <span className="label" id={`${id}-l`}>{t("Atıf stili")}</span>
      <select aria-labelledby={`${id}-l`} className="input" value={value} onChange={(e) => onChange(e.target.value as CitationStyleId)}>
        {STYLE_IDS.map((s) => <option key={s} value={s}>{t(STYLES[s].label)}</option>)}
      </select>
    </label>
  );
}

/** Biçimlendirilmiş metni (italik korunarak) panoya kopyalar; Word ve Google Dokümanlar’a yapıştırılabilir */
export function CopyButton({ html, text, label }: { html: string; text: string; label?: string }) {
  const { t } = useT();
  const [ok, setOk] = useState(false);
  async function copy() {
    try {
      if (typeof ClipboardItem !== "undefined" && navigator.clipboard?.write) {
        await navigator.clipboard.write([new ClipboardItem({ "text/html": new Blob([html], { type: "text/html" }), "text/plain": new Blob([text], { type: "text/plain" }) })]);
      } else await navigator.clipboard.writeText(text);
      setOk(true); setTimeout(() => setOk(false), 1600);
    } catch { /* izin verilmedi */ }
  }
  return (
    <button type="button" onClick={copy} className={cn("inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-[13px] font-medium transition", ok ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-ink-200 bg-white text-ink-700 hover:border-ink-300")}>
      {ok ? <Check className="h-4 w-4" /> : <ClipboardCopy className="h-4 w-4" />} {ok ? t("Kopyalandı") : label ?? t("Kopyala")}
    </button>
  );
}

/** Seçilen stilde kaynakça + her kaynağın metin içi atıf örneği */
export function Bibliography({ items, style, locale, onRemove }: { items: CitationItem[]; style: CitationStyleId; locale: "tr" | "en" | "de"; onRemove?: (id: string) => void }) {
  const { t } = useT();
  const engine = useMemo(() => new CitationEngine(style, items, { locale, citedOrder: items.map((i) => i.id) }), [items, style, locale]);
  const entries = engine.bibliography();
  if (!items.length) return null;
  const html = entries.map((e) => `<p>${engine.meta.family === "numeric" ? `[${e.number}] ` : ""}${richToHtml(e.rich)}</p>`).join("");
  const text = entries.map((e) => `${engine.meta.family === "numeric" ? `[${e.number}] ` : ""}${richToPlain(e.rich)}`).join("\n");
  return (
    <div className="card p-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <p className="font-serif text-xl font-semibold text-ink-950">{engine.meta.bibliographyTitle[locale]}</p>
        <CopyButton html={html} text={text} label={t("Kaynakçayı kopyala")} />
      </div>
      <ol className="space-y-3">
        {entries.map((e) => {
          // D190: dipnotlu stilde metin içi atıf yerine ilk dipnot (tam künye) ve sonraki dipnot (kısa atıf) gösterilir
          const isNote = engine.meta.family === "note";
          const intext = richToPlain(isNote ? engine.note([e.id], {}, true) : engine.cite([e.id], {}, false));
          const narrative = engine.meta.family === "numeric" ? null : richToPlain(isNote ? engine.note([e.id], {}, false) : engine.cite([e.id], { narrative: true }, false));
          return (
            <li key={e.id} className="group rounded-xl border border-ink-100 bg-white p-3">
              <p className="font-serif text-[15.5px] leading-relaxed text-ink-900" style={{ paddingLeft: "2em", textIndent: "-2em" }}>
                {engine.meta.family === "numeric" && <span>[{e.number}] </span>}<span dangerouslySetInnerHTML={{ __html: richToHtml(e.rich) }} />
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-500">
                <span>{isNote ? t("İlk dipnot:") : t("Metin içi:")} <b className="font-medium text-ink-800">{intext}</b></span>
                {narrative && <span>{isNote ? t("Sonraki dipnotlar:") : t("Anlatı:")} <b className="font-medium text-ink-800">{narrative}</b></span>}
                {onRemove && <button type="button" onClick={() => onRemove(e.id)} className="ml-auto text-ink-400 hover:text-rose-600">{t("Kaldır")}</button>}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export function SignupCta({ text }: { text: string }) {
  const { t } = useT();
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-brand-100 bg-brand-50/60 p-4 text-[14px] text-ink-700">
      <span className="min-w-0 flex-1">{text}</span>
      <Link href="/kayit" className="rounded-xl bg-ink-900 px-4 py-2 text-sm font-medium text-white hover:bg-ink-800">{t("Ücretsiz başla")}</Link>
    </div>
  );
}

let seq = 0;
export const itemId = () => `t${Date.now().toString(36)}${(seq++).toString(36)}`;
