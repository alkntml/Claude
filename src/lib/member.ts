/** Üye numarası (D56): ekranda “AC001234” biçiminde gösterilir; aramada AC001234, ac-1234 veya 1234 kabul edilir. */
export function memberCode(n: number | string | null | undefined): string {
  if (n == null || n === "") return "";
  return `AC${String(n).padStart(6, "0")}`;
}

export function parseMemberCode(q: string): number | null {
  const m = q.trim().match(/^(?:ac)?[-\s]?0*(\d{1,12})$/i);
  return m ? Number(m[1]) : null;
}
