import { z } from "zod";
import { ApiError, json, parseBody, route } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { auditSources, crossCheckSources, type PairInput, type PairResult, type SourceInput } from "@/lib/claim-audit";
import { bestVerdict, extractClaims, relatedCandidates, summarize, type AuditItem } from "@/lib/claims";
import { compatWrite } from "@/lib/db-compat";
import type { JSONNode } from "@/lib/editor/doc";
import { sectionDoc } from "@/lib/editor/sections";
import { localeFromRequest } from "@/i18n/server";
import { childAccess } from "@/lib/project-access";
import { assertSingleProject } from "@/lib/single-project";
import { loadChunks } from "@/lib/sources/chunk-insert";
import { assertWithinLimits, recordUsage } from "@/lib/usage";

export const maxDuration = 180;
type Ctx = { params: Promise<{ id: string }> };

/** Bir denetimde yapay zekâya gönderilecek en fazla yeni (cümle, kaynak) çifti; kalanlar sonraki çalıştırmada */
const MAX_NEW_PAIRS = 40;

/* eslint-disable @typescript-eslint/no-explicit-any */
async function lastAudit(db: any, stageId: string, projectId: string) {
  const { data } = await db.from("claim_audits").select("id, summary, results, created_at, scope").eq("stage_id", stageId).eq("project_id", projectId).order("created_at", { ascending: false }).limit(1).maybeSingle();
  return data as { id: string; summary: any; results: AuditItem[]; created_at: string; scope: string } | null;
}

/** Son denetim (bölümün) */
export const GET = route<Ctx>("claim_audit.get", async (_req, { params }) => {
  const s = await requireUser();
  const { id } = await params;
  const { row: stage, access } = await childAccess(s, "project_stages", id, "read", "id");
  const last = await lastAudit(access.db, id, stage.project_id).catch(() => null);
  return json({ audit: last });
});

/** Denetimi çalıştırır: bölümün (veya bir alt başlığın) iddiaları çıkarılır, atıflı cümleler kaynağıyla karşılaştırılır */
const MAX_CROSS_CLAIMS = 15;
const MAX_CROSS_PAIRS = 24;

