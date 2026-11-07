import { z } from "zod";
import { ApiError, json, parseBody, route } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";
import { ADMIN_RESOURCES, SETTING_KEYS, type AdminResource } from "@/lib/admin-resources";
import { invalidateSettings } from "@/lib/settings";
import { revalidateTag } from "next/cache";
import { adminClient } from "@/lib/supabase/admin";

type Ctx = { params: Promise<{ resource: string }> };

function resolve(name: string) {
  if (!(name in ADMIN_RESOURCES)) throw new ApiError(404, "Bilinmeyen kaynak");
  return ADMIN_RESOURCES[name as AdminResource];
}

export const GET = route<Ctx>("admin.list", async (req, { params }) => {
  await requireAdmin();
  const { resource } = await params;
  const r = resolve(resource);
  const url = new URL(req.url);
  const page = Math.max(0, Number(url.searchParams.get("page") ?? 0));
  const q = url.searchParams.get("q")?.slice(0, 100);
  let query = adminClient().from(r.table).select(r.select, { count: "exact" }).order(r.order, { ascending: r.order === "sort_order" || r.order === "key" }).range(page * 50, page * 50 + 49);
  if (q) query = query.ilike(r.search, `%${q.replace(/[%_]/g, "")}%`);
  const { data, count, error } = await query;
  if (error) throw error;
  return json({ rows: data ?? [], count: count ?? 0, page });
});

export const POST = route<Ctx>("admin.create", async (req, { params }) => {
  await requireAdmin();
  const { resource } = await params;
  const r = resolve(resource);
  if (!r.create) throw new ApiError(405, "Bu kaynak için oluşturma desteklenmiyor");
  const body = await parseBody(req, r.create as z.ZodTypeAny);
  const { data, error } = await adminClient().from(r.table).insert(body).select().single();
  if (error) throw new ApiError(400, error.message);
  if (resource === "plans") revalidateTag("plans"); // tanıtım sayfalarındaki paket önbelleğini yenile
  return json({ row: data }, 201);
});

export const PATCH = route<Ctx>("admin.update", async (req, { params }) => {
  const s = await requireAdmin();
  const { resource } = await params;
  const r = resolve(resource);
  if (!r.update) throw new ApiError(405, "Bu kaynak güncellenemez");
  const { id, ...rest } = await parseBody(req, z.object({ id: z.union([z.string(), z.number()]) }).passthrough());
  const patch = (r.update as z.ZodTypeAny).parse(rest) as Record<string, unknown>;
  const db = adminClient();
  if (resource === "settings") {
    if (!SETTING_KEYS.includes(String(id) as (typeof SETTING_KEYS)[number])) throw new ApiError(422, "Bilinmeyen ayar");
    if (JSON.stringify(patch.value ?? null).length > 200_000) throw new ApiError(413, "Ayar çok büyük");
    const { data, error } = await db.from("app_settings").upsert({ key: String(id), value: patch.value, updated_by: s.user.id, updated_at: new Date().toISOString() }).select().single();
    if (error) throw error;
    invalidateSettings();
    if (String(id) === "billing.margin") revalidateTag("fx"); // dolar fiyatları (D59)
    return json({ row: data });
  }
  if (resource === "users" && String(id) === s.user.id && patch.role === "user") throw new ApiError(422, "Kendi yönetici yetkinizi kaldıramazsınız");
  // D109: Tek Proje paketinin süresi yoktur; bitiş tarihi yazılırsa paket ileride ücretsize düşerdi
  if (resource === "users" && ("plan_id" in patch || "plan_expires_at" in patch)) {
    const { data: cur } = await db.from("profiles").select("plan_id").eq("id", id).maybeSingle();
    if ((patch.plan_id ?? cur?.plan_id) === "single") patch.plan_expires_at = null;
  }
  const key = resource === "settings" ? "key" : "id";
  const { data, error } = await db.from(r.table).update(patch).eq(key, id).select().single();
  if (error) throw new ApiError(400, error.message);
  if (resource === "plans") revalidateTag("plans"); // tanıtım sayfalarındaki paket önbelleğini yenile
  return json({ row: data });
});

export const DELETE = route<Ctx>("admin.delete", async (req, { params }) => {
  await requireAdmin();
  const { resource } = await params;
  const r = resolve(resource);
  if (!r.deletable) throw new ApiError(405, "Bu kaynak silinemez");
  const { id } = await parseBody(req, z.object({ id: z.union([z.string(), z.number()]) }));
  if (resource === "plans" && id === "free") throw new ApiError(422, "Ücretsiz paket silinemez");
  const { error } = await adminClient().from(r.table).delete().eq("id", id);
  if (error) throw new ApiError(400, error.message);
  if (resource === "plans") revalidateTag("plans"); // tanıtım sayfalarındaki paket önbelleğini yenile
  return json({ ok: true });
});
