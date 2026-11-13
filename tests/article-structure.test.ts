import { describe, expect, it } from "vitest";
import { buildRoadmap, stageNeedsData } from "@/lib/workflows";
import { subheadingBudget, sectionTitle, stagePrefixes } from "@/lib/workflows/structure";
import { buildExportDoc } from "@/lib/export/model";
import { toPdf } from "@/lib/export/render-pdf";
import { toDocx } from "@/lib/export/render-docx";

const p = (t: string) => ({ type: "paragraph", content: [{ type: "text", text: t }] });
const h = (level: number, t: string) => ({ type: "heading", attrs: { level }, content: [{ type: "text", text: t }] });
const st = (id: string, key: string, title: string, position: number, content: unknown[]) => ({ id, key, title, position, content_text: "metin", content: { type: "doc", content } });

describe("makale yapısı (D170)", () => {
  it("kuramsal dergi makalesi: Giriş → konu bölümleri → Sonuç; Yöntem/Bulgular yok", () => {
    // D171: dergi makalesi = yayın uyarlama; yapı yaklaşıma göre (kuramsal → konu bölümleri, ampirik → IMRaD)
    const keys = buildRoadmap({ workType: "journal_article", level: "master", methodology: "theoretical" }).map((s) => s.key);
    expect(keys).toEqual(["journal_requirements", "title_abstract", "introduction", "article_body", "conclusion_article", "declarations", "cover_letter", "references"]);
  });
  it("araştırma makalesi: kuramsal/derleme yaklaşımda kaynaklara dayalı, nicel/nitel/karmada IMRaD", () => {
    expect(buildRoadmap({ workType: "research_article", level: "master", methodology: "theoretical" }).map((s) => s.key)).not.toContain("results_article");
    expect(buildRoadmap({ workType: "research_article", level: "master", methodology: "quantitative" }).map((s) => s.key)).toContain("results_article");
  });
  it("veri yer tutucusu yalnızca alan araştırması içeren çalışmalarda", () => {
    expect(stageNeedsData("title_abstract", { work_type: "research_article", context: { methodology: "quantitative" } })).toBe(false);
    expect(stageNeedsData("results_article", { work_type: "research_article", context: { methodology: "quantitative" } })).toBe(true);
    expect(stageNeedsData("results_article", { work_type: "research_article", context: { methodology: "theoretical" } })).toBe(false);
    expect(stageNeedsData("conclusion", { work_type: "literature_review", context: {} })).toBe(false);
    expect(stageNeedsData("findings", { work_type: "thesis", context: { methodology: "qualitative" } })).toBe(true);
    expect(stageNeedsData("grant_budget", { work_type: "grant_proposal", context: {} })).toBe(true);
  });
  it("giriş en az 2 alt başlık, konu bölümleri 3–6 ana başlık", () => {
    expect(subheadingBudget("introduction", 0)).toBeGreaterThanOrEqual(2);
    expect(subheadingBudget("introduction", 1200)).toBeGreaterThanOrEqual(2);
    expect(subheadingBudget("article_body", 2000)).toBe(3);
    expect(subheadingBudget("article_body", 9000)).toBe(6);
  });
  it("eski çalışmalardaki “Başlık, özet ve anahtar kelimeler” belgeye “Özet” olarak geçer", () => {
    expect(sectionTitle("title_abstract", "Başlık, özet ve anahtar kelimeler", "Özet ve anahtar kelimeler", "tr")).toBe("Özet");
  });

  const stages = [
    st("a", "title_abstract", "Başlık, özet ve anahtar kelimeler", 0, [h(2, "Özet"), p("Türkçe özet metni."), p("Anahtar Kelimeler: a, b"), h(2, "Abstract"), p("English abstract."), p("Keywords: a, b")]),
    st("b", "introduction", "Giriş", 1, [p("Açılış."), h(2, "Bağlam"), p("…"), h(2, "Amaç"), p("…")]),
    st("c", "article_body", "Konu bölümleri", 2, [h(2, "Güçlü Etki Dönemi"), p("…"), h(3, "Kitle Toplumu"), p("…"), h(2, "Sınırlı Etki Dönemi"), p("…")]),
    st("d", "conclusion_article", "Sonuç", 3, [p("Sonuç metni.")]),
    st("e", "references", "Kaynakça", 4, []),
  ];
  const project = { title: "Kitle İletişim Kuramları", work_type: "journal_article", citation_style: "apa7", language: "tr", context: {} };
  const d = buildExportDoc({ project, stages, sources: [], engineItems: [], authorName: "Ayşe Yılmaz" });
  const toc = d.toc.map((x) => `${x.number} ${x.text}`.trim());

  it("belge başlıkları: Özet/Abstract numarasız, Giriş 1, konu başlıkları 2–3, Sonuç 4", () => {
    expect(d.article).toBe(true);
    expect(toc).toEqual(["Özet", "Abstract", "1 Giriş", "1.1 Bağlam", "1.2 Amaç", "2 Güçlü Etki Dönemi", "2.1 Kitle Toplumu", "3 Sınırlı Etki Dönemi", "4 SONUÇ"]);
    expect(toc.join(" ")).not.toContain("Başlık, özet");
    expect(d.blocks.filter((b) => (b.kind === "paragraph" || b.kind === "heading") && b.keep === "abstract").length).toBe(6);
  });
  it("editördeki bölüm numaraları belgeyle aynı (konu bölümleri 2–3, Sonuç 4)", () => {
    const pre = stagePrefixes(stages);
    expect(pre.d).toBe("4");
  });
  it("PDF ve Word: kapak ve içindekiler olmadan üretilir", async () => {
    const pdf = await toPdf(d);
    expect(pdf.subarray(0, 4).toString()).toBe("%PDF");
    const pages = (pdf.toString("latin1").match(/\/Type \/Page\b/g) ?? []).length;
    // Kapak + içindekiler olsaydı en az 3 sayfa olurdu; makalede içerik ilk sayfadan başlar
    expect(pages).toBeLessThanOrEqual(2);
    const docx = await toDocx(d);
    expect(docx.length).toBeGreaterThan(1000);
  });
});
