/**
 * D226: sipariş özeti (mesafeli satışta kalıcı veri saklayıcısı): kullanıcının indirdiği, tek başına açılan HTML belge.
 * Satıcı bilgileri, alıcı, paket, süre, tutar, ödeme yöntemi, otomatik yenileme ve cayma bilgisi. Saf modül.
 */
import { PAYMENT_PROVIDER, SELLER, SITE_URL } from "@/lib/site";

export interface ReceiptOrder {
  merchant_oid: string; plan_name: string; period: "monthly" | "yearly"; days: number; amount_try: number; list_price_try: number | null;
  discount_code: string | null; status: string; payer_name: string; payer_phone: string; payer_address: string; buyer_email: string | null;
  invoice_type?: string | null; company_title?: string | null; tax_number?: string | null; tax_office?: string | null; buyer_first_name?: string | null; buyer_last_name?: string | null;
  payment_type: string | null; test_mode: boolean; renewal?: boolean | null; auto_renew_consent?: boolean | null; created_at: string; applied_at: string | null; immediate_start_consent?: boolean | null; distance_version?: string | null;
}

const esc = (s: unknown) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const tl = (n: number) => `${Number(n).toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TL`;
const dt = (iso: string) => new Date(iso).toLocaleString("tr-TR", { dateStyle: "long", timeStyle: "short", timeZone: "Europe/Istanbul" });
const STATUS: Record<string, string> = { paid: "Ödendi", pending: "Ödeme bekleniyor", failed: "Ödeme tamamlanmadı" };

/** D231: bireysel faturada ad, soyad, telefon, e-posta; ticari faturada unvan, vergi no, vergi dairesi, adres, telefon, e-posta */
function buyerRows(o: ReceiptOrder, row: (k: string, v: string) => string): string {
  if (o.invoice_type === "commercial") {
    return [row("Fatura türü", "Ticari"), row("Şirket unvanı", esc(o.company_title ?? o.payer_name)), row("Vergi numarası", esc(o.tax_number ?? "—")), row("Vergi dairesi", esc(o.tax_office ?? "—")),
      row("Açık adres", esc(o.payer_address)), row("Telefon", esc(o.payer_phone)), row("E-posta", esc(o.buyer_email ?? "—"))].join("\n");
  }
  const name = o.buyer_first_name || o.buyer_last_name ? [row("Ad", esc(o.buyer_first_name ?? "")), row("Soyad", esc(o.buyer_last_name ?? ""))] : [row("Ad soyad", esc(o.payer_name))];
  return [row("Fatura türü", "Bireysel"), ...name, row("Telefon", esc(o.payer_phone)), row("E-posta", esc(o.buyer_email ?? "—")), ...(o.payer_address ? [row("Fatura adresi", esc(o.payer_address))] : [])].join("\n");
}

export function receiptHtml(o: ReceiptOrder): string {
  const row = (k: string, v: string) => `<tr><th>${esc(k)}</th><td>${v}</td></tr>`;
  const disc = o.list_price_try != null && Number(o.list_price_try) > Number(o.amount_try);
  return `<!doctype html><html lang="tr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Sipariş özeti ${esc(o.merchant_oid)} · Academiana</title>
<style>body{font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;color:#1a1d2c;max-width:760px;margin:32px auto;padding:0 20px;line-height:1.5}h1{font-size:22px;margin:0 0 4px}h2{font-size:15px;margin:26px 0 8px;text-transform:uppercase;letter-spacing:.06em;color:#4f46e5}table{width:100%;border-collapse:collapse;font-size:14px}th,td{text-align:left;vertical-align:top;padding:7px 8px;border-bottom:1px solid #eceef4}th{width:38%;color:#555a71;font-weight:600}p{font-size:13.5px;color:#3d4258}.test{display:inline-block;background:#fef3c7;color:#92400e;border-radius:6px;padding:2px 8px;font-weight:700;font-size:12px}small{color:#6c7189}@media print{body{margin:0}}</style></head><body>
<h1>Sipariş özeti</h1><small>Academiana · ${esc(SITE_URL.replace("https://", ""))}${o.test_mode ? ' · <span class="test">TEST ÖDEMESİ — gerçek tahsilat yapılmadı</span>' : ""}</small>
<h2>Satıcı</h2><table>
${row("Ad soyad / unvan", `${esc(SELLER.name)} (${esc(SELLER.kind.tr)})`)}
${row("Adres", esc(SELLER.address))}
${row("Vergi dairesi / vergi no", `${esc(SELLER.taxOffice)} / ${esc(SELLER.taxNo)}`)}
${row("İletişim", `WhatsApp ${esc(SELLER.phone)} · ${esc(SITE_URL)}`)}
</table>
<h2>Alıcı (fatura bilgileri)</h2><table>
${buyerRows(o, row)}
</table>
<h2>Sipariş</h2><table>
${row("Sipariş no", esc(o.merchant_oid))}
${row("Sipariş tarihi", esc(dt(o.created_at)))}
${row("Hizmet", `Academiana ${esc(o.plan_name)} paketi — ${o.period === "yearly" ? "yıllık" : "aylık"} (${o.days} gün)`)}
${disc ? row("Liste fiyatı", tl(Number(o.list_price_try))) : ""}${o.discount_code ? row("İndirim kodu", esc(o.discount_code)) : ""}
${row("Toplam bedel", `<b>${tl(Number(o.amount_try))}</b> (vergiler dahil, Türk lirası)`)}
${row("Ödeme yöntemi", `Kredi / banka kartı, tek çekim — ${esc(PAYMENT_PROVIDER.name)} güvenli ödeme sayfası`)}
${row("Ödeme durumu", esc(STATUS[o.status] ?? o.status))}
${o.applied_at ? row("Hizmetin başlangıcı", esc(dt(o.applied_at))) : ""}
${row("Otomatik yenileme", o.auto_renew_consent ? "Evet. İptal edilmedikçe her dönem sonunda kayıtlı kartınızdan o günkü güncel fiyatla yenilenir; yenilemeden önce bildirim gönderilir. Hesap → Otomatik yenileme bölümünden istediğiniz an iptal edebilirsiniz; iptalde paketiniz ödediğiniz dönemin sonuna kadar sürer." : "Yok. Dönem sonunda yenilemeyi siz başlatırsınız; onayınız olmadan ücret alınmaz.")}
${o.renewal ? row("Sipariş türü", "Otomatik yenileme") : ""}
</table>
<h2>Bilgilendirme</h2>
<p>Hizmet, ödemenin ödeme kuruluşu tarafından onaylanmasıyla paketin hesaba tanımlandığı anda başlar. ${o.immediate_start_consent ? "Satın alma sırasında hizmetin hemen başlamasını talep ettiniz ve bunun cayma hakkınıza etkisi size bildirildi. " : ""}Cayma hakkı, iade ve şikâyet yolları Mesafeli Sözleşmeler ve Ön Bilgilendirme belgesinde açıklanır${o.distance_version ? ` (sürüm ${esc(o.distance_version)})` : ""}: ${esc(SITE_URL)}/mesafeli-sozlesmeler. Kart bilgileri Academiana’ya iletilmez; ödeme ${esc(PAYMENT_PROVIDER.name)} tarafından işlenir.</p>
<p><small>Bu belge, sipariş kaydınızdan oluşturulmuştur ve kalıcı olarak saklamanız için verilir.</small></p>
</body></html>`;
}
