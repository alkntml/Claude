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
import { effectiveFormat } from "@/lib/export/format";

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

describe("bölümlerin toplu eklenmesi (araştırma makalesi oluşturma hatası)", () => {
  it("eksik alanlar NULL değil veritabanı varsayılanıyla eklenir (defaultToNull: false)", async () => {
    const { insertStageRows } = await import("@/lib/structure-server");
    const calls: { rows: unknown; opts: unknown }[] = [];
    const db = { from: () => ({ insert: (rows: unknown, opts: unknown) => { calls.push({ rows, opts }); return { select: async () => ({ data: [], error: null }) }; } }) };
    // Araştırma makalesinde “Ek materyal”in gerekçesi var, “Beyanlar” kritik değil: satırların alanları farklı
    const rows = [{ key: "title_abstract", critical: true, why: "x" }, { key: "declarations", requirement: "conditional" }];
    await insertStageRows(db as never, rows);
    expect(calls[0].opts).toEqual({ defaultToNull: false });
  });
});

describe("kaynak numaraları sabit (metne “[KAYNAK DOĞRULANAMADI]” düşmesi)", () => {
  // Her zinciri { data: [], error: null } ile çözen sahte veritabanı
  const fakeDb: any = new Proxy(() => fakeDb, { get: (_t, k) => (k === "then" ? (r: (v: unknown) => void) => r({ data: [], error: null }) : fakeDb), apply: () => fakeDb });
  const src = (id: string, title: string, created_at: string) => ({ id, title, created_at, authors: [{ family: "Yılmaz" }], year: 2020, verified: true, access_level: "abstract", abstract: `${title} özet` });
  const sources = [src("a", "Medya etkisi", "2026-01-01"), src("b", "Propaganda", "2026-01-02"), src("c", "Kitle toplumu", "2026-01-03")];
  const project = { id: "p", title: "Kitle iletişim kuramları", work_type: "research_article", academic_level: "bachelor", language: "tr", citation_style: "apa7", context: {} };
  it("aynı kaynak farklı isteklerde aynı numarayı alır; bağlama girmeyen proje kaynakları da çözülür", async () => {
    const { buildContext } = await import("@/lib/ai/context");
    const run = async (query: string, maxSources: number) => (await buildContext({ db: fakeDb, project, stage: null, stages: [], sources, memory: [], query, maxSources })).sourceMap;
    const m1 = await run("propaganda", 1);
    const m2 = await run("kitle toplumu", 1);
    expect(m1).toEqual({ S1: "a", S2: "b", S3: "c" });
    expect(m2).toEqual(m1);
  });
});

describe("özet bölüm kontrolü (D176)", () => {
  it("Özet ve Abstract kelimeleri ayrı sayılır; anahtar kelime satırları sayılmaz; aralık dışıysa kural uyarısı", async () => {
    const { abstractParts, ruleIssues } = await import("@/lib/quality/stage-review");
    const w = (n: number) => Array(n).fill("kelime").join(" ");
    const text = `Özet\n\n${w(120)}\n\nAnahtar Kelimeler: medya, kuram\n\nAbstract\n\n${w(200)}\n\nKeywords: media, theory`;
    expect(abstractParts(text)).toEqual([{ label: "Özet", words: 120 }, { label: "Abstract", words: 200 }]);
    const bundle = { project: { language: "tr" }, sources: [] };
    const issues = ruleIssues(bundle, { key: "title_abstract", title: "Özet", content_text: text, content: null }, "tr");
    expect(issues.filter((i) => i.title === "Özet uzunluğu aralık dışında").map((i) => i.detail)).toEqual(["Özet: 120 kelime (önerilen 150–250)."]);
  });
});

describe("kaynak düzeltme ve tam metin oranı (D177)", () => {
  it("eklenen kaynakların en az %60’ı tam metni okunabilen kaynaklar", async () => {
    const { pickWithFullTextQuota, fullTextLikely } = await import("@/lib/sources/fulltext-share");
    const items = ["a", "b", "F1", "c", "F2", "d", "F3", "e"].map((x) => ({ id: x, oaUrl: x.startsWith("F") ? "https://x/p.pdf" : null }));
    const picked = pickWithFullTextQuota(items, 8, fullTextLikely).map((i) => items[i].id);
    const ft = picked.filter((x) => x.startsWith("F")).length;
    expect(ft).toBe(3);
    expect(ft / picked.length).toBeGreaterThanOrEqual(0.6);
    expect(picked.length).toBe(5); // 3 tam metin + en fazla 2 diğer
    expect(pickWithFullTextQuota(items.filter((x) => !x.oaUrl), 8, fullTextLikely)).toEqual([]);
    const { pickForAutoAdd } = await import("@/lib/research");
    const rec = (title: string, oa: boolean, i: number) => ({ title, authors: [{ family: "A" }], year: 2020, doi: `10.1/${i}`, oaUrl: oa ? "https://x/p.pdf" : null, abstract: "x".repeat(60), score: 1 - i * 0.01 }) as never;
    const res = pickForAutoAdd([rec("Bir", false, 1), rec("İki", true, 2), rec("Üç", false, 3), rec("Dört", true, 4), rec("Beş", false, 5)], new Set(), 8);
    const share = res.filter((r: { oaUrl?: string | null }) => r.oaUrl).length / res.length;
    expect(share).toBeGreaterThanOrEqual(0.6);
  });

  it("düzeltme önerisi kontrolü: kalan işaret, listede olmayan numara ve kaybolan atıf yakalanır", async () => {
    const { proposalProblems } = await import("@/lib/sources/fix-check");
    const map = { S1: "a", S2: "b" };
    expect(proposalProblems("Temiz cümle [[kaynak:S1]] ve ⟦C1⟧.", map, "Eski ⟦C1⟧ [KAYNAK GEREKLİ]")).toEqual([]);
    expect(proposalProblems("Hâlâ [KAYNAK DOĞRULANAMADI] var ⟦C1⟧.", map, "⟦C1⟧")).toContain("marker");
    expect(proposalProblems("Uydurma [[kaynak:S9]] ⟦C1⟧.", map, "⟦C1⟧")).toContain("unknown");
    expect(proposalProblems("Atıf kayboldu [[kaynak:S2]].", map, "Eski ⟦C1⟧")).toContain("lost");
  });

  it("“Kaynakla düzelt” her zaman kaynak arar", async () => {
    const { researchGate } = await import("@/lib/research");
    expect(researchGate({ action: "fix_claim", message: "düzelt", recentlySearchedFocus: true })).toBe("force");
  });
});

