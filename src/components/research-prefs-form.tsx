"use client";
import { useT } from "@/i18n/client";
import { cn } from "@/components/ui/cn";
import { yearsAgo, type ResearchMode, type ResearchPrefs } from "@/lib/research-prefs";

/**
 * Kaynak/araştırma tercihleri formu (D149): yeni çalışma sihirbazında ve Proje ayarlarında aynı form.
 * Veri tabanı taraması modu, yayın yılı, en az atıf ve ön baskılar.
 */
function Seg<T extends string | number | null>({ value, options, onChange }: { value: T; options: { v: T; label: string }[]; onChange: (v: T) => void }) {
  return (
    <div className="flex flex-wrap gap-1">
      {options.map((o) => (
        <button key={String(o.v)} type="button" onClick={() => onChange(o.v)} className={cn("rounded-md px-2.5 py-1 text-[13px] transition", value === o.v ? "bg-brand-50 font-medium text-brand-700" : "text-ink-600 hover:bg-ink-100")}>{o.label}</button>
      ))}
    </div>
  );
}

export function Toggle({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button type="button" role="switch" aria-checked={on} aria-label={label} onClick={() => onChange(!on)} className={cn("relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors", on ? "bg-brand-600" : "bg-ink-200")}>
      <span className={cn("inline-block h-5 w-5 rounded-full bg-white shadow transition-transform", on ? "translate-x-[22px]" : "translate-x-0.5")} />
    </button>
  );
}

export function ResearchPrefsForm({ value, onChange }: { value: ResearchPrefs; onChange: (v: ResearchPrefs) => void }) {
  const { t } = useT();
  const set = (p: Partial<ResearchPrefs>) => onChange({ ...value, ...p });
  const y5 = yearsAgo(5), y10 = yearsAgo(10);
  const yearOpt: number | null = value.yearFrom == null ? null : value.yearFrom === y5 ? y5 : value.yearFrom === y10 ? y10 : value.yearFrom;
  const row = "flex flex-wrap items-center justify-between gap-3 py-3";
  return (
    <div className="divide-y divide-ink-100">
      <div className={row}>
        <div className="min-w-0 max-w-sm"><p className="text-[14px] font-medium text-ink-900">{t("Veri tabanı taraması")}</p><p className="text-[12.5px] text-ink-500">{t("Yazarken gerektiğinde OpenAlex, Crossref, DergiPark gibi akademik veri tabanlarında gerçek kaynak aranır.")}</p></div>
        <Seg<ResearchMode> value={value.mode} onChange={(mode) => set({ mode })} options={[{ v: "auto", label: t("Otomatik") }, { v: "ask", label: t("Her seferinde sor") }, { v: "off", label: t("Kapalı") }]} />
      </div>
      <div className={row}>
        <p className="text-[14px] font-medium text-ink-900">{t("Yayın yılı")}</p>
        <div className="flex flex-wrap items-center gap-1">
          <Seg<number | null> value={yearOpt === y5 || yearOpt === y10 || yearOpt === null ? yearOpt : -1} onChange={(v) => set({ yearFrom: v === -1 ? (value.yearFrom ?? yearsAgo(3)) : v })} options={[{ v: null, label: t("Tümü") }, { v: y5, label: t("Son 5 yıl") }, { v: y10, label: t("Son 10 yıl") }, { v: -1, label: t("Özel") }]} />
          {yearOpt !== null && yearOpt !== y5 && yearOpt !== y10 && (
            <input type="number" min={1900} max={2100} className="input !h-8 !w-24 !py-1 text-[13px]" value={value.yearFrom ?? ""} onChange={(e) => set({ yearFrom: Number(e.target.value) || null })} aria-label={t("Başlangıç yılı")} />
          )}
        </div>
      </div>
      <div className={row}>
        <div className="min-w-0 max-w-sm"><p className="text-[14px] font-medium text-ink-900">{t("En az atıf sayısı")}</p><p className="text-[12.5px] text-ink-500">{t("Atıf sayısı bilinmeyen kayıtlar (ör. bazı DergiPark makaleleri) elenmez.")}</p></div>
        <Seg<number> value={value.minCitations} onChange={(minCitations) => set({ minCitations })} options={[{ v: 0, label: t("Tümü") }, { v: 5, label: "5+" }, { v: 20, label: "20+" }, { v: 50, label: "50+" }]} />
      </div>
      <div className={row}>
        <div className="min-w-0 max-w-sm"><p className="text-[14px] font-medium text-ink-900">{t("Ön baskıları dahil et")}</p><p className="text-[12.5px] text-ink-500">{t("arXiv, bioRxiv, SSRN gibi hakem değerlendirmesinden geçmemiş yayınlar.")}</p></div>
        <Toggle on={value.preprints} onChange={(preprints) => set({ preprints })} label={t("Ön baskıları dahil et")} />
      </div>
    </div>
  );
}
