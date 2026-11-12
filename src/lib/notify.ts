/** D146: yönetici mesajındaki bağlantı yalnızca site içi bir yol olabilir (dış adres, //, \ ve boşluk yok). Saf. */
export const INTERNAL_LINK_RE = /^\/(?![/\\])\S*$/;
export function isSafeInternalLink(s: string | null | undefined): boolean {
  return INTERNAL_LINK_RE.test(String(s ?? ""));
}
