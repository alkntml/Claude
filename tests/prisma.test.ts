import { describe, expect, it } from "vitest";
import { canMove, prismaCounts, prismaSvg, recordKey, reviewCsv, type ReviewRecord } from "@/lib/prisma";

const R = (stage: ReviewRecord["stage"], origin = "OpenAlex", reason: string | null = null): ReviewRecord => ({ id: Math.random().toString(36), key: "k", origin, stage, reason, record: { title: "T" } });

describe("PRISMA 2020 modülü (D122)", () => {
  it("yinelenen anahtarı DOI’yi veya başlık+yılı sadeleştirir", () => {
    expect(recordKey({ doi: "https://doi.org/10.1/ABC", title: "x" })).toBe("doi:10.1/abc");
    expect(recordKey({ title: "Öğretmen  Öz-yeterliği!", year: 2020 })).toBe(recordKey({ title: "ogretmen oz yeterligi", year: 2020 }));
  });
  it("akış şeması sayılarını PRISMA 2020 tanımlarına göre hesaplar", () => {
    const recs = [R("identified"), R("duplicate", "Crossref"), R("excluded_screening"), R("sought"), R("not_retrieved"), R("excluded_eligibility", "OpenAlex", "Yanlış örneklem"), R("excluded_eligibility", "OpenAlex", "Yanlış örneklem"), R("included"), R("included", "DergiPark")];
    const c = prismaCounts(recs);
    expect(c).toMatchObject({ identified: 9, duplicates: 1, screened: 8, excludedScreening: 1, pendingScreening: 1, sought: 6, notRetrieved: 1, assessed: 5, pendingEligibility: 1, excludedEligibilityTotal: 2, included: 2 });
    expect(c.byOrigin).toEqual({ OpenAlex: 7, Crossref: 1, DergiPark: 1 });
    expect(c.excludedEligibility).toEqual({ "Yanlış örneklem": 2 });
  });
  it("aşama atlamayı engeller; şema ve CSV üretilir", () => {
    expect(canMove("identified", "included")).toBe(false);
    expect(canMove("sought", "included")).toBe(true);
    const { svg, height } = prismaSvg(prismaCounts([R("included")]), "tr");
    expect(svg).toContain("Derlemeye dahil edilen çalışmalar (n = 1)");
    expect(height).toBeGreaterThan(300);
    expect(reviewCsv([R("included")], (s) => s)).toContain("\"included\"");
  });
});

