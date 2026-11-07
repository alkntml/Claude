import { ApiError, json, route } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { inviteProblem, INVITE_PROBLEM_TEXT } from "@/lib/coauthors";
import { displayName } from "@/lib/project-access";
import { adminClient } from "@/lib/supabase/admin";

type Ctx = { params: Promise<{ token: string }> };

/** Ortak yazar davetini kabul eder (D115). Yalnızca davetin gönderildiği e-postayla giriş yapan kişi kabul edebilir. */
export const POST = route<Ctx>("coauthor.accept", async (_req, { params }) => {
  const s = await requireUser();
  const { token } = await params;
  if (!/^[A-Za-z0-9_-]{32,64}$/.test(token)) throw new ApiError(404, INVITE_PROBLEM_TEXT.not_found);
  const admin = adminClient();
  const { data: inv } = await admin.from("project_invites").select("id, project_id, email, role, invited_by, expires_at, accepted_at, accepted_by").eq("token", token).maybeSingle();
  const { data: project } = inv ? await admin.from("projects").select("id, title, user_id").eq("id", inv.project_id).maybeSingle() : { data: null };
  const problem = inviteProblem(inv && project ? inv : null, { id: s.user.id, email: s.user.email ?? null }, project?.user_id ?? null);
  if (problem) throw new ApiError(problem === "not_found" ? 404 : 409, INVITE_PROBLEM_TEXT[problem], `invite_${problem}`);
  const { error } = await admin.from("project_members").upsert({ project_id: inv!.project_id, user_id: s.user.id, role: inv!.role, invited_by: inv!.invited_by }, { onConflict: "project_id,user_id" });
  if (error) throw error;
  if (!inv!.accepted_at) {
    await admin.from("project_invites").update({ accepted_at: new Date().toISOString(), accepted_by: s.user.id }).eq("id", inv!.id);
    await admin.from("notifications").insert({ user_id: project!.user_id, kind: "coauthor_joined", data: { project: String(project!.title).slice(0, 200), name: displayName(s.profile), projectId: project!.id } }).then(() => undefined, () => undefined);
  }
  return json({ projectId: project!.id });
});
