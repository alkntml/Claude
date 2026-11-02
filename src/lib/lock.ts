import "server-only";
import { cache } from "react";
import { getSession } from "@/lib/auth";
import { syncWorkLock, type LockReason } from "@/lib/usage";

export interface WorkLockInfo { locked: boolean; reasons: LockReason[] }

/** İstek başına bir kez: oturumdaki kullanıcının çalışma kilidi durumu (bayrağı da eşitler). */
export const getWorkLock = cache(async (): Promise<WorkLockInfo> => {
  const s = await getSession();
  if (!s) return { locked: false, reasons: [] };
  try {
    return await syncWorkLock(s.user.id, s.profile.plan_id, { isAdmin: s.profile.role === "admin", stored: !!s.profile.work_locked });
  } catch {
    // Hesaplanamazsa saklı bayrağa güven (veritabanı kuralları zaten bayrağa göre çalışır)
    return { locked: !!s.profile.work_locked && s.profile.role !== "admin", reasons: [] };
  }
});
