"use client";
/**
 * Görev bazlı başlangıç (D124): “Bugün ne yapmak istiyorsunuz?” — öğrenciyi özellik listesine değil, yapmak istediği işin
 * doğru akışına götürür. Yeni kullanıcıda açık, deneyimli kullanıcıda katlanmış gelir.
 */
import { BookCheck, ChevronDown, FileSearch2, FlaskConical, GraduationCap, Landmark, Languages, Lightbulb, Scale } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { cn } from "@/components/ui/cn";
import { useT } from "@/i18n/client";

const TASKS = [
  { href: "/yeni?tur=thesis", icon: GraduationCap, title: "Tezime başlıyorum", text: "Başlık, kurgu ve bölüm bölüm yol haritası" },
  { href: "/yeni?tur=research_article", icon: FlaskConical, title: "Makale yazıyorum", text: "Giriş–Yöntem–Bulgular–Tartışma, dergi önerisi" },
  { href: "/yeni?tur=literature_review", icon: FileSearch2, title: "Literatür taraması / sistematik derleme", text: "PRISMA akışı, eleme gerekçeleri, akış şeması" },
  { href: "/araclar/arastirmalar-ne-diyor", icon: Scale, title: "Bir soruya kanıtla cevap arıyorum", text: "Gerçek makalelerden kaynaklı kısa cevap" },
  { href: "/yeni?tur=text_editing", icon: Languages, title: "Metnimi düzeltip çevireceğim", text: "Word’den aktar, dil denetimi, akademik İngilizce" },
  { href: "/araclar/uydurma-kaynak-kontrolu", icon: BookCheck, title: "Kaynakçamı kontrol edeceğim", text: "Var olmayan kaynakları ve eksik künyeleri bul" },
  { href: "/konu-bul", icon: Lightbulb, title: "Tez konusu arıyorum", text: "Yıllara göre eğilim ve konu önerileri" },
  { href: "/yeni?tur=grant_proposal", icon: Landmark, title: "TÜBİTAK / BAP önerisi", text: "2209-A, 1001, BAP bölümleriyle" },
];

export function TaskStart({ defaultOpen }: { defaultOpen: boolean }) {
  const { t } = useT();
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className="card p-5">
      <button onClick={() => setOpen((o) => !o)} className="flex w-full items-center gap-2 text-left">
        <span className="font-semibold text-ink-900">{t("Bugün ne yapmak istiyorsunuz?")}</span>
        <span className="hidden text-sm text-ink-500 sm:inline">{t("Yapacağınız işi seçin; sizi doğru adıma götürelim.")}</span>
        <ChevronDown className={cn("ml-auto h-4 w-4 text-ink-400 transition", open && "rotate-180")} />
      </button>
      {open && (
        <>
          <div className="mt-4 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
            {TASKS.map((x) => (
              <Link key={x.href} href={x.href} className="group flex items-start gap-3 rounded-2xl border border-ink-100 p-3.5 transition hover:-translate-y-0.5 hover:border-brand-200 hover:bg-brand-50/40">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 group-hover:bg-white"><x.icon className="h-4 w-4" /></span>
                <span className="min-w-0"><span className="block text-[14px] font-medium text-ink-900">{t(x.title)}</span><span className="block text-[12.5px] text-ink-500">{t(x.text)}</span></span>
              </Link>
            ))}
          </div>
          <p className="mt-3 text-[12.5px] text-ink-500">{t("Nasıl göründüğünü önce görmek isterseniz:")} <Link href="/ornekler" className="font-medium text-brand-700 hover:underline">{t("örnek bir çalışmanın her adımını inceleyin →")}</Link></p>
        </>
      )}
    </section>
  );
}
