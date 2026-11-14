/**
 * D189 — İstem önbelleği: bağlam üç parçadır. Proje boyunca sabit (head), bölüm boyunca sabit (mid) ve her istekte
 * değişen (tail) kısım. Mid, aynı bölümde bölüm metni ya da istek değişince aynı kalmalı (önbellekten okunur). İçerik
 * kaybolmamalı: bölüm talimatları, bölüm metni, ek kaynaklar ve diğer bölümler bağlamda bulunmalı.
 */
import { describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));

/* eslint-disable @typescript-eslint/no-explicit-any */
const fakeDb: any = new Proxy(() => fakeDb, { get: (_t, k) => (k === "then" ? (r: (v: unknown) => void) => r({ data: [], error: null }) : fakeDb), apply: () => fakeDb });
const src = (id: string, title: string, created_at: string) => ({ id, title, created_at, authors: [{ family: "Yılmaz" }], year: 2020, verified: true, access_level: "abstract", abstract: `${title} özet` });
const sources = Array.from({ length: 6 }, (_, i) => src(`s${i}`, ["Medya etkisi", "Propaganda", "Kitle toplumu", "Gündem belirleme", "Kullanımlar ve doyumlar", "Ekim kuramı"][i], `2026-01-0${i + 1}`));
const project = { id: "p", title: "Kitle iletişim kuramları", work_type: "thesis", academic_level: "master", language: "tr", citation_style: "apa7", context: {}, keywords: ["medya"] };
const doc = (text: string) => ({ type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text }] }] });
const stageWith = (text: string) => ({ id: "st1", key: "literature", title: "Literatür", content: doc(text), content_text: text, word_count: text.split(/\s+/).length });
const other = { id: "st0", key: "problem", title: "Problem durumu", content: doc("Problem metni burada yer alır."), content_text: "Problem metni burada yer alır.", word_count: 5 };

async function build(text: string, query: string) {
  const { buildContext } = await import("@/lib/ai/context");
  const stage = stageWith(text);
  return buildContext({ db: fakeDb, project, stage, stages: [other, stage], sources, memory: [], query, maxSources: 3 });
}

describe("istem önbelleği (D189)", () => {
  it("bölüm metni ve istek değişince bölüm boyunca sabit kısım (mid) aynı kalır", async () => {
    const a = await build("Gündem belirleme kuramı medyanın önemini anlatır.", "gündem belirleme");
    const b = await build("Gündem belirleme kuramı medyanın önemini anlatır. Yeni eklenen paragraf ekim kuramını tartışır.", "ekim kuramı kullanımlar");
    expect(a.head).toBe(b.head);
    expect(a.mid).toBe(b.mid);
    expect(a.tail).not.toBe(b.tail);
  });

  it("içerik kaybolmaz: talimatlar mid’de; bölüm metni ve ek kaynaklar tail’de; tümü text’te", async () => {
    const c = await build("Gündem belirleme kuramı medyanın önemini anlatır.", "gündem belirleme");
    expect(c.mid).toContain("## DİĞER BÖLÜMLERİN DURUMU");
    expect(c.mid).toContain("## ÜZERİNDE ÇALIŞILAN BÖLÜM: Literatür");
    expect(c.mid).not.toContain("Bölümün mevcut metni");
    expect(c.tail).toContain("Bölümün mevcut metni");
    expect(c.tail).toContain("## BU İSTEKLE İLGİLİ EK KAYNAKLAR");
    // Bölüm metni, bölüm talimatlarının hemen arkasından gelir (ek kaynaklar ondan sonra)
    expect(c.tail.indexOf("Bölümün mevcut metni")).toBeLessThan(c.tail.indexOf("## BU İSTEKLE İLGİLİ EK KAYNAKLAR"));
    for (const part of [c.head, c.mid, c.tail]) expect(c.text).toContain(part);
    expect(c.text.indexOf(c.mid)).toBeLessThan(c.text.indexOf(c.tail));
  });
});
