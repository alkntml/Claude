"use client";
import { AlertTriangle, ArrowRight, CheckCircle2, CircleDashed, FileCheck2, GitFork, ListChecks, Network, ScanSearch } from "lucide-react";
import Link from "@/components/l-link";
import { FadeIn } from "@/components/ui/fade-in";
import { useT } from "@/i18n/client";

/**
 * “Teslim etmeden önce emin olun” vitrini (D126): iddia denetimi, kalite puanı + teslim öncesi kontrol listesi,
 * PRISMA 2020 ve literatür haritası. Görseller temsilîdir (“örnek” etiketiyle); sayı veya başarı iddiası içermez.
 */
export function AssuranceSection() {
  const { t } = useT();
  return (
    <section id="guvence" className="scroll-mt-24 py-20">
      <div className="mx-auto max-w-6xl px-6">
        <FadeIn className="mx-auto mb-12 max-w-2xl text-center">
          <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">{t("Yeni")}</span>
          <h2 className="mt-3 font-serif text-4xl font-medium tracking-tight text-ink-950 sm:text-5xl">{t("Teslim etmeden önce emin olun.")}</h2>
          <p className="mt-4 text-ink-500">{t("Yazmak işin yarısı. Academiana metninizi danışmanınızdan ve jüriden önce denetler: her atıflı cümleyi kaynağıyla karşılaştırır, eksikleri listeler ve bunu nasıl yaptığını açıkça gösterir.")}</p>
        </FadeIn>

        <div className="grid gap-5 md:grid-cols-2">
          <FadeIn>
            <Card icon={ScanSearch} title={t("İddia denetimi")} text={t("Atıf verdiğiniz her cümle, kaynağın kendi metniyle karşılaştırılır. Sonuç cümlenin üzerinde renkle görünür; kaynaktaki pasaj birebir gösterilir, tek tıkla düzeltme önerisi alırsınız.")}>
              <p className="font-serif text-[14px] leading-7 text-ink-700">
                <Mark tone="good">{t("Öz düzenleme, uzaktan eğitimde başarının güçlü bir yordayıcısıdır.")}</Mark>{" "}
                <Mark tone="partial">{t("Bu etki tüm öğrenciler için geçerlidir.")}</Mark>{" "}
                <Mark tone="bad">{t("Canlı dersler başarıyı iki katına çıkarır.")}</Mark>{" "}
                <Mark tone="none">{t("Geri bildirim de önemli bir etkendir.")}</Mark>
              </p>
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[11.5px] text-ink-500">
                <Legend c="bg-emerald-400" l={t("Destekliyor")} />
                <Legend c="bg-amber-400" l={t("Kısmen")} />
                <Legend c="bg-rose-400" l={t("Desteklemiyor")} />
                <Legend c="bg-ink-300" l={t("Atıfsız")} />
              </div>
            </Card>
          </FadeIn>

          <FadeIn delay={0.06}>
            <Card icon={ListChecks} title={t("Kalite puanı ve teslim öncesi kontrol listesi")} text={t("Eksik künye, kullanılmayan kaynak, atıfsız iddia, tablo ve şekil başlıkları, özet ve kaynakça tek listede. Puan sabit bir formülle hesaplanır; yapay zekânın görüşü puanı değiştirmez.")}>
              <ul className="space-y-1.5 text-[13px]">
                <Check ok l={t("Her bölüm yazıldı")} />
                <Check ok l={t("Kaynakçadaki her kaynağa metinde atıf var")} />
                <Check l={t("2 kaynağın künyesi eksik")} />
                <Check l={t("1 cümle kaynağında desteklenmiyor")} />
              </ul>
            </Card>
          </FadeIn>

          <FadeIn delay={0.1}>
            <Card icon={GitFork} title={t("Sistematik derleme (PRISMA 2020)")} text={t("Kayıtları ekleyin veya içe aktarın; yinelenenler ayıklanır, tarama ve uygunluk aşamaları işlenir, PRISMA akış şeması kendiliğinden çizilir. Yapay zekâ yalnızca öneri verir, kararı siz verirsiniz.")}>
              <div className="flex flex-wrap items-center gap-1.5 text-[12px]">
                {[t("Tanımlanan"), t("Taranan"), t("Tam metin"), t("Dahil edilen")].map((s, i, a) => (
                  <span key={s} className="flex items-center gap-1.5">
                    <span className={`rounded-lg border px-2.5 py-1.5 font-medium ${i === a.length - 1 ? "border-brand-200 bg-brand-50 text-brand-700" : "border-ink-100 bg-ink-50 text-ink-700"}`}>{s}</span>
                    {i < a.length - 1 && <ArrowRight className="h-3.5 w-3.5 text-ink-300" />}
                  </span>
                ))}
              </div>
              <p className="mt-3 text-[12px] text-ink-500">{t("Akış şeması PNG, SVG ve CSV olarak indirilir.")}</p>
            </Card>
          </FadeIn>

          <FadeIn delay={0.14}>
            <Card icon={Network} title={t("Literatür haritası")} text={t("Kaynaklarınızın birbirine atıf ağını görün. Kaynaklarınızın birden fazlasının atıf yaptığı ama sizde olmayan temel çalışmalar ayrıca önerilir.")}>
              <svg viewBox="0 0 260 74" className="h-[74px] w-full" aria-hidden>
                <g className="stroke-ink-200" strokeWidth="1.5">
                  <line x1="30" y1="40" x2="90" y2="18" /><line x1="30" y1="40" x2="95" y2="58" /><line x1="90" y1="18" x2="160" y2="34" /><line x1="95" y1="58" x2="160" y2="34" />
                </g>
                <g className="stroke-brand-300" strokeWidth="1.5" strokeDasharray="4 3"><line x1="160" y1="34" x2="228" y2="40" /><line x1="95" y1="58" x2="228" y2="40" /></g>
                <g className="fill-brand-500"><circle cx="30" cy="40" r="7" /><circle cx="90" cy="18" r="6" /><circle cx="95" cy="58" r="6" /><circle cx="160" cy="34" r="8" /></g>
                <circle cx="228" cy="40" r="8" className="fill-white stroke-brand-500" strokeWidth="2" strokeDasharray="3 2" />
              </svg>
              <p className="mt-2 flex items-center gap-1.5 text-[12px] text-ink-500"><CircleDashed className="h-3.5 w-3.5 text-brand-500" /> {t("Kesik çizgili düğüm: eksik olabilecek temel çalışma")}</p>
            </Card>
          </FadeIn>
        </div>

        <FadeIn className="mt-8 flex flex-col items-center justify-between gap-3 rounded-2xl border border-ink-100 bg-white px-6 py-4 text-sm shadow-soft sm:flex-row">
          <p className="flex items-center gap-2 text-ink-600"><FileCheck2 className="h-4 w-4 shrink-0 text-brand-600" /> {t("Kaynakların nasıl doğrulandığını, iddia denetiminin ve kalite puanının nasıl hesaplandığını herkese açık anlatıyoruz.")}</p>
          <Link href="/yontem" className="shrink-0 font-medium text-brand-700 hover:underline">{t("Yöntem ve şeffaflık →")}</Link>
        </FadeIn>
        <p className="mt-3 text-center text-[11.5px] text-ink-400">{t("Görseller temsilîdir; örnek cümle ve sonuçlar gerçek bir çalışmaya ait değildir.")}</p>
      </div>
    </section>
  );
}

