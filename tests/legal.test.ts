import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { LEGAL_DOCS, pendingAcceptances, signupAcceptanceMeta, sourceFromProvider, type AcceptanceRow } from "@/lib/legal/docs";
import { CONTENT as TR } from "@/lib/legal/content-tr";
import { CONTENT as EN } from "@/lib/legal/content-en";
import { CONTENT as DE } from "@/lib/legal/content-de";
import type { LegalSection } from "@/lib/legal/types";
import { PUBLIC_PATHS } from "@/lib/seo";
import { PAGE_SEO } from "@/lib/seo-pages";

const root = path.resolve(__dirname, "..");
const pdfText = fs.readFileSync(path.join(root, "docs/legal/yasal-metinler-2026-11-13.txt"), "utf8");

/** PDF metninde sayfa üst/alt bilgileri ve satır sonları atılır; yalnızca kelimeler karşılaştırılır */
function pdfWords(): string {
  return pdfText.split("\n").map((l) => l.trim())
    .filter((l) => !/^(Academiana \| Yasal metinler — çalışma taslağı|Academiana \| www\.academiana\.com\.tr|\d{1,2})$/.test(l))
    .join(" ").replace(/• /g, " ").replace(/\s+/g, " ");
}
const docWords = (sections: LegalSection[]) => sections.map((s) => [s.h, ...s.b.map((b) => ("p" in b ? b.p : b.ul.join(" ")))].join(" ")).join(" ").replace(/\s+/g, " ");

