import { z } from "zod";
import { json, route } from "@/lib/api";
import { deviceOf, isBot, normalizePath, referrerHost, visitorHash } from "@/lib/analytics";
import { adminClient } from "@/lib/supabase/admin";

const Body = z.object({
  path: z.string().max(500),
  referrer: z.string().max(1000).nullable().optional(),
  utm_source: z.string().max(100).nullable().optional(),
  utm_medium: z.string().max(100).nullable().optional(),
  utm_campaign: z.string().max(100).nullable().optional(),
  locale: z.string().max(5).nullable().optional(),
});

/** Sayfa görüntüleme kaydı (D90): kişisel veri yok; botlar ve “izleme” istemeyen tarayıcılar sayılmaz. */
export const POST = route("public.track", async (req) => {
  if (isBot(req) || req.headers.get("dnt") === "1" || req.headers.get("sec-gpc") === "1") return json({ ok: true });
  const raw = await req.json().catch(() => null);
  const b = Body.safeParse(raw);
  if (!b.success) return json({ ok: true });
  const path = normalizePath(b.data.path);
  if (path.startsWith("/api") || path.startsWith("/yonetim")) return json({ ok: true });
  const ua = req.headers.get("user-agent") ?? "";
  await adminClient().from("analytics_events").insert({
    kind: "pageview", path, visitor: visitorHash(req), device: deviceOf(ua),
    referrer: referrerHost(b.data.referrer, req.headers.get("host")),
    utm_source: b.data.utm_source?.slice(0, 100) || null, utm_medium: b.data.utm_medium?.slice(0, 100) || null, utm_campaign: b.data.utm_campaign?.slice(0, 100) || null,
    locale: b.data.locale === "en" ? "en" : "tr",
  });
  return json({ ok: true });
});
