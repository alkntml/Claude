import { describe, expect, it } from "vitest";
import { TOOL_GUIDES } from "@/lib/tools/guides";
import { TOOL_GUIDES_DE } from "@/lib/tools/guides-de";
import { SAMPLES_DE } from "@/lib/samples-de";
import * as S from "@/lib/samples";

/** D143: Almanca içerik dosyaları kaynak metinle aynı yapıda ve eksiksiz olmalı */
describe("Almanca içerik", () => {
  it("araç rehberleri: her araç için aynı bölüm, liste ve SSS sayısı; bağlantılar korunur", () => {
    expect(Object.keys(TOOL_GUIDES_DE).sort()).toEqual(Object.keys(TOOL_GUIDES).sort());
    for (const [path, g] of Object.entries(TOOL_GUIDES)) {
      const d = TOOL_GUIDES_DE[path], en = g.en;
      expect(d.sections.length, path).toBe(en.sections.length);
      expect(d.faq.length, path).toBe(en.faq.length);
      d.sections.forEach((s, i) => {
        expect(s.p.length, `${path} ${i}`).toBe(en.sections[i].p.length);
        expect(s.list?.length ?? 0, `${path} ${i}`).toBe(en.sections[i].list?.length ?? 0);
      });
      const links = (x: unknown) => JSON.stringify(x).match(/\]\([^)]+\)/g)?.sort() ?? [];
      expect(links(d).length, path).toBe(links(en).length);
      for (const l of links(d)) expect(l.startsWith("](/de/"), l).toBe(true);
      expect((JSON.stringify(d).match(/\*\*/g) ?? []).length % 2).toBe(0);
    }
  });
  it("örnek çıktılar: her metnin Almancası var", () => {
    const keys = new Set<string>();
    const walk = (v: unknown) => {
      if (!v || typeof v !== "object") return;
      const o = v as Record<string, unknown>;
      if (typeof o.tr === "string" && typeof o.en === "string") { keys.add(o.tr); return; }
      for (const k in o) walk(o[k]);
    };
    for (const v of Object.values(S)) walk(v);
    for (const k of keys) expect(SAMPLES_DE[k], k).toBeTruthy();
    expect(Object.keys(SAMPLES_DE).length).toBe(keys.size);
  });
});

describe("Almanca blog", () => {
  it("her yazının Almancası var; başlık ≤60, açıklama ≤160, iç bağlantılar Almanca yazılara gider", async () => {
    const { POSTS, DE_POSTS } = await import("@/lib/blog");
    const slugs = new Set(Object.values(DE_POSTS).map((p) => p.slug));
    expect(slugs.size).toBe(POSTS.length);
    for (const p of POSTS) {
      const d = DE_POSTS[p.slug];
      expect(d, p.slug).toBeTruthy();
      expect((d.seoTitle ?? d.title).length, p.slug).toBeLessThanOrEqual(60);
      expect(d.description.length, p.slug).toBeLessThanOrEqual(160);
      for (const m of d.body.matchAll(/\]\((\/[^)]+)\)/g)) {
        expect(m[1].startsWith("/de/"), m[1]).toBe(true);
        if (m[1].startsWith("/de/blog/")) expect(slugs.has(m[1].slice(9)), m[1]).toBe(true);
      }
    }
  });
});
