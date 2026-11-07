import { describe, expect, it } from "vitest";
import { cleanPdfPages, contentSegments, headingOf, segmentPages } from "@/lib/files/pdf-clean";
import { chunkText } from "@/lib/files/chunk";
import { agreement, appraisalSummary, characteristicsMarkdown, findFuzzyDuplicate, methodsMarkdown, prismaCounts, titleSimilarity, EMPTY_PROTOCOL, type ReviewRecord } from "@/lib/prisma";
import { auditCsv, bestVerdict, extractClaims, isMixed, relatedCandidates, summarize, type AuditItem } from "@/lib/claims";

/* ---------------- D132: PDF okuma ---------------- */
describe("PDF temizleme", () => {
  const header = "Journal of Online Learning, 12(3)";
  const body = ["This is the investi-\ngation of self-regulation. Students were ﬁne.", "Participants completed the scale twice during the semester.", "Results show a moderate effect of feedback timing on scores.", "Limitations include the small sample and short duration."];
  const pages = body.map((t, i) => `${header}\n${t}\nAdditional sentence number ${i} about the method, the sample and the procedure that was followed in the classrooms.\n${i + 1}`);
  it("tekrar eden üst bilgiyi ve sayfa numarasını kaldırır, bölünmüş kelimeyi ve bitişik harfleri düzeltir", () => {
    const r = cleanPdfPages(pages);
    expect(r.pages[0]).not.toContain(header);
    expect(r.pages[0]).toContain("investigation");
    expect(r.pages[0]).toContain("fine");
    expect(r.pages[0]).not.toMatch(/\n1$/);
    expect(r.removedLines).toBeGreaterThanOrEqual(8);
    expect(r.scanned).toBe(false);
  });
  it("paragraf içindeki satır kırılmalarını birleştirir", () => {
    const r = cleanPdfPages(["The participants were\nrecruited from three schools\nin Ankara."]);
    expect(r.pages[0]).toBe("The participants were recruited from three schools in Ankara.");
  });
  it("taranmış PDF’i tanır", () => {
    expect(cleanPdfPages(["", " ", "12"]).scanned).toBe(true);
  });
  it("bölüm başlıklarını tanır (numaralı, Türkçe, İngilizce)", () => {
    expect(headingOf("3. Method")).toBe("method");
    expect(headingOf("YÖNTEM")).toBe("method");
    expect(headingOf("Bulgular")).toBe("results");
    expect(headingOf("References")).toBe("references");
    expect(headingOf("II. Discussion")).toBe("discussion");
    expect(headingOf("The method used in this long sentence is described below")).toBeNull();
  });
  it("sayfaları bölümlere ayırır, kaynakçayı parçalardan çıkarır ve parçalar bölüm bilgisini taşır", () => {
    const segs = segmentPages(["Abstract\nWe studied X in many students across schools.\n\nMethod\nParticipants were 120 students from eight schools.", "Results\nScores increased significantly after the program.\n\nReferences\nSmith, J. (2020). A paper. Journal, 1, 1-2."]);
    expect(segs.map((s) => s.section)).toEqual(["abstract", "method", "results", "references"]);
    const { kept, droppedReferences } = contentSegments(segs);
    expect(droppedReferences).toBe(1);
    const chunks = chunkText({ text: "", pages: ["a", "b"], segments: kept, pageLabels: ["201", "202"] });
    expect(chunks.find((c) => c.section === "method")?.pageHint).toBe("s. 201");
    expect(chunks.find((c) => c.section === "results")?.pageHint).toBe("s. 202");
    expect(chunks.some((c) => /Smith, J\./.test(c.content))).toBe(false);
  });
});

/* ---------------- D133: atıf destek / çelişki ---------------- */
describe("İddia denetimi: çelişki ve kaynaklar arası", () => {
  it("“çelişiyor” en zayıf karardır; karışık kanıt tanınır", () => {
    expect(bestVerdict(["contradicts", "insufficient"])).toBe("insufficient");
    expect(bestVerdict(["contradicts", "supports"])).toBe("supports");
    expect(isMixed([{ verdict: "supports" }, { verdict: "contradicts" }])).toBe(true);
    expect(isMixed([{ verdict: "supports" }, { verdict: "partial" }])).toBe(false);
  });
  it("özet çelişki ve ilgili kaynak sayılarını içerir", () => {
    const s = summarize([
      { kind: "cited", verdict: "contradicts", checks: [{ verdict: "contradicts" }] },
      { kind: "cited", verdict: "supports", checks: [{ verdict: "supports" }, { verdict: "contradicts" }] },
      { kind: "uncited", verdict: null, related: [{ stance: "supports" }] },
    ]);
    expect(s.contradicts).toBe(1);
    expect(s.mixed).toBe(1);
    expect(s.relatedSupport).toBe(1);
  });
  it("aday kaynak seçimi: atıf yapılanı dışlar, kelime örtüşmesine göre sıralar", () => {
    const claim = { text: "Uzaktan eğitimde öz düzenleme becerileri akademik başarıyı güçlü biçimde yordamaktadır", citations: [{ ids: ["s1"] }] };
    const ids = relatedCandidates(claim, [
      { id: "s1", text: "Uzaktan eğitimde öz düzenleme ve akademik başarı" },
      { id: "s2", text: "Öz düzenleme becerileri uzaktan eğitimde akademik başarıyı yordamaktadır: bir meta-analiz" },
      { id: "s3", text: "Hastane enfeksiyonlarında el hijyeni" },
    ]);
    expect(ids).toEqual(["s2"]);
  });
  it("CSV her kaynak kararını ve diğer kaynakları içerir", () => {
    const [c] = extractClaims({ type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: "Canlı dersler başarıyı artırır " }, { type: "citation", attrs: { ids: ["a"], locator: null } }, { type: "text", text: "." }] }] });
    const item: AuditItem = { ...c, verdict: "contradicts", checks: [{ sourceId: "a", verdict: "contradicts", explanation: "Kaynak fark bulmadı", quote: "no significant difference", quotePage: "5", access: "full_text" }], related: [{ sourceId: "b", stance: "supports", explanation: "x", quote: null, quotePage: null }] };
    const csv = auditCsv([item], { title: (id) => (id === "a" ? "Kaya 2021" : "Lee 2020"), verdictLabel: (v) => String(v), stanceLabel: (s) => (s === "supports" ? "Destekliyor" : "Çelişiyor") });
    expect(csv).toContain("Kaya 2021");
    expect(csv).toContain("no significant difference");
    expect(csv).toContain("Destekliyor: Lee 2020");
  });
});

