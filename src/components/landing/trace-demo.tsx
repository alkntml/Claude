"use client";
import { AlertTriangle, BadgeCheck, BookMarked, Check, FileText, Loader2, Quote, Search, ShieldCheck } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/components/ui/cn";
import { useT } from "@/i18n/client";

/**
 * “Her iddianın izi sürülebilir” canlı demosu (D62): paragraftaki atıflar sırayla vurgulanır ve
 * sağdaki kaynak kartıyla eşleşir; kaynağı olmayan iddia [KAYNAK GEREKLİ] ile gösterilir.
 * Yalnızca ekranda görünürken döner (işlemciyi yormaz); kullanıcı tıklarsa durur.
 * Doğrulama paneli (D64): atıfın/kaynağın üzerine gelince açılır, DOI ve kayıt eşleşmesini adım adım
 * gösterir ve kaynaktaki pasajı birebir, eşleşen kısım vurgulu gösterir. Kaynaklar ve pasajlar ÖRNEKTİR
 * (gerçek yazarlara söz yüklememek için kurgusal; ekranda “örnek” diye belirtilir).
 */
type Excerpt = { before: string; match: string; after: string; where: string };
type Item = { text: string; cite?: string; source?: { ref: string; meta: string; badge: string; doi?: string; registry: string; excerpt?: Excerpt } };
const ITEMS: Item[] = [
  {
    text: "Uzaktan eğitimde öğrencilerin öz düzenleme becerileri, ders başarısının en güçlü yordayıcılarından biridir", cite: "Kaya, 2021",
    source: { ref: "Kaya, E. (2021). Uzaktan eğitimde öz düzenleme ve akademik başarı.", meta: "Eğitim Araştırmaları Dergisi, 14(2), 201–219", badge: "Crossref ile doğrulandı · Tam metin okundu", doi: "10.xxxx/ornek.2021.014", registry: "Crossref",
      excerpt: { before: "Regresyon analizi sonuçları, ", match: "öz düzenleme becerilerinin uzaktan eğitimde ders başarısını en güçlü biçimde yordayan değişken olduğunu", after: " göstermiştir.", where: "Bulgular · s. 211" } },
  },
  {
    text: "Eş zamanlı canlı derslerin öğrencilerin derse bağlılığını artırdığı bildirilmektedir", cite: "Demir ve Aksoy, 2022",
    source: { ref: "Demir, A., & Aksoy, M. (2022). Eş zamanlı derslerin öğrenci bağlılığına etkisi.", meta: "Öğretim Teknolojileri Dergisi, 8(3), 45–62", badge: "Crossref ile doğrulandı · Tam metin okundu", doi: "10.xxxx/ornek.2022.083", registry: "Crossref",
      excerpt: { before: "", match: "Canlı derslere katılan öğrencilerin derse bağlılık puanları, yalnızca kayıtlı videolarla çalışan öğrencilere göre anlamlı düzeyde yüksektir", after: ".", where: "Bulgular · s. 53" } },
  },
  {
    text: "Öğretmenden alınan zamanında geri bildirim ise bu ilişkide aracı bir rol üstlenmektedir", cite: "Lee vd., 2020",
    source: { ref: "Lee, S., Park, J., & Chen, Y. (2020). Feedback timing and self-regulation in online learning.", meta: "Online Learning Review, 5(1), 1–15", badge: "Crossref ile doğrulandı · Özet okundu", doi: "10.xxxx/ornek.2020.051", registry: "Crossref",
      excerpt: { before: "Çalışmada ", match: "zamanında verilen geri bildirimin, öz düzenleme ile başarı arasındaki ilişkide kısmi aracı rol üstlendiği", after: " belirlenmiştir.", where: "Özet" } },
  },
  { text: "Bu etkinin tüm yaş gruplarında aynı olduğu söylenebilir" },
];
const STEP_OF = [0, 1, 1, 2];

