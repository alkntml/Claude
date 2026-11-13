/**
 * D171 — Dinamik akademik yol haritası: referans belgedeki 12 zorunlu senaryo (12.1), kullanıcı özelleştirme
 * mantığı (12.2) ve tutarlılık zinciri (10.1–10.2).
 */
import { describe, expect, it } from "vitest";
import {
  buildTemplate, deletionWarning, diffTemplate, literatureDepth, reportingStandards, scopeGuidance, capstoneGuidance,
  TEMPLATE_VERSION, type TemplateInput, approachRules, approachSectionGuidance, workTypeGuidance, stageNeedsData,
} from "@/lib/workflows";
import { cleanSavedSections } from "@/lib/structure-server";
import { consistencyChain } from "@/lib/quality/consistency-chain";
import { NOT_IN_MANUSCRIPT } from "@/lib/workflows/structure";
import { EN } from "@/i18n/en";
import { DE } from "@/i18n/de";

const keys = (p: Partial<TemplateInput>) => buildTemplate(p as TemplateInput).map((x) => x.key);
const sec = (p: Partial<TemplateInput>, k: string) => buildTemplate(p as TemplateInput).find((x) => x.key === k);
const DATA_STAGES = ["sample", "participants", "instruments", "findings", "results_article", "methods_article", "analysis"];

