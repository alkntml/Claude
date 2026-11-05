import "server-only";
import { complete, estimateCost, resolveModel, type Tier } from "@/lib/ai/registry";
import { spentError } from "@/lib/ai/spent";
import { BLUEPRINT_FIELDS, BlueprintSchema, countsForLength, distributeWords, WORDS_PER_PAGE, type Blueprint, type BlueprintFieldKey } from "@/lib/blueprint";
import { GRANT_PROGRAMS, LEVEL_LABELS, METHODOLOGY_LABELS, stageDef, WORK_TYPES, type AcademicLevel, type Methodology } from "@/lib/workflows";

/* eslint-disable @typescript-eslint/no-explicit-any */

/** Kurgu (D67) için yapay zekâ: tüm kurguyu üretme ve tek alanı yeniden önerme. */

function projectInfo(p: any) {
  const ctx = p.context ?? {};
  const wt = WORK_TYPES.find((w) => w.id === p.work_type)?.title ?? p.work_type;
  const program = ctx.program ? GRANT_PROGRAMS.find((g) => g.id === ctx.program)?.label : null;
  return [
    `Çalışma türü: ${wt}${program ? ` (${program})` : ""}`,
    `Seviye: ${LEVEL_LABELS[p.academic_level as AcademicLevel] ?? p.academic_level}`,
    p.discipline && `Disiplin: ${p.discipline}`,
    ctx.methodology && `Seçilen yöntem yaklaşımı: ${METHODOLOGY_LABELS[ctx.methodology as Methodology] ?? ctx.methodology}`,
    `Geçici başlık: ${p.title}`,
    p.topic && `Konu açıklaması: ${p.topic}`,
    p.keywords?.length && `Anahtar kelimeler: ${p.keywords.join(", ")}`,
  ].filter(Boolean).join("\n");
}

const RULES = (lang: string) => `Deneyimli bir akademik danışmansın; öğrencinin çalışmasını yazmaya başlamadan önce birlikte kurgusunu (araştırma planını) çıkarıyorsunuz. Dil: ${lang === "en" ? "English" : "Türkçe"}.
KURALLAR:
- Bu bir PLANDIR: bulgu, sonuç, istatistik, kaynak, yazar adı veya DOI yazma; "literatürde … bulunmuştur" gibi kaynak gerektiren iddia kurma.
- Bilinmeyen somut bilgiyi (il, okul, kurum adı, kesin örneklem sayısı) uydurma; "örn. yaklaşık … katılımcı (güç analiziyle belirlenecek)" gibi öneri diliyle yaz.
- Seviyeye uygun, uygulanabilir ve tutarlı ol: amaç, sorular, yöntem, örneklem, veri toplama ve analiz birbirine uysun.
- Kısa ve net yaz: her alan 1–4 cümle.`;

const FIELD_PROPS = Object.fromEntries(BLUEPRINT_FIELDS.map((f) => [f.key, { type: "string" }]));