/* ---------------- D134: sistematik derleme ---------------- */
describe("PRISMA geliştirmeleri", () => {
  it("bulanık yinelenen: yazım ve noktalama farkını yakalar, farklı yılı ve farklı çalışmayı ayırır", () => {
    expect(titleSimilarity("Gamification and Mathematics Achievement: A Meta-Analysis", "Gamification and mathematics achievement - a meta analysis")).toBeGreaterThan(0.93);
    const pool = [{ key: "t:a|2020", title: "Gamification and Mathematics Achievement: A Meta-Analysis", year: 2020, doi: null }];
    expect(findFuzzyDuplicate({ title: "Gamification and mathematics achievement - a meta analysis", year: 2021 }, pool)).toBe("t:a|2020");
    expect(findFuzzyDuplicate({ title: "Gamification and Mathematics Achievement: A Meta-Analysis", year: 2015 }, pool)).toBeNull();
    expect(findFuzzyDuplicate({ title: "Gamification and science achievement in primary school", year: 2020 }, pool)).toBeNull();
  });
  it("Cohen’in kappası ve anlaşmazlıklar", () => {
    const v = (a: string, b: string) => ({ screening: { u1: { decision: a as "include", at: "" }, u2: { decision: b as "include", at: "" } } });
    const recs = [{ id: "1", votes: v("include", "include") }, { id: "2", votes: v("exclude", "exclude") }, { id: "3", votes: v("include", "exclude") }, { id: "4", votes: v("exclude", "exclude") }];
    const a = agreement(recs, "screening");
    expect(a.n).toBe(4);
    expect(a.observed).toBe(0.75);
    expect(a.conflicts).toEqual(["3"]);
    expect(a.kappa).toBeCloseTo(0.5, 2);
    expect(a.label).toBe("orta");
    expect(agreement([{ id: "1", votes: { screening: { u1: { decision: "include", at: "" } } } }], "screening").raters).toBeNull();
  });
  it("kalite özeti: uygulanamaz maddeler sayılmaz, risk düzeyi", () => {
    expect(appraisalSummary({ answers: { aim: "yes", design: "yes", sampling: "yes", measures: "no", analysis: "na" } }).risk).toBe("low");
    expect(appraisalSummary({ answers: { aim: "yes", design: "no", sampling: "unclear" } }).risk).toBe("high");
    expect(appraisalSummary({ answers: { aim: "yes" } }).risk).toBeNull();
  });
  it("yöntem metni: sayılar, uyum, atıf ve arama tablosu", () => {
    const recs = [
      ...Array.from({ length: 3 }, (_, i) => ({ origin: "Scopus", stage: "duplicate", reason: null })),
      ...Array.from({ length: 5 }, () => ({ origin: "Scopus", stage: "excluded_screening", reason: "Konu dışı" })),
      { origin: "ERIC", stage: "excluded_eligibility", reason: "Kontrol grubu yok" },
      { origin: "ERIC", stage: "included", reason: null }, { origin: "ERIC", stage: "included", reason: null },
    ] as Pick<ReviewRecord, "origin" | "stage" | "reason">[];
    const md = methodsMarkdown({ protocol: { ...EMPTY_PROTOCOL, question: "Oyunlaştırma başarıyı artırır mı?", inclusion: ["Deneysel desen"], searches: [{ database: "Scopus", query: "gamif* AND math*", date: "2026-10-01", results: 120 }] }, counts: prismaCounts(recs), lang: "tr", agreement: { raters: ["a", "b"], n: 10, agree: 9, observed: 0.9, kappa: 0.78, conflicts: [], label: "iyi" }, includedLabels: ["S1", "S2"] });
    expect(md).toContain("PRISMA 2020");
    expect(md).toContain("11 kayda ulaşılmıştır");
    expect(md).toContain("3 yinelenen");
    expect(md).toContain("Kontrol grubu yok (n = 1)");
    expect(md).toContain("2 çalışma derlemeye dahil edilmiştir [[kaynak:S1,S2]]");
    expect(md).toContain("κ = 0.78");
    expect(md).toContain("| Scopus | gamif* AND math* | 2026-10-01 | 120 |");
  });
  it("özellikler tablosu: atıf, alanlar ve risk", () => {
    const md = characteristicsMarkdown([{ label: "S1", title: "A", year: 2020, extraction: { design: { value: "Yarı deneysel" }, sample: { value: "n = 64 | 7. sınıf" } }, appraisal: { answers: { aim: "yes", design: "yes", sampling: "yes" } } }], "tr");
    expect(md).toContain("[[kaynak:S1|anlatı]]");
    expect(md).toContain("Yarı deneysel");
    expect(md).toContain("n = 64 / 7. sınıf");
    expect(md).toContain("Düşük");
  });
});
