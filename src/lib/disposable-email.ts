/**
 * Tek kullanımlık (geçici) e-posta servisleri (D106): bu adreslerle açılan hesaplar davet ödülü kazandırmaz.
 * Aynı liste migration 29’da `disposable_email_domains` tablosuna yazılır (tests/referral-guard.test.ts eşitliği denetler).
 */
export const DISPOSABLE_EMAIL_DOMAINS = [
  "10minutemail.com", "10minutemail.net", "20minutemail.com", "anonbox.net", "burnermail.io", "discard.email",
  "dispostable.com", "emailfake.com", "emailondeck.com", "fakeinbox.com", "fakemail.net", "getairmail.com",
  "getnada.com", "grr.la", "guerrillamail.biz", "guerrillamail.com", "guerrillamail.de", "guerrillamail.info",
  "guerrillamail.net", "guerrillamail.org", "guerrillamailblock.com", "inboxkitten.com", "jetable.org",
  "mail.tm", "mailcatch.com", "maildrop.cc", "mailinator.com", "mailinator.net", "mailnesia.com", "mintemail.com",
  "mohmal.com", "moakt.com", "mytemp.email", "nada.email", "sharklasers.com", "spam4.me", "spamgourmet.com",
  "temp-mail.io", "temp-mail.org", "tempail.com", "tempmail.com", "tempmail.dev", "tempmail.net", "tempmailo.com",
  "tempr.email", "throwawaymail.com", "tmpmail.net", "tmpmail.org", "trashmail.com", "trashmail.de", "trashmail.net",
  "yopmail.com", "yopmail.fr", "yopmail.net",
] as const;

/** Adres tek kullanımlık bir servise mi ait? (alt alan adları dahil) */
export function isDisposableEmail(email: string | null | undefined): boolean {
  const domain = (email ?? "").trim().toLowerCase().split("@")[1];
  if (!domain) return false;
  return DISPOSABLE_EMAIL_DOMAINS.some((d) => domain === d || domain.endsWith(`.${d}`));
}
