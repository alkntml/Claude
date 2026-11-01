import { ApiError, json, parseBody, route } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { SourceInput, toRow } from "@/lib/sources/input";

type Ctx = { params: Promise<{ id: string }> };

export const PATCH = route<Ctx>("source.update", async (req, { params }) => {
  const s = await requireUser();
  const { id } = await params;
  const { data: cur } = await s.supabase.from("sources").select("id, access_level, doi, pmid, arxiv_id, title").eq("id", id).eq("user_id", s.user.id).maybeSingle();
  if (!cur) throw new ApiError(404, "Kaynak bulunamadı");
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
  const { data, error } = await s.supabase.from("sources").update(update).eq("id", id).select().single();
  if (error) throw error;
  return json({ source: data });
});

export const DELETE = route<Ctx>("source.delete", async (_req, { params }) => {
  const s = await requireUser();
  const { id } = await params;
  await s.supabase.from("sources").delete().eq("id", id).eq("user_id", s.user.id);
  return json({ ok: true });
});
