"use client";
import { CheckCircle2 } from "lucide-react";
import Link from "@/components/l-link";
import { useT } from "@/i18n/client";
import { DISTANCE_ANCHORS } from "@/lib/legal/anchors";
import { formatPrice, yearlyDescription, yearlyFeature } from "@/lib/pricing";
import { SELLER } from "@/lib/site";

export interface OrderSummaryProps {
  planName: string; description?: string | null; planId: string; features: string[];
  yearly: boolean; days: number; amount: number; listPrice?: number | null; discountCode?: string | null;
  startsAt: Date; endsAt: Date; extending: boolean;
  /** true: otomatik yenileme açık; false: kapalı */
  autoRenew: boolean;
}

const doc = (k: keyof typeof DISTANCE_ANCHORS) => `/mesafeli-sozlesmeler#${DISTANCE_ANCHORS[k]}`;

/**
 * D235: sipariş özeti — satın almadan önce kullanıcı neyi aldığından emin olsun: paketin içeriği, süre (başlangıç/bitiş),
 * tutar dökümü, ödeme yöntemi, otomatik yenileme ve iptal/iade koşullarına bağlantılar. Yükseltme penceresinde ve ödeme sayfasında ortaktır.
 */
export function OrderSummary(p: OrderSummaryProps) {
  const { t, dl } = useT();
  const date = (d: Date) => d.toLocaleDateString(dl, { dateStyle: "long" });
  const desc = p.description ? (p.yearly ? yearlyDescription(p.planId, p.description) : { key: p.description, vars: undefined }) : null;
  const saving = p.listPrice != null && p.listPrice > p.amount ? p.listPrice - p.amount : 0;
  const lbl = "font-semibold text-ink-700";
  const link = "font-medium text-brand-700 underline underline-offset-2 hover:text-brand-800";
  return (
    <div className="rounded-xl border border-ink-100 bg-white p-4 text-[12.5px] leading-relaxed text-ink-600">
      <p className="text-[13.5px] font-semibold text-ink-900">{t("Sipariş özeti")}</p>

      <div className="mt-3 rounded-lg bg-ink-50 p-3">
        <p className="text-[13.5px] font-semibold text-ink-900">{t("Academiana {plan} paketi", { plan: t(p.planName) })} · {p.yearly ? t("Yıllık (tek ödeme)") : t("Aylık")}</p>
        {desc && <p className="mt-0.5">{t(desc.key, desc.vars)}</p>}
        <p className={`mt-2 ${lbl}`}>{t("Pakete dahil olanlar")}</p>
        <ul className="mt-1 grid gap-x-4 gap-y-1 sm:grid-cols-2">
          {p.features.map((f) => { const y = p.yearly ? yearlyFeature(f) : { key: f, vars: undefined }; return (
            <li key={f} className="flex items-start gap-1.5"><CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" aria-hidden /><span>{t(y.key, y.vars)}</span></li>
          ); })}
        </ul>
      </div>

      <dl className="mt-3 space-y-2">
        <div>
          <dt className={lbl}>{t("Süre")}</dt>
          <dd>{p.yearly ? t("365 gün; 12 aylık hak baştan tanımlanır") : t("30 gün")} · {t("Başlangıç")}: {t("ödeme onaylanınca hemen")} ({date(p.startsAt)}) · {t("Bitiş")}: <b className="text-ink-800">{date(p.endsAt)}</b>{p.extending ? ` · ${t("süre, mevcut paketinizin kalan süresine eklenir")}` : ""}</dd>
        </div>
        <div>
          <dt className={lbl}>{t("Tutar")}</dt>
          <dd>
            {p.listPrice != null && saving > 0 && <span className="block">{t("Liste fiyatı")}: {formatPrice(p.listPrice, "tr")} · {p.discountCode ? t("İndirim kodu {code}", { code: p.discountCode }) : t("Yıllık ödeme indirimi")}: −{formatPrice(saving, "tr")}</span>}
            <span className="block"><b className="text-ink-900">{t("Toplam")}: {formatPrice(p.amount, "tr")}</b> {t("(vergiler dahil, Türk lirası)")}</span>
            <span className="block">{t("Ödeme: kredi/banka kartı, tek çekim; kart bilgilerinizi PayTR’nin güvenli sayfasında girersiniz.")}</span>
          </dd>
        </div>
        <div>
          <dt className={lbl}>{t("Yenileme")}</dt>
          <dd>{p.autoRenew
            ? <>{t("İptal edilmedikçe her dönem sonunda kayıtlı kartınızdan o günkü güncel fiyatla otomatik yenilenir; yenilemeden önce bildirim gönderilir. Hesap → Otomatik yenileme’den istediğiniz an iptal edebilirsiniz.")} <Link href={doc("renewal")} target="_blank" className={link}>{t("Yenileme koşulları")}</Link></>
            : t("Otomatik yenileme yok: paketiniz ödediğiniz dönemin sonunda sona erer, kartınızdan yeni ödeme çekilmez.")}</dd>
        </div>
        <div>
          <dt className={lbl}>{t("İptal ve iade")}</dt>
          <dd>
            {t("Hizmet, ödeme onaylanır onaylanmaz başlar; elektronik ortamda anında ifa edilen dijital hizmette ifaya başlandıktan sonra cayma hakkı mevzuatın öngördüğü ölçüde kullanılamaz. İade gereken hâllerde bedel ödeme yapılan karta iade edilir. Aboneliği iptal ederseniz iptal bir sonraki dönem için geçerli olur ve paketiniz ödenmiş dönemin sonuna kadar sürer.")}
            <span className="mt-1 flex flex-wrap gap-x-4 gap-y-1">
              <Link href={doc("withdrawal")} target="_blank" className={link}>{t("Cayma hakkı ve iade koşulları")}</Link>
              <Link href={doc("start")} target="_blank" className={link}>{t("Hizmetin başlama zamanı")}</Link>
              <Link href={doc("complaints")} target="_blank" className={link}>{t("Şikâyet ve başvuru")}</Link>
            </span>
          </dd>
        </div>
        <div>
          <dt className={lbl}>{t("Satıcı")}</dt>
          <dd>{SELLER.name} · {t("Vergi no")} {SELLER.taxNo} ({t("{o} Vergi Dairesi", { o: SELLER.taxOffice })}) · {SELLER.address}</dd>
        </div>
      </dl>
    </div>
  );
}