describe("PRISMA geliştirmeleri (D222)", () => {
  it("Bölüm 1 / Bölüm 2 ayrı yayındır; ön baskı ile dergi sürümü farklı DOI’ye rağmen eşleşir", async () => {
    const { fuzzyMatch, partMarkers, isPreprintDoi } = await import("@/lib/prisma");
    const t = "Mindfulness-based stress reduction for nurses: a randomized controlled trial";
    expect(partMarkers(`${t} Part 1`)).not.toBe(partMarkers(`${t} Part 2`));
    expect(fuzzyMatch({ title: `${t} Part 2`, year: 2019 }, [{ key: "a", title: `${t} Part 1`, year: 2019 }])).toBeNull();
    expect(fuzzyMatch({ title: "Öz düzenleme üzerine bir inceleme: Bölüm II", year: 2020 }, [{ key: "a", title: "Öz düzenleme üzerine bir inceleme: Bölüm I", year: 2020 }])).toBeNull();
    expect(isPreprintDoi("10.48550/arXiv.2101.01234")).toBe(true);
    expect(isPreprintDoi("https://doi.org/10.1101/2020.01.01.123456")).toBe(true);
    expect(isPreprintDoi("10.1111/jan.13999")).toBe(false);
    expect(fuzzyMatch({ title: t, year: 2018, doi: "10.48550/arXiv.2101.01234" }, [{ key: "j", title: t, year: 2019, doi: "10.1111/jan.13999" }])).toEqual({ key: "j", kind: "version" });
    // iki dergi DOI’si farklıysa ayrı yayın
    expect(fuzzyMatch({ title: t, year: 2019, doi: "10.1000/a" }, [{ key: "j", title: t, year: 2019, doi: "10.1111/jan.13999" }])).toBeNull();
  });
  it("adı konmuş yanlılık riski araçları: RoB 2, ROBINS-I, NOS, JBI genel kararları", async () => {
    const { appraisalSummary } = await import("@/lib/prisma");
    expect(appraisalSummary({ tool: "rob2", answers: { d1: "low", d2: "low", d3: "low", d4: "low", d5: "low" } }).risk).toBe("low");
    expect(appraisalSummary({ tool: "rob2", answers: { d1: "low", d2: "some", d3: "low", d4: "low", d5: "low" } })).toMatchObject({ risk: "moderate", detail: "some" });
    expect(appraisalSummary({ tool: "rob2", answers: { d1: "high" } }).risk).toBe("high");
    expect(appraisalSummary({ tool: "rob2", answers: { d1: "low", d2: "low" } }).risk).toBeNull();
    expect(appraisalSummary({ tool: "robins_i", answers: { d1: "moderate", d2: "low", d3: "low", d4: "low", d5: "low", d6: "low", d7: "low" } })).toMatchObject({ risk: "moderate", detail: "moderate" });
    expect(appraisalSummary({ tool: "robins_i", answers: { d1: "critical" } })).toMatchObject({ risk: "high", detail: "critical" });
    expect(appraisalSummary({ tool: "robins_i", answers: { d1: "low", d2: "low", d3: "low", d4: "low", d5: "ni", d6: "low", d7: "low" } }).risk).toBeNull();
    const nos = { s1: "1", s2: "1", s3: "1", s4: "1", c1: "2", o1: "1", o2: "1", o3: "0" } as const;
    expect(appraisalSummary({ tool: "nos_cohort", answers: nos })).toMatchObject({ risk: "low", detail: "8/9" });
    expect(appraisalSummary({ tool: "jbi_cross", answers: { q1: "yes", q2: "yes", q3: "no", q4: "yes" } }).risk).toBe("low");
    // eski kayıtlar (araçsız) genel listeyle değerlendirilir
    expect(appraisalSummary({ answers: { aim: "yes", design: "yes", sampling: "no" } }).risk).toBe("moderate");
  });
  it("Türkçe yöntem metninde ondalık virgül; araç adları, ek alanlar ve raporlama metinleri yer alır; kontrol listesi 27 madde", async () => {
    const { methodsMarkdown, prismaChecklist, checklistMarkdown, prismaCounts, EMPTY_PROTOCOL } = await import("@/lib/prisma");
    const counts = prismaCounts([{ origin: "PubMed", stage: "included", reason: null }, { origin: "PubMed", stage: "excluded_screening", reason: null }]);
    const protocol = { ...EMPTY_PROTOCOL, question: "Soru?", inclusion: ["Hakemli"], searches: [{ database: "PubMed", query: "a AND b", date: "2026-11-01", results: 2 }], extractionFields: ["Örneklem büyüklüğü (n)"], reporting: { registration: "Protokol PROSPERO’ya kaydedilmiştir (CRD42025000001)", synthesis: "Anlatı sentezi yapılmıştır." } };
    const md = methodsMarkdown({ protocol, counts, lang: "tr", agreement: { raters: ["a", "b"], n: 10, agree: 9, observed: 0.9, kappa: 0.714, conflicts: [], label: "iyi" }, extracted: 1, appraised: 1, tools: ["rob2", "nos_cohort"] });
    expect(md).toContain("κ = 0,71");
    expect(md).toContain("randomize kontrollü çalışmalar için Cochrane RoB 2 ve kohort çalışmaları için Newcastle–Ottawa Ölçeği ile değerlendirilmiştir");
    expect(md).toContain("Örneklem büyüklüğü (n)");
    expect(md).toContain("CRD42025000001).");
    expect(md).toContain("Anlatı sentezi yapılmıştır.");
    expect(methodsMarkdown({ protocol, counts, lang: "en", agreement: { raters: ["a", "b"], n: 10, agree: 9, observed: 0.9, kappa: 0.714, conflicts: [], label: "" } })).toContain("κ = 0.71");
    const rows = prismaChecklist({ protocol, counts, lang: "tr", dualKappa: true, extracted: 1, appraised: 1 });
    expect(rows.map((r) => r.n)).toEqual(Array.from({ length: 27 }, (_, i) => i + 1));
    const st = Object.fromEntries(rows.map((r) => [r.n, r.status]));
    expect([st[4], st[5], st[7], st[8], st[13], st[16], st[24]]).toEqual(["done", "done", "done", "done", "done", "done", "done"]);
    expect([st[12], st[15], st[25]]).toEqual(["todo", "todo", "todo"]);
    expect([st[1], st[23]]).toEqual(["author", "author"]);
    expect(checklistMarkdown(rows, "tr")).toContain("| Yöntem | 13 | Sentez yöntemleri |");
  });
});

describe("Meta-analiz ve PRISMA bağlantısı (D224)", () => {
  it("yöntem metnine meta-analiz cümlesi girer; kontrol listesi sentez maddelerini tamamlar", async () => {
    const { methodsMarkdown, prismaChecklist, prismaCounts, EMPTY_PROTOCOL } = await import("@/lib/prisma");
    const counts = prismaCounts([{ origin: "PubMed", stage: "included", reason: null }]);
    const protocol = { ...EMPTY_PROTOCOL, question: "Soru?", searches: [{ database: "PubMed", query: "a", date: "2026-11-01", results: 1 }] };
    const md = methodsMarkdown({ protocol, counts, lang: "tr", meta: { type: "smd", model: "random" } });
    expect(md).toContain("Hedges g"); expect(md).toContain("DerSimonian–Laird");
    expect(methodsMarkdown({ protocol, counts, lang: "en", meta: { type: "or", model: "fixed" } })).toContain("odds ratio");
    expect(methodsMarkdown({ protocol, counts, lang: "tr" })).not.toContain("DerSimonian");
    const st = (k: number | null) => Object.fromEntries(prismaChecklist({ protocol, counts, lang: "tr", dualKappa: false, extracted: 1, appraised: 0, meta: k ? { k } : null }).map((r) => [r.n, r.status]));
    expect([st(12)[12], st(12)[13], st(12)[19], st(12)[20], st(12)[21]]).toEqual(["done", "done", "done", "done", "done"]);
    expect([st(5)[14], st(5)[21]]).toEqual(["partial", "partial"]); // 10’dan az çalışma
    expect([st(null)[12], st(null)[20]]).toEqual(["todo", "author"]);
  });
});
