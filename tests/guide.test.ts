import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { GUIDE, QUICK_START } from "@/lib/guide";
import { GUIDE_DE } from "@/lib/guide-de";

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
  it("Almanca: rehberdeki her metnin karşılığı var, fazlalık yok", () => {
    const all: string[] = [];
    for (const q of QUICK_START) all.push(q.title.tr, q.text.tr);
    for (const c of GUIDE) {
      all.push(c.title.tr, c.intro.tr);
      for (const a of c.articles) for (const x of [a.title, ...a.steps, ...(a.where ? [a.where] : []), ...(a.tip ? [a.tip] : [])]) all.push(x.tr);
    }
    const keys = new Set(all);
    for (const k of keys) expect(GUIDE_DE[k]?.trim(), k).toBeTruthy();
    for (const k of Object.keys(GUIDE_DE)) expect(keys.has(k), k).toBe(true);
  });
});
