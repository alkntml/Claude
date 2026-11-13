/**
 * Çerez ve benzeri teknolojilerin envanteri ve izin altyapısı (D154). İstemci ve sunucuda kullanılabilir.
 *
 * - TECHNOLOGIES: sitenin gerçekte kullandığı çerez/tarayıcı belleği/servis çalışanı listesi. Çerez Politikası (/cerez-politikasi)
 *   ile aynı bilgiyi vermelidir; tests/consent.test.ts koddaki çerez adlarının bu listede olduğunu denetler.
 * - Önceden izin gerektiren bir teknoloji (ör. analitik, pazarlama) eklendiğinde: `category` onu gösterir,
 *   `needsConsentBanner()` true olur, <ConsentBanner> kendiliğinden görünür ve <ConsentGate> / `hasConsent()` ile
 *   sarılmış kod kullanıcı izin verene kadar ÇALIŞMAZ. Bugün böyle bir teknoloji yoktur; şerit gösterilmez.
 * - Cihaz kimliği (acd_did) için izin gerekip gerekmediği hukuki karar bekliyor (Çerez Politikası, “Cihaz tanımlayıcısı”).
 *   Varsayım yapılmaz: bugünkü davranış korunur (SECURITY_REQUIRES_CONSENT = false). Hukukçu izin gerektiğine karar verirse
 *   bu değer true yapılır; şerit çıkar ve cihaz kimliği yalnızca izinle oluşturulur.
 */
export type ConsentCategory = "necessary" | "security" | "functional" | "analytics" | "marketing";

export interface Technology {
  name: string;
  kind: "cookie" | "localStorage" | "sessionStorage" | "serviceWorker";
  category: ConsentCategory;
  party: "first" | "third";
  duration: string;
  purpose: string;
}

export const TECHNOLOGIES: Technology[] = [
  { name: "sb-<proje>-auth-token", kind: "cookie", category: "necessary", party: "first", duration: "Oturum ve yenileme süresi", purpose: "Supabase oturum çerezleri (giriş, PKCE doğrulayıcısı dâhil)" },
  { name: "acd_did", kind: "cookie", category: "security", party: "first", duration: "400 gün", purpose: "Rastgele cihaz kimliği: davet ödülü suistimali ve hesap paylaşımı tespiti" },
  { name: "acd_did", kind: "localStorage", category: "security", party: "first", duration: "Silinene kadar", purpose: "Cihaz kimliğinin tarayıcı belleğindeki kopyası" },
  { name: "lang", kind: "cookie", category: "functional", party: "first", duration: "1 yıl", purpose: "Arayüz dili" },
  { name: "academiana-theme", kind: "localStorage", category: "functional", party: "first", duration: "Silinene kadar", purpose: "Gece modu tercihi" },
  { name: "akademi:tour:v1", kind: "localStorage", category: "functional", party: "first", duration: "Silinene kadar", purpose: "Rehberli tur durumu" },
  { name: "yazı yedeği (çalışma kimliğiyle)", kind: "localStorage", category: "functional", party: "first", duration: "Kayıt tamamlanınca silinir", purpose: "Çevrimdışı yazı yedeği" },
  { name: "diğer arayüz tercihleri (acd_autosuggest, academiana-gift-*, akademi:install-dismissed, akademi:*-later:*, academiana:tool-survey, acd_dev_sent)", kind: "localStorage", category: "functional", party: "first", duration: "Silinene kadar", purpose: "Satır içi öneri tercihi, hediye kutusu ve uygulama yükleme bildirimi görüldü bilgisi, “sonra” tercihleri, ücretsiz anket aracı taslağı, cihaz özeti gönderildi bilgisi" },
  { name: "akademi:ref, akademi:kod, warn:*, survey-ai-notes:*", kind: "sessionStorage", category: "functional", party: "first", duration: "Sekme kapanınca silinir", purpose: "Kayıt sırasında davet/indirim kodunun korunması, bir kez gösterilen uyarılar, anket yardımcısı notları" },
  { name: "sw.js", kind: "serviceWorker", category: "functional", party: "first", duration: "—", purpose: "PWA: sitenin çevrimdışı açılması" },
];

/** Önceden izin gerektiren kategoriler (bugün envanterde bu kategoride teknoloji yok) */
export const SECURITY_REQUIRES_CONSENT = false;
export function requiresConsent(c: ConsentCategory): boolean {
  return c === "analytics" || c === "marketing" || (c === "security" && SECURITY_REQUIRES_CONSENT);
}

export function needsConsentBanner(list: Technology[] = TECHNOLOGIES): boolean {
  return list.some((t) => requiresConsent(t.category));
}

/** İzin tercihinin saklandığı çerez (yalnızca izin gerektiren teknoloji varken ve kullanıcı seçim yaptığında yazılır) */
export const CONSENT_COOKIE = "acd_consent";
export type ConsentChoice = Partial<Record<ConsentCategory, boolean>>;

export function parseConsent(raw: string | null | undefined): ConsentChoice {
  if (!raw) return {};
  try {
    const v = JSON.parse(decodeURIComponent(raw)) as unknown;
    if (!v || typeof v !== "object") return {};
    const out: ConsentChoice = {};
    for (const k of ["security", "analytics", "marketing"] as const) if (typeof (v as Record<string, unknown>)[k] === "boolean") out[k] = (v as Record<string, boolean>)[k];
    return out;
  } catch { return {}; }
}

/** İzin gerekmeyen kategoriler her zaman serbest; izin gerekenler yalnızca açık “evet” ile */
export function hasConsent(category: ConsentCategory, choice: ConsentChoice): boolean {
  return !requiresConsent(category) || choice[category] === true;
}

/** Tarayıcıda: güncel tercih */
export function readConsent(): ConsentChoice {
  if (typeof document === "undefined") return {};
  const m = document.cookie.match(/(?:^|; )acd_consent=([^;]*)/);
  return parseConsent(m?.[1]);
}

export function writeConsent(choice: ConsentChoice): void {
  if (typeof document === "undefined") return;
  document.cookie = `${CONSENT_COOKIE}=${encodeURIComponent(JSON.stringify(choice))}; path=/; max-age=15552000; samesite=lax${location.protocol === "https:" ? "; secure" : ""}`;
  window.dispatchEvent(new Event("acd-consent"));
}
