import { z } from "zod";
import { ApiError, json, parseBody, route } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { canMove, EMPTY_PROTOCOL, findFuzzyDuplicate, recordKey, REVIEW_STAGES, type ReviewStage } from "@/lib/prisma";
import { isMissingColumn } from "@/lib/db-compat";
import { projectAccess } from "@/lib/project-access";
import { parseReferences } from "@/lib/sources/bib";
import { assertFeature } from "@/lib/usage";

type Ctx = { params: Promise<{ id: string }> };
export const maxDuration = 60;
const MAX_RECORDS = 5000;

const Person = z.object({ family: z.string().max(200).optional(), given: z.string().max(200).optional(), literal: z.string().max(300).optional() }).passthrough();
const RecordData = z.object({
  title: z.string().trim().min(2).max(1000),
  authors: z.array(Person).max(100).optional(),
  year: z.number().int().min(1000).max(2100).nullable().optional(),
  containerTitle: z.string().max(500).nullable().optional(),
  doi: z.string().max(300).nullable().optional(),
  url: z.string().max(1000).nullable().optional(),
  abstract: z.string().max(12000).nullable().optional(),
  type: z.string().max(40).optional(),
  volume: z.string().max(40).nullable().optional(), issue: z.string().max(40).nullable().optional(), pages: z.string().max(40).nullable().optional(),
  publisher: z.string().max(300).nullable().optional(), pmid: z.string().max(40).nullable().optional(), arxivId: z.string().max(60).nullable().optional(), isbn: z.string().max(40).nullable().optional(),
});
const Search = z.object({ database: z.string().trim().min(1).max(60), query: z.string().trim().max(1000), date: z.string().max(20), results: z.number().int().min(0).max(1_000_000) });
const Protocol = z.object({ question: z.string().max(2000), inclusion: z.array(z.string().trim().max(300)).max(20), exclusion: z.array(z.string().trim().max(300)).max(20), searches: z.array(Search).max(50), dual: z.boolean().optional() });

/* eslint-disable @typescript-eslint/no-explicit-any */
/** Kayıtlar + protokol (D122) */
export const GET = route<Ctx>("review.list", async (_req, { params }) => {
  const s = await requireUser();
  assertFeature(s.profile.plan_id, "prisma");
  const { id } = await params;
  const acc = await projectAccess(s, id, "read");
  const q = (cols: string) => acc.db.from("review_records").select(cols).eq("project_id", id).eq("user_id", acc.ownerId).order("created_at").limit(MAX_RECORDS);
  // D134 sütunları (oylar, veri çıkarma, kalite) migration 36 ile gelir; yoksa eski sütunlarla okunur
  let { data, error } = await q("id, key, origin, stage, reason, record, ai, source_id, created_at, votes, extraction, appraisal");
  let upgraded = true;
  if (error && isMissingColumn(error)) { upgraded = false; ({ data, error } = await q("id, key, origin, stage, reason, record, ai, source_id, created_at")); }
  if (error && /review_records/.test(error.message)) throw new ApiError(409, "Bu özellik için veritabanı güncellemesi gerekiyor (migration 33).", "migration_required");
  return json({ records: data ?? [], protocol: { ...EMPTY_PROTOCOL, ...(acc.project.context?.review ?? {}) }, me: s.user.id, upgraded });
});