export function TraceDemo() {
  const { t } = useT();
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [visible, setVisible] = useState(false);
  /** Doğrulama adımı (0: kapalı … 3: tamam); atıf seçilince/üzerine gelince sırayla ilerler */
  const [phase, setPhase] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.3 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  useEffect(() => {
    if (!visible || paused) return;
    const id = setInterval(() => setActive((a) => (a + 1) % ITEMS.length), 3200);
    return () => clearInterval(id);
  }, [visible, paused]);

  const pick = (i: number) => { setActive(i); setPaused(true); };
  // Seçili kaynağın doğrulaması adım adım “çalışır”
  useEffect(() => {
    if (!ITEMS[active].source) { setPhase(0); return; }
    setPhase(0);
    const ids = [1, 2, 3].map((p, k) => setTimeout(() => setPhase(p), 350 + k * 450));
    return () => ids.forEach(clearTimeout);
  }, [active]);
  const steps: [typeof Quote, string, string][] = [
    [Quote, t("Kaynak temelli yazım"), t("Yapay zekâ yalnızca projene eklenmiş kaynaklara atıf yapar.")],
    [ShieldCheck, t("Doğrulama"), t("DOI ve künyeler Crossref, PubMed ve arXiv’de tek tek kontrol edilir.")],
    [AlertTriangle, t("Eksik kaynak uyarısı"), t("Kaynağı olmayan iddia kesin bilgi gibi yazılmaz, işaretlenir.")],
  ];
  const cur = ITEMS[active];

  return (
    <section id="izlenebilir" className="scroll-mt-24 py-20">
      <div className="mx-auto max-w-6xl px-6">
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-brand-600">{t("Doğrulanabilir atıflar")}</p>
        <h2 className="mt-3 font-serif text-4xl font-medium tracking-tight text-ink-950 sm:text-5xl">{t("Her iddianın izi sürülebilir")}</h2>
        <p className="mt-4 max-w-2xl text-ink-500">{t("Paragraftaki her atıf gerçek bir kaynağa bağlanır: atıfa dokun, kaynağı ve doğrulamasını gör. Kaynağı olmayan iddia sessizce yazılmaz; işaretlenir.")}</p>

        <div ref={ref} className="mt-10 overflow-hidden rounded-3xl border border-ink-100 bg-ink-50/60 p-3 shadow-soft sm:p-4">
          <div className="flex items-center justify-between px-2 pb-3 pt-1">
            <span className="flex items-center gap-2 text-sm font-medium text-ink-600"><FileText className="h-4 w-4" /> {t("Örnek çalışma · 2.3 Kuramsal çerçeve")}</span>
            <span className="rounded-full bg-white px-2.5 py-0.5 text-xs font-medium text-ink-500 ring-1 ring-ink-100">{active + 1} / {ITEMS.length}</span>
          </div>
          <div className="grid gap-3 lg:grid-cols-[230px_1fr_300px]">
            {/* Adımlar */}
            <div className="hidden space-y-2 lg:block">
              {steps.map(([Icon, title, text], i) => (
                <div key={title} className={cn("rounded-2xl border p-3.5 transition-colors duration-300", STEP_OF[active] === i ? "border-brand-200 bg-white shadow-sm" : "border-transparent")}>
                  <p className="flex items-center gap-2 text-[14px] font-semibold text-ink-900"><Icon className={cn("h-4 w-4", STEP_OF[active] === i ? "text-brand-600" : "text-ink-400")} />{title}</p>
                  <p className="mt-1 text-[12.5px] leading-relaxed text-ink-500">{text}</p>
                </div>
              ))}
            </div>
            {/* Belge */}
            <div className="rounded-2xl bg-white p-5 sm:p-7">
              <p className="text-xs font-medium uppercase tracking-wider text-ink-400">{t("Bölüm 2 · Taslak")}</p>
              <p className="mt-3 font-serif text-[16.5px] leading-[2.05] text-ink-800">
                {ITEMS.map((it, i) => (
                  <span key={i}>
                    <span className={cn("rounded px-0.5 transition-colors duration-300", active === i && (it.cite ? "bg-brand-50" : "bg-amber-50"))}>{t(it.text)}</span>{" "}
                    {it.cite ? (
                      <button type="button" onClick={() => pick(i)} onMouseEnter={() => pick(i)} className={cn("whitespace-nowrap rounded-md border px-1.5 font-sans text-[12.5px] transition-colors duration-300", active === i ? "border-brand-400 bg-brand-600 text-white" : "border-brand-100 bg-brand-50 text-brand-700 hover:bg-brand-100")}>({t(it.cite)})</button>
                    ) : (
                      <button type="button" onClick={() => pick(i)} className={cn("whitespace-nowrap rounded-md border px-1.5 font-sans text-[12px] font-semibold transition-colors duration-300", active === i ? "border-amber-400 bg-amber-500 text-white" : "border-amber-200 bg-amber-50 text-amber-700")}>{t("[KAYNAK GEREKLİ]")}</button>
                    )}
                    {i < ITEMS.length - 1 ? ". " : "."}
                  </span>
                ))}
              </p>
            </div>
            {/* Kaynaklar */}
            <div className="rounded-2xl bg-white p-4">
              <p className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-ink-400">{t("Kaynaklar")} <span>{ITEMS.filter((x) => x.source).length}</span></p>
              <div className="mt-3 space-y-2">
                {ITEMS.map((it, i) => {
                  if (!it.source) return null;
                  const on = active === i;
                  const src = it.source;
                  const steps2: [boolean, string][] = [
                    [phase >= 1, src.doi ? t("DOI çözümlendi") : t("Künye bulundu")],
                    [phase >= 2, t("{r} kaydı eşleşti: yazar, yıl, başlık", { r: t(src.registry) })],
                    ...(src.excerpt ? [[phase >= 3, t("Kaynaktaki pasaj bulundu")] as [boolean, string]] : []),
                  ];
                  return (
                    <div key={it.cite} onMouseEnter={() => pick(i)} className={cn("cursor-pointer rounded-xl border p-3 transition-all duration-300", on ? "border-brand-300 bg-brand-50 shadow-sm" : "border-ink-100 opacity-70 hover:opacity-100")}>
                      <p className="flex items-start gap-2 text-[12.5px] font-medium leading-snug text-ink-800"><BookMarked className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ink-400" />{t(src.ref)}</p>
                      {on && (
                        <div className="mt-2 space-y-1.5 pl-5">
                          <p className="text-[11.5px] leading-snug text-ink-500">{t(src.meta)}</p>
                          {/* Doğrulama adımları */}
                          <ul className="space-y-1">
                            {steps2.map(([ok, label]) => (
                              <li key={label} className={cn("flex items-center gap-1.5 text-[11.5px] transition-colors", ok ? "text-emerald-700" : "text-ink-400")}>
                                {ok ? <Check className="h-3.5 w-3.5" /> : <Loader2 className="h-3.5 w-3.5 animate-spin" />}{label}
                              </li>
                            ))}
                          </ul>
                          {/* Kaynaktaki pasaj: birebir metin, eşleşen cümle vurgulu */}
                          {src.excerpt && phase >= 3 && (
                            <blockquote className="animate-rise rounded-lg border-l-2 border-emerald-400 bg-white/70 px-2.5 py-2 font-serif text-[12.5px] leading-relaxed text-ink-600">
                              “{t(src.excerpt.before)}<mark className="rounded bg-emerald-100 px-0.5 text-ink-900">{t(src.excerpt.match)}</mark>{t(src.excerpt.after)}”
                              <span className="mt-1 block font-sans text-[10.5px] not-italic text-ink-400">{t(src.excerpt.where)}</span>
                            </blockquote>
                          )}
                          {phase >= (src.excerpt ? 3 : 2) && <p className="flex items-center gap-1 text-[11.5px] font-medium text-emerald-700"><BadgeCheck className="h-3.5 w-3.5" />{t(src.badge)}</p>}
                          {src.doi && <p className="text-[11px] text-ink-400">doi:{src.doi} · {t("örnek kaynak")}</p>}
                        </div>
                      )}
                    </div>
                  );
                })}
                <div className={cn("rounded-xl border p-3 transition-all duration-300", !cur.source ? "border-amber-300 bg-amber-50" : "border-dashed border-ink-200 opacity-60")}>
                  <p className="flex items-center gap-2 text-[12.5px] font-medium text-amber-800"><AlertTriangle className="h-3.5 w-3.5" />{t("Bu iddia için kaynak yok")}</p>
                  {!cur.source && <p className="mt-1.5 flex items-start gap-1.5 text-[11.5px] leading-snug text-ink-600"><Search className="mt-0.5 h-3.5 w-3.5 shrink-0" />{t("Academiana uydurmak yerine işaretledi ve “Literatür araştır” önerdi.")}</p>}
                </div>
              </div>
            </div>
          </div>
          <p className="px-2 pt-3 text-[11.5px] text-ink-400">{t("Örnek gösterimdir; kaynaklar ve pasajlar temsilidir. Kendi çalışmanızda pasajlar, eklediğiniz kaynakların kendi metninden gelir. Bir atıfın veya kaynağın üzerine gelerek doğrulamayı görün.")}</p>
        </div>
      </div>
    </section>
  );
}
