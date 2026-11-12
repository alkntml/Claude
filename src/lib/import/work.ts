import "server-only";
/**
 * “Mevcut çalışmamı içe aktar” (D149): kullanıcının yazdığı çalışmayı (Word, PDF veya metin) okuyup
 * - yapay zekâyla türünü, seviyesini, yöntemini, disiplinini, dilini, konusunu ve atıf stilini çıkarır (metin yeniden yazılmaz),
 * - kaynakçayı doğrulayıp projeye ekler, metin içi atıfları bu kaynaklara bağlar,
 * - en üst düzey başlıklara göre bölümlere (aşamalara) ayırır.
 */
import { complete, estimateCost, resolveModel } from "@/lib/ai/registry";
import { STYLE_IDS } from "@/lib/citations/styles";
import type { JSONNode } from "@/lib/editor/doc";
import { extract } from "@/lib/files/extract";
import type { StageSeed } from "@/lib/project-create";
import { fitHeadings, linkCitations, type RefKey } from "./references";
import { docxToNodes } from "./server";
import { splitIntoSections, textToNodes } from "./whole";

export type WorkKind = "docx" | "pdf" | "txt";

export async function documentNodes(kind: WorkKind, buffer: Buffer): Promise<{ nodes: JSONNode[]; images: number }> {
  if (kind === "docx") return docxToNodes(buffer);
  const ex = await extract(kind, buffer);
  // PDF: temizlenmiş sayfalar (üst/alt bilgi, tire; D132). Kaynakça bölümü splitReferences ile ayrılır.
  const text = kind === "pdf" ? (ex.pages ?? [ex.text]).join("\n\n") : ex.text;
  return { nodes: textToNodes(text), images: 0 };
}

export interface WorkMeta {
  title: string; workType: string; level: string; methodology: string; discipline: string; language: "tr" | "en" | "de";
  topic: string; keywords: string[]; citationStyle: string;
}

const WORK_TYPES = ["thesis", "research_article", "journal_article", "capstone", "literature_review", "research_proposal", "grant_proposal", "text_editing"];
const SCHEMA = {
  type: "object", additionalProperties: false,
  required: ["title", "workType", "level", "methodology", "discipline", "language", "topic", "keywords", "citationStyle"],
  properties: {
    title: { type: "string" }, workType: { type: "string", enum: WORK_TYPES }, level: { type: "string", enum: ["bachelor", "master", "doctorate", "postdoc", "other"] },
    methodology: { type: "string", enum: ["quantitative", "qualitative", "mixed", "theoretical", "systematic_review"] }, discipline: { type: "string" },
    language: { type: "string", enum: ["tr", "en", "de"] }, topic: { type: "string" }, keywords: { type: "array", items: { type: "string" } },
    citationStyle: { type: "string", enum: STYLE_IDS as string[] },
  },
};

/** Belgenin başı ve başlıklarından çalışmanın künyesi (yalnızca metinde olan bilgi; uydurma yok) */
export async function analyzeWork(planId: string, text: string, headingList: string[]) {
  const model = await resolveModel(planId, "fast");
  const sample = `${text.slice(0, 9000)}${text.length > 12000 ? `\n…\n${text.slice(-2500)}` : ""}`;
  const res = await complete(model, {
    system: `Akademik bir çalışmanın metnini inceleyip künyesini çıkarıyorsun. Yalnızca metinde açıkça görülen bilgiyi kullan; bilinmeyeni tahmin etme, makul varsayılanı seç.
- title: belgedeki çalışma başlığı (yoksa konuyu anlatan kısa akademik başlık).
- workType: thesis (lisans/YL/doktora tezi), research_article (özgün araştırma makalesi), journal_article (derleme/kuramsal makale), literature_review (sistematik derleme / literatür taraması), research_proposal (araştırma önerisi), grant_proposal (TÜBİTAK/BAP proje önerisi), capstone (bitirme projesi), text_editing (diğer metin).
- level: tez ise lisans/yüksek lisans/doktora; makale ise master veya doctorate; bilinmiyorsa master.
- methodology: yöntem bölümüne göre.
- language: metnin dili.
- topic: çalışmanın amacını ve kapsamını 2–3 cümleyle, metindeki ifadelere sadık kalarak anlat.
- keywords: metindeki anahtar kelimeler (en çok 8).
- citationStyle: metin içi atıf biçimine göre (Yazar, Yıl) → apa7; [1] → ieee; dipnotlu Türkçe → isnad; emin değilsen apa7.`,
    messages: [{ role: "user", content: `BAŞLIKLAR:\n${headingList.slice(0, 60).join("\n")}\n\nMETİN:\n${sample}` }],
    maxTokens: 1500,
    effort: "low",
    jsonSchema: SCHEMA,
  });
  let meta: WorkMeta;
  try {
    const j = JSON.parse(res.text);
    meta = {
      title: String(j.title ?? "").trim().slice(0, 300), workType: WORK_TYPES.includes(j.workType) ? j.workType : "thesis",
      level: ["bachelor", "master", "doctorate", "postdoc", "other"].includes(j.level) ? j.level : "master",
      methodology: ["quantitative", "qualitative", "mixed", "theoretical", "systematic_review"].includes(j.methodology) ? j.methodology : "quantitative",
      discipline: String(j.discipline ?? "").slice(0, 200), language: ["tr", "en", "de"].includes(j.language) ? j.language : "tr",
      topic: String(j.topic ?? "").slice(0, 4000), keywords: (Array.isArray(j.keywords) ? j.keywords : []).map((k: unknown) => String(k).slice(0, 80)).filter(Boolean).slice(0, 8),
      citationStyle: (STYLE_IDS as string[]).includes(j.citationStyle) ? j.citationStyle : "apa7",
    };
  } catch {
    meta = { title: headingList[0] ?? "", workType: "thesis", level: "master", methodology: "quantitative", discipline: "", language: "tr", topic: "", keywords: [], citationStyle: "apa7" };
  }
  const cost = await estimateCost(res.model, res.usage.input, res.usage.output, res.usage);
  return { meta, usage: res.usage, model: res.model, provider: model.provider, cost };
}

/** Bölümlere ayrılmış, atıfları bağlanmış aşama tohumları */
export function buildSeeds(body: JSONNode[], keys: RefKey[], preambleTitle: string): { docTitle: string | null; seeds: StageSeed[]; linked: number; unmatched: string[] } {
  const { docTitle, sections } = splitIntoSections(body, { preambleTitle });
  let linked = 0;
  const unmatched: string[] = [];
  const seeds = sections.map((sec, i) => {
    const fitted = fitHeadings(sec.nodes, { base: 2, max: 4 });
    const r = linkCitations(fitted, keys);
    linked += r.report.linked;
    unmatched.push(...r.report.unmatched);
    const content: JSONNode = { type: "doc", content: r.nodes.length ? r.nodes : [{ type: "paragraph" }] };
    return { key: sec.libraryKey ?? `custom_imp${i}`, title: sec.title.slice(0, 200), description: "", content };
  });
  return { docTitle, seeds, linked, unmatched: [...new Set(unmatched)].slice(0, 30) };
}
