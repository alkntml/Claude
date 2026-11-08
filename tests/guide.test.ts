import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { GUIDE, QUICK_START } from "@/lib/guide";

describe("kullanım rehberi (D142)", () => {
  const ids = GUIDE.flatMap((c) => c.articles.map((a) => `${c.id}-${a.id}`));
  it("konu kimlikleri benzersiz, her konuda TR ve EN metin var", () => {
    expect(new Set(ids).size).toBe(ids.length);
    for (const c of GUIDE) for (const a of c.articles) {
      for (const x of [a.title, ...a.steps, ...(a.where ? [a.where] : []), ...(a.tip ? [a.tip] : [])]) { expect(x.tr.trim()).not.toBe(""); expect(x.en.trim()).not.toBe(""); }
      expect(a.steps.length).toBeGreaterThan(0);
    }
    expect(QUICK_START).toHaveLength(6);
  });
  it("rehberli turdaki “Ayrıntılı anlatım” bağlantıları var olan konulara gider", () => {
    const tour = fs.readFileSync(path.resolve(__dirname, "../src/components/workspace/tour.tsx"), "utf8");
    const more = [...tour.matchAll(/more: "([^"]+)"/g)].map((m) => m[1]);
    expect(more.length).toBeGreaterThan(10);
    for (const m of more) expect(ids).toContain(m);
  });
});
