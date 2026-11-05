"use client";
import { useMemo, useState } from "react";
import { cn } from "@/components/ui/cn";
import { useT } from "@/i18n/client";
import { cochran, meanSample, toReach, yamane } from "@/lib/tools/sample-size";
import { CopyButton, useToolPing } from "./shared";

type Method = "cochran" | "yamane" | "mean";

/** Örneklem büyüklüğü hesaplayıcı (D90): tamamen tarayıcıda, yapay zekâ yok */
export function SampleSizeTool() {
  const { t } = useT();
  const ping = useToolPing("sample_size");
  const [method, setMethod] = useState<Method>("cochran");
  const [N, setN] = useState("1000");
  const [conf, setConf] = useState<90 | 95 | 99>(95);
  const [margin, setMargin] = useState("5");
  const [p, setP] = useState("50");
  const [sd, setSd] = useState("15");
  const [meanMargin, setMeanMargin] = useState("2");
  const [rr, setRr] = useState("");
  const num = (s: string) => Number(s.replace(",", "."));
  const res = useMemo(() => {
    try {
      const pop = N.trim() ? num(N) : null;
      if (method === "yamane") {
        if (!pop) return { error: t("Yamane formülü için evren büyüklüğü gerekli.") };
        return { n: yamane(pop, num(margin)), pop };
      }
      if (method === "mean") return { n: meanSample(num(sd), num(meanMargin), conf, pop), pop };
      return { n: cochran({ population: pop, confidence: conf, margin: num(margin), p: num(p) / 100 }).n, pop };
    } catch (e) { return { error: t((e as Error).message) }; }
  }, [method, N, conf, margin, p, sd, meanMargin, t]);
  const reach = res.n && num(rr) > 0 && num(rr) < 100 ? toReach(res.n, num(rr)) : null;
  const sentence = res.n ? (method === "yamane"
    ? t("Araştırmanın evreni {N} kişiden oluşmaktadır. Yamane (1967) formülüyle ±%{e} hata payı için gereken örneklem büyüklüğü {n} olarak hesaplanmıştır.", { N: res.pop!.toLocaleString("tr-TR"), e: margin, n: res.n })
    : method === "mean"
      ? t("Ortalama tahmini için %{c} güven düzeyi, σ = {sd} ve ±{e} hata payıyla gereken örneklem büyüklüğü {n} olarak hesaplanmıştır (Cochran, 1977).", { c: conf, sd, e: meanMargin, n: res.n })
      : res.pop
        ? t("Araştırmanın evreni {N} kişiden oluşmaktadır. %{c} güven düzeyi, ±%{e} hata payı ve p = {p} varsayımıyla gereken örneklem büyüklüğü sonlu evren düzeltmesiyle {n} olarak hesaplanmıştır (Cochran, 1977).", { N: res.pop.toLocaleString("tr-TR"), c: conf, e: margin, p: (num(p) / 100).toFixed(2), n: res.n })
        : t("%{c} güven düzeyi, ±%{e} hata payı ve p = {p} varsayımıyla gereken örneklem büyüklüğü {n} olarak hesaplanmıştır (Cochran, 1977).", { c: conf, e: margin, p: (num(p) / 100).toFixed(2), n: res.n })) : "";
  const field = (label: string, value: string, set: (v: string) => void, hint?: string, suffix?: string) => (
    <label className="block">
      <span className="label">{label}</span>
      <div className="relative"><input inputMode="decimal" className="input" value={value} onChange={(e) => { set(e.target.value); ping(); }} />{suffix && <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-ink-400">{suffix}</span>}</div>
      {hint && <span className="mt-1 block text-xs text-ink-400">{hint}</span>}
    </label>
  );
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
      <div className="card space-y-4 p-5">
        <div className="flex flex-wrap gap-1 rounded-xl bg-ink-100 p-1" role="tablist">
          {([["cochran", "Oran (Cochran)"], ["yamane", "Yamane"], ["mean", "Ortalama"]] as [Method, string][]).map(([m, l]) => (
            <button key={m} role="tab" aria-selected={method === m} onClick={() => setMethod(m)} className={cn("flex-1 rounded-lg px-3 py-1.5 text-[13px] font-medium", method === m ? "bg-white text-ink-900 shadow-sm" : "text-ink-500")}>{t(l)}</button>
          ))}
        </div>
        {field(t("Evren büyüklüğü (N)"), N, setN, t("Bilinmiyorsa veya çok büyükse boş bırakın."))}
        {method !== "yamane" && (
          <div>
            <span className="label">{t("Güven düzeyi")}</span>
            <div className="flex gap-2">{([90, 95, 99] as const).map((c) => <button key={c} type="button" onClick={() => { setConf(c); ping(); }} className={cn("flex-1 rounded-xl border px-3 py-2 text-sm font-medium", conf === c ? "border-brand-400 bg-brand-50 text-brand-800" : "border-ink-200 text-ink-600")}>%{c}</button>)}</div>
          </div>
        )}
        {method === "mean" ? (
          <>
            {field(t("Tahmini standart sapma (σ)"), sd, setSd, t("Önceki çalışmalardan veya pilot uygulamadan."))}
            {field(t("Kabul edilen hata (ölçek biriminde)"), meanMargin, setMeanMargin)}
          </>
        ) : (
          <>
            {field(t("Hata payı"), margin, setMargin, t("Genellikle %5."), "%")}
            {method === "cochran" && field(t("Beklenen oran (p)"), p, setP, t("Bilinmiyorsa %50 (en büyük örneklemi verir)."), "%")}
          </>
        )}
        {field(t("Beklenen yanıt oranı (isteğe bağlı)"), rr, setRr, t("Ör. çevrim içi anketlerde %30–40."), "%")}
      </div>
      <div className="space-y-4">
        <div className="card p-6 text-center">
          <p className="text-sm text-ink-500">{t("Gereken örneklem büyüklüğü")}</p>
          {res.error ? <p className="mt-3 text-rose-600">{res.error}</p> : <p className="mt-2 font-serif text-6xl font-semibold tracking-tight text-ink-950">{res.n?.toLocaleString("tr-TR")}</p>}
          {reach && <p className="mt-3 text-[14px] text-ink-600">{t("Yanıt oranı %{r} ise yaklaşık {k} kişiye ulaşmanız gerekir.", { r: rr, k: reach.toLocaleString("tr-TR") })}</p>}
        </div>
        {sentence && (
          <div className="card p-5">
            <div className="mb-2 flex items-center justify-between gap-2"><p className="text-sm font-semibold text-ink-900">{t("Yöntem bölümü için örnek cümle")}</p><CopyButton html={`<p>${sentence}</p>`} text={sentence} /></div>
            <p className="font-serif text-[15.5px] leading-relaxed text-ink-800">{sentence}</p>
            <p className="mt-3 text-xs text-ink-400">{method === "yamane" ? "Yamane, T. (1967). Statistics: An introductory analysis (2nd ed.). Harper & Row." : "Cochran, W. G. (1977). Sampling techniques (3rd ed.). John Wiley & Sons."}</p>
          </div>
        )}
        <p className="text-xs text-ink-500">{t("Bu hesap basit rastgele örnekleme içindir. Gruplar arası karşılaştırma veya regresyon gibi analizler için güç analizi (ör. G*Power) daha uygundur; danışmanınızla birlikte karar verin.")}</p>
      </div>
    </div>
  );
}
