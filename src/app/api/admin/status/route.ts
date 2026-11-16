import { json, route } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";
import { systemStatus } from "@/lib/status";

/** D216: sistem durumu yalnızca yöneticiye (Yönetim → Sistem durumu) */
export const GET = route("admin.status", async () => {
  await requireAdmin();
  return json(await systemStatus());
});
