import { describe, expect, it } from "vitest";
import { applyReview, decideNext, issueKey, newState, type IssueLike } from "@/lib/autopilot";
import { costFor } from "@/lib/ai/cost";
import { collapseDrafts, compactHistory } from "@/lib/ai/history";
import { selectContextSources } from "@/lib/ai/context";
import { blueprintContext, blueprintStageNote, emptyBlueprint } from "@/lib/blueprint";

describe("API maliyeti (D78)", () => {
  it("önbellekten okunan girdiyi %10, yazılanı %125 fiyatla hesaplar", () => {
    const price = { in: 2, out: 10 };
    expect(costFor(price, 1_000_000, 0)).toBeCloseTo(2);
    expect(costFor(price, 1_000_000, 0, { cacheRead: 1_000_000 })).toBeCloseTo(0.2);
    expect(costFor(price, 1_000_000, 0, { cacheWrite: 1_000_000 })).toBeCloseTo(2.5);
    expect(costFor(price, 100_000, 10_000, { cacheRead: 80_000 })).toBeCloseTo((20_000 * 2 + 8_000 * 2 + 10_000 * 10) / 1e6);
    expect(costFor(undefined, 5, 5)).toBe(0);
  });

  it("geçmişteki eski taslakları kısa notla özetler, son yanıtı korur", () => {
    const draft = `Açıklama\n:::taslak\n## Kuram\n${"kelime ".repeat(500)}\n:::\nSon not`;
    expect(collapseDrafts(draft)).toMatch(/^Açıklama\n\[Bu yanıtta yaklaşık 50\d kelimelik bir taslak verildi \(başlıklar: Kuram\)/);
    expect(collapseDrafts(draft)).toContain("Son not");
    const h = compactHistory([
      { role: "assistant", content: "selam" },
      { role: "user", content: "yaz" },
      { role: "assistant", content: draft },
      { role: "user", content: "devam" },
      { role: "assistant", content: draft },
    ]);
    expect(h[0].role).toBe("user");
    expect(h[1].content).not.toContain("kelime kelime");
    expect(h[3].content).toBe(draft);
  });

  it("kaynak listesi isteğe göre değişmez; sınır aşılınca ek kaynaklar değişken kısma girer", () => {
    const src = Array.from({ length: 5 }, (_, i) => ({ id: `s${i}`, t: i === 4 ? "motivasyon" : "öğrenme" }));
    const score = (s: { t: string }, q: string) => (q.includes(s.t) ? 1 : 0);
    const a = selectContextSources(src, { max: 10, projectQuery: "öğrenme", query: "motivasyon", citedHere: new Set(), score });
    const b = selectContextSources(src, { max: 10, projectQuery: "öğrenme", query: "başka", citedHere: new Set(), score });
    expect(a.head.map((x) => x.id)).toEqual(b.head.map((x) => x.id));
    expect(a.head.map((x) => x.id)).toEqual(["s0", "s1", "s2", "s3", "s4"]);
    const c = selectContextSources(src, { max: 3, projectQuery: "öğrenme", query: "motivasyon", citedHere: new Set(["s3"]), score });
    expect(c.head.map((x) => x.id)).toEqual(["s0", "s1", "s2"]);
    expect(c.extra.map((x) => x.id).sort()).toEqual(["s3", "s4"]);
  });

  it("bölüme özel kurgu notu genel kurgudan ayrılır", () => {
    const bp = { ...emptyBlueprint(), aim: "Amaç", chapters: [{ stageId: "x", key: "theory", title: "Kuram", plan: "Plan", words: 900 }] };
    expect(blueprintContext(bp, null)).not.toContain("BU BÖLÜMÜN");
    expect(blueprintStageNote(bp, { id: "x", key: "theory" })).toContain("900 kelime");
  });
});

describe("otomatik çalışmada döngü önleme (D78)", () => {
  const data: IssueLike = { category: "data", severity: "error", title: "Veri girilmesi gereken alan", detail: "3 alanda", stageKey: "findings" };
  const lang: IssueLike = { category: "language", severity: "warning", title: "Uzun cümleler", detail: "4 cümle", stageKey: "theory" };
  const info: IssueLike = { category: "language", severity: "info", title: "Çift boşluk", stageKey: "theory" };
  const dup: IssueLike = { category: "sources", severity: "info", title: "Kullanılmayan kaynak" };

  it("sayılar değişse de aynı bulguyu tanır", () => {
    expect(issueKey(lang)).toBe(issueKey({ ...lang, detail: "7 cümle" }));
  });

  it("düzeltilebilir bulgu bir kez düzeltilir, sonra kullanıcıya sorulur", () => {
    const st = { ...newState(), round: 0 };
    const first = decideNext(70, [data, lang], st);
    expect(first.kind).toBe("fix");
    if (first.kind !== "fix") return;
    expect(Object.keys(first.plan.revise)).toEqual(["theory"]);
    expect(first.keys).toEqual([issueKey(lang)]);
    const second = decideNext(72, [data, { ...lang, detail: "2 cümle" }], { ...st, round: 1, attempted: first.keys });
    expect(second.kind).toBe("review");
    if (second.kind !== "review") return;
    expect(second.pending.map((p) => [p.reason, p.fixable])).toEqual([["data", false], ["attempted", true]]);
  });

  it("kullanıcının seçimi uygulanır: kalsın denenler yok sayılır, düzelt denen bir kez daha denenir", () => {
    const st = { ...newState(), round: 1, attempted: [issueKey(lang)] };
    const r = decideNext(72, [data, lang, info, dup], st);
    if (r.kind !== "review") throw new Error("review bekleniyordu");
    expect(r.pending.find((p) => p.key === issueKey(dup))?.fixable).toBe(false);
    const next = applyReview({ ...st, pending: r.pending }, [issueKey(lang), issueKey(data), issueKey(info)]);
    expect(next.ignored).toEqual(expect.arrayContaining([issueKey(data), issueKey(dup)]));
    expect(next.attempted).toEqual([]);
    const again = decideNext(72, [data, lang, info, dup], next);
    expect(again.kind).toBe("fix");
    if (again.kind === "fix") expect(again.plan.revise.theory.map((x) => x.title)).toEqual(["Uzun cümleler", "Çift boşluk"]);
    // Hepsi kabul edildiyse teslim
    const keepAll = applyReview({ ...st, pending: r.pending }, []);
    expect(decideNext(72, [data, lang, info, dup], keepAll).kind).toBe("done");
  });

  it("hedef puanda doğrudan teslim", () => {
    expect(decideNext(90, [lang], newState()).kind).toBe("done");
  });
});

import { KNOWN_PRICES, cacheSavings, resolvePrice } from "@/lib/ai/cost";
import { costHealth, monthProjection } from "@/lib/insights";

describe("model fiyatları (D94)", () => {
  it("Opus 5.5 önbellek okuması girdi fiyatının %5’i ($0.20/MTok)", () => {
    expect(costFor(KNOWN_PRICES["claude-opus-5-5"], 1_000_000, 0, { cacheRead: 1_000_000 })).toBeCloseTo(0.2);
    expect(costFor(KNOWN_PRICES["claude-sonnet-5-5"], 1_000_000, 0, { cacheRead: 1_000_000 })).toBeCloseTo(0.2);
  });
  it("Haiku 5.5: 100 bin token üstü istemde uzun istem fiyatı", () => {
    const h = KNOWN_PRICES["claude-haiku-5-5"];
    expect(costFor(h, 100_000, 1_000_000)).toBeCloseTo(0.01 + 0.5);
    expect(costFor(h, 200_000, 1_000_000)).toBeCloseTo(0.1 + 2.5);
  });
  it("tarih ekli, aile ve bilinmeyen model adları sıfır maliyete düşmez", () => {
    expect(resolvePrice("claude-sonnet-5-5", {}).match).toBe("exact");
    expect(resolvePrice("claude-sonnet-5-5-20261001", {}).match).toBe("alias");
    const fam = resolvePrice("claude-opus-6", {});
    expect(fam.match).toBe("family");
    expect(fam.price?.in).toBe(4);
    const unk = resolvePrice("mystery-model", {});
    expect(unk.match).toBe("unknown");
    expect(unk.price?.out).toBe(50); // en pahalı bilinen fiyat (eksik değil fazla tahmin)
  });
  it("yönetici fiyat tablosu girdi/çıktıyı değiştirir, önbellek kuralı korunur", () => {
    const { price } = resolvePrice("claude-opus-5-5", { "claude-opus-5-5": { in: 5, out: 25 } });
    expect(price).toMatchObject({ in: 5, out: 25, cacheRead: 0.05 });
  });
  it("önbellek tasarrufu", () => {
    const p = KNOWN_PRICES["claude-sonnet-5-5"];
    expect(cacheSavings(p, 1_000_000, 0, { cacheRead: 1_000_000 })).toBeCloseTo(1.8);
    expect(cacheSavings(p, 1_000_000, 0, { cacheWrite: 1_000_000 })).toBeCloseTo(-0.5);
  });
});

describe("maliyet sağlığı (D94)", () => {
  it("ortalama istek, önbellek isabeti, yarım/başarısız maliyet ve fiyatı tanımsız model", () => {
    const h = costHealth([
      { kind: "ai_request", quantity: 1, tokens_in: 100_000, tokens_out: 1000, cost_usd: 0.05, model: "claude-sonnet-5-5", meta: { cache: { r: 80_000, w: 0 } } },
      { kind: "ai_request", quantity: 1, tokens_in: 10_000, tokens_out: 500, cost_usd: 0.03, model: "claude-sonnet-5-5", meta: { partial: true } },
      { kind: "ai_request", quantity: 0, tokens_in: 5_000, tokens_out: 500, cost_usd: 0.02, model: "claude-opus-9", meta: { failed: true } },
      { kind: "quality_check", quantity: 1, tokens_in: 1000, tokens_out: 100, cost_usd: 0.001, model: "claude-haiku-5-5", meta: {} },
      { kind: "source_search", quantity: 3, tokens_in: 0, tokens_out: 0, cost_usd: 0, model: null, meta: {} },
    ], {});
    expect(h.requests).toBe(2);
    expect(h.aiCost).toBeCloseTo(0.101);
    expect(h.avgRequestUsd).toBeCloseTo(0.0505);
    expect(h.cache.readTokens).toBe(80_000);
    expect(h.cache.hitRate).toBeCloseTo(68.7, 0);
    expect(h.cache.savingsUsd).toBeCloseTo(80_000 * 0.9 * 2 / 1e6);
    expect(h.partialUsd).toBeCloseTo(0.03);
    expect(h.failedUsd).toBeCloseTo(0.02);
    expect(h.unpriced).toEqual(["claude-opus-9"]);
  });
  it("ay sonu tahmini", () => {
    // 10 Kasım 12:00 TR → 9,5 gün geçti, 30 günlük ay
    expect(monthProjection(19, new Date("2026-11-10T09:00:00Z"))).toBeCloseTo(60);
    expect(monthProjection(5, new Date("2026-11-01T00:30:00Z"))).toBeNull();
  });
});
