"use client";
/** D213: Sistem durumu panosu: /api/public/status’u okur, 60 sn’de bir yeniler. */
import { CheckCircle2, CircleAlert, CircleHelp, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/components/ui/cn";
import { useT } from "@/i18n/client";

type Level = "ok" | "degraded" | "down" | "unknown";
interface Report { at: string; overall: Level; items: { id: string; level: Level; ms: number | null }[] }

const NAMES: Record<string, [string, string]> = {
  app: ["Web uygulaması", "Sayfalar ve çalışma alanı"],
  db: ["Veritabanı ve dosyalar", "Çalışmalarınız, kaynaklarınız, kayıt"],
  ai: ["Yapay zekâ (Zenit, Rasat, Mizan)", "Sağlayıcının (Anthropic) kendi durum bildirimi"],
  crossref: ["Crossref", "DOI ve künye doğrulama"],
  europepmc: ["Europe PMC", "Tıp ve sağlık literatürü, tam metin"],
  arxiv: ["arXiv", "Ön baskılar"],
};
const LEVEL: Record<Level, { t: string; cls: string; Icon: typeof CheckCircle2 }> = {
  ok: { t: "Çalışıyor", cls: "text-emerald-700 bg-emerald-50", Icon: CheckCircle2 },
  degraded: { t: "Yavaş veya kısmi", cls: "text-amber-800 bg-amber-50", Icon: CircleAlert },
  down: { t: "Sorun var", cls: "text-rose-700 bg-rose-50", Icon: XCircle },
  unknown: { t: "Bilinmiyor", cls: "text-ink-600 bg-ink-100", Icon: CircleHelp },
};
const OVERALL: Record<Level, string> = { ok: "Bütün sistemler çalışıyor", degraded: "Bazı hizmetlerde yavaşlık var", down: "Bir hizmette sorun var", unknown: "Durum alınamadı" };

export function StatusBoard() {
  const { t, locale } = useT();
  const [r, setR] = useState<Report | null>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let alive = true;
    const load = () => fetch("/api/public/status").then((x) => x.json()).then((d: Report) => { if (alive) { setR(d); setFailed(false); } }).catch(() => alive && setFailed(true));
    load();
    const id = setInterval(load, 60_000);
    return () => { alive = false; clearInterval(id); };
  }, []);
  const overall: Level = failed ? "down" : r?.overall ?? "unknown";
  const O = LEVEL[overall];
  return (
    <div className="not-prose space-y-4">
      <div className={cn("flex items-center gap-3 rounded-2xl px-5 py-4", r || failed ? O.cls : "bg-ink-50 text-ink-500")} role="status" aria-live="polite">
        <O.Icon className="h-6 w-6 shrink-0" />
        <div>
          <p className="text-lg font-semibold">{r || failed ? t(failed ? "Durum alınamadı" : OVERALL[overall]) : t("Kontrol ediliyor…")}</p>
          {r && <p className="text-[13px]">{t("Son kontrol: {time}", { time: new Date(r.at).toLocaleTimeString(locale === "tr" ? "tr-TR" : locale === "de" ? "de-DE" : "en-GB") })}</p>}
        </div>
      </div>
      <ul className="divide-y divide-ink-100 overflow-hidden rounded-2xl border border-ink-100 bg-white">
        {Object.entries(NAMES).map(([id, [n, d]]) => {
          const it = r?.items.find((x) => x.id === id);
          const L = LEVEL[it?.level ?? "unknown"];
          return (
            <li key={id} className="flex items-center justify-between gap-3 px-5 py-3.5">
              <div className="min-w-0"><p className="font-medium text-ink-900">{t(n)}</p><p className="text-[13px] text-ink-500">{t(d)}</p></div>
              <span className={cn("inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[12.5px] font-semibold", it ? L.cls : "bg-ink-50 text-ink-400")}>
                {it ? <L.Icon className="h-3.5 w-3.5" /> : null}{it ? t(L.t) : "…"}{it?.ms != null && <span className="font-normal">· {it.ms} ms</span>}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
