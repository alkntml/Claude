import type { Segment, SectionId } from "./pdf-clean";

export interface Chunk {
  content: string;
  pageHint: string | null;
  /** Bölüm (Özet, Yöntem, Bulgular…) — PDF’te başlıklardan tanınır (D132) */
  section?: SectionId | null;
}

/**
 * Metni ~1200 karakterlik, paragraf sınırlarına saygılı ve örtüşmeli parçalara böler.
 * pageLabels: PDF sayfalarının yayındaki sayfa numaraları (null = güvenilir sayfa yok).
 * segments verilirse (temizlenmiş PDF bölümleri) parçalar bölüm sınırını aşmaz ve bölüm bilgisini taşır.
 */
export function chunkText(input: { pages?: string[]; text: string; pageLabels?: (string | null)[]; segments?: Segment[] }, size = 1200, overlap = 150): Chunk[] {
  const units: { text: string; pageIndex: number | null; section: SectionId | null }[] = input.segments?.length
    ? input.segments.map((s) => ({ text: s.text, pageIndex: s.page - 1, section: s.section }))
    : (input.pages?.length ? input.pages : [input.text]).map((p, i) => ({ text: p, pageIndex: input.pages?.length ? i : null, section: null }));
  const out: Chunk[] = [];
  for (const u of units) {
    const label = u.pageIndex == null ? null : input.pageLabels ? input.pageLabels[u.pageIndex] : String(u.pageIndex + 1);
    const hint = label ? `s. ${label}` : null;
    const paras = u.text.split(/\n{2,}|(?<=[.!?])\s{2,}/).map((p) => p.replace(/\s+/g, " ").trim()).filter(Boolean);
    let buf = "";
    const push = (content: string) => out.push({ content: content.trim(), pageHint: hint, ...(input.segments ? { section: u.section } : {}) });
    for (const p of paras) {
      if ((buf + " " + p).length > size && buf) {
        push(buf);
        buf = buf.slice(-overlap) + " " + p;
      } else buf = buf ? `${buf} ${p}` : p;
      while (buf.length > size * 1.6) {
        push(buf.slice(0, size));
        buf = buf.slice(size - overlap);
      }
    }
    if (buf.trim()) push(buf);
  }
  return out.filter((c) => c.content.length > 30);
}
