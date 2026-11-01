"use client";
import { CheckCircle2, CircleHelp, Loader2, ShieldAlert, ShieldCheck, TriangleAlert } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Badge, Modal } from "@/components/ui/primitives";
import { cn } from "@/components/ui/cn";
import { useT } from "@/i18n/client";
import { api } from "@/lib/client";

/* eslint-disable @typescript-eslint/no-explicit-any */
const VERDICT: Record<string, { label: string; tone: string; icon: any }> = {
  supports: { label: "Kaynak bu iddiayı destekliyor", tone: "bg-emerald-50 text-emerald-800 border-emerald-200", icon: ShieldCheck },
  partial: { label: "Kısmen destekliyor", tone: "bg-amber-50 text-amber-800 border-amber-200", icon: TriangleAlert },
  not_supported: { label: "Kaynak bu iddiayı desteklemiyor", tone: "bg-rose-50 text-rose-800 border-rose-200", icon: ShieldAlert },
  insufficient: { label: "Karar vermek için yeterli metin yok", tone: "bg-ink-50 text-ink-700 border-ink-200", icon: CircleHelp },
};

/** Atıf doğrulama penceresi: cümle, kaynaktaki ilgili parçalar (sayfasıyla) ve yapay zekâ değerlendirmesi */
export function EvidenceDialog({ sourceId, source, sentence, locator, onClose }: { sourceId: string; source: any; sentence: string; locator: string | null; onClose: () => void }) {
  const { t } = useT();
  const [data, setData] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    api<any>(`/api/sources/${sourceId}/evidence`, { method: "POST", json: { sentence, locator } }).then(setData).catch((e) => setError((e as Error).message));
  }, [sourceId, sentence, locator]);
  const v = data ? VERDICT[data.verdict] ?? VERDICT.insufficient : null;
  const mark = (text: string) => {
    if (!data?.quote) return text;
    const i = text.toLowerCase().indexOf(String(data.quote).toLowerCase().slice(0, 80));
    if (i < 0) return text;
    return <>{text.slice(0, i)}<mark className="rounded bg-amber-100 px-0.5">{text.slice(i, i + data.quote.length)}</mark>{text.slice(i + data.quote.length)}</>;
  };
  if (typeof document === "undefined") return null;
  return createPortal(
    <Modal open onClose={onClose} title={t("Atıf doğrulama")} wide>
      <div className="space-y-4 text-[14px]">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-ink-400">{t("Metindeki iddia")}</p>
          <p className="mt-1 rounded-xl bg-ink-50 p-3 font-serif text-ink-800">{sentence}{locator && <span className="ml-1 font-sans text-xs text-brand-700">({t("s. {p}", { p: locator })})</span>}</p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-ink-400">{t("Kaynak")}</p>
          <p className="mt-1 font-medium text-ink-900">{source?.title}</p>
          <p className="text-xs text-ink-500">{source?.year ?? t("t.y.")} · {t(source?.access_level === "full_text" ? "Tam metin okundu" : source?.access_level === "abstract" ? "Özet okundu" : "Yalnızca künye")}</p>
        </div>
        {!data && !error && <p className="flex items-center gap-2 text-ink-500"><Loader2 className="h-4 w-4 animate-spin text-brand-600" /> {t("Kaynak metni taranıyor ve iddia karşılaştırılıyor…")}</p>}
        {error && <p className="rounded-xl bg-rose-50 p-3 text-rose-700">{error}</p>}
        {data && v && (
          <>
            <div className={cn("flex gap-2.5 rounded-2xl border p-3", v.tone)}>
              <v.icon className="mt-0.5 h-5 w-5 shrink-0" />
              <div><p className="font-semibold">{t(v.label)}</p><p className="mt-0.5 text-[13.5px]">{data.explanation}</p></div>
            </div>
            {data.quote && <p className="flex gap-2 text-[13.5px] text-ink-700"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" /><span>“{data.quote}”{data.quotePage && <b className="ml-1">({t("s. {p}", { p: data.quotePage })})</b>}</span></p>}
            {data.chunks?.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium uppercase tracking-wider text-ink-400">{t("Kaynaktaki ilgili bölümler")}</p>
                {data.chunks.map((c: any, i: number) => (
                  <div key={i} className="rounded-xl border border-ink-100 p-3">
                    <Badge tone={c.page ? "brand" : "ink"}>{c.page ? t("s. {p}", { p: c.page }) : t("sayfa bilgisi yok")}</Badge>
                    <p className="mt-1.5 max-h-40 overflow-y-auto text-[13px] leading-relaxed text-ink-600">{mark(c.content)}</p>
                  </div>
                ))}
              </div>
            )}
            {!data.chunks?.length && data.abstract && <div className="rounded-xl border border-ink-100 p-3"><p className="text-xs font-medium text-ink-400">{t("Özet")}</p><p className="mt-1 text-[13px] text-ink-600">{mark(data.abstract)}</p></div>}
            <p className="text-xs text-ink-400">{t("Değerlendirme yapay zekâ tarafından yalnızca okunan kaynak metnine dayanarak yapılır; son karar sizindir.")}</p>
          </>
        )}
      </div>
    </Modal>,
    document.body,
  );
}
/* eslint-enable @typescript-eslint/no-explicit-any */
