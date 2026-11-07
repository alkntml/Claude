/**
 * Çeviri ve dil denetimi için belge dönüşümü (D111). Atıflar ⟦C1⟧, dipnotlar ⟦F1⟧, şekiller ⟦G1⟧ işaretlerine çevrilir;
 * yapay zekâ yalnızca metni çevirir, işaretler geri dönüşte özgün düğümlere (atfın sayfa no., anlatı ayarı dahil) döner.
 * Başlık düzeyi, kalın/italik, liste, tablo ve blok alıntı korunur. İstemci ve sunucuda çalışır (saf fonksiyonlar).
 */
import { markdownToDoc, type JSONNode } from "./doc";

export interface Tokenized {
  md: string;
  citations: JSONNode[];
  /** Dipnot metinleri (çeviriye ayrıca gönderilir) */
  footnotes: string[];
  figures: JSONNode[];
}

const TOKEN_RE = /⟦([CFG])(\d+)⟧/g;

export function tokenizeForLanguage(doc: JSONNode | null | undefined): Tokenized {
  const citations: JSONNode[] = [], footnotes: string[] = [], figures: JSONNode[] = [];
  const inline = (nodes: JSONNode[] | undefined): string => (nodes ?? []).map((n) => {
    if (n.type === "citation") { citations.push(n); return `⟦C${citations.length}⟧`; }
    if (n.type === "footnote") { footnotes.push(String(n.attrs?.text ?? "")); return `⟦F${footnotes.length}⟧`; }
    if (n.type === "hardBreak") return " ";
    if (n.type === "text") {
      const t = n.text ?? "";
      if (!t.trim()) return t;
      const marks = new Set((n.marks ?? []).map((m) => m.type));
      // Kalın/italik işaretleri boşlukları dışarıda bırakarak sarılır (Markdown ayrıştırıcısı “** metin**” biçimini tanımaz)
      const lead = t.match(/^\s*/)![0], trail = t.match(/\s*$/)![0], core = t.trim();
      const wrapped = marks.has("bold") ? `**${core}**` : marks.has("italic") ? `*${core}*` : core;
      return lead + wrapped + trail;
    }
    return inline(n.content);
  }).join("");
  const out: string[] = [];
  const block = (b: JSONNode) => {
    if (b.type === "heading") out.push(`${"#".repeat(Math.min(3, Math.max(1, Number(b.attrs?.level ?? 2) - 1)))} ${inline(b.content).trim()}`);
    else if (b.type === "paragraph") { const t = inline(b.content).trim(); if (t) out.push(t); }
    else if (b.type === "bulletList" || b.type === "orderedList") {
      out.push((b.content ?? []).map((li, i) => `${b.type === "orderedList" ? `${i + 1}.` : "-"} ${(li.content ?? []).map((p) => (p.type === "paragraph" ? inline(p.content) : "")).join(" ").trim()}`).join("\n"));
    } else if (b.type === "table") {
      const rows = (b.content ?? []).map((r) => `| ${(r.content ?? []).map((c) => (c.content ?? []).map((p) => inline(p.content)).join(" ").replace(/\|/g, "/").trim()).join(" | ")} |`);
      if (rows.length) out.push([rows[0], `| ${rows[0].split("|").slice(1, -1).map(() => "---").join(" | ")} |`, ...rows.slice(1)].join("\n"));
    } else if (b.type === "blockquote") out.push((b.content ?? []).map((p) => `> ${inline(p.content).trim()}`).join("\n"));
    else if (b.type === "figure") { figures.push(b); out.push(`⟦G${figures.length}⟧`); }
    else if (b.content) b.content.forEach(block);
  };
  (doc?.content ?? []).forEach(block);
  return { md: out.join("\n\n"), citations, footnotes, figures };
}

/** Markdown’ı boş satırlardan bölerek en fazla `max` karakterlik parçalara ayırır (bir blok asla bölünmez) */
export function splitChunks(md: string, max = 6000): string[] {
  const blocks = md.split(/\n{2,}/);
  const out: string[] = [];
  let cur = "";
  for (const b of blocks) {
    if (cur && cur.length + b.length + 2 > max) { out.push(cur); cur = b; }
    else cur = cur ? `${cur}\n\n${b}` : b;
  }
  if (cur) out.push(cur);
  return out;
}

/** Bir metindeki işaretler (sırasız küme) */
export function tokensIn(text: string): string[] {
  return [...text.matchAll(TOKEN_RE)].map((m) => `${m[1]}${m[2]}`);
}

export interface Detokenized { doc: JSONNode; missing: { citations: number; footnotes: number; figures: number } }

/**
 * Çevrilmiş Markdown’ı belgeye çevirir; işaretleri özgün düğümlere döndürür. Yapay zekânın düşürdüğü işaretler kaybolmaz:
 * eksik atıf ve dipnotlar son paragrafın sonuna, eksik şekiller belgenin sonuna eklenir ve sayıları bildirilir.
 */
