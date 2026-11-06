/**
 * Kurgudaki hedef uzunluğa uyum (D97). Bölümün hedef kelime sayısı (blueprint) yazım isteğine kesin bir sayı olarak
 * verilir; alt başlığa odaklanıldıysa hedef, bölümün metin taşıyan alt başlıklarına eşit bölünür. Taslak hedefin
 * %85’inin altında kalırsa sunucu kaldığı yerden devam ettirir. Saf modül (test edilir).
 */
import { sectionTree } from "@/lib/editor/sections";
import type { JSONNode } from "@/lib/editor/doc";

/** Hedefe uyum denetlenen (bölüm metni üreten) asistan eylemleri */
export const LENGTH_ACTIONS = new Set(["draft", "discussion", "methodology", "synthesize", "interpret"]);
/** Bu oranın altında kalan taslak tamamlatılır */
export const MIN_RATIO = 0.85;
/** En fazla devam isteği (maliyet sınırı) */
export const MAX_CONTINUATIONS = 2;

export interface LengthTarget {
  /** Bu yanıtta yazılması gereken yaklaşık kelime */
  words: number;
  /** Bölümün kurgudaki toplam hedefi */
  chapterWords: number;
  scope: "subheading" | "section" | "remaining";
  /** Hedefin bölündüğü alt başlık sayısı (alt başlıkta) */
  parts?: number;
}

/** Metin taşıyan alt başlıklar: kendi alt başlığı olmayan (yaprak) başlıklar */
function leafSections(doc: JSONNode | null | undefined) {
  const tree = sectionTree(doc);
  return tree.filter((s) => !tree.some((o) => o.index > s.index && o.index < s.end));
}

export function draftTarget(p: { chapterWords: number | null | undefined; doc: JSONNode | null | undefined; focusIndex?: number | null; currentWords: number }): LengthTarget | null {
  const total = Math.round(Number(p.chapterWords) || 0);
  if (total < 100) return null;
  const leaves = leafSections(p.doc);
  if (p.focusIndex != null && leaves.length) {
    const parts = leaves.length;
    return { words: Math.max(150, Math.round(total / parts / 10) * 10), chapterWords: total, scope: "subheading", parts };
  }
  // Bölüm henüz (neredeyse) boşsa hedefin tamamı; doluysa kalan kısım yazılır
  if (p.currentWords < total * 0.1) return { words: total, chapterWords: total, scope: "section" };
  const remaining = total - p.currentWords;
  if (remaining < 150) return null;
  return { words: Math.round(remaining / 10) * 10, chapterWords: total, scope: "remaining" };
}

/** Modele verilen kesin uzunluk talimatı */
export function lengthInstruction(t: LengthTarget): string {
  const min = Math.round(t.words * 0.9), max = Math.round(t.words * 1.15);
  const why = t.scope === "subheading"
    ? `Kurguda bu bölümün hedefi ${t.chapterWords} kelime; ${t.parts} alt başlığa eşit bölündüğünde bu alt başlığa ${t.words} kelime düşer.`
    : t.scope === "remaining"
      ? `Kurguda bu bölümün hedefi ${t.chapterWords} kelime; bölümde yazılmış metinden sonra kalan yaklaşık ${t.words} kelimedir.`
      : `Kurguda bu bölümün hedefi ${t.chapterWords} kelimedir.`;
  return `HEDEF UZUNLUK (zorunlu): Bu yanıttaki :::taslak bloğu yaklaşık ${t.words} kelime olmalı (en az ${min}, en fazla ${max} kelime). ${why} Kısa kesme, özetleme; konuyu kaynaklarla derinleştirerek bu uzunluğa ulaş. Kaynakla desteklenemeyen iddia ekleyerek uzatma; bunun yerine yöntem, kavram tanımı, karşılaştırma ve kaynaklardaki bulguların ayrıntısıyla genişlet.`;
}

const DRAFT_RE = /:::taslak[^\n]*\n([\s\S]*?)(\n:::\s*(?:\n|$)|$)/g;
const words = (s: string) => (s.match(/[\p{L}\p{N}][\p{L}\p{N}’'\-]*/gu) ?? []).length;

/** Yanıttaki taslak bloklarının toplam kelimesi (atıf işaretleri sayılmaz) */
export function draftWords(answer: string): number {
  let n = 0;
  for (const m of answer.matchAll(DRAFT_RE)) n += words(m[1].replace(/\[\[kaynak:[^\]]*\]\]/g, ""));
  return n;
}

/** Devam metnini son taslak bloğunun sonuna (kapanış işaretinden önce) ekler */
export function appendToDraft(answer: string, continuation: string): string {
  const add = continuation.replace(/^\s*:::taslak[^\n]*\n/, "").replace(/\n:::\s*$/, "").trim();
  if (!add) return answer;
  const blocks = [...answer.matchAll(DRAFT_RE)];
  const last = blocks[blocks.length - 1];
  if (!last || last.index == null) return `${answer.trimEnd()}\n\n${add}`;
  const bodyEnd = last.index + last[0].length - (last[2]?.length ?? 0);
  return `${answer.slice(0, bodyEnd).trimEnd()}\n\n${add}${answer.slice(bodyEnd)}`;
}

export function continuationPrompt(written: number, t: LengthTarget): string {
  const left = Math.max(150, t.words - written);
  return `Taslak ${written} kelimede kaldı; hedef ${t.words} kelime. Kaldığın yerden devam ederek yaklaşık ${left} kelime daha yaz. Önceki paragrafları tekrar etme, yeni başlık veya alt başlık açma, giriş cümlesi kurma; metnin doğal devamı olan paragrafları ver. Yalnızca devam metnini yaz: :::taslak işareti, açıklama, :::eksik veya :::hafiza bloğu kullanma. Atıf kuralları aynıdır ([[kaynak:S1]]).`;
}
