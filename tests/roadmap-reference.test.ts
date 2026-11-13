/**
 * D173 — Referans belgesinin tamamına uyum: bölüm işlevleri (4.1–4.9), gösterilmeyen bölümlerin gerekçesi (1.1),
 * disiplin ve desen (1.1, 2.1, 14), asistan rolleri (9), tez ön sayfaları ve tablo/şekil listeleri (4.1),
 * literatür kalite kontrolü (6.4) ve yinelenen başlık (7.3).
 */
import { describe, expect, it } from "vitest";
import {
  assistantFor, buildTemplate, designsFor, disciplineGuidance, documentPurposeGuidance, HEADING_RULES, levelGuidance,
  literatureDepth, omittedSections, reportingStandards, sectionFunctions, workTypeGuidance, type TemplateInput,
} from "@/lib/workflows";
import { consistencyChain } from "@/lib/quality/consistency-chain";
import { buildExportDoc } from "@/lib/export/model";
import { toLatexFiles } from "@/lib/export/render-latex";

const keys = (p: Partial<TemplateInput>) => buildTemplate(p as TemplateInput).map((x) => x.key);

describe("4. hizmet türleri: bölümde beklenen işlevler", () => {
  it("4.1 nicel/nitel/karma tezin koşullu alt başlıkları bölümlere dağıtılır", () => {
    const q = { workType: "thesis", methodology: "quantitative" };
    expect(sectionFunctions("method", q)).toContain("Araştırma modeli ve değişkenlerin kavramsallaştırılması");
    expect(sectionFunctions("questions", q)).toContain("Hipotezler (araştırma amacı gerektiriyorsa)");
    expect(sectionFunctions("sample", q)).toContain("Örneklem büyüklüğünün gerekçesi");
    expect(sectionFunctions("instruments", q)).toContain("Ölçme araçları ve psikometrik özellikleri (geçerlik, güvenirlik)");
    expect(sectionFunctions("analysis", q)).toEqual(expect.arrayContaining(["İstatistiksel analiz planı", "Varsayım kontrolleri (normallik vb.)"]));
    const n = { workType: "thesis", methodology: "qualitative" };
    expect(sectionFunctions("questions", n).join()).toMatch(/hipotez yok/);
    expect(sectionFunctions("instruments", n)).toContain("Veri üretimi/toplanması ve transkripsiyon");
    expect(sectionFunctions("analysis", n).join()).not.toMatch(/normallik/i);
    expect(sectionFunctions("trustworthiness", n)).toEqual(expect.arrayContaining(["İnandırıcılık", "Aktarılabilirlik", "Tutarlılık", "Teyit edilebilirlik"]));
    const k = { workType: "thesis", methodology: "mixed" };
    expect(sectionFunctions("method", k)).toEqual(expect.arrayContaining(["Karma yöntemin gerekçesi ve desen türü", "Aşamaların sıralanması veya eş zamanlı yürütülmesi", "Veri setlerinin entegrasyon noktası ve yöntemi"]));
    expect(sectionFunctions("integration", k)).toEqual(expect.arrayContaining(["Uyumlu ve çelişkili bulguların değerlendirilmesi", "Bütünleştirilmiş çıkarımlar (meta-çıkarımlar)"]));
  });

  it("4.5 meta-analiz ek adımları ve sistematik derlemede yanlılık riski", () => {
    expect(sectionFunctions("meta_analysis", { workType: "literature_review", methodology: "meta_analysis" })).toEqual([
      "Etki ölçüsü", "İstatistiksel model ve model seçiminin gerekçesi", "Heterojenlik", "Yayın yanlılığı ve küçük çalışma etkileri (uygunsa)",
      "Alt grup ve meta-regresyon analizleri (gerekçelendirildiğinde)", "Duyarlılık analizleri", "Forest plot ve uygun görseller",
    ]);
    expect(sectionFunctions("data_extraction", { workType: "literature_review" })).toContain("Çalışma kalitesi / yanlılık riski değerlendirmesi");
  });

  it("4.6–4.9 öneri, fon, kaynak araştırması ve metin düzenleme işlevleri; fon başvurusunda ekler", () => {
    expect(sectionFunctions("ethics", { workType: "research_proposal" })).toContain("Planlanan etik kurul başvurusu");
    expect(sectionFunctions("grant_objectives", { workType: "grant_proposal" })).toContain("Ölçülebilir hedefler ve başarı ölçütleri");
    expect(sectionFunctions("grant_risks", { workType: "grant_proposal" })).toContain("Alternatif planlar (B planı)");
    expect(keys({ workType: "grant_proposal", level: "bachelor", program: "tubitak_2209a" })).toContain("appendices");
    expect(sectionFunctions("search_strategy", { workType: "source_research" })).toEqual(expect.arrayContaining(["Anahtar kelimeler ve eş anlamlılar", "Tarih aralığı ve seçim kriterleri"]));
    expect(sectionFunctions("editing_format", { workType: "text_editing" })).toContain("Orijinal ve düzenlenmiş metin karşılaştırması");
    expect(workTypeGuidance("research_proposal")).toMatch(/Gerçek bulgu, analiz sonucu veya tamamlanmış tartışma YAZMA/);
    expect(workTypeGuidance("grant_proposal")).toMatch(/Eski formları güncelmiş gibi sunma/);
    expect(workTypeGuidance("text_editing")).toMatch(/Anlamı değiştirebilecek her müdahaleyi/);
  });

  it("4.1 tezde ön sayfalar ve özet; eğitim projesinde hedef grup ihtiyaç analizinde", () => {
    const k = keys({ workType: "thesis", level: "master", methodology: "quantitative" });
    expect(k.slice(0, 3)).toEqual(["front_matter", "title_abstract", "topic"]);
    expect(buildTemplate({ workType: "thesis", level: "master", methodology: "quantitative" } as TemplateInput).find((x) => x.key === "title_abstract")!.title).toBe("Özet ve Abstract");
    expect(sectionFunctions("needs_analysis", { workType: "capstone", variant: "education" })).toContain("Hedef grubun özellikleri");
  });
});

