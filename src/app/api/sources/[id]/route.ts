import { assertDeleted, json, parseBody, route } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { childAccess } from "@/lib/project-access";
import { SourceInput, toRow } from "@/lib/sources/input";

type Ctx = { params: Promise<{ id: string }> };

export const GET = route<Ctx>("source.get", async (_req, { params }) => {
  const s = await requireUser();
  const { id } = await params;
  const { row } = await childAccess(s, "sources", id, "read");
  return json({ source: row });
});

export const PATCH = route<Ctx>("source.update", async (req, { params }) => {
  const s = await requireUser();
  const { id } = await params;
  const { row: cur, access } = await childAccess(s, "sources", id, "edit", "id, access_level, doi, pmid, arxiv_id, title");
  const b = await parseBody(req, SourceInput.partial().extend({ notes: SourceInput.shape.relevanceNote }));
  const full = toRow({ ...b, title: b.title ?? cur.title, origins: b.origins ?? ["manual"], authors: b.authors ?? [] } as Parameters<typeof toRow>[0]);
  const update: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(full)) {
    const camel = k.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
    if (camel in b || (k === "container_title" && "containerTitle" in b) || (k === "relevance_note" && "relevanceNote" in b)) update[k] = v;
  }
  delete update.origin;
  // Tam metin seviyesi istemciyle düşürülmez/yükseltilmez
  if (cur.access_level === "full_text") delete update.access_level;
  if (b.notes !== undefined) update.notes = b.notes;
  // Tanımlayıcı değiştiyse doğrulama sıfırlanır
  if ("doi" in update || "pmid" in update || "arxiv_id" in update) { update.verified = false; update.verification = {}; }
  const { data, error } = await access.db.from("sources").update(update).eq("id", id).eq("user_id", access.ownerId).select().single();
  if (error) throw error;
  return json({ source: data });
});

export const DELETE = route<Ctx>("source.delete", async (_req, { params }) => {
  const s = await requireUser();
  const { id } = await params;
  const { access } = await childAccess(s, "sources", id, "edit", "id");
  assertDeleted(await access.db.from("sources").delete().eq("id", id).eq("user_id", access.ownerId).select("id"), "Kaynak bulunamadı");
  return json({ ok: true });
});