describe("makale teslim düzeni (D178): kapak, içindekiler, listeler, sola yaslı başlık, numarasız Giriş", () => {
  const PNG = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
  const para = (text: string) => ({ type: "paragraph", content: [{ type: "text", text }] });
  const stages = [
    { id: "i", key: "introduction", title: "Giriş", position: 0, content_text: "Giriş metni.", content: { type: "doc", content: [para("Giriş metni.")] } },
    { id: "m", key: "methods_article", title: "Yöntem", position: 1, content_text: "x", content: { type: "doc", content: [para("Yöntem metni."), para("Tablo 1. Örneklem"), { type: "table", content: [{ type: "tableRow", content: [{ type: "tableCell", content: [para("a")] }] }] }, para("Şekil 1. Model"), { type: "figure", attrs: { src: PNG, alt: "x" } }] } },
  ];
  const project = { title: "Kitle iletişim kuramları", work_type: "research_article", academic_level: "bachelor", language: "tr", citation_style: "apa7", context: { university: "Ankara Üniversitesi" } };
  it("lisans araştırma makalesi varsayılan olarak kapaklı teslim düzeninde; Giriş numarasız, Yöntem 1", async () => {
    const d = buildExportDoc({ project, stages, sources: [], engineItems: [], authorName: "Ali Veli" });
    expect(d.cover).toBe(true);
    expect(d.toc.map((x) => `${x.number} ${x.text}`.trim())).toEqual(["Giriş", "1 Yöntem"]);
    const { toDocx } = await import("@/lib/export/render-docx");
    const JSZip = (await import("jszip")).default;
    const xml = await (await JSZip.loadAsync(await toDocx(d, effectiveFormat(project)))).file("word/document.xml")!.async("string");
    for (const x of ["Üniversite logosu", "T.C.", "ANKARA ÜNİVERSİTESİ", "[FAKÜLTE / ENSTİTÜ ADI]", "ARAŞTIRMA MAKALESİ", "İÇİNDEKİLER", "TABLOLAR LİSTESİ", "ŞEKİLLER LİSTESİ"]) expect(xml, x).toContain(x);
    // D180: APA projesinde 1. düzey başlık ortalı (APA 7 resmî kuralı)
    const head = xml.slice(xml.lastIndexOf("<w:p>", xml.lastIndexOf(">1 Yöntem<")), xml.lastIndexOf(">1 Yöntem<"));
    expect(head).toContain('w:val="center"');
    const isnad = buildExportDoc({ project: { ...project, citation_style: "isnad" }, stages, sources: [], engineItems: [], authorName: "Ali Veli" });
    const xml2 = await (await JSZip.loadAsync(await toDocx(isnad, effectiveFormat({ ...project, citation_style: "isnad" })))).file("word/document.xml")!.async("string");
    const head2 = xml2.slice(xml2.lastIndexOf("<w:p>", xml2.lastIndexOf(">1 Yöntem<")), xml2.lastIndexOf(">1 Yöntem<"));
    expect(head2).not.toContain('w:val="center"');
    const { toPdf } = await import("@/lib/export/render-pdf");
    const pdf = await toPdf(d);
    expect((pdf.toString("latin1").match(/\/Type \/Page\b/g) ?? []).length).toBeGreaterThanOrEqual(4); // kapak + içindekiler + listeler + metin
    const { toLatexFiles } = await import("@/lib/export/render-latex");
    const tex = toLatexFiles(d, { style: "apa7", items: [] }).find((f) => f.name === "main.tex")!.data as string;
    expect(tex).toContain("\\begin{titlepage}");
    expect(tex).toContain("ARAŞTIRMA MAKALESİ");
    expect(tex).toContain("ANKARA ÜNİVERSİTESİ");
    expect(tex).not.toContain("\\maketitle");
    expect(tex).not.toMatch(/\\\\\s*\[/); // “\\ [” derlemeyi bozar
  });
  it("dergi makalesi veya dergi amacında kapaksız düzen", () => {
    expect(buildExportDoc({ project: { ...project, work_type: "journal_article" }, stages, sources: [], engineItems: [], authorName: "A" }).cover).toBe(false);
    expect(buildExportDoc({ project: { ...project, context: { documentPurpose: "journal" } }, stages, sources: [], engineItems: [], authorName: "A" }).cover).toBe(false);
    expect(buildExportDoc({ project: { ...project, context: { documentPurpose: "journal", format: { layout: "submission" } } }, stages, sources: [], engineItems: [], authorName: "A" }).cover).toBe(true);
  });
});