/** Kayıt ekleme: arama sonuçları, RIS/BibTeX içe aktarma veya elle. Yinelenenler “duplicate” aşamasında saklanır (akış şemasında sayılır). */
export const POST = route<Ctx>("review.add", async (req, { params }) => {
  const s = await requireUser();
  assertFeature(s.profile.plan_id, "prisma");
  const { id } = await params;
  const acc = await projectAccess(s, id, "edit");
  const b = await parseBody(req, z.discriminatedUnion("action", [
    z.object({ action: z.literal("add"), origin: z.string().trim().min(1).max(60), records: z.array(RecordData).min(1).max(500), search: Search.optional() }),
    z.object({ action: z.literal("import"), origin: z.string().trim().min(1).max(60), text: z.string().min(10).max(5_000_000), search: Search.optional() }),
  ]));
  let incoming: z.infer<typeof RecordData>[] = [];
  if (b.action === "import") {
    const { format, refs } = parseReferences(b.text, null);
    if (!format) throw new ApiError(422, "Dosya biçimi tanınmadı. Scopus, Web of Science veya diğer veri tabanlarından RIS ya da BibTeX olarak dışa aktarın.");
    incoming = refs.slice(0, 2000).filter((r) => r.title?.trim().length >= 2).map((r) => ({ title: r.title.slice(0, 1000), authors: (r.authors ?? []).slice(0, 100) as any, year: r.year, containerTitle: r.containerTitle ?? null, doi: r.doi ?? null, url: r.url ?? null, abstract: (r.abstract ?? null)?.slice(0, 12000) ?? null, type: r.type, volume: r.volume ?? null, issue: r.issue ?? null, pages: r.pages ?? null, publisher: r.publisher ?? null, pmid: r.pmid ?? null, arxivId: r.arxivId ?? null, isbn: r.isbn ?? null }));
  } else incoming = b.records;
  if (!incoming.length) throw new ApiError(422, "Eklenecek kayıt bulunamadı");

  const { data: existing, count } = await acc.db.from("review_records").select("key, stage, title:record->>title, year:record->>year, doi:record->>doi", { count: "exact" }).eq("project_id", id).eq("user_id", acc.ownerId).limit(MAX_RECORDS);
  if ((count ?? 0) + incoming.length > MAX_RECORDS) throw new ApiError(422, `Bir derlemede en fazla ${MAX_RECORDS} kayıt tutulabilir.`);
  const live = (existing ?? []).filter((r: any) => r.stage !== "duplicate");
  const seen = new Set(live.map((r: any) => r.key));
  // D134: DOI’siz veya farklı yazılmış aynı yayınlar için başlık benzerliği (bulanık eşleşme)
  const pool = live.map((r: any) => ({ key: r.key, title: String(r.title ?? ""), year: r.year ? Number(r.year) : null, doi: r.doi ?? null }));
  let fuzzy = 0;
  const rows = incoming.map((r) => {
    const key = recordKey(r);
    const exact = seen.has(key);
    const near = exact ? null : findFuzzyDuplicate(r, pool);
    if (near) fuzzy++;
    if (!exact && !near) { seen.add(key); pool.push({ key, title: r.title, year: r.year ?? null, doi: r.doi ?? null }); }
    const dup = exact || !!near;
    return { project_id: id, user_id: acc.ownerId, key: key.slice(0, 600), origin: b.origin, stage: dup ? "duplicate" : "identified", reason: near ? "Olası yinelenen (benzer başlık ve yıl)" : null, record: r, decided_by: null };
  });
  const { error } = await acc.db.from("review_records").insert(rows);
  if (error) throw error;
  if (b.search) {
    const proto = { ...EMPTY_PROTOCOL, ...(acc.project.context?.review ?? {}) };
    proto.searches = [...proto.searches, b.search].slice(-50);
    await acc.db.from("projects").update({ context: { ...(acc.project.context ?? {}), review: proto } }).eq("id", id).eq("user_id", acc.ownerId);
  }
  return json({ added: rows.filter((r) => r.stage === "identified").length, duplicates: rows.filter((r) => r.stage === "duplicate").length, fuzzy }, 201);
});

/** Toplu karar: aşama + gerekçe. Aşama atlama engellenir (ör. taranmadan dahil edilemez). */
export const PATCH = route<Ctx>("review.decide", async (req, { params }) => {
  const s = await requireUser();
  assertFeature(s.profile.plan_id, "prisma");
  const { id } = await params;
  const acc = await projectAccess(s, id, "edit");
  const b = await parseBody(req, z.object({ ids: z.array(z.string().uuid()).min(1).max(500), stage: z.enum(REVIEW_STAGES as [ReviewStage, ...ReviewStage[]]), reason: z.string().trim().max(300).nullable().optional() }));
  if ((b.stage === "excluded_screening" || b.stage === "excluded_eligibility") && !b.reason) throw new ApiError(422, "Hariç tutma gerekçesi seçin");
  const { data: cur } = await acc.db.from("review_records").select("id, stage").eq("project_id", id).eq("user_id", acc.ownerId).in("id", b.ids);
  const ok = (cur ?? []).filter((r: any) => canMove(r.stage, b.stage)).map((r: any) => r.id);
  if (ok.length) {
    const { error } = await acc.db.from("review_records").update({ stage: b.stage, reason: b.reason ?? null, decided_by: s.user.id, updated_at: new Date().toISOString() }).eq("project_id", id).eq("user_id", acc.ownerId).in("id", ok);
    if (error) throw error;
  }
  return json({ updated: ok.length, skipped: b.ids.length - ok.length });
});

/** Protokolü kaydeder (soru, dahil etme/hariç tutma ölçütleri, aramalar) */
export const PUT = route<Ctx>("review.protocol", async (req, { params }) => {
  const s = await requireUser();
  assertFeature(s.profile.plan_id, "prisma");
  const { id } = await params;
  const acc = await projectAccess(s, id, "edit");
  const protocol = await parseBody(req, Protocol);
  const { error } = await acc.db.from("projects").update({ context: { ...(acc.project.context ?? {}), review: protocol } }).eq("id", id).eq("user_id", acc.ownerId);
  if (error) throw error;
  return json({ protocol });
});

export const DELETE = route<Ctx>("review.delete", async (req, { params }) => {
  const s = await requireUser();
  assertFeature(s.profile.plan_id, "prisma");
  const { id } = await params;
  const acc = await projectAccess(s, id, "edit");
  const b = await parseBody(req, z.object({ ids: z.array(z.string().uuid()).min(1).max(5000) }));
  const { error } = await acc.db.from("review_records").delete().eq("project_id", id).eq("user_id", acc.ownerId).in("id", b.ids);
  if (error) throw error;
  return json({ ok: true });
});
/* eslint-enable @typescript-eslint/no-explicit-any */
