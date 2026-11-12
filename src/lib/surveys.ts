/**
 * Anket modeli (istemci + sunucu). Sorular JSON olarak saklanır; cevaplar doğrulanıp
 * analize hazır tabloya (her madde bir sütun, Likert değerleri 1..k) dönüştürülür.
 * Katılımcıdan kimlik bilgisi (IP, e-posta) toplanmaz.
 */
import { z } from "zod";

export const LIKERT_PRESETS = {
  tr: {
    5: ["Kesinlikle katılmıyorum", "Katılmıyorum", "Kararsızım", "Katılıyorum", "Kesinlikle katılıyorum"],
    7: ["Kesinlikle katılmıyorum", "Katılmıyorum", "Kısmen katılmıyorum", "Kararsızım", "Kısmen katılıyorum", "Katılıyorum", "Kesinlikle katılıyorum"],
  },
  en: {
    5: ["Strongly disagree", "Disagree", "Neutral", "Agree", "Strongly agree"],
    7: ["Strongly disagree", "Disagree", "Somewhat disagree", "Neutral", "Somewhat agree", "Agree", "Strongly agree"],
  },
  // D144: Almanca (yaygın Likert ifadeleri)
  de: {
    5: ["Stimme überhaupt nicht zu", "Stimme eher nicht zu", "Teils/teils", "Stimme eher zu", "Stimme voll und ganz zu"],
    7: ["Stimme überhaupt nicht zu", "Stimme nicht zu", "Stimme eher nicht zu", "Teils/teils", "Stimme eher zu", "Stimme zu", "Stimme voll und ganz zu"],
  },
} as const;

const Code = z.string().trim().min(1).max(40).regex(/^[\p{L}\p{N}_ .-]+$/u, "Değişken adında yalnızca harf, rakam, boşluk, nokta, tire ve alt çizgi kullanılabilir");
const Base = { id: z.string().min(1).max(40), code: Code, title: z.string().trim().min(1).max(500), help: z.string().max(1000).default(""), required: z.boolean().default(true) };

export const QuestionSchema = z.discriminatedUnion("type", [
  z.object({ ...Base, type: z.literal("single"), options: z.array(z.string().trim().min(1).max(200)).min(2).max(30) }),
  z.object({ ...Base, type: z.literal("multi"), options: z.array(z.string().trim().min(1).max(200)).min(2).max(30) }),
  z.object({ ...Base, type: z.literal("likert"), items: z.array(z.string().trim().min(1).max(500)).min(1).max(100), points: z.union([z.literal(5), z.literal(7)]), labels: z.array(z.string().trim().min(1).max(60)), reverse: z.array(z.number().int().min(0)).max(100).default([]) }),
  z.object({ ...Base, type: z.literal("number"), min: z.number().nullable().default(null), max: z.number().nullable().default(null) }),
  z.object({ ...Base, type: z.literal("text"), long: z.boolean().default(false) }),
  z.object({ ...Base, type: z.literal("info"), required: z.literal(false).default(false) }),
]);
export type Question = z.infer<typeof QuestionSchema>;
export const QuestionsSchema = z.array(QuestionSchema).max(150).superRefine((qs, ctx) => {
  const cols = surveyColumns(qs as Question[]).map((c) => c.toLocaleLowerCase("tr"));
  const dup = cols.find((c, i) => cols.indexOf(c) !== i);
  if (dup) ctx.addIssue({ code: "custom", message: `“${dup}” değişken adı birden fazla kez kullanılmış` });
  for (const q of qs) if (q.type === "likert" && q.labels.length !== q.points) ctx.addIssue({ code: "custom", message: `“${q.title}” için ${q.points} seçenek etiketi gerekir` });
});

/** Likert maddesinin sütun adı: kod + sıra (ör. BO1, BO2…) */
export const itemCode = (q: { code: string }, i: number) => `${q.code}${i + 1}`;
/** Çoklu seçim seçeneğinin sütun adı */
export const optionCode = (q: { code: string }, i: number) => `${q.code}_${i + 1}`;

