import { describe, expect, it } from "vitest";
import { newState, parseHeadingLines, planFixes, pushLog, MAX_LOG } from "@/lib/autopilot";
import { docToTokenMarkdown, markdownToDoc, restoreTokens, type JSONNode } from "@/lib/editor/doc";
import { sameHeading } from "@/lib/workflows/structure";

describe("otomatik çalışma kuralları (D77)", () => {
  it("kalite bulgularını düzeltme adımlarına çevirir", () => {
    const plan = planFixes([
      { category: "structure", severity: "warning", title: "Boş bölüm", stageKey: "gaps" },
      { category: "citations", severity: "warning", title: "Atıf içermeyen bölüm", stageKey: "literature" },
      { category: "citations", severity: "error", title: "Kaynak gerektiren iddia", stageKey: "problem" },
      { category: "language", severity: "warning", title: "Aşırı kesin iddia", stageKey: "discussion" },
      { category: "language", severity: "info", title: "Çok uzun cümle", stageKey: "method" },
      { category: "consistency", severity: "warning", title: "Hipotez–yöntem uyumsuzluğu", stageKey: "literature" },
      { category: "repetition", severity: "warning", title: "Bölüm içinde tekrar", stageKey: "discussion" },
      { category: "sources", severity: "warning", title: "Doğrulanmamış kaynak" },
      { category: "data", severity: "error", title: "Veri girilmesi gereken alan", stageKey: "findings" },
    ]);
    expect(plan.rewrite).toEqual(["gaps", "literature"]);
    expect(plan.placeholders).toEqual(["problem"]);
    expect(Object.keys(plan.revise)).toEqual(["discussion"]); // literatür yeniden yazılacağı için ayrıca gözden geçirilmez; yöntemdeki bilgi notu atlanır
    expect(plan.revise.discussion).toHaveLength(2);
    expect(plan.verifySources).toBe(true);
    expect(plan.dataPending).toBe(true);
  });
  it("alt başlık önerilerini temizler: numara, bölüm adı ve tekrar atılır, sınır uygulanır", () => {
    const text = "1. Literatür taraması\n## Kablo çekme makineleri\n- İnşaat robotiği\n* Kablo Çekme Makineleri\n3) İş gücü etkisi\nSürtünme ve kayma";
    expect(parseHeadingLines(text, "Literatür taraması", 3, sameHeading)).toEqual(["Kablo çekme makineleri", "İnşaat robotiği", "İş gücü etkisi"]);
  });
  it("günlük en fazla belirli sayıda kayıt tutar", () => {
    let s = newState();
    for (let i = 0; i < MAX_LOG + 10; i++) s = pushLog(s, `adım ${i}`);
    expect(s.log).toHaveLength(MAX_LOG);
    expect(s.log.at(-1)?.text).toBe(`adım ${MAX_LOG + 9}`);
  });
  it("bölüm düzeltmesinde atıflar ⟦Cn⟧ ile korunur ve geri yerleştirilir", () => {
    const cite = (id: string): JSONNode => ({ type: "citation", attrs: { ids: [id], locator: null, narrative: false } });
    const doc: JSONNode = { type: "doc", content: [
      { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "Kayma" }] },
      { type: "paragraph", content: [{ type: "text", text: "Sürtünme artar " }, cite("a"), { type: "text", text: " ve " }, cite("b"), { type: "text", text: "." }] },
    ] };
    const { md, tokens } = docToTokenMarkdown(doc);
    expect(md).toBe("## Kayma\n\nSürtünme artar ⟦C1⟧ ve ⟦C2⟧.");
    const revised = "## Kayma\n\nSürtünme belirgin biçimde artar ⟦C1⟧; benzer sonuç ⟦C2⟧ tarafından da bildirilmiştir.";
    const nodes = restoreTokens(markdownToDoc(revised, () => null).content ?? [], tokens);
    const ids = JSON.stringify(nodes).match(/"ids":\["(\w)"\]/g);
    expect(ids).toEqual(['"ids":["a"]', '"ids":["b"]']);
  });
});
