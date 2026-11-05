import { describe, expect, it } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { htmlToNodes } from "@/lib/import/html-doc";
import { fitHeadings, linkCitations, matchCitation, parseReference, splitReferences } from "@/lib/import/references";
import { docToPlain, type JSONNode } from "@/lib/editor/doc";

const html = `<p>1.3 Değişkenlerin Ölçülmesi</p><a id="x"></a><h1>1.3 Değişkenlerin Ölçülmesi</h1><p>Giriş metni.</p><h2>1.3.1 ISO 14001 Süreci</h2>
<p>Dinçer (2006), modellemiştir. Mındıkoğlu ve Duygu’nun (2009) biçimine uygun olarak (Fonseca, 2015; Choi, 2021, s. 320). Salwin vd. (2026) ve (Bilinmeyen, 1999).</p>
<table><thead><tr><th><p>Değişken</p></th><th><p>Kaynak</p></th></tr></thead><tbody><tr><td><p>ISO</p></td><td><p>Dinçer (2006)</p></td></tr><tr><td></td><td><p><strong>Kalın</strong> ve <em>italik</em></p></td></tr></tbody></table>
<h1>Kaynakça</h1>
<p>Choi, Y. (2021). A study of employee acceptance of artificial intelligence technology. European Journal of Management and Business Economics, 30(3), 318–330. https://doi.org/10.1108/ejmbe-06-2020-0158</p>
<p>Dinçer, S. (2006). ISO 14001 çevre yönetim sistemi. Öneri Dergisi, 7(25), 243–253. https://doi.org/10.14783/maruoneri.677835</p>
<p>Fonseca, L. M. C. M. (2015). ISO 14001:2015: An improved tool for sustainability. Journal of Industrial Engineering and Management, 8(1), 37–50. https://doi.org/10.3926/jiem.1298</p>
<p>Mındıkoğlu, B., &amp; Duygu, A. E. (2009). ISO 14001 standardı. Ankara Üniversitesi Çevrebilimleri Dergisi, 1(2), 93–109.</p>
<p>Salwin, M., Kocot, M., Kwasek, A., &amp; Pałęga, M. (2026). Perceived benefits and barriers. Sustainability, 18(11), Article 5535. https://doi.org/10.3390/su18115535</p>
<p>Ibrahim, F., Münscher, J.-C., Daseking, M., &amp; Telle, N. (2025). The technology acceptance model. Frontiers in Artificial Intelligence, 7.</p>`;

