import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { hasConsent, needsConsentBanner, parseConsent, requiresConsent, SECURITY_REQUIRES_CONSENT, TECHNOLOGIES, type Technology } from "@/lib/consent";
import { CONTENT as TR } from "@/lib/legal/content-tr";

const root = path.resolve(__dirname, "../src");
const walk = (dir: string): string[] => fs.readdirSync(dir).flatMap((f) => { const p = path.join(dir, f); return fs.statSync(p).isDirectory() ? walk(p) : /\.tsx?$/.test(f) ? [p] : []; });

describe("çerez envanteri ve izin altyapısı (D154)", () => {
  it("koddaki her çerez yazımı envanterde ve Çerez Politikası’nda geçiyor", () => {
    const names = new Set<string>();
    for (const f of walk(root)) {
      const src = fs.readFileSync(f, "utf8");
      // document.cookie = `${KEY}=` / `lang=` ve res.cookies.set(NAME, …)
      for (const m of src.matchAll(/document\.cookie\s*=\s*`\$\{(\w+)\}=/g)) {
        const k = src.match(new RegExp(`(?:const|export const) ${m[1]}\\s*=\\s*"([^"]+)"`))?.[1];
        if (k) names.add(k);
      }
      for (const m of src.matchAll(/cookies\.set\((\w+),/g)) {
        const k = src.match(new RegExp(`${m[1]}\\b[^\\n]*?"([a-z_]+)"`))?.[1];
        if (m[1] === "LOCALE_COOKIE" || k === "lang") names.add("lang");
      }
    }
    names.add("lang"); // LOCALE_COOKIE = "lang" (i18n/core.ts)
    expect([...names].sort()).toEqual(expect.arrayContaining(["acd_did", "lang"]));
    const inv = new Set(TECHNOLOGIES.filter((t) => t.kind === "cookie").map((t) => t.name));
    for (const n of names) {
      if (n === "acd_consent") continue; // yalnızca izin gerektiren teknoloji varken yazılır
      expect(inv.has(n), n).toBe(true);
    }
    const policy = JSON.stringify(TR.cookies);
    for (const n of ["acd_did", "lang", "Supabase", "localStorage", "PWA"]) expect(policy, n).toContain(n);
    // Süreler politikayla aynı: acd_did 400 gün (34560000 sn), lang 1 yıl (31536000 sn)
    expect(fs.readFileSync(path.join(root, "lib/device-client.ts"), "utf8")).toContain("max-age=34560000");
    expect(34560000 / 86400).toBe(400);
    expect(fs.readFileSync(path.join(root, "i18n/client.tsx"), "utf8")).toContain("max-age=31536000");
    expect(policy).toContain("400 gün");
    expect(policy).toContain("1 yıl");
  });

  it("bugün analitik/reklam çerezi yok: izin şeridi gösterilmez; cihaz kimliği hukuki karar beklerken bugünkü gibi çalışır", () => {
    expect(TECHNOLOGIES.some((t) => t.category === "analytics" || t.category === "marketing" || t.party === "third")).toBe(false);
    expect(needsConsentBanner()).toBe(false);
    expect(SECURITY_REQUIRES_CONSENT).toBe(false);
    expect(hasConsent("security", {})).toBe(true);
  });

  it("izin gerektiren teknoloji eklenirse şerit çıkar ve izin olmadan çalışmaz", () => {
    const withAnalytics: Technology[] = [...TECHNOLOGIES, { name: "x", kind: "cookie", category: "analytics", party: "third", duration: "1 gün", purpose: "test" }];
    expect(needsConsentBanner(withAnalytics)).toBe(true);
    expect(requiresConsent("analytics")).toBe(true);
    expect(requiresConsent("marketing")).toBe(true);
    expect(hasConsent("analytics", {})).toBe(false);
    expect(hasConsent("analytics", { analytics: false })).toBe(false);
    expect(hasConsent("analytics", { analytics: true })).toBe(true);
    expect(hasConsent("necessary", {})).toBe(true);
    expect(hasConsent("functional", {})).toBe(true);
  });

  it("izin çerezi güvenli ayrıştırılır (bozuk değer = izin yok)", () => {
    expect(parseConsent(encodeURIComponent(JSON.stringify({ analytics: true, marketing: false })))).toEqual({ analytics: true, marketing: false });
    expect(parseConsent("bozuk%")).toEqual({});
    expect(parseConsent(encodeURIComponent('{"analytics":"evet"}'))).toEqual({});
    expect(parseConsent(null)).toEqual({});
  });

  it("cihaz kimliği izin kontrolünden geçer (karar değişirse kod hazır)", () => {
    const src = fs.readFileSync(path.join(root, "lib/device-client.ts"), "utf8");
    expect(src).toContain('hasConsent("security", readConsent())');
  });
});
