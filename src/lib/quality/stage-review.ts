import "server-only";
import { AI_LANGUAGE } from "@/i18n/core";
import { complete, estimateCost, isProviderConfigured, resolveModel } from "@/lib/ai/registry";
import { spentError } from "@/lib/ai/spent";
import { citedIdsInOrder, type JSONNode } from "@/lib/editor/doc";
import { sourceRowToItem } from "@/lib/projects";
import { runQualityChecks, type QualityIssue } from "@/lib/quality/checks";
import { stageDef } from "@/lib/workflows";
import { makeT, type Locale } from "@/i18n";

/* eslint-disable @typescript-eslint/no-explicit-any */
export interface ReviewIssue { severity: "info" | "warning" | "error"; title: string; detail: string; fix?: string; source: "rule" | "ai" }
export interface StageReview { verdict: "ok" | "minor" | "major"; summary: string; strengths: string[]; issues: ReviewIssue[]; aiRan: boolean }

const SCHEMA = {
  type: "object", additionalProperties: false, required: ["verdict", "summary", "strengths", "issues"],
  properties: {
    verdict: { type: "string", enum: ["ok", "minor", "major"] },
    summary: { type: "string" },
    strengths: { type: "array", items: { type: "string" } },
    issues: { type: "array", items: { type: "object", additionalProperties: false, required: ["severity", "title", "detail", "fix"], properties: { severity: { type: "string", enum: ["info", "warning", "error"] }, title: { type: "string" }, detail: { type: "string" }, fix: { type: "string" } } } },
  },
};

/** D176: özet bölümünü Türkçe Özet / İngilizce Abstract (ve Almanca Zusammenfassung) kısımlarına ayırıp kelimeleri sayar; anahtar kelime satırları sayılmaz */
export function abstractParts(text: string): { label: string; words: number }[] {
  const lines = text.replace(/\r/g, "").split("\n");
  const parts: { label: string; body: string[] }[] = [];
  for (const line of lines) {
    const h = line.trim().match(/^(Özet|Öz|Abstract|Zusammenfassung)$/i);
    if (h) { parts.push({ label: h[1], body: [] }); continue; }
    if (/^(Anahtar Kelimeler|Anahtar sözcükler|Keywords|Schlüsselwörter)\s*:/i.test(line.trim())) continue;
    if (!parts.length) parts.push({ label: "Özet", body: [] });
    parts[parts.length - 1].body.push(line);
  }
  return parts.map((p) => ({ label: p.label, words: p.body.join(" ").split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w)).length })).filter((p) => p.words > 0);
}

/** D176: bölümün özeti için öbür bölümlerin ana metin olup olmadığı */
const NOT_MAIN = new Set(["title_abstract", "grant_summary", "references", "declarations", "appendices", "front_matter", "journal_requirements", "cover_letter"]);