describe("belgeden içe aktarma (D87)", () => {
  it("HTML’i başlık, paragraf ve tabloya çevirir; kaynakçayı ayırır", () => {
    const { nodes } = htmlToNodes(html);
    const { body, refs } = splitReferences(nodes);
    expect(refs).toHaveLength(6);
    expect(body.some((n) => n.type === "table")).toBe(true);
    const table = body.find((n) => n.type === "table")!;
    expect(table.content![0].content![0].type).toBe("tableHeader");
    expect(JSON.stringify(table)).toContain('"marks":[{"type":"bold"}]');
    expect(docToPlain({ type: "doc", content: body })).not.toContain("Kaynakça");
  });

  it("kaynak satırını ayrıştırır (yazarlar, yıl, DOI, başlık)", () => {
    const r = parseReference("Mındıkoğlu, B., & Duygu, A. E. (2009). ISO 14001 standardı. Ankara Üniversitesi Çevrebilimleri Dergisi, 1(2), 93–109. https://doi.org/10.1501/Csaum_0000000018.");
    expect(r.families).toEqual(["Mındıkoğlu", "Duygu"]);
    expect(r.year).toBe(2009);
    expect(r.doi).toBe("10.1501/Csaum_0000000018");
    expect(r.title).toBe("ISO 14001 standardı");
    expect(parseReference("Ibrahim, F., Münscher, J.-C., Daseking, M., & Telle, N. (2025). T. X.").families).toEqual(["Ibrahim", "Münscher", "Daseking", "Telle"]);
  });

  it("metin içi atıfları bağlar; eşleşmeyeni olduğu gibi bırakıp raporlar", () => {
    const { nodes } = htmlToNodes(html);
    const { body, refs } = splitReferences(nodes);
    const keys = refs.map((r, i) => { const p = parseReference(r); return { id: `s${i}`, families: p.families, year: p.year }; });
    const { nodes: linked, report } = linkCitations(body, keys);
    const cites: JSONNode[] = [];
    const walk = (n: JSONNode) => { if (n.type === "citation") cites.push(n); n.content?.forEach(walk); };
    linked.forEach(walk);
    expect(cites.map((c) => [c.attrs!.ids, !!c.attrs!.narrative, !!c.attrs!.suppressAuthor, c.attrs!.locator])).toEqual([
      [["s1"], true, false, null],          // Dinçer (2006)
      [["s3"], false, true, null],          // Mındıkoğlu ve Duygu’nun (2009) → yalnızca yıl
      [["s2", "s0"], false, false, null],   // (Fonseca, 2015; Choi, 2021, s. 320)
      [["s4"], true, false, null],          // Salwin vd. (2026)
      [["s1"], true, false, null],          // tablodaki Dinçer (2006)
    ]);
    expect(report.linked).toBe(5);
    expect(report.unmatched).toEqual(["(Bilinmeyen, 1999)"]);
    expect(JSON.stringify(linked)).toContain("Mındıkoğlu ve Duygu’nun ");
    expect(matchCitation("Choi", "2021", keys)).toBe("s0");
    expect(matchCitation("Choi", "2020", keys)).toBeNull();
  });

  it("başlıkları çalışmaya oturtur: numaralar silinir, yinelenen başlık atılır, düzey kaydırılır", () => {
    const { nodes } = htmlToNodes(html);
    const fitted = fitHeadings(splitReferences(nodes).body, { base: 2, max: 4 });
    const hs = fitted.filter((n) => n.type === "heading").map((n) => [n.attrs!.level, docToPlain({ type: "doc", content: [n] }).trim()]);
    expect(hs).toEqual([[2, "Değişkenlerin Ölçülmesi"], [3, "ISO 14001 Süreci"]]);
    expect(docToPlain({ type: "doc", content: fitted }).match(/Değişkenlerin Ölçülmesi/g)).toHaveLength(1);
    const inside = fitHeadings(splitReferences(nodes).body, { base: 3, max: 3, dropTitle: (t) => t.includes("Değişkenlerin") });
    expect(inside.filter((n) => n.type === "heading").map((n) => n.attrs!.level)).toEqual([3]);
  });

  const sample = "/root/.claude/uploads/34918334-c0c2-5550-980b-63b0e058622f/d5bfcc43-Degiskenlerin_Olculmesi_kopyas_.docx";
  it.skipIf(!existsSync(sample))("kullanıcının örnek belgesinde kaynakçadaki tüm atıflar eşleşir", async () => {
    const mammoth = await import("mammoth");
    const r = await mammoth.convertToHtml({ buffer: readFileSync(sample) }, { styleMap: ["p[style-name='Title'] => h1:fresh"] });
    const { body, refs } = splitReferences(htmlToNodes(r.value).nodes);
    expect(refs).toHaveLength(9);
    const keys = refs.map((x, i) => { const p = parseReference(x); return { id: `s${i}`, families: p.families, year: p.year }; });
    const { report } = linkCitations(body, keys);
    // Kaynakçada olmayan ikincil kaynaklar (“akt.” ile verilenler) metin olarak kalır
    expect(report.unmatched).toEqual(["Venkatesh vd. (2012)", "Lu vd.’nin (2019)", "Sohn ve Kwon’un (2020)", "Rafferty ve Minbashian (2019)", "Çalışkan (2022)", "Karaca vd. (2021)"]);
    expect(report.linked).toBeGreaterThan(15);
  });
});
