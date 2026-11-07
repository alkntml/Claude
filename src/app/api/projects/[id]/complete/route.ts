import { z } from "zod";
import { ApiError, json, parseBody, route } from "@/lib/api";
import { requireProject, requireUser } from "@/lib/auth";
import { AUTOCOMPLETE_DAILY, suggestContinuation } from "@/lib/autocomplete";
import { detectLang } from "@/lib/editor/translate-doc";
import { assertSingleProject } from "@/lib/single-project";
import { adminClient } from "@/lib/supabase/admin";
import { assertWithinLimits, isAdminUser, recordUsage } from "@/lib/usage";

export const maxDuration = 20;
type Ctx = { params: Promise<{ id: string }> };

const Body = z.object({ before: z.string().min(20).max(4000), stageTitle: z.string().max(300).default(""), focusTitle: z.string().max(300).nullable().optional() });

/** Türkiye saatiyle bugünün başlangıcı */
const trDayStart = () => { const TR = 3 * 3600_000; const d = new Date(Date.now() + TR); return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()) - TR).toISOString(); };

/** Satır içi otomatik tamamlama (D113): haktan düşmez; günlük sınır, dakikalık sınır ve maliyet tavanı uygulanır */
export const POST = route<Ctx>("project.complete", async (req, { params }) => {
  const s = await requireUser();
  const { id } = await params;
  const project = await requireProject(s, id);
  const b = await parseBody(req, Body);
  await assertSingleProject(s, id);
  // Maliyet tavanı (haktan düşmeden)
  await assertWithinLimits(s.user.id, s.profile.plan_id, "ai_request", { costOnly: true });
  if (!(await isAdminUser(s.user.id).catch(() => false))) {
    const db = adminClient();
    const [{ count: today }, { count: minute }] = await Promise.all([
      db.from("usage_events").select("id", { count: "exact", head: true }).eq("user_id", s.user.id).eq("kind", "autocomplete").gte("created_at", trDayStart()),
      db.from("usage_events").select("id", { count: "exact", head: true }).eq("user_id", s.user.id).eq("kind", "autocomplete").gte("created_at", new Date(Date.now() - 60_000).toISOString()),
    ]);
    if ((minute ?? 0) >= 30) throw new ApiError(429, "Çok hızlı öneri istendi", "rate_limited");
    if ((today ?? 0) >= (AUTOCOMPLETE_DAILY[s.profile.plan_id] ?? 30)) throw new ApiError(429, "Bugünkü otomatik tamamlama sınırına ulaşıldı; yarın yenilenir.", "autocomplete_daily");
  }
  const r = await suggestContinuation({ planId: s.profile.plan_id, before: b.before, stageTitle: b.stageTitle, focusTitle: b.focusTitle, projectTitle: project.title, lang: detectLang(b.before) });
  await recordUsage(s.user.id, "autocomplete", { quantity: 1, usage: r.usage, costUsd: r.cost, provider: r.provider, model: r.model, meta: { projectId: id, shown: !!r.text } });
  return json({ text: r.text });
});
