import "server-only";
import PptxGenJS from "pptxgenjs";
import { CitationEngine, type CitationItem, type CitationStyleId } from "@/lib/citations";
import { richToPlain } from "@/lib/citations/util";
import { complete, estimateCost, resolveModel } from "@/lib/ai/registry";
import { citedIdsInOrder, type JSONNode } from "@/lib/editor/doc";
import { resolveFormat } from "./format";

/* eslint-disable @typescript-eslint/no-explicit-any */
export interface Slide { title: string; bullets: string[]; notes: string }
export interface Deck { slides: Slide[] }

const SCHEMA = {
  type: "object", additionalProperties: false, required: ["slides"],
  properties: {
    slides: {
      type: "array",
      items: {
        type: "object", additionalProperties: false, required: ["title", "bullets", "notes"],
        properties: { title: { type: "string" }, bullets: { type: "array", items: { type: "string" } }, notes: { type: "string" } },
      },
    },
  },
};

/**
 * Tez/makale metninden savunma sunumu taslağı üretir. Yalnızca verilen metindeki bilgiler kullanılır;
 * atıflar [[kaynak:Sn]] işaretleriyle verilir ve gerçek kaynak künyesine çevrilir.
 */
export async function generateDeck(params: { planId: string; project: any; stages: any[]; sources: any[] }) {
  const { project, stages, sources } = params;
  const ordered = [...stages].sort((a, b) => a.position - b.position).filter((s) => s.key !== "references" && String(s.content_text ?? "").trim());
  if (!ordered.length) throw new Error("Sunum için önce bölümleri yazın");
  // Bölüm metinleri (toplam ~60 bin karakter; her bölüme orantılı pay)
  const budget = 60_000;
  const per = Math.max(2500, Math.floor(budget / ordered.length));
  const body = ordered.map((s) => `### ${s.title}\n${String(s.content_text).slice(0, per)}`).join("\n\n");
  const order = citedIdsInOrder(stages.map((s) => s.content as JSONNode));
  const cited = order.map((id) => sources.find((x) => x.id === id)).filter(Boolean).slice(0, 40);
  const sourceMap: Record<string, string> = {};
  const list = cited.map((s: any, i: number) => { sourceMap[`S${i + 1}`] = s.id; const fam = (s.authors ?? [])[0]?.family ?? (s.authors ?? [])[0]?.literal ?? "?"; return `S${i + 1}: ${fam} (${s.year ?? "t.y."}) ${s.title}`; }).join("\n");
  const lang = project.language === "en" ? "English" : "Türkçe";

  const model = await resolveModel(params.planId, "balanced"); // orta: sunum metni
  const res = await complete(model, {
    system: `Akademik tez/makale savunma sunumu hazırlayan deneyimli bir akademisyensin. Dil: ${lang}.
KURALLAR:
- YALNIZCA verilen çalışma metnindeki bilgileri kullan. Metinde olmayan bulgu, sayı, istatistik, yöntem ayrıntısı veya kaynak EKLEME.
- Bulgular metinde yoksa o slayta "[Bulgular eklenecek]" yaz.
- Atıf gerekiyorsa yalnızca KAYNAKLAR listesindeki kimliklerle [[kaynak:S1]] biçiminde ver; yazar-yıl yazma.
- 10–14 slayt: Giriş ve problem, amaç ve önem, araştırma soruları/hipotezler, kuramsal çerçeve, yöntem (desen, örneklem, araçlar, analiz), bulgular (1–3 slayt), tartışma, sonuç ve öneriler, sınırlılıklar, teşekkür. Başlık slaytı ve kaynakça EKLEME (sistem ekler).
- Her slaytta en fazla 5 madde, her madde en fazla 18 kelime. "notes" alanına sunucunun söyleyeceği 2–4 cümlelik konuşma notunu yaz.`,
    messages: [{ role: "user", content: `ÇALIŞMA: ${project.title}\n\nKAYNAKLAR:\n${list || "(yok)"}\n\nÇALIŞMA METNİ:\n${body}` }],
    maxTokens: 8000,
    effort: "medium",
    jsonSchema: SCHEMA,
  });
  let deck: Deck;
  try { deck = JSON.parse(res.text); } catch { throw new Error("Sunum taslağı oluşturulamadı"); }
  deck.slides = (deck.slides ?? []).filter((s) => s.title?.trim()).slice(0, 18).map((s) => ({ title: s.title.trim(), bullets: (s.bullets ?? []).slice(0, 6), notes: s.notes ?? "" }));
  const cost = await estimateCost(res.model, res.usage.input, res.usage.output, res.usage);
  return { deck, sourceMap, usage: res.usage, model: res.model, provider: model.provider, cost };
}

