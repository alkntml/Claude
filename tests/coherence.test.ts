/** D182: bölümler arası bütünlük — omurga, bölüm kuralları, ana hat ve deterministik denetimler */
import { describe, expect, it } from "vitest";
import { aimOf, coherenceRule, hypothesisLabels, keyTerms, outlineBlock, researchQuestionsOf, spineBlock, termCoverage } from "@/lib/coherence";
import { consistencyChain } from "@/lib/quality/consistency-chain";
import { quickActions } from "@/lib/workflows/quick-actions";

const lorem = (s: string, n: number) => Array(n).fill(s).join(" ");
const stages = [
  { key: "purpose", title: "Amaç", text: "Bu araştırmanın amacı üniversite öğrencilerinde sosyal medya kullanımı ile akademik erteleme arasındaki ilişkiyi incelemektir." },
  { key: "questions", title: "Sorular", text: "1. Sosyal medya kullanımı akademik ertelemeyi yordamakta mıdır?\n2. Akademik erteleme cinsiyete göre farklılaşmakta mıdır?\nH1: Sosyal medya kullanımı akademik ertelemeyi pozitif yordar.\nH2: Erteleme cinsiyete göre farklılaşır." },
];
const base = { workType: "thesis", level: "master", methodology: "quantitative", program: null, design: null, variant: null, title: "Üniversite öğrencilerinde sosyal medya kullanımı ve akademik erteleme" };

describe("omurga ve bölüm kuralları", () => {
  it("amaç, araştırma soruları ve hipotezler bölümlerden çıkarılır", () => {
    const p = { title: base.title, stages };
    expect(aimOf(p)).toMatch(/amacı/);
    expect(researchQuestionsOf(p)).toHaveLength(4);
    const sp = spineBlock({ ...p, methodologyLabel: "Nicel" });
    expect(sp).toContain("ÇALIŞMANIN OMURGASI");
    expect(sp).toContain("akademik ertelemeyi yordamakta");
    expect(sp).toContain("BÜTÜNLÜK KURALI");
    expect(sp).toMatch(/kaynak veya bulgu değildir/);
  });
  it("kurgu varsa kurgudaki amaç ve sorular önceliklidir; hiçbiri yoksa kullanıcının yazdığı sorular", () => {
    expect(aimOf({ title: "x", blueprint: { purpose: "Kurgudaki amaç" }, stages })).toBe("Kurgudaki amaç");
    expect(researchQuestionsOf({ title: "x", stages: [], researchQuestions: "Birinci soru?\nİkinci soru?" })).toEqual(["Birinci soru?", "İkinci soru?"]);
  });
  it("bölüm türüne göre bütünlük görevi ve ana hat", () => {
    expect(coherenceRule("discussion")).toMatch(/araştırma sorusu\/hipotez ve literatür/);
    expect(coherenceRule("conclusion")).toMatch(/Her araştırma sorusunu/);
    expect(coherenceRule("bilinmeyen")).toMatch(/amacına/);
    const ol = outlineBlock([{ key: "literature", title: "Literatür", text: "x", headings: ["Sosyal medya", "Erteleme"] }, { key: "method", title: "Yöntem", text: "" }], "method");
    expect(ol).toContain("Literatür: Sosyal medya · Erteleme");
    expect(ol).toContain("Yöntem ← ÜZERİNDE ÇALIŞILAN (henüz yazılmadı)");
  });
  it("tutarlılık kontrolü her bölümde; “Bütünle uyumla” seçili metin eylemi", () => {
    for (const k of ["literature", "method", "findings", "topic", "concepts"]) expect(quickActions(k, { lowSources: false, hasData: false, longSection: false })).toContain("consistency");
  });
});

describe("deterministik bütünlük denetimleri", () => {
  it("anahtar terim kapsaması ve hipotez etiketleri", () => {
    const terms = keyTerms({ title: base.title, stages });
    expect(terms.length).toBeGreaterThanOrEqual(3);
    expect(termCoverage("Sosyal medya kullanımı akademik ertelemeyi artırır.", terms).share).toBeGreaterThan(0.4);
    expect(termCoverage(lorem("Hava durumu ve iklim değişikliği tarımı etkiler.", 3), terms).share).toBeLessThan(0.3);
    expect(hypothesisLabels("H1 desteklendi, H2 desteklenmedi; H1 tekrar.")).toEqual(["H1", "H2"]);
  });
  it("amaçtan kopuk bölüm, eksik hipotez ve yanıtlanmamış soru uyarılır; uyumlu çalışmada uyarı çıkmaz", () => {
    const off = lorem("Hava durumu ve iklim değişikliği tarım üretimini farklı biçimlerde etkilemektedir.", 20);
    const bad = consistencyChain({ ...base, stages: [...stages, { key: "literature", title: "Literatür", text: off }, { key: "findings", title: "Bulgular", text: lorem("H1 desteklenmiştir; sosyal medya kullanımı akademik ertelemeyi yordamaktadır.", 10) }, { key: "conclusion", title: "Sonuç", text: lorem("Sosyal medya kullanımı akademik ertelemeyi yordamaktadır ve öğrenciler etkilenmektedir.", 10) }] });
    const titles = bad.map((x) => x.title);
    expect(titles).toContain("Bölümün çalışmanın amacıyla bağı zayıf görünüyor");
    expect(bad.find((x) => x.title === "Hipotez ilgili bölümde ele alınmamış")).toMatchObject({ level: "important", vars: { h: "H2" } });
    expect(bad.find((x) => x.title === "Sonuçta yanıtlanmamış görünen araştırma soruları")?.vars?.list).toBe("2");
    const good = consistencyChain({ ...base, stages: [...stages,
      { key: "literature", title: "Literatür", text: lorem("Üniversite öğrencilerinde sosyal medya kullanımı ile akademik erteleme ilişkisi çok sayıda çalışmada ele alınmıştır.", 15) },
      { key: "findings", title: "Bulgular", text: lorem("H1 ve H2 test edilmiştir; sosyal medya kullanımı akademik ertelemeyi yordamaktadır.", 10) },
      { key: "conclusion", title: "Sonuç", text: lorem("Sosyal medya kullanımı akademik ertelemeyi yordamaktadır; akademik erteleme cinsiyete göre farklılaşmaktadır.", 10) }] });
    expect(good.map((x) => x.title).filter((x) => /bağı zayıf|Hipotez ilgili|yanıtlanmamış/.test(x))).toEqual([]);
  });
});
