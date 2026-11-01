import { json, route } from "@/lib/api";
import { requireUser } from "@/lib/auth";

export const GET = route("announcements.list", async () => {
  const s = await requireUser();
  const { data } = await s.supabase.from("announcements").select("id, title, body, level, starts_at").order("starts_at", { ascending: false }).limit(5);
  return json({ announcements: data ?? [] });
});
