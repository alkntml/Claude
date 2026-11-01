import { z } from "zod";
import { json, parseBody, route } from "@/lib/api";
import { requireUser } from "@/lib/auth";

export const POST = route("feedback.create", async (req) => {
  const s = await requireUser();
  const b = await parseBody(req, z.object({ message: z.string().trim().min(3).max(5000), page: z.string().max(300).default(""), category: z.enum(["general", "bug", "feature", "source", "billing"]).default("general") }));
  const { error } = await s.supabase.from("feedback").insert({ user_id: s.user.id, message: b.message, page: b.page, category: b.category });
  if (error) throw error;
  return json({ ok: true }, 201);
});
