import { beforeEach, describe, expect, it, vi } from "vitest";

const calls: string[] = [];
vi.mock("@/lib/ai/registry", () => ({
  resolveModel: async () => ({ provider: "anthropic", model: "claude-haiku-5-5" }),
  isProviderConfigured: () => true,
  estimateCost: async () => 0.001,
  complete: async (_m: unknown, req: { system: string; messages: { content: string }[] }) => {
    calls.push(req.system.slice(0, 20));
    const ids = [...req.messages[0].content.matchAll(/\[([a-z0-9]+)\]/g)].map((m) => m[1]);
    if (req.system.includes("anahtar kelime")) return { text: JSON.stringify({ items: ids.map((id) => ({ id, keywords: ["anxiety"] })) }), usage: { input: 10, output: 5 }, model: "claude-haiku-5-5" };
    return { text: JSON.stringify({ items: [
      { id: ids[0], verdict: "supports", explanation: "Destekliyor.", quote: "anxiety lowers achievement", quotePage: "4" },
      { id: ids[1], verdict: "partial", explanation: "Kısmen.", quote: "uydurma alıntı kaynakta yok", quotePage: "9" },
    ] }), usage: { input: 100, output: 50 }, model: "claude-haiku-5-5" };
  },
}));

import { auditSources } from "@/lib/claim-audit";

describe("iddia denetimi motoru (D119)", () => {
  beforeEach(() => { calls.length = 0; });
  it("kaynak başına toplu karar verir; kaynak metninde olmayan alıntıyı göstermez", async () => {
    const r = await auditSources({ planId: "pro", lang: "tr", groups: [{
      source: { id: "S", title: "Kaygı", abstract: null, access_level: "full_text", chunks: [{ content: "Results: anxiety lowers achievement in students.", page_hint: "4" }] },
      pairs: [{ claimId: "a1", sentence: "Kaygı başarıyı düşürür.", locator: "4" }, { claimId: "b2", sentence: "Kaygı her öğrencide aynıdır.", locator: null }],
    }] });
    expect(calls).toHaveLength(2); // anahtar kelime + toplu karar
    expect(r.results.find((x) => x.claimId === "a1")).toMatchObject({ verdict: "supports", quote: "anxiety lowers achievement", quotePage: "4" });
    expect(r.results.find((x) => x.claimId === "b2")).toMatchObject({ verdict: "partial", quote: null, quotePage: null });
  });
  it("yalnızca künyesi bilinen kaynakta yapay zekâya gitmez, “yetersiz” döner", async () => {
    const r = await auditSources({ planId: "pro", lang: "tr", groups: [{ source: { id: "M", title: "X", abstract: null, access_level: "metadata", chunks: [] }, pairs: [{ claimId: "c3", sentence: "Bir iddia.", locator: null }] }] });
    expect(calls).toHaveLength(0);
    expect(r.results[0].verdict).toBe("insufficient");
    expect(r.calls).toBe(0);
  });
});

describe("iddia denetimi ikinci okuma (D150)", () => {
  beforeEach(() => { calls.length = 0; });
  it("zayıf sonuç daha geniş metinle yeniden okunur; kaynakta bulunmayan alıntıyla “destekliyor”a çevrilmez", async () => {
    const chunks = Array.from({ length: 8 }, (_, i) => ({ content: `Section ${i}: anxiety and achievement in students, details.`, page_hint: String(i + 1) }));
    const r = await auditSources({ planId: "pro", lang: "tr", groups: [{ source: { id: "S2", title: "Kaygı", abstract: null, access_level: "full_text", chunks }, pairs: [{ claimId: "a1", sentence: "Kaygı başarıyı düşürür.", locator: null }, { claimId: "b2", sentence: "Kaygı her öğrencide aynıdır.", locator: null }] }] });
    expect(calls).toHaveLength(4); // ilk okuma (anahtar kelime + karar) + yalnızca zayıf cümle için ikinci okuma
    expect(r.results.find((x) => x.claimId === "b2")?.verdict).toBe("partial");
  });
});