function Card({ icon: Icon, title, text, children }: { icon: typeof ScanSearch; title: string; text: string; children: React.ReactNode }) {
  return (
    <div className="flex h-full flex-col rounded-3xl border border-ink-100 bg-white p-7 shadow-soft">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-ink-900 text-white"><Icon className="h-5 w-5" /></span>
        <h3 className="text-lg font-semibold text-ink-900">{title}</h3>
      </div>
      <p className="mt-3 text-[14.5px] leading-relaxed text-ink-500">{text}</p>
      <div className="mt-5 flex-1 rounded-2xl border border-ink-100 bg-ink-50/50 p-4" aria-hidden>{children}</div>
    </div>
  );
}

const TONES = {
  good: "decoration-emerald-400",
  partial: "decoration-amber-400",
  bad: "decoration-rose-400",
  none: "decoration-ink-300 decoration-dashed",
} as const;

function Mark({ tone, children }: { tone: keyof typeof TONES; children: React.ReactNode }) {
  return <span className={`underline decoration-2 underline-offset-4 ${TONES[tone]}`}>{children}</span>;
}

function Legend({ c, l }: { c: string; l: string }) {
  return <span className="flex items-center gap-1.5"><span className={`h-2 w-2 rounded-full ${c}`} />{l}</span>;
}

function Check({ ok, l }: { ok?: boolean; l: string }) {
  return (
    <li className="flex items-center gap-2 text-ink-700">
      {ok ? <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" /> : <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500" />}
      {l}
    </li>
  );
}
