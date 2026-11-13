import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { localeForCountry, normalizeLocale, translate } from "@/i18n";
import { EN } from "@/i18n/en";
import { DE } from "@/i18n/de";
import { LEVEL_LABELS, METHODOLOGY_LABELS, STAGE_LIBRARY, STRUCTURE_ACTION_LABEL, WORK_TYPES } from "@/lib/workflows";
import { CHAIN_LEVEL_LABEL } from "@/lib/quality/consistency-chain";
import { ASSISTANT_ACTIONS } from "@/lib/ai/prompts";

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((f) => {
    const p = path.join(dir, f);
    return statSync(p).isDirectory() ? walk(p) : /\.(ts|tsx)$/.test(f) ? [p] : [];
  });
}

describe("i18n", () => {
  it("ülkeye göre varsayılan dil: TR ve bilinmeyen → Türkçe, Almanca konuşulan ülkeler → Almanca, diğerleri → İngilizce", () => {
    expect(localeForCountry("TR")).toBe("tr");
    expect(localeForCountry("tr")).toBe("tr");
    expect(localeForCountry(null)).toBe("tr");
    for (const c of ["DE", "de", "AT", "CH", "LI"]) expect(localeForCountry(c)).toBe("de");
    expect(localeForCountry("US")).toBe("en");
    expect(localeForCountry("NL")).toBe("en");
    expect(normalizeLocale("en")).toBe("en");
    expect(normalizeLocale("de")).toBe("de");
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
      // D171: yapı geçmişi ve tutarlılık zinciri metinleri
      ...Object.values(STRUCTURE_ACTION_LABEL), ...Object.values(CHAIN_LEVEL_LABEL),
      ...[...readFileSync(path.resolve(__dirname, "../src/lib/quality/consistency-chain.ts"), "utf8").matchAll(/(?:title|evidence|suggestion): "((?:[^"\\]|\\.)*)"/g)].map((m) => m[1]),
    ];
    expect(texts.filter((x) => !(x in EN))).toEqual([]);
  });

  it("çevirilerde değişken adları korunur", () => {
    const bad = Object.entries(EN).filter(([k, v]) => JSON.stringify((k.match(/\{\w+\}/g) ?? []).sort()) !== JSON.stringify((v.match(/\{\w+\}/g) ?? []).sort()));
    expect(bad).toEqual([]);
  });
  it("Almanca sözlük İngilizce sözlüğün tüm anahtarlarını içerir; değişken adları ve boş olmayan değerler korunur (D143)", () => {
    const ph = (x: string) => (x.match(/\{\w+\}/g) ?? []).sort().join(",");
    const missing = Object.keys(EN).filter((k) => !(k in DE));
    expect(missing, `DE eksik: ${missing.slice(0, 5).join(" | ")}`).toEqual([]);
    for (const [k, v] of Object.entries(DE)) {
      expect(ph(v), `değişken uyumsuz: ${k}`).toBe(ph(k));
      if ((EN[k] ?? "").trim()) expect(v.trim(), `boş çeviri: ${k}`).not.toBe("");
    }
    expect(translate("de", "Kaydet")).toBe("Speichern");
    expect(translate("de", "{n} kaynak eklendi", { n: 3 })).toMatch(/3/);
  });
});
