import { NextResponse } from "next/server";
import { route } from "@/lib/api";
import { systemStatus } from "@/lib/status";

/** D213: sistem durumu (herkese açık; kişisel veri yok) */
export const GET = route("public.status", async () => {
  const r = await systemStatus();
  return NextResponse.json(r, { headers: { "cache-control": "public, s-maxage=60, stale-while-revalidate=60" } });
});
