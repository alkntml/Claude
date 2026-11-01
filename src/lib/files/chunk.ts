export interface Chunk {
  content: string;
  pageHint: string | null;
}

/** Metni ~1200 karakterlik, paragraf sınırlarına saygılı ve örtüşmeli parçalara böler. */
/** pageLabels: PDF sayfalarının yayındaki sayfa numaraları (null = güvenilir sayfa yok). */
export function chunkText(input: { pages?: string[]; text: string; pageLabels?: (string | null)[] }, size = 1200, overlap = 150): Chunk[] {
  const pages = input.pages?.length ? input.pages : [input.text];
  const out: Chunk[] = [];
  pages.forEach((page, pi) => {
    const label = input.pageLabels ? input.pageLabels[pi] : String(pi + 1);
    const hint = input.pages?.length && label ? `s. ${label}` : null;
    const paras = page.split(/\n{2,}|(?<=[.!?])\s{2,}/).map((p) => p.replace(/\s+/g, " ").trim()).filter(Boolean);
    let buf = "";
    for (const p of paras) {
      if ((buf + " " + p).length > size && buf) {
        out.push({ content: buf.trim(), pageHint: hint });
        buf = buf.slice(-overlap) + " " + p;
      } else buf = buf ? `${buf} ${p}` : p;
      while (buf.length > size * 1.6) {
        out.push({ content: buf.slice(0, size).trim(), pageHint: hint });
        buf = buf.slice(size - overlap);
      }
    }
    if (buf.trim()) out.push({ content: buf.trim(), pageHint: hint });
  });
  return out.filter((c) => c.content.length > 30);
}