/** Bölüm bazında kural kontrolleri (yalnızca bu bölüme ait sorunlar) */
export function ruleIssues(bundle: any, stage: any, uiLocale: Locale): ReviewIssue[] {
  const def = stageDef(stage.key);
  const input = [{ key: stage.key, title: stage.title, text: stage.content_text ?? "", citedIds: citedIdsInOrder([stage.content as JSONNode]), needsLiterature: def?.needsLiterature, requiresUserData: def?.requiresUserData, generated: !!def?.generated }];
  const sources = bundle.sources.map((r: any) => ({ ...sourceRowToItem(r), verified: r.verified, accessLevel: r.access_level }));
  const report = runQualityChecks(input, sources, { language: bundle.project.language, uiLocale });
  const T = makeT(uiLocale);
  const out: ReviewIssue[] = report.issues
    .filter((i: QualityIssue) => i.stageKey === stage.key || ["language", "repetition", "data"].includes(i.category))
    .map((i: QualityIssue) => ({ severity: i.severity, title: i.title, detail: i.excerpt ? `${i.detail} (${i.excerpt})` : i.detail, source: "rule" as const }));
  const text = String(stage.content_text ?? "");
  const missing = (text.match(/\[KAYNAK GEREKLİ\]/g) ?? []).length;
  const data = (text.match(/\[VERİ GİRİLECEK\]/g) ?? []).length;
  if (missing) out.unshift({ severity: "error", title: T("Kaynak bekleyen iddialar"), detail: T("Bölümde {n} yerde “[KAYNAK GEREKLİ]” var.", { n: missing }), fix: T("Üstteki “Kaynak bul ve düzelt” ile kaynak ekleyin veya iddiayı çıkarın."), source: "rule" });
  // D176: özet uzunluğu sistemce sayılır (yapay zekâ incelemesine bırakılmaz)
  if (stage.key === "title_abstract") for (const p of abstractParts(text)) {
    if (p.words < 150 || p.words > 250) out.push({ severity: "warning", title: T("Özet uzunluğu aralık dışında"), detail: T("{label}: {n} kelime (önerilen 150–250).", { label: p.label, n: p.words }), fix: T("Derginin sınırına göre kısaltın veya genişletin."), source: "rule" });
  }
  if (data) out.unshift({ severity: "error", title: T("Doldurulmamış veri alanları"), detail: T("Bölümde {n} yerde “[VERİ GİRİLECEK]” var.", { n: data }), fix: T("Kendi verilerinizi girin; yapay zekâ veri üretmez."), source: "rule" });
  // Aynı başlık birden çok kez gelirse tekilleştir
  const seen = new Set<string>();
  return out.filter((i) => (seen.has(i.title + i.detail) ? false : (seen.add(i.title + i.detail), true)));
}

