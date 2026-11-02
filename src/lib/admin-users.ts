import "server-only";

/** Yönetim: paket süresi hesapları (D53) */
export function addDays(fromIso: string | null | undefined, days: number): string {
  const base = fromIso && new Date(fromIso).getTime() > Date.now() ? new Date(fromIso).getTime() : Date.now();
  return new Date(base + days * 86400_000).toISOString();
}

export function daysLeft(iso: string | null | undefined): number | null {
  if (!iso) return null;
  return Math.ceil((new Date(iso).getTime() - Date.now()) / 86400_000);
}
