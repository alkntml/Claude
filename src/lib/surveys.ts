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