export function detokenize(md: string, translatedFootnotes: string[], t: Tokenized): Detokenized {
  // Başlıklar: tokenize ederken düzey−1 yazıldı; markdownToDoc düzey+1 okur → özgün düzey
  const base = markdownToDoc(md, () => null);
  const used = new Set<string>();
  const footnote = (i: number): JSONNode => ({ type: "footnote", attrs: { text: (translatedFootnotes[i - 1] ?? "").trim() || t.footnotes[i - 1] || "" } });
  const fixInline = (nodes: JSONNode[] | undefined): JSONNode[] => (nodes ?? []).flatMap((n) => {
    if (n.type === "text" && n.text && /⟦[CFG]\d+⟧/.test(n.text)) {
      const out: JSONNode[] = [];
      for (const part of n.text.split(/(⟦[CFG]\d+⟧)/)) {
        const m = part.match(/^⟦([CFG])(\d+)⟧$/);
        if (!m) { if (part) out.push({ ...n, text: part }); continue; }
        const k = `${m[1]}${m[2]}`, i = Number(m[2]);
        if (used.has(k)) continue; // aynı işaret iki kez yazıldıysa ikincisi atılır
        if (m[1] === "C" && t.citations[i - 1]) { out.push(t.citations[i - 1]); used.add(k); }
        else if (m[1] === "F" && i <= t.footnotes.length) { out.push(footnote(i)); used.add(k); }
      }
      return out;
    }
    return [n.content ? { ...n, content: fixInline(n.content) } : n];
  });
  const fixBlock = (b: JSONNode): JSONNode => {
    // Yalnızca şekil işaretinden oluşan paragraf → şekil düğümü
    if (b.type === "paragraph" && b.content?.length === 1 && b.content[0].type === "text") {
      const m = (b.content[0].text ?? "").trim().match(/^⟦G(\d+)⟧$/);
      if (m && t.figures[Number(m[1]) - 1] && !used.has(`G${m[1]}`)) { used.add(`G${m[1]}`); return t.figures[Number(m[1]) - 1]; }
    }
    if (b.type === "paragraph" || b.type === "heading") return { ...b, content: fixInline(b.content) };
    return b.content ? { ...b, content: b.content.map(fixBlock) } : b;
  };
  const content = (base.content ?? []).map(fixBlock).filter((b) => !(b.type === "paragraph" && !(b.content ?? []).length));
  const lost = { citations: [] as JSONNode[], footnotes: [] as JSONNode[], figures: [] as JSONNode[] };
  t.citations.forEach((c, i) => { if (!used.has(`C${i + 1}`)) lost.citations.push(c); });
  t.footnotes.forEach((_, i) => { if (!used.has(`F${i + 1}`)) lost.footnotes.push(footnote(i + 1)); });
  t.figures.forEach((g, i) => { if (!used.has(`G${i + 1}`)) lost.figures.push(g); });
  if (lost.citations.length || lost.footnotes.length) {
    let idx = content.map((b) => b.type).lastIndexOf("paragraph");
    if (idx < 0) { content.push({ type: "paragraph", content: [] }); idx = content.length - 1; }
    const p = content[idx];
    content[idx] = { ...p, content: [...(p.content ?? []), { type: "text", text: " " }, ...lost.citations, ...lost.footnotes] };
  }
  content.push(...lost.figures);
  return {
    doc: { type: "doc", content: content.length ? content : [{ type: "paragraph" }] },
    missing: { citations: lost.citations.length, footnotes: lost.footnotes.length, figures: lost.figures.length },
  };
}

/** Dil denetimi için paragraf ve başlıkların metni (atıflar ⟦C⟧ olarak; boş bloklar atlanır) */
export function proofreadBlocks(doc: JSONNode | null | undefined): string[] {
  const out: string[] = [];
  const text = (nodes: JSONNode[] | undefined): string => (nodes ?? []).map((n) => (n.type === "text" ? n.text ?? "" : n.type === "citation" ? "⟦C⟧" : n.type === "hardBreak" ? " " : text(n.content))).join("");
  const walkB = (n: JSONNode) => {
    if (n.type === "paragraph" || n.type === "heading") { const s = text(n.content).trim(); if (s.length >= 2) out.push(s); return; }
    (n.content ?? []).forEach(walkB);
  };
  (doc?.content ?? []).forEach(walkB);
  return out;
}

/** Metnin dilini kaba ama güvenilir biçimde tahmin eder: Türkçe harfler ve sık kelimeler */
export function detectLang(text: string): "tr" | "en" {
  const t = ` ${text.toLocaleLowerCase("tr").slice(0, 4000)} `;
  const trChars = (t.match(/[ğüşıöç]/g) ?? []).length;
  const trWords = (t.match(/\s(ve|bir|bu|ile|için|olarak|olan|da|de|ki|çalışma|araştırma)\s/g) ?? []).length;
  const enWords = (t.match(/\s(the|and|of|to|in|is|that|for|with|was|were|this|study)\s/g) ?? []).length;
  return trChars * 0.5 + trWords >= enWords ? "tr" : "en";
}
