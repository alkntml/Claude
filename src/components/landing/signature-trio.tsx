"use client";
/**
 * D211: Özellikler bölümünün başındaki “üç imza zekâ” vitrini: Zenit (yazım), Rasat (kaynak okuma ve analiz),
 * Mizan (denetim). Her biri için açıklama, yetenek listesi ve ekranda kendiliğinden oynayan temsilî bir arayüz.
 * Canlandırmalar yalnızca görünürken döner; “hareketi azalt” tercihinde son durum sabit gösterilir.
 * Örnek künyeler ve sayılar temsilîdir (vitrinin diğer görselleriyle aynı örnek).
 */
import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";
import { BookOpenText, CheckCircle2, FileSearch2, Layers, MessagesSquare, PenLine, Quote, Scale, ScanSearch, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { BrandMark, WithMarks, type Signature } from "@/components/brand-mark";
import { cn } from "@/components/ui/cn";
import { FadeIn } from "@/components/ui/fade-in";
import { useT } from "@/i18n/client";

type Icon = typeof Quote;

/** Görünürken adım adım ilerleyen döngü; hareket azaltılmışsa son adımda durur */
function useLoop(durations: number[]) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.35 });
  const still = useReducedMotion();
  const [step, setStep] = useState(still ? durations.length - 1 : 0);
  useEffect(() => {
    if (still || !inView) return;
    const id = setTimeout(() => setStep((s) => (s + 1) % durations.length), durations[step]);
    return () => clearTimeout(id);
  }, [step, inView, still, durations]);
  return { ref, step: still ? durations.length - 1 : step };
}

function Screen({ children, label, mark }: { children: React.ReactNode; label: string; mark: Signature }) {
  const { t } = useT();
  return (
    <div className="relative rounded-3xl border border-brand-100 bg-white p-5 shadow-[0_40px_80px_-40px_rgb(79_70_229/0.45)]">
      <div className="mb-4 flex items-center gap-2">
        <span className="h-2.5 w-2.5 rounded-full bg-ink-200" /><span className="h-2.5 w-2.5 rounded-full bg-ink-200" /><span className="h-2.5 w-2.5 rounded-full bg-ink-200" />
        <span className="ml-2 text-[11.5px] font-medium text-ink-400"><BrandMark name={mark} /> · {label}</span>
      </div>
      {children}
      <p className="absolute bottom-3 right-4 text-[10px] text-ink-300">{t("Temsilî görsel")}</p>
    </div>
  );
}

/* ---------------- Zenit: bağlamı bilen yazım ---------------- */
const ZENIT_STEPS = [700, 2600, 1300, 1500, 2600];
function ZenitDemo() {
  const { t } = useT();
  const { ref, step } = useLoop(ZENIT_STEPS);
  const typed = t("Öz düzenleme becerileri yüksek öğrenciler, uzaktan eğitimde derse katılımı daha tutarlı sürdürür.");
  const ghost = t("Bu bulgu, geri bildirimin zamanlamasının öz düzenleme ile başarı arasındaki ilişkiyi nasıl biçimlendirdiğini sorgulamayı gerektirir.");
  const ctx: [string, string][] = [["Konu", "Uzaktan eğitimde öz düzenleme"], ["Bölüm", "2.1 Kuramsal çerçeve"], ["Bölümün amacı", "Kavramları ve ilişkileri tanımlamak"]];
  return (
    <div ref={ref}>
      <Screen label={t("Bölüm yazımı")} mark="Zenit">
        <div className="flex flex-wrap gap-1.5">
          {ctx.map(([k, v], i) => (
            <motion.span key={k} initial={false} animate={{ opacity: step >= 1 ? 1 : 0.35 }} transition={{ delay: step >= 1 ? 0.15 * i : 0 }}
              className="rounded-lg border border-brand-100 bg-brand-50/70 px-2 py-1 text-[10.5px] text-brand-700"><b className="font-semibold">{t(k)}:</b> {t(v)}</motion.span>
          ))}
        </div>
        <div className="mt-4 min-h-[9.5rem] rounded-2xl border border-ink-100 p-4">
          <p className="text-[11px] font-semibold text-ink-400">2.1 {t("Kuramsal çerçeve")}</p>
          <p className="mt-2 font-serif text-[14px] leading-7 text-ink-800">
            <span className="text-ink-500">{t("Önceki paragrafta öz düzenlemenin üç evresi tanımlandı.")} </span>
            {typed}{" "}
            <AnimatePresence mode="wait">
              {step >= 2 && (
                <motion.span key={step >= 4 ? "ok" : "ghost"} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.45 }}
                  className={step >= 4 ? "text-ink-800" : "text-ink-300"}>{ghost}</motion.span>
              )}
            </AnimatePresence>
            {step < 4 && <span className="ml-0.5 inline-block h-4 w-0.5 translate-y-0.5 animate-pulse bg-brand-500" />}
          </p>
        </div>
        <div className="mt-3 flex items-center justify-between gap-2 text-[11px] text-ink-500">
          <span className="flex items-center gap-1.5"><Sparkles className="h-3.5 w-3.5 text-brand-500" />{step >= 4 ? t("Öneri kabul edildi") : step >= 2 ? t("Öneri hazır: Tab ile kabul edin") : t("Çalışmanın konusu ve bölümün amacı okunuyor…")}</span>
          <motion.kbd animate={step === 3 ? { scale: [1, 0.9, 1] } : { scale: 1 }} transition={{ duration: 0.4 }}
            className={cn("rounded-md border px-1.5 py-0.5 font-sans text-[10.5px] font-semibold", step === 3 ? "border-brand-400 bg-brand-600 text-white" : "border-ink-200 text-ink-500")}>Tab</motion.kbd>
        </div>
      </Screen>
    </div>
  );
}

