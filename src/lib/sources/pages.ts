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

/**
 * D222: PDF’in kendi sayfalarına basılmış sayfa numaralarını bulur (künyede sayfa aralığı yokken de doğru sayfa için).
 * Her sayfanın ilk ve son üç satırındaki 1–4 basamaklı sayılar adaydır; aday “sayı − PDF sırası” farkıyla tutulur.
 * Bir sayfanın numarası, aynı fark komşu sayfalardan birinde (±2) de görülüyorsa kabul edilir: yıl, cilt, dipnot
 * numarası gibi sayılar sayfadan sayfaya ardışık artmadığı için elenir; ek dosyalar gibi numaranın yeniden başladığı
 * bölümler kendi farkıyla tanınır. Numarasız sayfalar (makalenin ilk sayfası gibi) iki yanındaki aynı farkla doldurulur.
 * Sayfaların en az %40’ında (en az 3 sayfa) güvenilir numara yoksa null döner (tahmin yürütülmez).
 */
export function detectPrintedPages(rawPages: string[]): (string | null)[] | null {
  const n = rawPages.length;
  if (n < 3) return null;
  const cand: Set<number>[] = rawPages.map((page, i) => {
    const lines = page.split(/\n+/).map((l) => l.trim()).filter(Boolean);
    const edge = lines.length <= 6 ? lines : [...lines.slice(0, 3), ...lines.slice(-3)];
    const offs = new Set<number>();
    for (const line of edge) {
      for (const m of line.matchAll(/(?<![\d.,/:-])(\d{1,4})(?![\d.,/:]\d|\d|%)/g)) {
        const v = Number(m[1]);
        if (v >= 1) offs.add(v - (i + 1));
      }
    }
    return offs;
  });
  // Genel en sık fark (eşitlikte tercih edilir)
  const votes = new Map<number, number>();
  for (const c of cand) for (const o of c) votes.set(o, (votes.get(o) ?? 0) + 1);
  const global = [...votes.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
  // Genel fark: bir komşuda (±2) da görülmesi yeter. Başka bir fark (ör. eklerde yeniden başlayan numara) ancak
  // ±3 sayfa içinde en az iki başka sayfada da görülüyorsa kabul edilir (kaynakçadaki ardışık yıllar gibi rastlantılar elenir).
  const support = (i: number, o: number, w: number) => [...Array(2 * w + 1).keys()].map((k) => i - w + k).filter((j) => j !== i && j >= 0 && j < n && cand[j].has(o)).length;
  const off: (number | null)[] = cand.map((c, i) => {
    if (global !== undefined && c.has(global) && support(i, global, 2) >= 1) return global;
    const ok = [...c].filter((o) => o !== global && support(i, o, 3) >= 2);
    return ok.length === 1 ? ok[0] : null;
  });
  const sure = off.filter((o) => o !== null).length;
  if (sure < Math.max(3, Math.ceil(n * 0.4))) return null;
  // Boşluk doldurma: iki yanındaki bilinen farklar aynıysa (ya da belgenin başı/sonuysa) o fark kullanılır
  const filled = [...off];
  for (let i = 0; i < n; i++) {
    if (filled[i] !== null) continue;
    let a = i - 1; while (a >= 0 && off[a] === null) a--;
    let b = i + 1; while (b < n && off[b] === null) b++;
    const L = a >= 0 ? off[a] : null, R = b < n ? off[b] : null;
    filled[i] = L !== null && R !== null ? (L === R ? L : null) : L ?? R;
  }
  return filled.map((o, i) => (o !== null && i + 1 + o >= 1 ? String(i + 1 + o) : null));
}

/**
 * D222: sayfa etiketlerinin tek kaynağı. Önce PDF’e basılı numaralar (belgenin kendisi en güçlü kanıttır; künyedeki
 * aralık yanlış olabilir), yoksa künyedeki aralık PDF’le birebir eşleşiyorsa o, aralık hiç yoksa PDF sırası (ön baskı,
 * rapor); aralık var ama tutmuyorsa sayfa yazılmaz (yanlış sayfa yazmaktansa hiç yazmamak).
 */
export function resolvePageLabels(sourcePages: string | null | undefined, pdfCount: number, printed?: (string | null)[] | null): (string | null)[] {
  if (printed && printed.length === pdfCount && printed.some((x) => x !== null)) return printed;
  return pdfPageLabels(sourcePages, pdfCount);
}
