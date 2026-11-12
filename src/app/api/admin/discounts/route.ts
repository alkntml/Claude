import { z } from "zod";
import { ApiError, json, parseBody, route } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";
import { adminClient } from "@/lib/supabase/admin";
import { getSetting } from "@/lib/settings";
import { CODE_RE, normalizeCode } from "@/lib/discount";

/**
 * İndirim kodları yönetimi (D145; yalnızca yönetici). Liste: kodlar + her kodla kayıt olan kullanıcılar +
 * paket fiyatları ve dolar kuru (TL/$ karşılıkları istemcide hesaplanır).
 */
const Code = z.string().transform((s) => normalizeCode(s)).refine((s) => CODE_RE.test(s), "Kod 3–32 karakter olmalı: harf, rakam, - ve _");
const Body = z.object({
  kind: z.enum(["percent", "amount_try"]),
  value: z.number().positive().max(1_000_000),
  plans: z.array(z.string().max(40)).max(20).default([]),
  active: z.boolean().default(true),
  max_uses: z.number().int().positive().max(1_000_000).nullable().default(null),
  expires_at: z.string().datetime({ offset: true }).nullable().default(null),
  note: z.string().max(500).default(""),
}).refine((b) => b.kind !== "percent" || b.value <= 100, { message: "Yüzde 100’ü geçemez", path: ["value"] });

export const GET = route("admin.discounts", async () => {
  await requireAdmin();
  const db = adminClient();
  const [codes, plans, margin] = await Promise.all([
    db.from("discount_codes").select("*").order("created_at", { ascending: false }),
    db.from("plans").select("id, name, price_monthly, sort_order").eq("is_active", true).order("sort_order"),
    getSetting("billing.margin"),
  ]);
  if (codes.error) throw new ApiError(503, "İndirim kodları tablosu yok. Önce migration 38’i Supabase’de çalıştırın.", "migration_missing");
  const { data: users } = await db.from("profiles").select("id, email, full_name, plan_id, discount_code, created_at").not("discount_code", "is", null).order("created_at", { ascending: false }).limit(2000);
  return json({
    codes: codes.data ?? [],
    users: users ?? [],
    plans: (plans.data ?? []).map((p) => ({ id: p.id, name: p.name, price: Number(p.price_monthly) })).filter((p) => p.price > 0),
    usdTry: Number(margin.usd_try) || 0,
  });
});

export const POST = route("admin.discounts.create", async (req) => {
  await requireAdmin();
  const b = await parseBody(req, Body.and(z.object({ code: Code })));
  const { data, error } = await adminClient().from("discount_codes").insert(b).select().single();
  if (error) throw new ApiError(400, error.code === "23505" ? "Bu kod zaten var" : error.message);
  return json({ row: data }, 201);
});

export const PATCH = route("admin.discounts.update", async (req) => {
  await requireAdmin();
  const { code, ...rest } = await parseBody(req, z.object({ code: Code }).passthrough());
  const patch = z.object({
    kind: z.enum(["percent", "amount_try"]).optional(), value: z.number().positive().max(1_000_000).optional(), plans: z.array(z.string().max(40)).max(20).optional(),
    active: z.boolean().optional(), max_uses: z.number().int().positive().max(1_000_000).nullable().optional(), expires_at: z.string().datetime({ offset: true }).nullable().optional(), note: z.string().max(500).optional(),
  }).parse(rest);
  const { data, error } = await adminClient().from("discount_codes").update(patch).eq("code", code).select().single();
  if (error) throw new ApiError(400, error.message.includes("check") ? "Yüzde 100’ü geçemez" : error.message);
  return json({ row: data });
});

/** Silinen kod, bağlı kullanıcılardan da kalkar (ON DELETE SET NULL). Hakkı korumak için silmek yerine “pasif” yapın. */
export const DELETE = route("admin.discounts.delete", async (req) => {
  await requireAdmin();
  const { code } = await parseBody(req, z.object({ code: Code }));
  const { error } = await adminClient().from("discount_codes").delete().eq("code", code);
  if (error) throw new ApiError(400, error.message);
  return json({ ok: true });
});