/* ---------------- Rasat: PDF’ten seç, sayfasıyla alıntıla ---------------- */
const RASAT_STEPS = [900, 1500, 1500, 3000];
function RasatDemo() {
  const { t } = useT();
  const { ref, step } = useLoop(RASAT_STEPS);
  const quote = t("öz düzenleme stratejilerini kullanan öğrenciler çevrimiçi derslerde daha yüksek başarı göstermiştir");
  const tools: [Icon, string][] = [[BookOpenText, "Oku ve alıntıla"], [MessagesSquare, "Kaynağa sor"], [Layers, "Birlikte analiz et"]];
  return (
    <div ref={ref}>
      <Screen label={t("Kaynak okuyucu")} mark="Rasat">
        <div className="flex gap-1.5">{tools.map(([I, l], i) => <span key={l} className={cn("inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[10.5px] font-medium", i === 0 ? "bg-brand-600 text-white" : "bg-ink-50 text-ink-500")}><I className="h-3 w-3" />{t(l)}</span>)}</div>
        <div className="relative mt-3 rounded-2xl border border-ink-100 bg-ink-50/40 p-4">
          <div className="flex items-center justify-between text-[10px] text-ink-400"><span>Kaya (2021) · PDF</span><span className="rounded bg-white px-1.5 py-0.5 font-semibold text-ink-500">{t("s. {p}", { p: 45 })}</span></div>
          <div className="mt-2 space-y-1.5" aria-hidden>{[92, 84, 96].map((w, i) => <span key={i} className="block h-1.5 rounded-full bg-ink-200/80" style={{ width: `${w}%` }} />)}</div>
          <p className="relative mt-2 font-serif text-[12.5px] leading-6 text-ink-700">
            {t("Bulgular,")}{" "}
            <motion.span className="rounded bg-gradient-to-r from-brand-200 to-brand-200 bg-no-repeat [box-decoration-break:clone]" style={{ backgroundPosition: "0 0" }}
              initial={false} animate={{ backgroundSize: step >= 1 ? "100% 100%" : "0% 100%" }} transition={{ duration: step >= 1 ? 1.1 : 0.2, ease: "easeInOut" }}>{quote}</motion.span>.
          </p>
          <div className="mt-2 space-y-1.5" aria-hidden>{[88, 70].map((w, i) => <span key={i} className="block h-1.5 rounded-full bg-ink-200/80" style={{ width: `${w}%` }} />)}</div>
          <AnimatePresence>
            {step === 2 && (
              <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="absolute right-3 top-9 flex gap-1 rounded-xl bg-ink-900 p-1 text-[10.5px] text-white shadow-lg">
                <span className="rounded-lg bg-white/15 px-2 py-1 font-semibold"><Quote className="mr-1 inline h-3 w-3" />{t("Alıntı olarak ekle")}</span>
                <span className="px-2 py-1 text-white/70">{t("Yalnızca atıf")}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div className="mt-3 min-h-[4.5rem] rounded-2xl border border-ink-100 p-3">
          <p className="text-[10.5px] font-semibold text-ink-400">{t("Çalışmanız")}</p>
          <AnimatePresence mode="wait">
            {step >= 3 ? (
              <motion.p key="q" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="mt-1 font-serif text-[13px] leading-6 text-ink-800">
                {t("Kaya’ya göre")} “{quote}” <span className="rounded-md border border-brand-100 bg-brand-50 px-1.5 font-sans text-[11px] text-brand-700">(Kaya, 2021, s. 45)</span>.
              </motion.p>
            ) : (
              <motion.p key="e" exit={{ opacity: 0 }} className="mt-1 font-serif text-[13px] text-ink-400">{t("Kaya’ya göre")} <span className="inline-block h-4 w-0.5 translate-y-0.5 bg-brand-500" /></motion.p>
            )}
          </AnimatePresence>
        </div>
      </Screen>
    </div>
  );
}

/* ---------------- Mizan: iddiaları tartar ---------------- */
const MIZAN_STEPS = [800, 900, 900, 900, 3200];
function MizanDemo() {
  const { t } = useT();
  const { ref, step } = useLoop(MIZAN_STEPS);
  const rows: [string, string, string][] = [
    ["Öz düzenleme, başarının güçlü bir yordayıcısıdır.", "Destekliyor", "bg-emerald-50 text-emerald-700"],
    ["Bu etki tüm öğrenciler için geçerlidir.", "Kısmen", "bg-amber-50 text-amber-800"],
    ["Canlı dersler başarıyı iki katına çıkarır.", "Çelişiyor", "bg-rose-50 text-rose-700"],
  ];
  const r = 30, c = 2 * Math.PI * r;
  return (
    <div ref={ref}>
      <Screen label={t("Teslim öncesi denetim")} mark="Mizan">
        <ul className="space-y-2">
          {rows.map(([x, l, cls], i) => (
            <li key={x} className="flex items-center justify-between gap-3 rounded-xl border border-ink-100 px-3 py-2">
              <span className="font-serif text-[12.5px] text-ink-800">{t(x)}</span>
              <span className="w-24 shrink-0 text-right">
                <AnimatePresence mode="wait">
                  {step > i ? (
                    <motion.span key="v" initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} className={cn("inline-block rounded-full px-2 py-0.5 text-[10.5px] font-semibold", cls)}>{t(l)}</motion.span>
                  ) : (
                    <motion.span key="w" exit={{ opacity: 0 }} className="inline-flex items-center gap-1 text-[10.5px] text-ink-400"><Scale className="h-3 w-3 animate-pulse" />{t("tartılıyor")}</motion.span>
                  )}
                </AnimatePresence>
              </span>
            </li>
          ))}
        </ul>
        <motion.div initial={false} animate={{ opacity: step >= 3 ? 1 : 0.25 }} className="mt-3 rounded-xl border border-rose-100 bg-rose-50/60 px-3 py-2 text-[11.5px]">
          <p className="font-semibold text-rose-800">{t("Kaynak bunun tersini söylüyor")} · Kaya (2021), s. 214</p>
          <p className="mt-0.5 font-serif italic text-ink-700">“{t("İki grubun başarı puanları arasında anlamlı bir fark bulunmamıştır.")}”</p>
        </motion.div>
        <div className="mt-3 flex items-center gap-4">
          <div className="relative h-20 w-20 shrink-0">
            <svg viewBox="0 0 80 80" className="h-full w-full -rotate-90"><circle cx="40" cy="40" r={r} className="fill-none stroke-ink-100" strokeWidth="8" />
              <motion.circle cx="40" cy="40" r={r} className="fill-none stroke-brand-500" strokeWidth="8" strokeLinecap="round" strokeDasharray={c} initial={false} animate={{ strokeDashoffset: step >= 4 ? c * (1 - 0.86) : c }} transition={{ duration: 1.1, ease: "easeOut" }} />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-lg font-semibold text-ink-900">{step >= 4 ? 86 : "–"}</span>
          </div>
          <ul className="min-w-0 flex-1 space-y-1 text-[11px] text-ink-600">
            {["Kaynak gerektiren 2 ifade", "Akademik dil: 3 öneri", "Jüri gözüyle: yöntem–soru uyumu"].map((x, i) => (
              <motion.li key={x} initial={false} animate={{ opacity: step >= 4 ? 1 : 0.3, x: step >= 4 ? 0 : -4 }} transition={{ delay: step >= 4 ? 0.15 * i : 0 }} className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-brand-500" />{t(x)}</motion.li>
            ))}
          </ul>
        </div>
      </Screen>
    </div>
  );
}

/* ---------------- Vitrin ---------------- */
interface Pillar { name: Signature; motto: string; role: string; icon: Icon; lead: string; points: string[]; Demo: () => React.ReactNode }
const PILLARS: Pillar[] = [
  { name: "Zenit", motto: "Zenit yazar.", role: "Yazım zekâsı", icon: PenLine, Demo: ZenitDemo,
    lead: "Zenit, çalışmanızın bütününü yukarıdan görür: önceki paragraflarınızı, konunun ve bölümlerin gidişatını, yazdığınız bölümün başlığını ve amacını bilir; o bölümün asistan rolüyle sizinle birlikte yazar.",
    points: ["Bölüm bölüm taslak, genişletme, yeniden yazma ve sentez", "Yazarken bağlama uygun cümle önerisi; Tab ile kabul", "Amaç, hipotez ve araştırma soruları her bölümde izlenir", "Kaynaklı yazımda yalnızca kütüphanenizdeki kaynaklara atıf; uydurma yok"] },
  { name: "Rasat", motto: "Rasat okur.", role: "Kaynak okuma ve analiz zekâsı", icon: FileSearch2, Demo: RasatDemo,
    lead: "Rasat, kaynaklarınızın içine bakar: PDF’leri ve açık erişim tam metinleri okur, bölümlerini tanır, sorularınızı yalnızca okunan metinden ve sayfa numarasıyla cevaplar.",
    points: ["PDF’ten metni seçip yayındaki sayfa numarasıyla alıntılama", "Bir makaleye soru sorma; cevap sayfa numaralı", "Birden çok makaleyi birlikte analiz: uyuşan, çelişen bulgular ve boşluklar", "Kaynaklardan atıflı akademik paragraf; literatür matrisi"] },
  { name: "Mizan", motto: "Mizan tartar.", role: "Denetim zekâsı", icon: ScanSearch, Demo: MizanDemo,
    lead: "Mizan, yazdığınızı teslimden önce tartar: atıflı her cümleyi kaynağın okunan metniyle karşılaştırır, kaynaksız iddiaları bulur, dili ve tutarlılığı denetler, hakemin takılacağı noktaları gösterir.",
    points: ["İddia denetimi: destekliyor, kısmen, desteklemiyor, çelişiyor; birebir alıntı ve sayfa", "Atıf doğrulama ve uydurma kaynak/DOI kontrolü", "Akademik dil, tutarlılık ve kaynakların uygunluğu", "Jüri gözüyle inceleme ve açık formüllü kalite puanı"] },
];

export function SignatureTrio() {
  const { t } = useT();
  return (
    <div className="mt-20">
      <FadeIn className="mx-auto max-w-3xl text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-brand-600">{t("İmza zekâlarımız")}</p>
        <h3 className="mt-3 font-serif text-3xl font-medium tracking-tight text-ink-950 sm:text-4xl">
          <WithMarks text={t("Zenit yazar, Rasat okur, Mizan tartar.")} />
        </h3>
        <p className="mt-4 text-[16px] leading-relaxed text-ink-500">{t("Academiana’nın kalbinde birbirini tamamlayan üç zekâ çalışır. Onlarca özellik bu üçünün altında toplanır; hepsi yalnızca gerçek kaynaklara ve okunan metne dayanır.")}</p>
      </FadeIn>

      <div className="mt-14 space-y-20">
        {PILLARS.map((p, i) => (
          <FadeIn key={p.name}>
            <div className={cn("grid grid-cols-1 items-center gap-10 lg:grid-cols-2 [&>*]:min-w-0", i % 2 && "lg:[&>*:first-child]:order-2")}>
              <div>
                <p className="flex items-center gap-2 text-[12.5px] font-semibold uppercase tracking-[0.12em] text-ink-400"><p.icon className="h-4 w-4 text-brand-500" />{t(p.role)}</p>
                <h4 className="mt-3 font-serif text-5xl font-medium tracking-tight sm:text-6xl"><BrandMark name={p.name} /></h4>
                <p className="mt-2 font-serif text-xl italic text-ink-500">{t(p.motto)}</p>
                <p className="mt-5 text-[16px] leading-relaxed text-ink-600">{t(p.lead)}</p>
                <ul className="mt-6 space-y-2.5">
                  {p.points.map((x) => <li key={x} className="flex items-start gap-2.5 text-[14.5px] text-ink-700"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" />{t(x)}</li>)}
                </ul>
              </div>
              <p.Demo />
            </div>
          </FadeIn>
        ))}
      </div>
    </div>
  );
}
