"use client";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, BadgeCheck, BookMarked, FileCheck2, Quote, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRef } from "react";

export function Hero({ signedIn }: { signedIn: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const rotate = useTransform(scrollYProgress, [0, 1], [0, -4]);

  return (
    <section ref={ref} className="relative overflow-hidden pb-20 pt-32 sm:pt-40">
      <div className="bg-grid absolute inset-0 [mask-image:radial-gradient(ellipse_at_top,black_40%,transparent_75%)]" />
      <motion.div aria-hidden className="absolute -left-40 -top-40 h-[520px] w-[520px] rounded-full bg-brand-300/40 blur-3xl" animate={{ x: [0, 60, 0], y: [0, 40, 0] }} transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }} />
      <motion.div aria-hidden className="absolute -right-32 top-10 h-[460px] w-[460px] rounded-full bg-sky-300/30 blur-3xl" animate={{ x: [0, -50, 0], y: [0, 60, 0] }} transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }} />
      <motion.div aria-hidden className="absolute bottom-0 left-1/3 h-[300px] w-[300px] rounded-full bg-amber-200/30 blur-3xl" animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 14, repeat: Infinity }} />

      <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand-100 bg-white/80 px-3 py-1 text-[13px] font-medium text-brand-700 shadow-sm backdrop-blur">
            <Sparkles className="h-3.5 w-3.5" /> Gerçek kaynaklarla çalışan akademik asistan
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.05, ease: [0.22, 1, 0.36, 1] }} className="font-serif text-[42px] font-medium leading-[1.05] tracking-tight text-ink-950 sm:text-6xl">
            Akademik çalışmanızı <span className="text-gradient italic">ilk fikirden</span> son kaynakçaya kadar yönetin.
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.15 }} className="mt-6 max-w-xl text-lg leading-relaxed text-ink-500">
            Tez, makale ve araştırma önerinizi adım adım ilerleyen bir yol haritasıyla hazırlayın. Kaynaklar OpenAlex, Crossref ve PubMed gibi veri tabanlarından gelir ve doğrulanır. Atıflar seçtiğiniz stile göre kendiliğinden biçimlenir.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.25 }} className="mt-9 flex flex-wrap items-center gap-3">
            <Link href={signedIn ? "/yeni" : "/kayit"} className="group inline-flex h-12 items-center gap-2 rounded-2xl bg-gradient-to-b from-brand-500 to-brand-600 px-6 font-medium text-white shadow-[0_14px_30px_-12px_rgb(39_71_220/0.8)] transition hover:-translate-y-0.5">
              Çalışmaya başla <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </Link>
            <Link href="#tur-sec" className="inline-flex h-12 items-center rounded-2xl border border-ink-200 bg-white/80 px-6 font-medium text-ink-700 backdrop-blur transition hover:border-ink-300 hover:bg-white">Çalışma türlerini gör</Link>
          </motion.div>
          <motion.ul initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="mt-9 flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink-500">
            <li className="flex items-center gap-1.5"><BadgeCheck className="h-4 w-4 text-emerald-500" /> Uydurma kaynak yok</li>
            <li className="flex items-center gap-1.5"><BadgeCheck className="h-4 w-4 text-emerald-500" /> 9 atıf stili</li>
            <li className="flex items-center gap-1.5"><BadgeCheck className="h-4 w-4 text-emerald-500" /> KVKK uyumlu</li>
          </motion.ul>
        </div>

        <motion.div style={{ y, rotate }} className="relative hidden lg:block">
          <motion.div initial={{ opacity: 0, y: 30, rotateX: 12 }} animate={{ opacity: 1, y: 0, rotateX: 0 }} transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }} className="relative rounded-3xl border border-white/70 bg-white/85 p-6 shadow-[0_40px_80px_-30px_rgb(21_24_41/0.35)] backdrop-blur-xl" aria-hidden>
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-medium text-ink-400"><span className="h-2 w-2 rounded-full bg-emerald-400" /> 2.3 Kavramsal çerçeve</div>
              <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[11px] font-medium text-brand-700">APA 7</span>
            </div>
            <p className="font-serif text-[15px] leading-7 text-ink-700">
              Ebeveyn tutumları, bireyin yakın ilişkilerdeki bağlanma örüntülerini şekillendiren temel etkenler arasında yer almaktadır <span className="rounded-md border border-brand-100 bg-brand-50 px-1.5 font-sans text-[12px] text-brand-700">(Bowlby, 1969)</span>. İlişki odaklı obsesif belirtiler ise partnere yönelik yineleyici şüphelerle karakterizedir <span className="rounded-md border border-brand-100 bg-brand-50 px-1.5 font-sans text-[12px] text-brand-700">(Doron vd., 2014)</span>.
            </p>
            <div className="mt-5 space-y-2">
              {[["Doron, G. vd. (2014)", "Crossref ile doğrulandı · Özet okundu", "green"], ["Bowlby, J. (1969)", "Kitap künyesi · Yalnızca künye", "amber"]].map(([a, b, c]) => (
                <div key={a} className="flex items-center gap-3 rounded-xl border border-ink-100 bg-ink-50/60 px-3 py-2">
                  <BookMarked className="h-4 w-4 text-ink-400" />
                  <div className="min-w-0 flex-1"><p className="truncate text-[13px] font-medium text-ink-800">{a}</p><p className="text-[11px] text-ink-500">{b}</p></div>
                  <span className={`h-2 w-2 rounded-full ${c === "green" ? "bg-emerald-400" : "bg-amber-400"}`} />
                </div>
              ))}
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.7, duration: 0.6 }} className="absolute -bottom-8 -left-10 flex items-center gap-3 rounded-2xl border border-white/70 bg-white/90 px-4 py-3 shadow-xl backdrop-blur" aria-hidden>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600"><FileCheck2 className="h-5 w-5" /></div>
            <div><p className="text-[13px] font-semibold text-ink-800">Kalite skoru 86</p><p className="text-[11px] text-ink-500">2 eksik künye · 0 eşleşmeyen atıf</p></div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9, duration: 0.6 }} className="absolute -right-6 -top-8 flex items-center gap-2 rounded-2xl bg-ink-900 px-4 py-2.5 text-white shadow-xl" aria-hidden>
            <Quote className="h-4 w-4 text-amber-300" /><span className="text-[13px]">OpenAlex · Crossref · PubMed taranıyor…</span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