/** [[kaynak:S1|s. 12]] işaretlerini seçili stilde metin içi atfa çevirir; listede olmayanları çıkarır. */
export function resolveMarkers(text: string, map: Record<string, string>, engine: CitationEngine, used: Set<string>): string {
  return text.replace(/\[\[kaynak:([A-Za-z0-9,\s-]+)(?:\|([^\]]+))?\]\]/g, (_m, ids: string, opt?: string) => {
    const real = ids.split(",").map((x) => map[x.trim()]).filter(Boolean);
    if (!real.length) return "";
    real.forEach((r) => used.add(r));
    const narrative = /^(anlatı|narrative)$/i.test((opt ?? "").trim());
    const locator = !narrative && opt ? opt.replace(/^(s|ss|p|pp)\.\s*/i, "") : null;
    return richToPlain(engine.cite(real, { locator, narrative }));
  }).replace(/\s+([.,;:])/g, "$1").replace(/\s{2,}/g, " ").trim();
}

export async function renderPptx(params: { deck: Deck; sourceMap: Record<string, string>; project: any; items: CitationItem[]; authorName: string }): Promise<Buffer> {
  const { deck, project } = params;
  const locale = project.language === "en" ? "en" : "tr";
  const engine = new CitationEngine(project.citation_style as CitationStyleId, params.items, { locale });
  const fmt = resolveFormat(project.context?.format);
  const used = new Set<string>();
  const C = { ink: "151829", brand: "2F4BE0", soft: "EEF2FF", muted: "6B7194" };

  const pptx = new PptxGenJS();
  pptx.layout = "LAYOUT_WIDE"; // 13.33 x 7.5 in
  pptx.title = project.title;
  pptx.author = params.authorName;
  const font = "Calibri";

  // Başlık slaytı
  const t = pptx.addSlide();
  t.background = { color: "FFFFFF" };
  t.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 13.33, h: 0.18, fill: { color: C.brand } });
  const inst = [fmt.cover.university, fmt.cover.institute, fmt.cover.department].filter(Boolean).join(" · ");
  if (inst) t.addText(inst, { x: 0.8, y: 0.7, w: 11.7, h: 0.5, fontFace: font, fontSize: 16, color: C.muted, align: "center" });
  t.addText(project.title, { x: 0.8, y: 2.0, w: 11.7, h: 2.0, fontFace: font, fontSize: 34, bold: true, color: C.ink, align: "center", valign: "middle" });
  const who = [params.authorName, fmt.cover.advisor ? `${locale === "tr" ? "Danışman" : "Supervisor"}: ${fmt.cover.advisor}` : "", fmt.cover.thesisType].filter(Boolean).join("\n");
  t.addText(who, { x: 0.8, y: 4.4, w: 11.7, h: 1.4, fontFace: font, fontSize: 18, color: C.ink, align: "center" });
  t.addText([fmt.cover.city, fmt.cover.year || String(new Date().getFullYear())].filter(Boolean).join(", "), { x: 0.8, y: 6.3, w: 11.7, h: 0.5, fontFace: font, fontSize: 14, color: C.muted, align: "center" });

  // İçerik slaytları
  deck.slides.forEach((s, i) => {
    const sl = pptx.addSlide();
    sl.background = { color: "FFFFFF" };
    sl.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 0.18, h: 7.5, fill: { color: C.brand } });
    sl.addText(resolveMarkers(s.title, params.sourceMap, engine, used), { x: 0.6, y: 0.4, w: 12.1, h: 0.9, fontFace: font, fontSize: 28, bold: true, color: C.ink });
    const bullets = s.bullets.map((b) => resolveMarkers(b, params.sourceMap, engine, used)).filter(Boolean);
    if (bullets.length) {
      sl.addText(bullets.map((b) => ({ text: b, options: { bullet: { indent: 18 }, paraSpaceAfter: 10 } })), { x: 0.8, y: 1.5, w: 11.7, h: 5.2, fontFace: font, fontSize: 20, color: C.ink, valign: "top" });
    }
    sl.addText(`${i + 2}`, { x: 12.3, y: 6.9, w: 0.7, h: 0.4, fontFace: font, fontSize: 11, color: C.muted, align: "right" });
    const notes = resolveMarkers(s.notes, params.sourceMap, engine, used);
    if (notes) sl.addNotes(notes);
  });

  // Kaynakça (yalnızca slaytlarda atıf yapılanlar)
  if (used.size) {
    const bib = engine.bibliography([...used]).map((e) => (e.number ? `[${e.number}] ` : "") + richToPlain(e.rich));
    for (let k = 0; k < bib.length; k += 6) {
      const sl = pptx.addSlide();
      sl.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 0.18, h: 7.5, fill: { color: C.brand } });
      sl.addText(engine.meta.bibliographyTitle[locale], { x: 0.6, y: 0.4, w: 12.1, h: 0.9, fontFace: font, fontSize: 28, bold: true, color: C.ink });
      sl.addText(bib.slice(k, k + 6).map((b) => ({ text: b, options: { paraSpaceAfter: 8 } })), { x: 0.8, y: 1.4, w: 11.7, h: 5.6, fontFace: font, fontSize: 13, color: C.ink, valign: "top" });
    }
  }
  const out = await pptx.write({ outputType: "nodebuffer" });
  return out as Buffer;
}
/* eslint-enable @typescript-eslint/no-explicit-any */
