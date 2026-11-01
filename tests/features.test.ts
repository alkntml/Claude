import { describe, expect, it } from "vitest";
import { blockToTokenText, docToPlain, findPlaceholderBlocks, markdownToDoc, replaceBlockByText, restoreTokens, type JSONNode } from "@/lib/editor/doc";
import { daysLeft, deadlinePlan, logWords, neededPerWeek, weekStart, wordsThisWeek } from "@/lib/goals";
import { coverLines, resolveFormat } from "@/lib/export/format";
import { rankChunks } from "@/lib/ai/evidence";

const cite = (id: string): JSONNode => ({ type: "citation", attrs: { ids: [id], locator: null, narrative: false } });

describe("toplu [KAYNAK GEREKLİ] düzeltme", () => {
  const doc: JSONNode = { type: "doc", content: [
    { type: "paragraph", content: [{ type: "text", text: "Bağlanma erken gelişir " }, cite("u1"), { type: "text", text: ". Ayrıca kaygı artar [KAYNAK GEREKLİ]." }] },
    { type: "paragraph", content: [{ type: "text", text: "Sorunsuz paragraf." }] },
  ] };
  it("yer tutucu içeren paragrafları bulur", () => {
    expect(findPlaceholderBlocks(doc)).toHaveLength(1);
  });
  it("mevcut atıflar ⟦C1⟧ olarak korunur ve geri yüklenir", () => {
    const block = findPlaceholderBlocks(doc)[0];
    const { text, tokens } = blockToTokenText(block);
    expect(text).toBe("Bağlanma erken gelişir ⟦C1⟧. Ayrıca kaygı artar [KAYNAK GEREKLİ].");
    const fixed = markdownToDoc("Bağlanma erken gelişir ⟦C1⟧. Ayrıca kaygı artar [[kaynak:S1]].", (s) => (s === "S1" ? "u2" : null));
    const nodes = restoreTokens(fixed.content ?? [], tokens);
    const ids = JSON.stringify(nodes).match(/"ids":\["(u\d)"\]/g);
    expect(ids).toEqual(['"ids":["u1"]', '"ids":["u2"]']);
    const plain = docToPlain({ type: "doc", content: block.content });
    const out = replaceBlockByText(doc, plain, nodes)!;
    expect(findPlaceholderBlocks(out)).toHaveLength(0);
    expect(out.content).toHaveLength(2);
    expect(replaceBlockByText(doc, "yok böyle bir paragraf", nodes)).toBeNull();
  });
});

describe("yazım hedefi ve takvim", () => {
  const mon = new Date(2026, 10, 2, 10); // 2 Kasım 2026 pazartesi
  it("hafta pazartesi başlar", () => {
    expect(weekStart(new Date(2026, 10, 5)).getDate()).toBe(2);
  });
  it("ilk kayıtta mevcut metin bu haftaya sayılmaz", () => {
    const log = logWords({}, mon, 5200, 5000);
    expect(wordsThisWeek(log, mon, 5200)).toBe(200);
    const later = logWords(log, new Date(2026, 10, 4), 6000, 5200);
    expect(wordsThisWeek(later, new Date(2026, 10, 4), 6000)).toBe(1000);
  });
  it("kalan bölümleri haftalara dağıtır, son hafta düzeltmeye kalır", () => {
    const stages = ["A", "B", "C", "D", "E", "F"].map((title) => ({ title, status: "in_progress" }));
    const plan = deadlinePlan([...stages, { title: "Kaynakça", status: "not_started", key: "references" }], "2026-11-29", mon);
    expect(plan.length).toBe(4);
    expect(plan.flatMap((w) => w.stages)).toEqual(["A", "B", "C", "D", "E", "F"]);
    expect(plan[plan.length - 1].stages).toEqual([]);
    expect(daysLeft("2026-11-29", mon)).toBe(28);
    expect(neededPerWeek({ targetWords: 9000, deadline: "2026-11-29" }, 5000, mon)).toBe(1000);
  });
});

describe("biçim şablonu", () => {
  it("eksik alanlar şablondan tamamlanır, sınırlar uygulanır", () => {
    const f = resolveFormat({ fontSizePt: 40, margins: { top: 3, bottom: 2, left: 4, right: 2 } } as never);
    expect(f.fontSizePt).toBe(16);
    expect(f.margins.left).toBe(4);
    expect(f.preset).toBe("tez-tr");
    expect(f.chapterOnNewPage).toBe(true);
  });
  it("Türk tezi kapak satırları", () => {
    const f = resolveFormat({ cover: { showTC: true, university: "Hacettepe Üniversitesi", institute: "Sosyal Bilimler Enstitüsü", thesisType: "Yüksek Lisans Tezi", advisor: "Prof. Dr. A B", city: "Ankara", year: "2027" } });
    const c = coverLines(f, { title: "İlişki odaklı OKB", subtitle: "", author: "Ayşe", date: "", language: "tr" });
    expect(c.top).toEqual(["T.C.", "HACETTEPE ÜNİVERSİTESİ", "SOSYAL BİLİMLER ENSTİTÜSÜ"]);
    expect(c.title).toBe("İLİŞKİ ODAKLI OKB");
    expect(c.advisor).toBe("Danışman\nProf. Dr. A B");
    expect(c.bottom).toBe("Ankara, 2027");
  });
});

describe("atıf doğrulama parça seçimi", () => {
  const chunks = [
    { content: "Introduction about attachment theory in infancy.", page_hint: "s. 170" },
    { content: "Relationship obsessive compulsive disorder involves doubts about the partner.", page_hint: "s. 172" },
    { content: "Method: participants were 200 students.", page_hint: "s. 174" },
  ];
  it("anahtar kelimeye ve verilen sayfaya göre sıralar", () => {
    expect(rankChunks(chunks, ["partner doubts relationship"], null, 1)[0].page).toBe("172");
    expect(rankChunks(chunks, ["partner doubts"], "174", 1)[0].page).toBe("174");
  });
});
