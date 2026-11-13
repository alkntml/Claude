/** D177: “Kaynakla düzelt” önerisinin uygulanabilir olup olmadığı (istemci ve test ortak) */
/** D177: önerinin sorunları — kalan işaret, projede karşılığı olmayan kaynak numarası, kaybolan mevcut atıf */
export function proposalProblems(md: string, map: Record<string, string>, tokenText: string): string[] {
  const out: string[] = [];
  if (/\[KAYNAK (GEREKLİ|DOĞRULANAMADI)\]|\[(CITATION NEEDED|QUELLE ERFORDERLICH)\]/i.test(md)) out.push("marker");
  for (const m of md.matchAll(/\[\[kaynak:([A-Za-z0-9,\s-]+)/g)) if (m[1].split(",").some((x) => !map[x.trim()])) { out.push("unknown"); break; }
  const tokens = tokenText.match(/⟦C\d+⟧/g) ?? [];
  if (tokens.some((tk) => !md.includes(tk))) out.push("lost");
  return out;
}
