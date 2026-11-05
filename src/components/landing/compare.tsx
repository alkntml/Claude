"use client";
import { Check, MessageSquare, X } from "lucide-react";
import { Logo } from "@/components/icons";
import { useT } from "@/i18n/client";

/** Academiana ile genel sohbet botlarının karşılaştırması (D62). İddialar ürünün gerçek davranışına dayanır. */
const ROWS: [string, string][] = [
  ["Atıflar yalnızca gerçek ve doğrulanmış kaynaklardan gelir (DOI, Crossref, PubMed)", "Var olmayan kaynak ve DOI üretebilir; doğrulamak sana kalır"],
  ["Kaynağı olmayan iddiayı yazmaz, [KAYNAK GEREKLİ] diye işaretler", "Boşlukları ikna edici ama dayanaksız cümlelerle doldurabilir"],
  ["Tez ve makale bölüm bölüm, akademik iskelet ve bölüm kontrolüyle ilerler", "Genelde tek blok metin verir; bölüm yapısı ve ilerleme takibi yok"],
  ["APA 7, ISNAD, MLA, IEEE dahil 10 atıf stili; kaynakça kendiliğinden oluşur", "Atıf biçimi tutarsız olabilir; kaynakçayı elle düzenlersin"],
  ["OpenAlex, PubMed ve arXiv’den DergiPark’a 12 akademik veri tabanında doğrudan arar", "Akademik veri tabanlarına doğrudan bağlı değildir; kaynak bulma genel web aramasına dayanır"],
  ["İstatistik, anket, grafik ve Word/PDF çıktısı aynı çalışma alanında", "Analiz, anket ve biçimli belge için farklı araçlar arasında gidip gelirsin"],
];

export function CompareSection() {
  const { t } = useT();
  return (
    <section id="fark" className="scroll-mt-24 py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="font-serif text-4xl font-medium tracking-tight text-ink-950 sm:text-5xl">{t("Sıradan bir yapay zekâ değil.")}</h2>
          <p className="mt-4 text-ink-500">{t("Yüzlerce yapay zekâ aracı var. Academiana’yı genel sohbet botlarından ayıran şey burada.")}</p>
        </div>
        {/* Her satır iki hücre: masaüstünde yan yana hizalı, mobilde alt alta */}
        <div className="overflow-hidden rounded-3xl border border-ink-100 bg-white shadow-soft">
          <div className="grid md:grid-cols-2">
            <div className="flex items-center gap-2 bg-gradient-to-r from-brand-600 to-indigo-600 px-7 pb-4 pt-7 sm:px-9 [&_img]:brightness-0 [&_img]:invert [&_span]:!text-white"><Logo /></div>
            <p className="hidden items-center gap-2.5 px-7 pb-4 pt-7 text-lg font-semibold text-ink-800 sm:px-9 md:flex"><span className="flex h-8 w-8 items-center justify-center rounded-xl bg-ink-100 text-ink-500"><MessageSquare className="h-4 w-4" /></span>{t("ChatGPT ve genel sohbet botları")}</p>
          </div>
          {ROWS.map(([good, bad], i) => (
            <div key={good} className="grid md:grid-cols-2">
              <div className={`flex items-start gap-3 bg-gradient-to-r from-brand-600 to-indigo-600 px-7 py-4 sm:px-9 ${i === ROWS.length - 1 ? "pb-7" : ""}`}>
                <Check className="mt-0.5 h-5 w-5 shrink-0 text-emerald-300" />
                <span className="text-[15px] leading-relaxed text-white">{t(good)}</span>
              </div>
              <div className={`flex items-start gap-3 border-t border-ink-100 px-7 py-4 sm:px-9 md:border-t-0 ${i ? "md:border-t" : ""} ${i === ROWS.length - 1 ? "md:pb-7" : ""}`}>
                <X className="mt-0.5 h-5 w-5 shrink-0 text-ink-300" />
                <span className="text-[15px] leading-relaxed text-ink-500"><span className="font-medium text-ink-600 md:hidden">{t("Genel botlar:")} </span>{t(bad)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