export function surveyColumns(qs: Question[]): string[] {
  return qs.flatMap((q) => {
    if (q.type === "info") return [];
    if (q.type === "likert") return q.items.map((_, i) => itemCode(q, i));
    if (q.type === "multi") return q.options.map((_, i) => optionCode(q, i));
    return [q.code];
  });
}

export type Answers = Record<string, string | number | number[] | null>;

/**
 * Katılımcı cevaplarını doğrular ve temizler. Hata varsa ilk sorunlu sorunun kimliğiyle birlikte döner.
 * Cevap biçimi: single → seçenek sırası; multi → sıralar dizisi; likert → `${id}:${i}` anahtarlarıyla 1..k;
 * number → sayı; text → metin.
 */
export function validateAnswers(qs: Question[], raw: Record<string, unknown>): { ok: true; answers: Answers } | { ok: false; questionId: string; message: string } {
  const out: Answers = {};
  for (const q of qs) {
    if (q.type === "info") continue;
    const miss = (msg = "Bu soru zorunludur") => ({ ok: false as const, questionId: q.id, message: msg });
    if (q.type === "likert") {
      for (let i = 0; i < q.items.length; i++) {
        const v = raw[`${q.id}:${i}`];
        if (v === undefined || v === null || v === "") { if (q.required) return miss("Lütfen tüm maddeleri cevaplayın"); out[`${q.id}:${i}`] = null; continue; }
        const n = Number(v);
        if (!Number.isInteger(n) || n < 1 || n > q.points) return miss("Geçersiz cevap");
        out[`${q.id}:${i}`] = n;
      }
      continue;
    }
    const v = raw[q.id];
    const empty = v === undefined || v === null || v === "" || (Array.isArray(v) && !v.length);
    if (empty) { if (q.required) return miss(); out[q.id] = null; continue; }
    if (q.type === "single") {
      const n = Number(v);
      if (!Number.isInteger(n) || n < 0 || n >= q.options.length) return miss("Geçersiz cevap");
      out[q.id] = n;
    } else if (q.type === "multi") {
      if (!Array.isArray(v)) return miss("Geçersiz cevap");
      const idx = [...new Set(v.map(Number))];
      if (idx.some((n) => !Number.isInteger(n) || n < 0 || n >= q.options.length)) return miss("Geçersiz cevap");
      out[q.id] = idx.sort((a, b) => a - b);
    } else if (q.type === "number") {
      const n = Number(String(v).replace(",", "."));
      if (!Number.isFinite(n)) return miss("Lütfen bir sayı girin");
      if (q.min !== null && n < q.min) return miss("Değer izin verilen aralığın dışında");
      if (q.max !== null && n > q.max) return miss("Değer izin verilen aralığın dışında");
      out[q.id] = n;
    } else if (q.type === "text") {
      const s = String(v).slice(0, q.long ? 5000 : 500).trim();
      if (!s && q.required) return miss();
      out[q.id] = s || null;
    }
  }
  return { ok: true, answers: out };
}

/**
 * Cevapları analize hazır tabloya çevirir. Likert ters maddeler istenirse ters kodlanır
 * (k + 1 − x); ham veri isteniyorsa `reverse: false`.
 */
