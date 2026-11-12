import { z } from "zod";
import { ApiError, json, parseBody, route } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { projectAccess } from "@/lib/project-access";
import { logAiOutput } from "@/lib/activity";
import { detokenize, proofreadBlocks, tokenizeForLanguage } from "@/lib/editor/translate-doc";
import { docToPlain, type JSONNode } from "@/lib/editor/doc";
import { MAX_PROOFREAD_CHARS, MAX_TRANSLATE_CHARS, proofread, translateTokenized, type GlossaryEntry } from "@/lib/language";
import { assertSingleProject } from "@/lib/single-project";
import { assertWithinLimits, recordUsage } from "@/lib/usage";

export const maxDuration = 300;

type Ctx = { params: Promise<{ id: string }> };

const Doc = z.object({ type: z.literal("doc"), content: z.array(z.any()).max(5000) }).passthrough();
const Body = z.discriminatedUnion("mode", [
  z.object({ mode: z.literal("translate"), doc: Doc, from: z.enum(["tr", "en", "de"]), to: z.enum(["tr", "en", "de"]), variant: z.enum(["us", "uk"]).default("us"), stageTitle: z.string().max(300).optional() }),
  z.object({ mode: z.literal("proofread"), doc: Doc, lang: z.enum(["tr", "en", "de"]), variant: z.enum(["us", "uk"]).default("us") }),
]);

/** Dil ve çeviri (D111): seçili metin, alt başlık veya bölüm; projenin terim sözlüğü (context.glossary) kullanılır */
export const POST = route<Ctx>("project.language", async (req, { params }) => {
  const s = await requireUser();
  const { id } = await params;
  const { project } = await projectAccess(s, id, "edit");
  const b = await parseBody(req, Body);
  if (JSON.stringify(b.doc).length > 2_000_000) throw new ApiError(413, "Metin çok büyük");
  await assertSingleProject(s, id);
  await assertWithinLimits(s.user.id, s.profile.plan_id, "ai_request");
  const glossary = (Array.isArray(project.context?.glossary) ? project.context.glossary : []) as GlossaryEntry[];
  const doc = b.doc as JSONNode;

  if (b.mode === "translate") {
    if (b.from === b.to) throw new ApiError(422, "Kaynak ve hedef dil aynı");
    const t = tokenizeForLanguage(doc);
    if (!t.md.trim()) throw new ApiError(422, "Çevrilecek metin yok");
    if (t.md.length > MAX_TRANSLATE_CHARS) throw new ApiError(413, "Metin tek seferde çevrilemeyecek kadar uzun. Lütfen bölümü alt başlık alt başlık çevirin.");
    const r = await translateTokenized({ planId: s.profile.plan_id, md: t.md, footnotes: t.footnotes, from: b.from, to: b.to, variant: b.variant, glossary, discipline: project.discipline });
    const out = detokenize(r.md, r.footnotes, t);
    const plain = docToPlain(out.doc);
    await Promise.all([
      recordUsage(s.user.id, "ai_request", { quantity: r.spend.calls, usage: r.spend.usage, costUsd: r.spend.cost, provider: r.spend.provider, model: r.spend.model, meta: { action: `translate_${b.from}_${b.to}`, projectId: id } }),
      logAiOutput({ userId: s.user.id, action: `translate_${b.from}_${b.to}`, projectId: id, projectTitle: project.title, stageTitle: b.stageTitle ?? null, model: r.spend.model, output: plain }),
    ]);
    return json({ doc: out.doc, missing: out.missing, terms: r.terms, words: plain.split(/\s+/).filter(Boolean).length });
  }

  const blocks = proofreadBlocks(doc);
  if (!blocks.length) throw new ApiError(422, "Denetlenecek metin yok");
  if (blocks.join("\n").length > MAX_PROOFREAD_CHARS) throw new ApiError(413, "Metin tek seferde denetlenemeyecek kadar uzun. Lütfen bir alt başlık seçin veya metnin bir kısmını seçerek denetleyin.");
  const r = await proofread({ planId: s.profile.plan_id, blocks, lang: b.lang, variant: b.variant, glossary });
  await recordUsage(s.user.id, "ai_request", { quantity: r.spend.calls, usage: r.spend.usage, costUsd: r.spend.cost, provider: r.spend.provider, model: r.spend.model, meta: { action: `proofread_${b.lang}`, projectId: id } });
  return json({ issues: r.issues.map((x) => ({ ...x, context: blocks[x.block] })) });
});