/** Yapay zekâ incelemesi: bölümün amacına, yazım kurallarına ve çalışma başlığına uygunluğu */
export async function aiStageReview(params: { planId: string; bundle: any; stage: any; uiLocale: Locale; tier?: "fast" | "balanced" }) {
  const { bundle, stage } = params;
  const def = stageDef(stage.key);
  const model = await resolveModel(params.planId, params.tier ?? "fast");
  if (!isProviderConfigured(model.provider)) return null;
  // D176: bütünü özetleyen/yorumlayan bölümlerde denetleyici ana metnin tamamını görür (“tutarlılık doğrulanamıyor” gibi boş uyarılar olmasın)
  const whole = ["title_abstract", "grant_summary", "conclusion", "conclusion_article", "discussion", "discussion_article", "cover_letter"].includes(stage.key);
  const per = whole ? 6000 : 300;
  const written = bundle.stages.filter((x: any) => x.id !== stage.id && !x.hidden && String(x.content_text ?? "").trim());
  const others = written.map((x: any) => `- ${x.title}: ${String(x.content_text).slice(0, per).replace(/\s+/g, " ")}${String(x.content_text).length > per ? "…" : ""}`).join("\n").slice(0, whole ? 40000 : 6000);
  const unwritten = bundle.stages.filter((x: any) => x.id !== stage.id && !x.hidden && !NOT_MAIN.has(x.key) && !String(x.content_text ?? "").trim()).map((x: any) => x.title);
  const text = String(stage.content_text ?? "");
  const measured = [
    `Bölümün kelime sayısı (sistem saydı): ${text.split(/\s+/).filter(Boolean).length}`,
    ...(stage.key === "title_abstract" ? abstractParts(text).map((p) => `${p.label}: ${p.words} kelime (sistem saydı)`) : []),
    `Henüz yazılmamış ana bölümler: ${unwritten.length ? unwritten.join(", ") : "yok"}`,
  ].join("\n");
  const res = await complete(model, {
    system: `Deneyimli bir tez danışmanısın; öğrencinin tamamladığını söylediği TEK bir bölümü değerlendiriyorsun. Geri bildirim dili: ${AI_LANGUAGE[params.uiLocale]}.
DEĞERLENDİR:
- Bölüm, amacını ve yazım kurallarını karşılıyor mu? Beklenen alt konular eksik mi?
- Çalışma başlığı ve konusuyla uyumlu mu; bölüme ait olmayan içerik (ör. özet bölümünde ana metin, yöntemde bulgu) var mı?
- Akademik dil, paragraf yapısı ve mantıksal akış yeterli mi? Desteklenmeyen kesin iddia var mı?
KURALLAR:
- Yalnızca verilen metne dayan; kaynakların doğruluğunu veya içeriğini yorumlama (sistem ayrıca kontrol ediyor).
- "verdict": "ok" = teslim edilebilir; "minor" = küçük düzeltmeler önerilir; "major" = bölüm amacını karşılamıyor veya önemli eksik var.
- En fazla 6 sorun; her biri için somut "fix" (ne yapılmalı). "strengths" en fazla 3 madde. "summary" tek-iki cümle.
- Nazik ama dürüst ol; gereksiz sorun üretme.
- ÖLÇÜLEN DEĞERLER sistem tarafından kesin olarak hesaplanmıştır: kelime sayısını yeniden saymayı veya “doğrulanmamış” demeyi ÖNERME; uzunluk sorununu sistem ayrıca bildirir.
- Göremediğin veya doğrulayamadığın bir şeyi sorun olarak YAZMA (“doğrulanamıyor”, “kontrol edilmemiş”, “belirtilmemiş olabilir” gibi). Yalnızca metinde gerçekten bulunan, yazarın düzeltebileceği somut sorunları yaz.
- Henüz yazılmamış ana bölümler varsa, o bölümlere bağlı eksiklikleri (ör. özette sonuç yok) ayrı ayrı sorun olarak yazma; en fazla tek bir “info” ile “ana metin tamamlanınca bu bölüm güncellenmeli” de.`,
    messages: [{ role: "user", content: `ÇALIŞMA: ${bundle.project.title}\nTür: ${bundle.project.work_type} · Seviye: ${bundle.project.academic_level}\n\nBÖLÜM: ${stage.title}\nAmaç: ${def?.purpose ?? stage.description ?? ""}\nYazım kuralları:\n${(def?.rules ?? []).map((r: string) => `- ${r}`).join("\n") || "-"}\n\nÖLÇÜLEN DEĞERLER:\n${measured}\n\nDİĞER BÖLÜMLER${whole ? "" : " (kısa)"}:\n${others || "-"}\n\nBÖLÜM METNİ:\n"""\n${String(stage.content_text ?? "").slice(0, 24000)}\n"""` }],
    maxTokens: 2500,
    effort: "medium",
    jsonSchema: SCHEMA,
  });
  let parsed: any;
  try { parsed = JSON.parse(res.text); } catch { throw await spentError("Yapay zekâ incelemesi şu anda yapılamadı", res, model.provider, "stage_review"); }
  const cost = await estimateCost(res.model, res.usage.input, res.usage.output, res.usage);
  return {
    verdict: (["ok", "minor", "major"].includes(parsed.verdict) ? parsed.verdict : "minor") as StageReview["verdict"],
    summary: String(parsed.summary ?? ""),
    strengths: (parsed.strengths ?? []).map(String).slice(0, 3),
    issues: (parsed.issues ?? []).slice(0, 6).map((i: any) => ({ severity: ["info", "warning", "error"].includes(i.severity) ? i.severity : "warning", title: String(i.title ?? ""), detail: String(i.detail ?? ""), fix: String(i.fix ?? ""), source: "ai" as const })),
    usage: res.usage, model: res.model, provider: model.provider, cost,
  };
}

/** Kural ve yapay zekâ sonuçlarını birleştirir; kural hatası varsa karar en az “minor/major” olur */
export function combine(rules: ReviewIssue[], ai: { verdict: StageReview["verdict"]; summary: string; strengths: string[]; issues: ReviewIssue[] } | null, T: (s: string) => string): StageReview {
  const ruleErr = rules.some((i) => i.severity === "error");
  const ruleWarn = rules.some((i) => i.severity === "warning");
  const rank = { ok: 0, minor: 1, major: 2 } as const;
  const fromRules: StageReview["verdict"] = ruleErr ? "major" : ruleWarn ? "minor" : "ok";
  const verdict = ai ? (rank[ai.verdict] >= rank[fromRules] ? ai.verdict : fromRules) : fromRules;
  return {
    verdict,
    summary: ai?.summary || (verdict === "ok" ? T("Otomatik kontrollerde sorun bulunmadı.") : T("Otomatik kontroller bazı sorunlar buldu.")),
    strengths: ai?.strengths ?? [],
    issues: [...rules, ...(ai?.issues ?? [])],
    aiRan: !!ai,
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */
