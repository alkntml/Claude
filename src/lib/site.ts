/** Sitenin adı ve resmî adresi (ana alan adı; www’siz adres buraya yönlenir). İstemci ve sunucuda kullanılabilir. */
export const SITE_NAME = "Academiana";
export const SITE_URL = "https://www.academiana.com.tr";
export const SITE_HOST = "www.academiana.com.tr";

/** Tanıtım videosu (D127): public/video altında; ana sayfa oynatıcısı ve VideoObject şeması aynı dosyayı kullanır. */
export const PROMO_VIDEO = { src: "/video/academiana-tanitim-80-ses.mp4", poster: "/video/academiana-tanitim-kapak.jpg", duration: "PT1M20S", uploadDate: "2026-11-14" };

/** İletişim (D199): herkese açık e-posta ve Instagram hesabı (altbilgi, Hakkımızda, Kurumlar, yapılandırılmış veri) */
export const CONTACT_EMAIL = "iletisim@academiana.com.tr";
export const INSTAGRAM = { handle: "academianatr", url: "https://www.instagram.com/academianatr/" };

/**
 * D226: Satıcı ve veri sorumlusu bilgileri (vergi levhası). Mesafeli Sözleşmeler, KVKK, sipariş özeti, altbilgi ve
 * Hakkımızda bu bilgileri kullanır. T.C. kimlik numarası bilerek yayımlanmaz (vergi kimlik numarası yeterlidir).
 */
export const SELLER = {
  name: "Alkın Mert Temel",
  kind: { tr: "Şahıs işletmesi", en: "Sole proprietorship", de: "Einzelunternehmen" },
  address: "Örencik Mah. 3803 Cad. No: 17 İç Kapı No: 11, Gölbaşı / Ankara, Türkiye",
  taxOffice: "Gölbaşı",
  taxNo: "8370931187",
  activity: { tr: "582901 – Diğer yazılım programlarının yayımlanması", en: "582901 – Other software publishing", de: "582901 – Verlegen von sonstiger Software" },
  phone: "+90 542 526 66 50",
} as const;
/** Ödeme kuruluşu (D225/D226) */
export const PAYMENT_PROVIDER = { name: "PayTR Ödeme ve Elektronik Para Kuruluşu A.Ş.", short: "PayTR", url: "https://www.paytr.com" } as const;
