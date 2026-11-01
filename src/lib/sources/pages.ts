/**
 * PDF sayfa sırasını yayının gerçek sayfa numaralarına eşler.
 * Atıf stilleri (APA, MLA, Chicago…) yayındaki sayfa numarasını ister; PDF'in kaçıncı sayfası olduğu değil.
 * - Künyede sayfa aralığı yoksa (ön baskı, rapor, kitap PDF'i) PDF sayfası kullanılır.
 * - Aralık PDF sayfa sayısıyla birebir eşleşiyorsa: başlangıç + sıra.
 * - PDF'te tam bir fazla sayfa varsa ilki kapak sayfası kabul edilir.
 * - Eşleşme güvenilir değilse null döner (yanlış sayfa yazmaktansa hiç yazmamak).
 */
export function pdfPageLabels(sourcePages: string | null | undefined, pdfCount: number): (string | null)[] {
  const pdf = Array.from({ length: pdfCount }, (_, i) => String(i + 1));
  if (!sourcePages || !sourcePages.trim()) return pdf;
  const m = sourcePages.trim().match(/^(\d+)\s*[-–—]\s*(\d+)$/);
  if (!m) return Array(pdfCount).fill(null);
  const start = Number(m[1]);
  let end = Number(m[2]);
  // Kısaltılmış aralık: 185-96 -> 185-196
  if (end < start && m[2].length < m[1].length) end = Number(m[1].slice(0, m[1].length - m[2].length) + m[2]);
  const span = end - start + 1;
  if (span <= 0) return Array(pdfCount).fill(null);
  if (pdfCount === span) return pdf.map((_, i) => String(start + i));
  if (pdfCount === span + 1) return pdf.map((_, i) => (i === 0 ? null : String(start + i - 1)));
  return Array(pdfCount).fill(null);
}