export const POST = route<Ctx>("claim_audit.run", async (req, { params }) => {
  const s = await requireUser();
  const { id } = await params;
  const b = await parseBody(req, z.object({ focus: z.number().int().min(0).max(10000).nullable().default(null), crossCheck: z.boolean().default(true) }));
  const { row: stage, access } = await childAccess(s, "project_stages", id, "edit", "id, content");
  await assertSingleProject(s, stage.project_id);
  const doc = (b.focus != null ? sectionDoc(stage.content as JSONNode, b.focus) : stage.content) as JSONNode;
  const claims = extractClaims(doc);
  if (!claims.length) return json({ audit: { id: null, created_at: new Date().toISOString(), scope: b.focus != null ? "section" : "stage", summary: summarize([]), results: [] } });

  // Önceki denetimden değişmeyen (cümle + kaynak + sayfa) sonuçları yeniden kullan
  const prev = await lastAudit(access.db, id, stage.project_id).catch(() => null);
  const cache = new Map<string, Omit<PairResult, "claimId">>();
  for (const it of prev?.results ?? []) for (const c of it.checks ?? []) cache.set(`${it.id}|${c.sourceId}`, c);

  const sourceIds = [...new Set(claims.flatMap((c) => c.citations.flatMap((x) => x.ids)))];
  const { data: srcRows } = sourceIds.length
    ? await access.db.from("sources").select("id, title, abstract, access_level").eq("project_id", stage.project_id).eq("user_id", access.ownerId).in("id", sourceIds)
    : { data: [] as any[] };
  const srcById = new Map<string, any>((srcRows ?? []).map((r: any) => [r.id, r]));

  // Yeni çiftler (önbellekte olmayan), kaynağa göre gruplanır
  const pending = new Map<string, PairInput[]>();
  let newPairs = 0, skipped = 0;
  for (const c of claims) {
    if (c.kind !== "cited") continue;
    for (const cit of c.citations) for (const sid of cit.ids) {
      if (!srcById.has(sid) || cache.has(`${c.id}|${sid}`)) continue;
      if (newPairs >= MAX_NEW_PAIRS) { skipped++; continue; }
      newPairs++;
      if (!pending.has(sid)) pending.set(sid, []);
      pending.get(sid)!.push({ claimId: c.id, sentence: c.text, locator: cit.locator });
    }
  }

  let fresh: PairResult[] = [];
  if (pending.size) {
    await assertWithinLimits(s.user.id, s.profile.plan_id, "ai_request");
    const full = [...pending.keys()].filter((sid) => srcById.get(sid)?.access_level === "full_text");
    const { data: chunks } = full.length
      ? await access.db.from("source_chunks").select("source_id, content, page_hint").in("source_id", full).eq("user_id", access.ownerId).order("chunk_index").limit(6000)
      : { data: [] as any[] };
    const groups = [...pending.entries()].map(([sid, pairs]) => {
      const r = srcById.get(sid);
      const source: SourceInput = { id: sid, title: r.title, abstract: r.access_level === "metadata" ? null : r.abstract, access_level: r.access_level, chunks: (chunks ?? []).filter((c: any) => c.source_id === sid) };
      return { source, pairs };
    });
    const out = await auditSources({ planId: s.profile.plan_id, lang: localeFromRequest(req), groups });
    fresh = out.results;
    if (out.calls) {
      await recordUsage(s.user.id, "ai_request", { quantity: Math.max(1, Math.ceil(out.calls / 2)), usage: out.usage, costUsd: out.cost, provider: out.provider, model: out.model, meta: { action: "claim_audit", projectId: stage.project_id, pairs: newPairs } });
    }
  }
  for (const r of fresh) { const { claimId, ...rest } = r; cache.set(`${claimId}|${r.sourceId}`, rest); }

  const results: AuditItem[] = claims.map((c) => {
    const checks = c.kind === "cited" ? [...new Set(c.citations.flatMap((x) => x.ids))].map((sid) => cache.get(`${c.id}|${sid}`)).filter(Boolean) as AuditItem["checks"] : [];
    const old = prev?.results?.find((x) => x.id === c.id);
    return { ...c, checks, verdict: checks.length ? bestVerdict(checks.map((x) => x.verdict)) : null, ...(old?.relatedChecked ? { related: old.related ?? [], relatedChecked: true } : {}) };
  });

  // D133: kaynaklar arası destek/çelişki — cümlenin atıf yapmadığı proje kaynakları (önceden bakılmış cümleler atlanır)
  if (b.crossCheck) {
    const todo = results.filter((r) => !r.relatedChecked && (r.kind !== "cited" || (r.verdict && r.verdict !== "supports") || r.checks.some((c) => c.verdict === "supports")))
      // Önce atıfsız iddialar ve desteklenmeyenler (en çok işe yarayanlar)
      .sort((a, b2) => (a.kind === "cited" ? 1 : 0) - (b2.kind === "cited" ? 1 : 0)).slice(0, MAX_CROSS_CLAIMS);
    if (todo.length) {
      const { data: pool } = await access.db.from("sources").select("id, title, abstract, access_level").eq("project_id", stage.project_id).eq("user_id", access.ownerId).neq("access_level", "metadata").limit(300);
      const texts = (pool ?? []).map((p: any) => ({ id: p.id, text: `${p.title} ${p.abstract ?? ""}` }));
      const want = new Map<string, { claimId: string; sentence: string }[]>();
      let pairs = 0;
      for (const r of todo) for (const sid of relatedCandidates(r, texts)) {
        if (pairs >= MAX_CROSS_PAIRS) break;
        pairs++;
        if (!want.has(sid)) want.set(sid, []);
        want.get(sid)!.push({ claimId: r.id, sentence: r.text });
      }
      if (want.size) {
        await assertWithinLimits(s.user.id, s.profile.plan_id, "ai_request");
        const poolById = new Map<string, any>((pool ?? []).map((p: any) => [p.id, p]));
        const fullIds = [...want.keys()].filter((sid) => poolById.get(sid)?.access_level === "full_text");
        const chunks = await loadChunks(access.db, { sourceIds: fullIds, userId: access.ownerId, limit: 6000 });
        const groups = [...want.entries()].map(([sid, cl]) => { const p = poolById.get(sid); return { source: { id: sid, title: p.title, abstract: p.abstract, access_level: p.access_level, chunks: chunks.filter((c) => c.source_id === sid) } as SourceInput, claims: cl }; });
        const cx = await crossCheckSources({ planId: s.profile.plan_id, lang: localeFromRequest(req), groups });
        if (cx.calls) await recordUsage(s.user.id, "ai_request", { quantity: Math.max(1, Math.ceil(cx.calls / 2)), usage: cx.usage, costUsd: cx.cost, provider: cx.provider, model: cx.model, meta: { action: "claim_crosscheck", projectId: stage.project_id, pairs } });
        for (const r of todo) r.related = cx.results.filter((x) => x.claimId === r.id).map((x) => ({ sourceId: x.sourceId, stance: x.stance, explanation: x.explanation, quote: x.quote, quotePage: x.quotePage }));
      }
      for (const r of todo) { r.related = r.related ?? []; r.relatedChecked = true; }
    }
  }
  const summary = { ...summarize(results), skipped };
  const scope = b.focus != null ? "section" : "stage";
  const { data: saved } = await compatWrite({ project_id: stage.project_id, stage_id: id, user_id: access.ownerId, actor_id: s.user.id, scope, summary, results },
    (row) => access.db.from("claim_audits").insert(row).select("id, created_at").single());
  if (!saved && newPairs) throw new ApiError(409, "Bu özellik için veritabanı güncellemesi gerekiyor (migration 33).", "migration_required");
  return json({ audit: { id: saved?.id ?? null, created_at: saved?.created_at ?? new Date().toISOString(), scope, summary, results } });
});
/* eslint-enable @typescript-eslint/no-explicit-any */
