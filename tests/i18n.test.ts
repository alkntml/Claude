import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { localeForCountry, normalizeLocale, translate } from "@/i18n";
import { EN } from "@/i18n/en";
import { LEVEL_LABELS, METHODOLOGY_LABELS, STAGE_LIBRARY, WORK_TYPES } from "@/lib/workflows";
import { ASSISTANT_ACTIONS } from "@/lib/ai/prompts";

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((f) => {
    const p = path.join(dir, f);
    return statSync(p).isDirectory() ? walk(p) : /\.(ts|tsx)$/.test(f) ? [p] : [];
  });
}

describe("i18n", () => {
  it("ülkeye göre varsayılan dil: TR ve bilinmeyen → Türkçe, diğerleri → İngilizce", () => {
    expect(localeForCountry("TR")).toBe("tr");
    expect(localeForCountry("tr")).toBe("tr");
    expect(localeForCountry(null)).toBe("tr");
    expect(localeForCountry("DE")).toBe("en");
    expect(localeForCountry("US")).toBe("en");
    expect(normalizeLocale("en")).toBe("en");
    expect(normalizeLocale("fr")).toBeNull();
  });

  it("değişkenler doldurulur, sözlükte olmayan metin Türkçe kalır", () => {
    expect(translate("en", "{n} kaynak eklendi", { n: 3 })).toBe("3 sources added");
    expect(translate("tr", "{n} kaynak eklendi", { n: 3 })).toBe("3 kaynak eklendi");
    expect(translate("en", "Sözlükte olmayan metin")).toBe("Sözlükte olmayan metin");
  });

  it("koddaki her t(\"…\") metninin İngilizce karşılığı var (yönetim paneli hariç)", () => {
    const root = path.resolve(__dirname, "../src");
    const missing = new Set<string>();
    for (const f of walk(root)) {
      if (/[\\/](admin|yonetim)[\\/]/.test(f) || f.endsWith("en.ts")) continue;
      const src = readFileSync(f, "utf8");
      for (const m of src.matchAll(/(?<![\w.])(?:t|T)\(\s*"((?:[^"\\\n]|\\.)*)"/g)) {
        const key = m[1].replace(/\\"/g, '"').replace(/\\n/g, "\n");
        if (/[A-Za-zÇĞİÖŞÜçğıöşü]/.test(key) && !(key in EN)) missing.add(`${path.relative(root, f)}: ${key}`);
      }
    }
    expect([...missing]).toEqual([]);
  });

  it("yol haritası, çalışma türü ve eylem metinleri çevrilmiş", () => {
    const texts = [
      ...Object.values(STAGE_LIBRARY).flatMap((s) => [s.title, s.purpose, ...s.steps, ...s.rules, ...s.questions, ...(s.example ? [s.example] : [])]),
      ...WORK_TYPES.flatMap((w) => [w.title, w.short, w.description]),
      ...Object.values(LEVEL_LABELS), ...Object.values(METHODOLOGY_LABELS),
      ...Object.values(ASSISTANT_ACTIONS).map((a) => a.label),
    ];
    expect(texts.filter((x) => !(x in EN))).toEqual([]);
  });

  it("çevirilerde değişken adları korunur", () => {
    const bad = Object.entries(EN).filter(([k, v]) => JSON.stringify((k.match(/\{\w+\}/g) ?? []).sort()) !== JSON.stringify((v.match(/\{\w+\}/g) ?? []).sort()));
    expect(bad).toEqual([]);
  });
});
