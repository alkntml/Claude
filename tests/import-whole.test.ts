import { describe, expect, it } from "vitest";
import { libraryKeyFor, sectionText, splitIntoSections, textToNodes } from "@/lib/import/whole";
import type { JSONNode } from "@/lib/editor/doc";

const H = (level: number, text: string): JSONNode => ({ type: "heading", attrs: { level }, content: [{ type: "text", text }] });
const P = (text: string): JSONNode => ({ type: "paragraph", content: [{ type: "text", text }] });

/** D149: tüm çalışmayı içe aktarma */
describe("çalışmayı bölümlere ayırma", () => {
  it("belge başlığı ayrılır, en üst düzey başlıklar bölüm olur, numaralar silinir", () => {
    const nodes = [H(1, "Elektrikli Araçlar Tezi"), H(2, "1. GİRİŞ"), P("Giriş metni."), H(3, "1.1 Problem"), P("Problem metni."), H(2, "2. YÖNTEM"), P("Yöntem metni."), H(2, "BULGULAR"), P("Bulgu.")];
    const { docTitle, sections } = splitIntoSections(nodes);
    expect(docTitle).toBe("Elektrikli Araçlar Tezi");
    expect(sections.map((s) => s.title)).toEqual(["GİRİŞ", "YÖNTEM", "BULGULAR"]);
    expect(sections[0].nodes).toHaveLength(3);
    expect(sections.map((s) => s.libraryKey)).toEqual(["introduction", "method", "findings"]);
  });
  it("uzun ön metin ayrı bölüm; başlıksız belge tek bölüm", () => {
    const long = Array.from({ length: 50 }, () => "kelime").join(" ");
    expect(splitIntoSections([P(long), H(1, "Giriş"), P("x"), H(1, "Sonuç"), P("y")], { preambleTitle: "Ön metin" }).sections.map((s) => s.title)).toEqual(["Ön metin", "Giriş", "Sonuç"]);
    expect(splitIntoSections([P("yalnız metin")]).sections).toHaveLength(1);
  });
  it("düz metinden başlık ve paragraf", () => {
    const nodes = textToNodes("1. GİRİŞ\nBu çalışma elektrikli\naraçları incelemektedir.\n\n1.1 Amaç\nAmaç şudur.\n\nYÖNTEM\nNicel desen kullanılmıştır.");
    expect(nodes.map((n) => n.type)).toEqual(["heading", "paragraph", "heading", "paragraph", "heading", "paragraph"]);
    expect(nodes[1].content?.[0].text).toBe("Bu çalışma elektrikli araçları incelemektedir.");
    expect(nodes[2].attrs?.level).toBe(2);
    expect(sectionText(nodes).words).toBeGreaterThan(8);
    expect(libraryKeyFor("Tartışma")).toBe("discussion");
    expect(libraryKeyFor("Elektrikli araçların değeri")).toBeNull();
  });
});
