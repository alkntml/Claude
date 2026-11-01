/** Fiyatlandırma ve paket yardımcıları (istemci ve sunucu ortak, saf fonksiyonlar). */

export const PLAN_RANK: Record<string, number> = { free: 0, basic: 1, pro: 2, premium: 3 };

/** Kurum paketi kişisel paketten yüksekse kurum paketi geçerlidir */
export function higherPlan(personal: string, org: string | null | undefined): string {
  if (!org) return personal;
  return (PLAN_RANK[org] ?? 0) > (PLAN_RANK[personal] ?? 0) ? org : personal;
}

/** Üniversite e-postası mı? (ör. ali@ogr.hacettepe.edu.tr → "edu.tr" alan adı listesiyle eşleşir) */
export function isStudentEmail(email: string | null | undefined, domains: string[]): boolean {
  const host = String(email ?? "").toLowerCase().split("@")[1];
  if (!host) return false;
  return domains.some((d) => { const dd = d.toLowerCase().replace(/^[.@]/, ""); return host === dd || host.endsWith(`.${dd}`); });
}

export function discounted(price: number, percent: number): number {
  const p = Math.max(0, Math.min(90, percent));
  return Math.round(price * (1 - p / 100) * 100) / 100;
}

/** E-posta kurum alan adına uygun mu? (domain boşsa herkes) */
export function emailMatchesDomain(email: string | null | undefined, domain: string | null | undefined): boolean {
  if (!domain) return true;
  return isStudentEmail(email, [domain]);
}