export function responsesToRows(qs: Question[], responses: { answers: Answers; created_at?: string }[], opts: { reverse?: boolean; withTime?: boolean } = {}): string[][] {
  const head = [...(opts.withTime ? ["Tarih"] : []), ...surveyColumns(qs)];
  const rows = responses.map((r) => {
    const a = r.answers ?? {};
    const cells: string[] = opts.withTime ? [r.created_at ? r.created_at.slice(0, 16).replace("T", " ") : ""] : [];
    for (const q of qs) {
      if (q.type === "info") continue;
      if (q.type === "likert") {
        q.items.forEach((_, i) => {
          const v = a[`${q.id}:${i}`];
          const n = typeof v === "number" ? (opts.reverse && q.reverse.includes(i) ? q.points + 1 - v : v) : null;
          cells.push(n === null ? "" : String(n));
        });
      } else if (q.type === "multi") {
        const sel = Array.isArray(a[q.id]) ? (a[q.id] as number[]) : null;
        q.options.forEach((_, i) => cells.push(sel === null ? "" : sel.includes(i) ? "1" : "0"));
      } else if (q.type === "single") {
        const v = a[q.id];
        cells.push(typeof v === "number" ? q.options[v] ?? "" : "");
      } else {
        const v = a[q.id];
        cells.push(v === null || v === undefined ? "" : String(v));
      }
    }
    return cells;
  });
  return [head, ...rows];
}

