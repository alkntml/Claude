/**
 * Fiyat ve limit tutarlılığı (D118): ana sayfa ile fiyat sayfası aynı bileşeni (PricingCards) ve aynı veri kaynağını
 * (publicPlans → plans tablosu) kullanmalı; tanıtım bileşenlerinde sabit fiyat/limit sayısı olmamalı.
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { FALLBACK_PLANS } from "@/lib/plans-fallback";

const read = (p: string) => readFileSync(path.resolve(__dirname, "..", p), "utf8");

describe("fiyat/limit tek kaynak", () => {
  it("ana sayfa ve fiyat sayfası aynı bileşen ve aynı veri kaynağıyla paketleri gösterir", () => {
    for (const f of ["src/app/page.tsx", "src/app/fiyatlar/page.tsx"]) {
      const s = read(f);
      expect(s).toContain("publicPlans()");
      expect(s).toContain("<PricingCards plans={plans}");
    }
  });
  it("tanıtım bileşenlerinde sabit fiyat veya tarama sayısı yok", () => {
    const s = read("src/components/landing/sections.tsx") + read("src/app/page.tsx") + read("src/components/landing/hero.tsx");
    expect(s).not.toMatch(/\b(749|1\.349|2\.249|3\.999)\b/);
    expect(s).not.toMatch(/2\.000 kaynak|8\.000 kaynak/);
  });
  it("paket kartlarında eski sayısal tarama ifadeleri ve koşulsuz “sınırsız” yok", () => {
    const all = FALLBACK_PLANS.flatMap((p) => p.features).join(" | ");
    expect(all).not.toMatch(/2\.000|8\.000/);
    for (const f of FALLBACK_PLANS.flatMap((p) => p.features)) if (/Sınırsız (kaynak|yapay)/.test(f)) expect(f).toMatch(/adil kullanım/);
  });
});