describe("hukuki metinler (D154)", () => {
  it("Türkçe metinler (1–6) ve GDPR’ın İngilizce aslı PDF’teki metinle kelimesi kelimesine aynı", () => {
    const all = pdfWords();
    for (const id of ["kvkk", "terms", "cookies", "integrity", "distance"] as const) expect(all.includes(docWords(TR[id])), id).toBe(true);
    // D162: Adil Kullanım’da “Sınırsız Proje paketi” bölümü ve ihlal bölümünün giriş cümlesi site sahibince güncellendi; diğer bölümler PDF ile aynı
    for (const [i, s] of TR.fair_use.entries()) if (i !== 1 && i !== 2) expect(all.includes(docWords([s])), s.h).toBe(true);
    const fu = JSON.stringify(TR.fair_use);
    for (const x of ["Sınırsız Proje paketi", "1 ay geçerlidir", "tamamen sınırsızdır", "ücretsiz araçlar", "en fazla 5", "en fazla 60"]) expect(fu, x).toContain(x);
    expect(all.includes(docWords(EN.gdpr)), "gdpr").toBe(true);
  });

  it("yedi belge üç dilde aynı yapıda (bölüm, paragraf, madde sayısı)", () => {
    for (const d of LEGAL_DOCS) {
      const shape = (s: LegalSection[]) => s.map((x) => x.b.map((b) => ("p" in b ? "p" : `ul${b.ul.length}`)).join(","));
      expect(TR[d.id].length, d.id).toBeGreaterThan(3);
      expect(shape(EN[d.id]), `${d.id} en`).toEqual(shape(TR[d.id]));
      expect(shape(DE[d.id]), `${d.id} de`).toEqual(shape(TR[d.id]));
      for (const c of [TR, EN, DE]) for (const s of c[d.id]) { expect(s.h.trim()).not.toBe(""); for (const b of s.b) expect(("p" in b ? b.p : b.ul.join("")).trim()).not.toBe(""); }
    }
  });

  it("metinlerde uydurma iletişim bilgisi yok (e-posta, telefon, vergi/MERSİS numarası)", () => {
    const text = JSON.stringify([TR, EN, DE]);
    expect(text).not.toMatch(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
    expect(text).not.toMatch(/\+?\d[\d ()-]{8,}\d/);
    expect(text).not.toMatch(/MERSİS\s*(no|numarası)?\s*:?\s*\d/i);
  });

  it("her belgenin adresi herkese açık, arama metni ve dil sürümü var", () => {
    for (const d of LEGAL_DOCS) {
      expect(PUBLIC_PATHS, d.path).toContain(d.path);
      expect(PAGE_SEO[d.path], d.path).toBeTruthy();
      expect(fs.existsSync(path.join(root, `src/app${d.path}/page.tsx`)), d.path).toBe(true);
      expect(d.title.tr && d.title.en && d.title.de).toBeTruthy();
      expect(d.version).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
    expect(PUBLIC_PATHS).not.toContain("/gizlilik");
  });

  it("eski /gizlilik adresi (üç dilde) KVKK metnine kalıcı yönlenir; altbilgi yedi belgeye bağlanır", () => {
    const cfg = fs.readFileSync(path.join(root, "next.config.ts"), "utf8");
    for (const p of ["", "/en", "/de"]) expect(cfg).toContain(`{ source: "${p}/gizlilik", destination: "${p}/kvkk", permanent: true }`);
    const footer = fs.readFileSync(path.join(root, "src/components/site-footer.tsx"), "utf8");
    expect(footer).toContain("LEGAL_DOCS.map");
    expect(footer).toContain('t("Gizlilik ve Güvenlik")');
    // Kodda eski adrese bağlantı kalmadı
    const walk = (dir: string): string[] => fs.readdirSync(dir).flatMap((f) => { const p = path.join(dir, f); return fs.statSync(p).isDirectory() ? walk(p) : /\.tsx?$/.test(f) ? [p] : []; });
    for (const f of walk(path.join(root, "src"))) expect(fs.readFileSync(f, "utf8"), f).not.toMatch(/href=["{`]+\/gizlilik/);
  });

  it("kabul gereken belge: kayıt yoksa, eski sürüm kabul edildiyse veya yalnızca bilgilendirme varsa yeniden sorulur", () => {
    const terms = LEGAL_DOCS.find((d) => d.id === "terms")!;
    const row = (o: Partial<AcceptanceRow>): AcceptanceRow => ({ doc: "terms", version: terms.version, kind: "accept", accepted_at: "2026-11-13T10:00:00Z", ...o });
    expect(pendingAcceptances([]).map((d) => d.id)).toEqual(["terms"]);
    expect(pendingAcceptances([row({ version: "2025-01-01" })]).map((d) => d.id)).toEqual(["terms"]);
    expect(pendingAcceptances([row({ kind: "notice" })]).map((d) => d.id)).toEqual(["terms"]);
    expect(pendingAcceptances([row({ doc: "kvkk" })]).map((d) => d.id)).toEqual(["terms"]);
    expect(pendingAcceptances([row({})])).toEqual([]);
    // Yeni sürüm yayımlanınca (simülasyon): eski kabul geçersiz
    const bumped = LEGAL_DOCS.map((d) => (d.id === "terms" ? { ...d, version: "2027-01-01" } : d));
    const pending = bumped.filter((d) => d.requiresAcceptance && ![row({})].some((r) => r.doc === d.id && r.kind === "accept" && r.version === d.version));
    expect(pending.map((d) => d.id)).toEqual(["terms"]);
  });

  it("kayıt meta verisi: Kullanım Koşulları kabulü + KVKK bilgilendirmesi güncel sürümle; kaynak giriş yönteminden", () => {
    const m = signupAcceptanceMeta();
    expect(Object.keys(m).sort()).toEqual(["kvkk", "terms"]);
    for (const v of Object.values(m)) expect(v).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(sourceFromProvider("google")).toBe("google");
    expect(sourceFromProvider("apple")).toBe("apple");
    expect(sourceFromProvider("email")).toBe("email");
    expect(sourceFromProvider(undefined)).toBe("consent_page");
  });

  it("kayıt formunda ayrı ve zorunlu Kullanım Koşulları kutusu; KVKK yalnızca bağlantı; pazarlama izni yok; Google/Apple’da örtülü kabul metni yok", () => {
    const form = fs.readFileSync(path.join(root, "src/components/auth/auth-form.tsx"), "utf8");
    expect(form).toContain("legal: signupAcceptanceMeta()");
    expect(form).toContain('href="/kvkk"');
    expect(form).not.toMatch(/pazarlama|ticari elektronik ileti/i);
    expect(form).not.toContain("kabul etmiş olursunuz");
    const consent = fs.readFileSync(path.join(root, "src/components/auth/consent-form.tsx"), "utf8");
    expect(consent).toContain('notice: ["kvkk"]');
  });
});
