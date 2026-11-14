/**
 * D179: Kapak ve içindekiler bütün proje türlerinde hatasız olmalı. Her çalışma türü × düzey için gerçek yol haritasıyla
 * belge kurulur; Word, PDF ve LaTeX üretilir ve kurallar denetlenir.
 */
import { describe, expect, it } from "vitest";
import JSZip from "jszip";
import { buildRoadmap, WORK_TYPES } from "@/lib/workflows";
import { buildExportDoc } from "@/lib/export/model";
import { toDocx } from "@/lib/export/render-docx";
import { toPdf } from "@/lib/export/render-pdf";
import { toLatexFiles } from "@/lib/export/render-latex";
import { defaultPreset, effectiveFormat } from "@/lib/export/format";
import { NOT_IN_MANUSCRIPT } from "@/lib/workflows/structure";

const para = (text: string) => ({ type: "paragraph", content: [{ type: "text", text }] });
const head = (text: string) => ({ type: "heading", attrs: { level: 2 }, content: [{ type: "text", text }] });

const cases = WORK_TYPES.flatMap((w) => w.levels.filter((l) => l !== "other").map((level) => ({ workType: w.id, level })));

describe("bütün proje türlerinde kapak ve içindekiler (D179)", () => {
  for (const c of cases) {
    it(`${c.workType} · ${c.level}`, async () => {
      const methodology = c.workType === "journal_article" ? "theoretical" : c.workType === "literature_review" ? "systematic_review" : "quantitative";
      const roadmap = buildRoadmap({ workType: c.workType as never, level: c.level as never, methodology: methodology as never, program: "tubitak_2209a" as never });
      const stages = roadmap.map((r, i) => ({
        id: `00000000-0000-0000-0000-${String(i).padStart(12, "0")}`, key: r.key, title: r.title, position: i, content_text: "x",
        content: { type: "doc", content: r.key === "article_body" ? [head("Birinci Konu"), para("Metin."), head("İkinci Konu"), para("Metin.")] : [para(`${r.title} metni.`)] },
      }));
      const project = { title: "Deneme çalışması", work_type: c.workType, academic_level: c.level, language: "tr", citation_style: "apa7", context: { methodology, university: "Ankara Üniversitesi" } };
      const d = buildExportDoc({ project, stages, sources: [], engineItems: [], authorName: "Ali Veli" });
      const expectCover = c.workType !== "journal_article";
      expect(d.cover).toBe(expectCover);
      // Kurallar: Giriş numarasız; numaralı ana bölümler 1’den başlar ve boşluksuz ilerler
      const tops = d.toc.filter((x) => x.level === 1 && x.number).map((x) => Number(x.number));
      tops.forEach((n, i) => expect(n, JSON.stringify(d.toc.map((x) => `${x.number} ${x.text}`))).toBe(i + 1));
      expect(d.toc.some((x) => x.number && /^(GİRİŞ|Giriş)$/.test(x.text))).toBe(false);
      // Dergi yazışmaları (kapak mektubu vb.) makaleye girmez
      expect(d.toc.some((x) => /kapak mektubu|editöre mektup/i.test(x.text))).toBe(false);
      // Word
      const xml = await (await JSZip.loadAsync(await toDocx(d, effectiveFormat(project)))).file("word/document.xml")!.async("string");
      if (expectCover) {
        for (const x of ["Üniversite logosu", "ANKARA ÜNİVERSİTESİ", "İÇİNDEKİLER", "KASIM", "Danışman"].filter((x) => x !== "KASIM")) expect(xml, x).toContain(x);
        expect(xml).toMatch(/<w:titlePg\/>|<w:titlePg w:val="(1|true)"\/>/);
      } else {
        expect(xml).not.toContain("İÇİNDEKİLER");
        expect(xml).not.toContain("Üniversite logosu");
      }
      // Bölüm başlıkları sola yaslı (kılavuz/kullanıcı aksini seçmedikçe)
      expect(effectiveFormat(project).chapterTitleCenter).toBe(false);
      // PDF
      const pdf = await toPdf(d, effectiveFormat(project));
      expect(pdf.subarray(0, 4).toString()).toBe("%PDF");
      // LaTeX
      const tex = toLatexFiles(d, { style: "apa7", items: [] }).find((f) => f.name === "main.tex")!.data as string;
      expect(tex.includes("\\begin{titlepage}")).toBe(expectCover);
      expect(tex.includes("\\tableofcontents")).toBe(expectCover);
      expect(tex).not.toMatch(/\\\\\s*\[/);
      // Makaleye girmeyen aşamalar
      for (const st of stages.filter((x) => NOT_IN_MANUSCRIPT.has(x.key))) expect(xml).not.toContain(`${st.title} metni.`);
    });
  }

  it("varsayılan biçim çalışma türüne ve yazım stiline göre", () => {
    expect(defaultPreset({ workType: "thesis", citationStyle: "apa7" })).toBe("tez-tr");
    expect(defaultPreset({ workType: "capstone", citationStyle: "ieee" })).toBe("tez-tr");
    expect(defaultPreset({ workType: "journal_article", citationStyle: "apa7" })).toBe("article");
    expect(defaultPreset({ workType: "research_article", citationStyle: "apa7", documentPurpose: "journal" })).toBe("article");
    expect(defaultPreset({ workType: "research_article", citationStyle: "apa7" })).toBe("apa7-student");
    expect(defaultPreset({ workType: "literature_review", citationStyle: "mla" })).toBe("mla9");
    expect(defaultPreset({ workType: "research_proposal", citationStyle: "chicago" })).toBe("chicago");
    expect(defaultPreset({ workType: "research_article", citationStyle: "ieee" })).toBe("ieee");
    expect(defaultPreset({ workType: "research_article", citationStyle: "vancouver" })).toBe("medical");
    expect(defaultPreset({ workType: "research_article", citationStyle: "isnad" })).toBe("isnad");
    const apa = effectiveFormat({ work_type: "research_article", citation_style: "apa7", context: {} });
    expect([apa.fontFamily, apa.fontSizePt, apa.lineSpacing, apa.margins.left, apa.firstLineIndentCm, apa.pageNumber]).toEqual(["Times New Roman", 12, 2, 2.54, 1.27, "top-right"]);
    // Kullanıcının seçtiği şablon korunur
    expect(effectiveFormat({ work_type: "research_article", citation_style: "apa7", context: { format: { preset: "tez-tr" } } }).preset).toBe("tez-tr");
  });
});

describe("yazım kılavuzu (D179)", () => {
  it("kılavuz dosyası adından veya içeriğinden tanınır", async () => {
    const { looksLikeGuideline } = await import("@/lib/guideline");
    expect(looksLikeGuideline("SBE_Tez_Yazim_Kilavuzu_2024.pdf", "")).toBe(true);
    expect(looksLikeGuideline("belge.pdf", "Kenar boşluğu üstten 3 cm. Satır aralığı 1,5. Yazı tipi Times New Roman, 12 punto. Sayfa numaraları alt orta.")).toBe(true);
    expect(looksLikeGuideline("veri_seti.pdf", "Katılımcıların yaşı ve cinsiyeti tabloda verilmiştir.")).toBe(false);
  });
  it("yalnızca kılavuzda yazan kurallar uygulanır; yazmayanlar stilin varsayılanında kalır", async () => {
    const { guideFormatPatch } = await import("@/lib/guideline");
    const project = { work_type: "thesis", academic_level: "master", citation_style: "apa7", context: {} };
    const g = {
      format: { fontFamily: "Times New Roman", fontSizePt: 12, lineSpacing: 1.5, marginTopCm: 3, marginBottomCm: 2.5, marginLeftCm: 4, marginRightCm: 2.5, firstLineIndentCm: null, paragraphAfterPt: null, justify: true, chapterOnNewPage: true, chapterTitleUppercase: true, chapterTitleCenter: true, pageNumber: "bottom-right", citationStyle: "apa7", tableOfContents: true },
      cover: { showTC: true, logoSpace: true, university: "Hacettepe Üniversitesi", faculty: null, institute: "Sosyal Bilimler Enstitüsü" },
    };
    const p = guideFormatPatch(project, g);
    expect(p.format.margins).toEqual({ top: 3, bottom: 2.5, left: 4, right: 2.5 });
    expect(p.format.chapterTitleCenter).toBe(true); // kılavuz ortalı diyorsa kılavuz geçerli
    expect(p.format.pageNumber).toBe("bottom-right");
    expect(p.format.firstLineIndentCm).toBe(1.25); // kılavuzda yok → tez şablonunun değeri
    expect(p.format.cover?.university).toBe("Hacettepe Üniversitesi");
    expect(p.format.cover?.institute).toBe("Sosyal Bilimler Enstitüsü");
    expect(p.format.v).toBe(2);
    expect(p.fields).toEqual(expect.arrayContaining(["kenar boşlukları", "punto", "satır aralığı", "başlık hizası", "sayfa numarası yeri"]));
    expect(p.fields).not.toContain("paragraf girintisi");
    // Geçersiz değerler uygulanmaz
    const bad = guideFormatPatch(project, { format: { fontSizePt: 40, lineSpacing: 0, marginLeftCm: 20 }, cover: {} });
    expect(bad.fields).toEqual([]);
    // Uygulanan biçim dışa aktarmada kullanılır
    const fmt = effectiveFormat({ ...project, context: { format: p.format } });
    expect(fmt.margins.left).toBe(4);
    expect(fmt.chapterTitleCenter).toBe(true);
  });
});