/** Excel'in Türkçe ayarlarıyla doğru açılan CSV (noktalı virgül, UTF-8 BOM) */
export function toCsv(rows: string[][], sep = ";"): string {
  // Formül enjeksiyonuna karşı: sayı olmayan ve =,+,-,@ ile başlayan metinlerin başına ' eklenir
  const cell = (c: string) => {
    const safe = /^[=+\-@]/.test(c) && !/^-?\d+([.,]\d+)?$/.test(c) ? `'${c}` : c;
    return /[";\n\r,]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
  };
  return "\uFEFF" + rows.map((r) => r.map((c) => cell(String(c ?? ""))).join(sep)).join("\r\n");
}

/** Değişken kod kitabı (ölçek, madde metni, değer etiketleri) */
export function codebook(qs: Question[]): string[][] {
  const rows: string[][] = [["Değişken", "Soru / madde", "Değerler"]];
  for (const q of qs) {
    if (q.type === "info") continue;
    if (q.type === "likert") q.items.forEach((it, i) => rows.push([itemCode(q, i), `${q.title} — ${it}${q.reverse.includes(i) ? " (ters madde)" : ""}`, q.labels.map((l, k) => `${k + 1} = ${l}`).join("; ")]));
    else if (q.type === "multi") q.options.forEach((o, i) => rows.push([optionCode(q, i), `${q.title} — ${o}`, "1 = seçildi; 0 = seçilmedi"]));
    else if (q.type === "single") rows.push([q.code, q.title, q.options.join("; ")]);
    else rows.push([q.code, q.title, q.type === "number" ? "sayı" : "metin"]);
  }
  return rows;
}

let seq = 0;
export const newId = () => `q${Date.now().toString(36)}${(seq++).toString(36)}`;

// ---------------------------------------------------------------------------
// Yapay zekâ desteği için yardımcılar (D66): yapay zekânın düz biçimli çıktısını güvenli soru
// modeline çevirme, kural tabanlı hızlı kontrol ve tahmini doldurma süresi.
// ---------------------------------------------------------------------------

/** Yapay zekânın döndürdüğü düz soru biçimi (her alan her türde bulunur; türe göre kullanılır) */
export interface AiQuestion {
  type: string; title: string; help?: string; code?: string; required?: boolean;
  options?: string[]; items?: string[]; reverse?: number[]; points?: number; min?: string | number | null; max?: string | number | null; long?: boolean;
}

const TYPES_OK = new Set(["single", "multi", "likert", "number", "text", "info"]);
const clean = (s: unknown, max: number) => String(s ?? "").replace(/\s+/g, " ").trim().slice(0, max);
const cleanList = (l: unknown, max: number, limit: number) => (Array.isArray(l) ? l : []).map((x) => clean(x, max)).filter(Boolean).slice(0, limit);
const toNum = (v: unknown) => { if (v === null || v === undefined || v === "") return null; const n = Number(String(v).replace(",", ".")); return Number.isFinite(n) ? n : null; };

/** Değişken adı: izinli karakterler, en fazla 40; boşsa yedek ad */
export function safeCode(raw: unknown, fallback: string): string {
  const s = String(raw ?? "").normalize("NFC").replace(/[^\p{L}\p{N}_.-]/gu, "").slice(0, 40);
  return s || fallback;
}

/**
 * Yapay zekâ çıktısını doğrulanmış soru listesine çevirir: bilinmeyen türler atılır, seçenek/madde
 * sayıları sınırlanır, Likert etiketleri hazır kalıptan gelir, değişken adları benzersizleştirilir.
 * `keepIds` verilirse aynı sıradaki mevcut soruların kimlikleri korunur (düzenlemede veri bağı kopmasın).
 */
export function fromAiQuestions(raw: AiQuestion[], lang: "tr" | "en" | "de", keepIds: string[] = []): Question[] {
  const out: Question[] = [];
  const used = new Set<string>();
  const reserve = (cols: string[]) => cols.forEach((c) => used.add(c.toLocaleLowerCase("tr")));
  const free = (cols: string[]) => cols.every((c) => !used.has(c.toLocaleLowerCase("tr")));
  for (const r of (Array.isArray(raw) ? raw : []).slice(0, 150)) {
    if (!r || !TYPES_OK.has(r.type)) continue;
    const n = out.length + 1;
    const title = clean(r.title, 500);
    if (!title) continue;
    const id = keepIds[out.length] ?? newId();
    const base = { id, title, help: clean(r.help, 1000), required: r.required !== false };
    let q: Question | null = null;
    if (r.type === "single" || r.type === "multi") {
      const options = [...new Set(cleanList(r.options, 200, 30))];
      if (options.length < 2) continue;
      q = { ...base, type: r.type, code: "", options } as Question;
    } else if (r.type === "likert") {
      const items = cleanList(r.items, 500, 100).map((x) => x.replace(/^\d+[.)]\s*/, ""));
      if (!items.length) continue;
      const points = r.points === 7 ? 7 : 5;
      const reverse = [...new Set((r.reverse ?? []).map(Number).filter((k) => Number.isInteger(k) && k >= 0 && k < items.length))].sort((a, b) => a - b);
      q = { ...base, type: "likert", code: "", items, points, labels: [...LIKERT_PRESETS[lang][points]], reverse } as Question;
    } else if (r.type === "number") {
      const min = toNum(r.min), max = toNum(r.max);
      q = { ...base, type: "number", code: "", min, max: min !== null && max !== null && max < min ? null : max } as Question;
    } else if (r.type === "text") {
      q = { ...base, type: "text", code: "", long: !!r.long } as Question;
    } else {
      q = { ...base, type: "info", code: "", required: false } as Question;
    }
    // Benzersiz değişken adı (Likert’te madde sütunları, çoklu seçimde seçenek sütunları dahil)
    const fallback = q.type === "likert" ? `L${n}_` : q.type === "info" ? `B${n}` : `S${n}`;
    let code = safeCode(r.code, fallback);
    for (let k = 2; ; k++) {
      const cols = surveyColumns([{ ...q, code } as Question]);
      if (q.type === "info" ? !used.has(code.toLocaleLowerCase("tr")) : free(cols)) { reserve(q.type === "info" ? [code] : cols); break; }
      code = `${safeCode(r.code, fallback).slice(0, 36)}${q.type === "likert" ? `_${k}_` : `_${k}`}`;
    }
    out.push({ ...q, code } as Question);
  }
  return out;
}

/** Tahmini doldurma süresi (dakika): Likert maddesi ~6 sn, seçim ~8 sn, sayı ~6 sn, açık uçlu ~40 sn */
export function estimateMinutes(qs: Question[]): number {
  let sec = 0;
  for (const q of qs) {
    if (q.type === "likert") sec += q.items.length * 6 + 5;
    else if (q.type === "single" || q.type === "multi") sec += 8 + q.options.length;
    else if (q.type === "number") sec += 6;
    else if (q.type === "text") sec += q.long ? 60 : 25;
    else sec += 8;
  }
  return Math.max(1, Math.round(sec / 60));
}