describe("1.1 şeffaflık, 2.1 desen, 14 standartlar, 9 asistanlar", () => {
  it("gösterilmeyen bölümler gerekçesiyle listelenir", () => {
    const q = omittedSections({ workType: "thesis", level: "master", methodology: "qualitative" } as TemplateInput);
    expect(q.find((x) => x.key === "sample")?.why).toMatch(/çalışma grubu/);
    expect(q.find((x) => x.key === "integration")?.why).toMatch(/karma/);
    const t = omittedSections({ workType: "thesis", level: "master", methodology: "theoretical" } as TemplateInput);
    expect(t.find((x) => x.key === "findings")?.why).toMatch(/veri/);
    const p = omittedSections({ workType: "research_proposal", level: "master", methodology: "quantitative" } as TemplateInput);
    expect(p.length === 0 || p.every((x) => x.why.length > 10)).toBe(true);
  });

  it("disipline uygun olmayan desen gösterilmez; yönetimden eklenen desen listeye girer", () => {
    expect(designsFor("quantitative", "Eğitim Bilimleri").map((d) => d.id)).not.toContain("cohort_case_control");
    expect(designsFor("quantitative", "Halk Sağlığı").map((d) => d.id)).toContain("cohort_case_control");
    expect(designsFor("quantitative", "").map((d) => d.id)).toContain("cohort_case_control");
    const extra = [{ id: "delphi", label: "Delphi tekniği", approach: "mixed" as const, guidance: "Uzman panelleri", standards: [] }];
    expect(designsFor("mixed", "", extra).map((d) => d.id)).toContain("delphi");
  });

  it("raporlama standartları desen ve disipline göre seçilir; sağlık dışı alanda STROBE/CONSORT dayatılmaz", () => {
    expect(reportingStandards({ design: "experimental", discipline: "Hemşirelik" })).toContain("CONSORT");
    expect(reportingStandards({ design: "experimental", discipline: "Matematik Eğitimi" })).toEqual(["APA JARS-Quant"]);
    expect(reportingStandards({ design: "cohort_case_control", discipline: "İşletme" })).toEqual(["STROBE"]);
  });

  it("disiplin, belge amacı, düzey ve başlıklandırma yönergeleri", () => {
    expect(disciplineGuidance("Tıp")).toMatch(/sağlık/);
    expect(disciplineGuidance("Bilgisayar Mühendisliği")).toMatch(/mühendislik/);
    expect(disciplineGuidance("")).toBe("");
    expect(documentPurposeGuidance("journal")).toMatch(/yazar rehberi/);
    expect(levelGuidance("postdoc")).toMatch(/akademisyen/);
    expect(literatureDepth({ workType: "thesis", level: "postdoc" })).toMatch(/eleştirel sentez/);
    expect(HEADING_RULES).toMatch(/onayı olmadan yeniden adlandırma/);
    expect(HEADING_RULES).toMatch(/kullanıcıya sor/);
  });

  it("her bölümün sorumlu asistanı belgedeki 11 asistandan biridir", () => {
    expect(assistantFor("literature").name).toBe("Literatür asistanı");
    expect(assistantFor("analysis", "qualitative").name).toBe("Nitel analiz asistanı");
    expect(assistantFor("analysis", "quantitative").name).toBe("Nicel analiz asistanı");
    expect(assistantFor("integration").name).toBe("Karma yöntem asistanı");
    expect(assistantFor("references").name).toBe("Kaynakça asistanı");
    expect(assistantFor("ethics").name).toBe("Etik kontrol asistanı");
    expect(assistantFor("editing_language").name).toBe("Akademik editör");
  });
});