/** Tüm kurguyu üretir (öğrencinin girişi varsa ona göre) */
export async function generateBlueprint(planId: string, p: { project: any; stages: { id: string; key: string; title: string; description?: string | null }[]; input: string; previous?: Blueprint | null; targetWords?: number; wordsPerPage?: number }) {
  const wpp = p.wordsPerPage || WORDS_PER_PAGE;
  const target = p.targetWords && p.targetWords > 0 ? p.targetWords : 0;
  const stages = p.stages.filter((s) => s.key !== "references");
  const schema = {
    type: "object", additionalProperties: false, required: [...BLUEPRINT_FIELDS.map((f) => f.key), "questions", "targetWords", "chapters"],
    properties: {
      ...FIELD_PROPS,
      questions: { type: "array", items: { type: "string" } },
      targetWords: { type: "integer" },
      chapters: { type: "array", items: { type: "object", additionalProperties: false, required: ["n", "plan", "words"], properties: { n: { type: "integer" }, plan: { type: "string" }, words: { type: "integer" } } } },
    },
  };
  const stageList = stages.map((s, i) => `${i + 1}. ${s.title}${countsForLength(s.key) ? "" : " [uzunluğa dahil değil: words = 0]"} — ${stageDef(s.key)?.purpose ?? s.description ?? ""}`).join("\n");
  const user = [
    projectInfo(p.project),
    p.input.trim() && `\nÖĞRENCİNİN KENDİ GİRİŞİ (önceliklidir; kurguyu buna göre kur):\n${p.input.trim()}`,
    p.previous && `\nÖnceki kurgu taslağı (öğrencinin girişiyle çelişmeyen kısımlarını koruyabilirsin):\n${JSON.stringify({ ...p.previous, chapters: undefined, input: undefined, approvedAt: undefined, updatedAt: undefined })}`,
    target ? `\nHEDEF UZUNLUK (öğrencinin belirlediği, uy): toplam ${target} kelime` : `\nHEDEF UZUNLUK: öğrenci belirtmedi; çalışma türü ve seviyeye uygun, yaygın bir toplam kelime öner.`,
    `\nÇALIŞMANIN DEĞİŞMEYECEK BÖLÜMLERİ (sıra numarasıyla):\n${stageList}`,
  ].filter(Boolean).join("\n");
  const out = await run(planId, "default", `${RULES(p.project.language)}
GÖREV: Çalışmanın kurgusunu çıkar.
- problem, aim, method, sample, data, analysis, contribution alanlarını doldur. Derleme/kuramsal çalışmada sample = kapsam ve dahil etme ölçütleri, data = veri tabanları ve arama stratejisi, analysis = sentez yöntemi.
- questions: 2–5 araştırma sorusu veya hipotez (nicel çalışmada test edilebilir hipotez olabilir).
- targetWords: çalışmanın toplam hedef kelimesi (öğrenci belirlediyse aynısı).
- chapters: yukarıdaki HER bölüm için (n = sıra numarası) words = o bölümün yaklaşık kelime sayısı (toplamı targetWords’e eşit olsun; bölümün akademik ağırlığına göre dağıt: kuramsal çerçeve/literatür, bulgular ve tartışma uzun; giriş, amaç, sorular kısa) ve plan = o bölümde neyin yazılacağı, 1–2 cümle. Kapsamı uzunluğa göre ayarla (uzun bölümde hangi alt konuların işleneceğini say; kısa bölümde öz tut). Bölüm ekleme/çıkarma yapma.`, user, schema, 8000);
  const d = out.data;
  const bp = BlueprintSchema.parse({
    ...Object.fromEntries(BLUEPRINT_FIELDS.map((f) => [f.key, String(d[f.key] ?? "").trim().slice(0, 2000)])),
    questions: (d.questions ?? []).map((x: unknown) => String(x).trim().slice(0, 500)).filter(Boolean).slice(0, 12),
    chapters: (() => {
      const found = stages.map((_, i) => (d.chapters ?? []).find((c: any) => Number(c.n) === i + 1));
      const base = stages.map((s, i) => ({ stageId: s.id, key: s.key, title: s.title, plan: String(found[i]?.plan ?? "").trim().slice(0, 1200) }));
      // Toplam: öğrencinin hedefi > yapay zekânın önerisi; dağılım yapay zekânın kelimeleri oranında, toplam tam tutturulur
      const total = target || Math.min(500000, Math.max(0, Math.round(Number(d.targetWords) || 0)));
      return distributeWords(base, total, found.map((c: any) => Math.max(0, Number(c?.words) || 0)));
    })(),
    targetWords: target || Math.min(500000, Math.max(0, Math.round(Number(d.targetWords) || 0))),
    wordsPerPage: wpp,
    input: p.input.slice(0, 2000),
    approvedAt: null,
    updatedAt: new Date().toISOString(),
  });
  return { blueprint: bp, ...out.meta };
}

/** Tek bir alanı (veya soru listesini) öğrencinin isteğiyle yeniden önerir */
export async function refineField(planId: string, p: { project: any; blueprint: Blueprint; field: BlueprintFieldKey | "questions"; instruction?: string }) {
  const label = p.field === "questions" ? "Araştırma soruları / hipotezler" : BLUEPRINT_FIELDS.find((f) => f.key === p.field)!.label;
  const schema = { type: "object", additionalProperties: false, required: ["text", "questions"], properties: { text: { type: "string" }, questions: { type: "array", items: { type: "string" } } } };
  const out = await run(planId, "balanced", `${RULES(p.project.language)}
GÖREV: Kurgunun yalnızca “${label}” kısmını yeniden yaz; diğer kısımlarla tutarlı olsun. ${p.field === "questions" ? "Soruları questions dizisine yaz (2–5 tane), text boş kalsın." : "Yeni metni text alanına yaz, questions boş dizi kalsın."}`,
  `${projectInfo(p.project)}\n\nMevcut kurgu:\n${JSON.stringify({ ...p.blueprint, chapters: undefined, approvedAt: undefined, updatedAt: undefined })}${p.instruction ? `\n\nÖğrencinin isteği: ${p.instruction}` : ""}`, schema, 2000);
  return {
    text: String(out.data.text ?? "").trim().slice(0, 2000),
    questions: (out.data.questions ?? []).map((x: unknown) => String(x).trim().slice(0, 500)).filter(Boolean).slice(0, 12) as string[],
    ...out.meta,
  };
}

async function run(planId: string, tier: Tier, system: string, user: string, schema: Record<string, unknown>, maxTokens: number) {
  const model = await resolveModel(planId, tier);
  const res = await complete(model, { system, messages: [{ role: "user", content: user }], maxTokens, effort: tier === "default" ? "medium" : "low", jsonSchema: schema });
  let data: any;
  try { data = JSON.parse(res.text); } catch { throw await spentError("Kurgu oluşturulamadı, lütfen tekrar deneyin", res, model.provider, "blueprint"); }
  const cost = await estimateCost(res.model, res.usage.input, res.usage.output, res.usage);
  return { data, meta: { usage: res.usage, model: res.model, provider: model.provider, cost } };
}
/* eslint-enable @typescript-eslint/no-explicit-any */