export interface LintIssue { level: "warning" | "tip"; question: number | null; message: string; params?: Record<string, string | number> }

/**
 * Kural tabanlı hızlı kontrol (yapay zekâ kullanmaz, hak harcamaz). Mesajlar Türkçe anahtardır;
 * arayüz `t(message, params)` ile çevirir.
 */
export function surveyLint(qs: Question[], meta: { consent?: string; description?: string } = {}): LintIssue[] {
  const out: LintIssue[] = [];
  if (!qs.length) return out;
  const consent = (meta.consent ?? "").trim();
  if (!consent) out.push({ level: "warning", question: null, message: "Bilgilendirilmiş onam metni yok. Etik kurullar çoğunlukla ister (Ayarlar sekmesi)." });
  else if (/\[[^\]]{2,40}\]/.test(consent)) out.push({ level: "warning", question: null, message: "Onam metninde doldurulmamış alanlar var (köşeli parantez içindekiler)." });
  const answerable = qs.filter((q) => q.type !== "info");
  if (answerable.length && !qs.some((q) => q.type === "single" || q.type === "number")) out.push({ level: "tip", question: null, message: "Demografik soru yok. Örneklemi betimlemek için yaş, cinsiyet gibi sorular eklemeyi düşünün." });
  const mins = estimateMinutes(qs);
  if (mins > 20) out.push({ level: "warning", question: null, message: "Anket yaklaşık {n} dakika sürüyor. 15–20 dakikayı aşan anketlerde yarıda bırakma artar.", params: { n: mins } });
  const seen = new Map<string, number>();
  qs.forEach((q, i) => {
    const n = i + 1;
    const texts = q.type === "likert" ? q.items : q.type === "info" ? [] : [q.title];
    for (const x of texts) {
      const key = x.toLocaleLowerCase("tr").replace(/[^\p{L}\p{N}]+/gu, " ").trim();
      if (!key) continue;
      if (seen.has(key)) out.push({ level: "warning", question: n, message: "{n}. soruda, {m}. sorudaki bir ifadenin aynısı var.", params: { n, m: seen.get(key)! } });
      else seen.set(key, n);
      if (/\s(ve|veya|ya da|and|or)\s/i.test(x) && x.length < 160 && q.type === "likert") out.push({ level: "tip", question: n, message: "{n}. sorudaki “{x}” maddesi iki şeyi birden soruyor olabilir; gerekirse iki maddeye ayırın.", params: { n, x: x.slice(0, 60) } });
    }
    if (q.type === "likert" && q.items.length >= 6 && !q.reverse.length) out.push({ level: "tip", question: n, message: "{n}. sorudaki ölçekte ters madde yok. Hep aynı yönde cevaplamayı fark etmek için 1–2 ters madde eklenebilir.", params: { n } });
    if (q.type === "likert" && q.items.length > 40) out.push({ level: "tip", question: n, message: "{n}. sorudaki ölçek {k} maddeden oluşuyor; katılımcı yorulabilir, bölmeyi düşünün.", params: { n, k: q.items.length } });
    if (q.type === "number" && q.min === null && q.max === null) out.push({ level: "tip", question: n, message: "{n}. soru (sayı) için alt/üst sınır yok; hatalı girişleri önlemek için aralık belirleyin.", params: { n } });
    if (q.type === "multi" && !q.options.some((o) => /diğer|other/i.test(o))) out.push({ level: "tip", question: n, message: "{n}. soruda (çoklu seçim) “Diğer” seçeneği yok.", params: { n } });
    if ((q.type === "single" || q.type === "multi") && q.options.length > 12) out.push({ level: "tip", question: n, message: "{n}. soruda {k} seçenek var; uzun listeler okunmayabilir.", params: { n, k: q.options.length } });
  });
  return out;
}