describe("12.1 zorunlu senaryolar", () => {
  it("1) Yüksek lisans, nicel, ilişkisel desenli tez: örneklem + ölçme araçları; nitel ölçütler yok", () => {
    const p = { workType: "thesis", level: "master", methodology: "quantitative", design: "correlational" };
    const k = keys(p);
    expect(k).toEqual(expect.arrayContaining(["problem", "purpose", "questions", "literature", "gaps", "method", "sample", "instruments", "analysis", "ethics", "findings", "discussion", "conclusion", "references"]));
    expect(k).not.toContain("participants");
    expect(k).not.toContain("trustworthiness");
    expect(k).not.toContain("integration");
    expect(reportingStandards({ workType: "thesis", approach: "quantitative", design: "correlational" })).toContain("APA JARS-Quant");
  });

  it("2) Yüksek lisans, nitel, fenomenolojik tez: çalışma grubu + inandırıcılık; örneklem yok", () => {
    const k = keys({ workType: "thesis", level: "master", methodology: "qualitative", design: "phenomenology" });
    expect(k).toContain("participants");
    expect(k).toContain("trustworthiness");
    expect(k).not.toContain("sample");
    expect(k).not.toContain("integration");
    expect(reportingStandards({ approach: "qualitative", design: "phenomenology" })).toEqual(expect.arrayContaining(["APA JARS-Qual", "COREQ"]));
  });

  it("3) Doktora, karma, açıklayıcı sıralı tez: entegrasyon zorunlu ve kritik; kuram ve boşluk var", () => {
    const p = { workType: "thesis", level: "doctorate", methodology: "mixed", design: "explanatory_sequential" };
    const k = keys(p);
    expect(k).toEqual(expect.arrayContaining(["theory", "gaps", "integration", "trustworthiness"]));
    expect(k.indexOf("findings")).toBeLessThan(k.indexOf("integration"));
    expect(k.indexOf("integration")).toBeLessThan(k.indexOf("discussion"));
    expect(sec(p, "integration")).toMatchObject({ requirement: "required", critical: true });
    expect(reportingStandards({ approach: "mixed", design: "explanatory_sequential" })).toContain("APA JARS-Mixed");
  });

  it("4–6) Nicel / nitel / karma araştırma makalesi: IMRaD; yöntem ve bulgu başlıkları yaklaşıma göre ayrışır, karma makalede entegrasyon", () => {
    const quant = buildTemplate({ workType: "research_article", level: "master", methodology: "quantitative" } as TemplateInput);
    const qual = buildTemplate({ workType: "research_article", level: "master", methodology: "qualitative" } as TemplateInput);
    const mixed = keys({ workType: "research_article", level: "master", methodology: "mixed" });
    expect(quant.map((x) => x.key)).toEqual(["title_abstract", "introduction", "methods_article", "results_article", "discussion_article", "declarations", "references", "appendices"]);
    // Başlıklar doğal kalır (“Yöntem”, “Bulgular”); yaklaşım farkı gerekçede ve yapay zekâ kurallarında
    expect(qual.find((x) => x.key === "methods_article")!.title).toBe("Yöntem");
    expect(qual.find((x) => x.key === "methods_article")!.why).toMatch(/refleksivite/);
    expect(quant.find((x) => x.key === "methods_article")!.why).toMatch(/istatistiksel raporlama/);
    expect(qual.find((x) => x.key === "results_article")!.why).toMatch(/tema/);
    expect(quant.find((x) => x.key === "appendices")).toMatchObject({ title: "Ek materyal", requirement: "optional" });
    // Makale tez kopyası değildir: bağımsız kuramsal çerçeve, örneklem bölümü vb. yok
    for (const x of ["theory", "concepts", "sample", "participants", "literature"]) expect(quant.map((y) => y.key)).not.toContain(x);
    expect(mixed).toContain("integration");
    expect(quant.map((x) => x.key)).not.toContain("integration");
  });

  it("7) Yazılım geliştirme odaklı bitirme projesi: gereksinim → tasarım → uygulama → test; yapay araştırma başlığı yok", () => {
    const k = keys({ workType: "capstone", level: "bachelor", variant: "software" });
    expect(k).toEqual(expect.arrayContaining(["requirements_analysis", "design_development", "implementation", "testing"]));
    for (const x of ["questions", "sample", "participants", "instruments", "analysis", "findings"]) expect(k).not.toContain(x);
    expect(capstoneGuidance("software")).toMatch(/hipotez/);
    expect(capstoneGuidance("research")).toBe("");
  });

  it("8) İşletme vaka analizi bitirme projesi: vaka bağlamı ve stratejik öneriler; istatistik/örneklem yok", () => {
    const k = keys({ workType: "capstone", level: "bachelor", variant: "business" });
    expect(k).toEqual(expect.arrayContaining(["case_context", "problem", "strategic_recommendations"]));
    for (const x of ["sample", "instruments", "testing", "implementation"]) expect(k).not.toContain(x);
  });

  it("9) Sistematik derleme: protokol, arama, tarama, veri çıkarımı, sentez; PRISMA", () => {
    const k = keys({ workType: "literature_review", level: "master", methodology: "systematic_review" });
    expect(k).toEqual(expect.arrayContaining(["review_protocol", "search_strategy", "source_screening", "data_extraction", "review_synthesis"]));
    expect(k).not.toContain("meta_analysis");
    expect(reportingStandards({ approach: "systematic_review" })).toEqual(["PRISMA 2020"]);
  });

  it("10) Meta-analiz: sistematik derleme adımlarına ek olarak meta-analiz bölümü (kullanıcı verisi gerekir)", () => {
    const k = keys({ workType: "literature_review", level: "doctorate", methodology: "meta_analysis" });
    expect(k.indexOf("data_extraction")).toBeLessThan(k.indexOf("meta_analysis"));
    expect(k.indexOf("meta_analysis")).toBeLessThan(k.indexOf("review_synthesis"));
    expect(literatureDepth({ approach: "meta_analysis" })).toMatch(/yeniden üretilebilir/);
  });

  it("11) Henüz veri toplanmamış araştırma önerisi: plan bölümleri var, bulgu/tartışma yok", () => {
    const k = keys({ workType: "research_proposal", level: "master", methodology: "quantitative" });
    expect(k).toEqual(expect.arrayContaining(["problem", "purpose", "questions", "literature", "method", "analysis", "risks", "proposal_timeline", "references"]));
    for (const x of ["findings", "results_article", "discussion", "conclusion", "integration"]) expect(k).not.toContain(x);
  });

  it("12) TÜBİTAK 2209-A: başvuru formunun bölümleri (özgün değer, yöntem, yönetim, riskler, yaygın etki, bütçe)", () => {
    const k = keys({ workType: "grant_proposal", level: "bachelor", program: "tubitak_2209a" });
    expect(k).toEqual(expect.arrayContaining(["grant_summary", "grant_originality", "grant_objectives", "grant_method", "grant_management", "grant_risks", "grant_impact", "grant_budget"]));
    for (const x of ["findings", "discussion", "sample"]) expect(k).not.toContain(x);
  });

  it("Dergi makalesi: dergi gereklilikleri ve kapak mektubu var ama makale metnine girmez", () => {
    const k = keys({ workType: "journal_article", level: "master", methodology: "theoretical" });
    expect(k).toContain("journal_requirements");
    expect(k).toContain("cover_letter");
    expect(NOT_IN_MANUSCRIPT.has("journal_requirements") && NOT_IN_MANUSCRIPT.has("cover_letter")).toBe(true);
  });

  it("Her şablonda bölüm anahtarları tekil; her bölümün gerekçesi var ve çevrilmiş; kaynakça sonda", () => {
    const all: Partial<TemplateInput>[] = [
      { workType: "thesis", level: "bachelor", methodology: "theoretical" },
      { workType: "thesis", level: "master", methodology: "quantitative", design: "experimental" },
      { workType: "thesis", level: "doctorate", methodology: "mixed" },
      { workType: "research_article", level: "master", methodology: "qualitative" },
      { workType: "journal_article", level: "master", methodology: "quantitative" },
      { workType: "capstone", level: "bachelor", variant: "education" },
      { workType: "capstone", level: "bachelor", variant: "research", methodology: "qualitative" },
      { workType: "literature_review", level: "master", methodology: "theoretical" },
      { workType: "research_proposal", level: "doctorate", methodology: "qualitative" },
      { workType: "grant_proposal", level: "master", program: "tubitak_1001" },
      { workType: "text_editing", level: "master" },
      { workType: "source_research", level: "master" },
    ];
    for (const p of all) {
      const t = buildTemplate(p as TemplateInput);
      const k = t.map((x) => x.key);
      expect(new Set(k).size, JSON.stringify(p)).toBe(k.length);
      for (const s of t) {
        expect(s.why, s.key).toBeTruthy();
        expect(EN[s.why], s.why).toBeTruthy();
        expect(DE[s.why], s.why).toBeTruthy();
        expect(EN[s.title], s.title).toBeTruthy();
      }
      if (k.includes("references")) expect(k.indexOf("references")).toBeGreaterThanOrEqual(k.length - 2);
    }
  });

  it("Gereksiz başlık gösterilmez: veri gerektiren bölümler kuramsal/derleme şablonlarına girmez", () => {
    for (const p of [{ workType: "thesis", level: "master", methodology: "theoretical" }, { workType: "literature_review", level: "master", methodology: "theoretical" }, { workType: "journal_article", level: "master", methodology: "theoretical" }]) {
      const k = keys(p);
      for (const d of DATA_STAGES) expect(k, `${JSON.stringify(p)} ${d}`).not.toContain(d);
    }
  });

  it("Yaklaşım kuralları (5 ve 5.1): nitelde hipotez/normallik yok, alıntı uydurulmaz; karmada entegrasyon ve meta-çıkarım; makale ve dergi yönergeleri", () => {
    expect(approachRules("qualitative")).toMatch(/Hipotez kullanılmaz/);
    expect(approachRules("qualitative")).toMatch(/ASLA uydurulmaz/);
    expect(approachRules("quantitative")).toMatch(/Kodlama, tema ve katılımcı alıntısı başlıkları kullanılmaz/);
    expect(approachRules("mixed")).toMatch(/meta-çıkarımlar entegrasyondan üretilir/);
    expect(approachRules("theoretical")).toBe("");
    expect(approachSectionGuidance("results_article", "qualitative")).toMatch(/hipotez testi YAZMA/);
    expect(approachSectionGuidance("findings", "mixed")).toMatch(/bütünleştirilmiş|birleştirilmiş/);
    expect(approachSectionGuidance("introduction", "quantitative")).toBe("");
    expect(workTypeGuidance("research_article")).toMatch(/kuramsal çerçeve bölümü makaleye eklenmez/);
    expect(workTypeGuidance("journal_article")).toMatch(/yazar rehberi/);
  });

  it("Dergi makalesi: veri yalnızca nicel/nitel/karma seçilirse istenir", () => {
    expect(stageNeedsData("results_article", { work_type: "journal_article", context: { methodology: "quantitative" } })).toBe(true);
    expect(stageNeedsData("results_article", { work_type: "journal_article", context: { methodology: "theoretical" } })).toBe(false);
    expect(stageNeedsData("results_article", { work_type: "journal_article", context: {} })).toBe(false);
  });

  it("Literatür derinliği akademik düzeye göre artar (6.3)", () => {
    expect(literatureDepth({ workType: "thesis", level: "bachelor" })).toMatch(/Temel kavramlar/);
    expect(literatureDepth({ workType: "thesis", level: "master" })).toMatch(/tematik ampirik sentez/);
    expect(literatureDepth({ workType: "thesis", level: "doctorate" })).toMatch(/eleştirel sentez/);
    expect(literatureDepth({ workType: "research_article", level: "doctorate" })).toMatch(/kelime sınırı/);
    expect(scopeGuidance("brief")).toMatch(/KISA/);
    expect(scopeGuidance("detailed")).toMatch(/AYRINTILI/);
    expect(scopeGuidance("standard")).toBe("");
  });
});

describe("12.2 kullanıcı özelleştirme", () => {
  const ctx = { workType: "thesis", level: "master", methodology: "quantitative" } as TemplateInput;
  const tpl = buildTemplate(ctx);

  it("kritik bölüm silinirken gerekçeli uyarı; isteğe bağlı bölümde uyarı yok", () => {
    expect(deletionWarning({ key: "method", title: "Yöntem" }, ctx)).toMatch(/kritik/);
    expect(deletionWarning({ key: "appendices", title: "Ekler" }, ctx)).toBeNull();
  });

  it("varsayılana dönüş: farklar (eklenecek, yeniden adlandırılacak, kaldırılacak) gösterilir; metni olan bölüm kaldırılabilir olarak işaretlenmez", () => {
    const stages = [
      ...tpl.filter((x) => x.key !== "ethics").map((x, i) => ({ id: `id${i}`, key: x.key, title: x.key === "method" ? "Benim yöntemim" : x.title, word_count: 0 })),
      { id: "c1", key: "custom_abc", title: "Kısaltmalar", word_count: 0 },
      { id: "c2", key: "custom_def", title: "Özel bölüm", word_count: 120 },
    ];
    const d = diffTemplate(stages, tpl);
    expect(d.add.map((x) => x.key)).toEqual(["ethics"]);
    expect(d.rename).toEqual([expect.objectContaining({ key: "method", from: "Benim yöntemim" })]);
    expect(d.remove).toEqual([expect.objectContaining({ id: "c1", hasText: false }), expect.objectContaining({ id: "c2", hasText: true })]);
  });

  it("aynı yapı → fark yok (şablon güncellemesi sessizce uygulanmaz, yalnızca fark gösterilir)", () => {
    const d = diffTemplate(tpl.map((x, i) => ({ id: `i${i}`, key: x.key, title: x.title })), tpl);
    expect(d).toEqual({ add: [], remove: [], rename: [] });
    expect(TEMPLATE_VERSION).toBeGreaterThanOrEqual(2);
  });

  it("kayıtlı şablon temizlenir: bilinmeyen anahtar atılır, özel bölüm korunur, alanlar sınırlanır", () => {
    const out = cleanSavedSections([
      { key: "method", title: "Yöntem", requirement: "optional", scope: "detailed", hidden: true },
      { key: "custom_x1", title: "Kısaltmalar" },
      { key: "<script>", title: "x" },
      { key: "unknown_key", title: "x" },
      { key: "findings", title: "B".repeat(500), requirement: "bogus", scope: "bogus" },
    ]);
    expect(out.map((x) => x.key)).toEqual(["method", "custom_x1", "findings"]);
    expect(out[0]).toMatchObject({ requirement: "optional", scope: "detailed", hidden: true });
    expect(out[2]).toMatchObject({ requirement: "required", scope: "standard", hidden: false });
    expect(out[2].title.length).toBe(200);
    expect(cleanSavedSections("x")).toEqual([]);
  });
});

describe("10. tutarlılık zinciri (puanı etkilemez)", () => {
  const base = { level: "master", program: null, design: null, variant: null } as const;
  const st = (key: string, text = "") => ({ key, title: key, text });

  it("karma yöntemde entegrasyon yoksa Kritik", () => {
    const items = consistencyChain({ ...base, workType: "thesis", methodology: "mixed", stages: [st("findings", "Bulgu metni burada."), st("integration", "")] });
    expect(items.find((x) => x.title === "Karma yöntemde veri entegrasyonu yok")?.level).toBe("critical");
  });

  it("hipotez var, analiz planı yok → Önemli; nitel yaklaşımda hipotez → Önemli", () => {
    const a = consistencyChain({ ...base, workType: "thesis", methodology: "quantitative", stages: [st("questions", "H1: Değişkenler arasında ilişki vardır."), st("analysis", "")] });
    expect(a.find((x) => x.title === "Hipotez var fakat analiz planı yok")?.level).toBe("important");
    const b = consistencyChain({ ...base, workType: "thesis", methodology: "qualitative", stages: [st("questions", "Hipotez: öğretmenler tükenmiştir.")] });
    expect(b.find((x) => x.title === "Nitel yaklaşımda hipotez")?.level).toBe("important");
  });

  it("tartışma bulgulardan önce yazılmışsa uyarır; kritik bölüm eksik veya gizliyse bildirir", () => {
    const tpl = buildTemplate({ workType: "thesis", level: "master", methodology: "quantitative" } as TemplateInput);
    const stages = tpl.filter((x) => x.key !== "ethics").map((x) => ({ key: x.key, title: x.title, text: x.key === "discussion" ? "Tartışma metni." : "", hidden: x.key === "method" }));
    const items = consistencyChain({ ...base, workType: "thesis", methodology: "quantitative", stages });
    expect(items.some((x) => x.title === "Tartışma bulgulardan önce yazılmış")).toBe(true);
    expect(items.some((x) => x.title === "Kritik bölüm yapıda yok" && x.stageKey === "ethics")).toBe(true);
    expect(items.some((x) => x.title === "Kritik bölüm gizlenmiş" && x.stageKey === "method")).toBe(true);
  });

  it("literatür yüzeyselse İyileştirme; yeterli kaynakta uyarı yok; boşluk bölümü boşsa bildirilir", () => {
    const thin = consistencyChain({ ...base, workType: "thesis", methodology: "quantitative", stages: [{ ...st("literature", "Metin."), citations: 3 }, st("gaps", "")] });
    expect(thin.find((x) => x.title === "Literatür kapsamı sınırlı görünüyor")).toMatchObject({ level: "improvement", vars: { n: 3 } });
    expect(thin.some((x) => x.title === "Araştırma boşluğu gösterilmemiş")).toBe(true);
    const rich = consistencyChain({ ...base, workType: "thesis", methodology: "quantitative", stages: [{ ...st("literature", "Metin."), citations: 14 }, st("gaps", "Boşluk.")] });
    expect(rich.some((x) => x.title === "Literatür kapsamı sınırlı görünüyor" || x.title === "Araştırma boşluğu gösterilmemiş")).toBe(false);
  });

  it("kuramsal çalışmada veri zinciri uyarısı çıkmaz", () => {
    const tpl = buildTemplate({ workType: "thesis", level: "master", methodology: "theoretical" } as TemplateInput);
    const items = consistencyChain({ ...base, workType: "thesis", methodology: "theoretical", stages: tpl.map((x) => ({ key: x.key, title: x.title, text: "Metin." })) });
    expect(items).toEqual([]);
  });
});
