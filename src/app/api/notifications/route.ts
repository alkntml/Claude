import { z } from "zod";
import { json, parseBody, route } from "@/lib/api";
import { requireUser } from "@/lib/auth";

/** Bildirim kutusu (D100): son bildirimler ve okunmamış sayısı. Tablo henüz kurulmadıysa boş döner. */
export const GET = route("notifications.list", async () => {
  const s = await requireUser();
  const { data, error } = await s.supabase.from("notifications").select("id, kind, data, read_at, created_at").eq("user_id", s.user.id).order("created_at", { ascending: false }).limit(30);
  if (error) return json({ items: [], unread: 0 });
  const items = data ?? [];
  return json({ items, unread: items.filter((n) => !n.read_at).length });
});

const Body = z.object({ action: z.literal("read_all") });

/** Tümünü okundu işaretler */
export const POST = route("notifications.read", async (req) => {
  const s = await requireUser();
  await parseBody(req, Body);
  await s.supabase.from("notifications").update({ read_at: new Date().toISOString() }).eq("user_id", s.user.id).is("read_at", null);
  return json({ ok: true });
});