describe("6.4 ve 7.3 kalite kontrol (puanı etkilemez)", () => {
  const base = { workType: "thesis", level: "master", methodology: "quantitative", program: null, design: null, variant: null };
  it("ardışık özet, güncellik ve çelişki uyarıları", () => {
    const longText = Array(700).fill("çalışma").join(" ");
    const items = consistencyChain({ ...base, now: 2026, stages: [{ key: "literature", title: "İlgili Araştırmalar", text: longText, citations: 12, citedYears: [2001, 2005, 2010], citedParagraphs: 8, singleSourceShare: 0.875 }, { key: "gaps", title: "Boşluk", text: "Boşluk." }] });
    const lit = items.filter((x) => x.title !== "Kritik bölüm yapıda yok");
    const titles = lit.map((x) => x.title);
    expect(titles).toEqual(expect.arrayContaining(["Kaynaklar sentezlenmek yerine ardışık özetlenmiş olabilir", "Güncel çalışmalar temsil edilmiyor", "Çelişkili bulgular ele alınmamış görünüyor"]));
    expect(lit.every((x) => x.level === "improvement")).toBe(true);
    const good = consistencyChain({ ...base, now: 2026, stages: [{ key: "literature", title: "İlgili Araştırmalar", text: `${longText} bununla birlikte bazı çalışmalar çelişkili sonuçlar bildirmiştir`, citations: 12, citedYears: [2005, 2023], citedParagraphs: 8, singleSourceShare: 0.25 }, { key: "gaps", title: "Boşluk", text: "Boşluk." }] });
    expect(good.map((x) => x.title).filter((x) => x !== "Kritik bölüm yapıda yok")).toEqual([]);
  });
  it("yinelenen başlık bölüm içinde ve bölümler arasında yakalanır", () => {
    const a = consistencyChain({ ...base, stages: [{ key: "literature", title: "Literatür", text: "x", headings: ["Dijital okuryazarlık", "Dijital Okuryazarlık"] }] });
    expect(a.some((x) => x.title === "Yinelenen başlık")).toBe(true);
    const b = consistencyChain({ ...base, stages: [{ key: "concepts", title: "Kavramlar", text: "x", headings: ["Öz yeterlik"] }, { key: "literature", title: "Literatür", text: "x", headings: ["Öz yeterlik"] }] });
    expect(b.some((x) => x.title === "Yinelenen başlık")).toBe(true);
  });
});

describe("4.1 ön sayfalar: tablo ve şekil listeleri dışa aktarmada", () => {
  const PNG = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
  const content = { type: "doc", content: [
    { type: "paragraph", content: [{ type: "text", text: "Tablo 1. Katılımcıların demografik özellikleri" }] },
    { type: "table", content: [{ type: "tableRow", content: [{ type: "tableCell", content: [{ type: "paragraph", content: [{ type: "text", text: "a" }] }] }] }] },
    { type: "paragraph", content: [{ type: "text", text: "Şekil 1. Araştırma modeli" }] },
    { type: "figure", attrs: { src: PNG, alt: "x" } },
  ] };
  const stages = [
    { id: "f", key: "front_matter", title: "Ön sayfalar", position: 0, content: { type: "doc", content: [{ type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "Etik Beyan" }] }, { type: "paragraph", content: [{ type: "text", text: "Beyan metni." }] }] }, content_text: "Etik Beyan Beyan metni." },
    { id: "s", key: "findings", title: "Bulgular", position: 1, content, content_text: "x" },
  ];
  it("tezde listeler oluşur; ön sayfa başlığı numarasızdır, sonraki bölüm 1’den başlar", () => {
    const d = buildExportDoc({ project: { title: "T", work_type: "thesis", language: "tr", citation_style: "apa7", context: {} }, stages, sources: [], engineItems: [], authorName: "A" });
    expect(d.lists.tables).toHaveLength(1);
    expect(d.lists.figures).toHaveLength(1);
    expect(d.lists.tables[0]).toMatch(/Tablo 1/);
    expect(d.lists.tablesTitle).toBe("TABLOLAR LİSTESİ");
    const heads = d.blocks.filter((b) => b.kind === "heading") as Extract<(typeof d.blocks)[number], { kind: "heading" }>[];
    expect(heads[0].number).toBe("");
    expect(heads.find((h) => h.number === "1")).toBeTruthy();
    const tex = toLatexFiles(d, { style: "apa7", items: [] }).find((f) => f.name.endsWith(".tex"))!.data as string;
    expect(tex).toContain("TABLOLAR LİSTESİ");
    expect(tex).toContain("\\pageref{lot:1}");
    expect(tex).toContain("\\label{lot:1}");
  });
});
