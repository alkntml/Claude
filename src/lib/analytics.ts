import "server-only";
/**
 * Gizlilik dostu ölçüm ve ücretsiz araç kullanımı (D90). Kişisel veri saklanmaz: IP adresi ve tarayıcı bilgisi
 * yalnızca o güne ait, geri çözülemeyen bir karma üretmek için kullanılır (gün değişince aynı kişi farklı görünür),
 * kendileri kaydedilmez. Çerez yoktur. Kayıtlara yalnızca sunucu yazar ve yönetici okur.
 */
import { createHash } from "node:crypto";
import { BOT_UA } from "@/lib/seo";
import { adminClient } from "@/lib/supabase/admin";

const SALT = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY ?? "academiana";

export function clientIp(req: Request): string {
  return (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || req.headers.get("x-real-ip") || "0";
}

/** Günlük dönen anonim ziyaretçi karması (16 karakter) */
export function visitorHash(req: Request, now = new Date()): string {
  const day = now.toISOString().slice(0, 10);
  return createHash("sha256").update(`${SALT}|${day}|${clientIp(req)}|${req.headers.get("user-agent") ?? ""}`).digest("hex").slice(0, 16);
}

export function isBot(req: Request): boolean {
  return BOT_UA.test(req.headers.get("user-agent") ?? "");
}

export function deviceOf(ua: string): "mobile" | "tablet" | "desktop" {
  if (/ipad|tablet|(android(?!.*mobile))/i.test(ua)) return "tablet";
  if (/mobi|iphone|android/i.test(ua)) return "mobile";
  return "desktop";
}

/** Kimlik içeren yolları gruplar: /proje/<id> → /proje/:id */
export function normalizePath(path: string): string {
  const p = (path.split(/[?#]/)[0] || "/").slice(0, 300);
  return p
    .replace(/^\/(en\/)?proje\/[^/]+/, (_m, en) => `/${en ?? ""}proje/:id`)
    .replace(/^\/(en\/)?(a|paylasim|davet)\/[^/]+/, (_m, en, seg) => `/${en ?? ""}${seg}/:token`)
    .replace(/\/[0-9a-f]{8}-[0-9a-f-]{27,}/gi, "/:id");
}

/** Yönlendiren sitenin yalnızca alan adı (tam adres kişisel bilgi taşıyabilir) */
export function referrerHost(ref: string | null | undefined, ownHost: string | null): string | null {
  if (!ref) return null;
  try {
    const h = new URL(ref).hostname.replace(/^www\./, "");
    if (!h || (ownHost && h === ownHost.replace(/^www\./, ""))) return null;
    return h.slice(0, 200);
  } catch { return null; }
}

/** Ücretsiz araç kullanımı (ve varsa yapay zekâ maliyeti) kaydı */
export async function recordTool(req: Request, tool: string, data: { userId?: string | null; items?: number; tokensIn?: number; tokensOut?: number; costUsd?: number; model?: string | null } = {}) {
  const visitor = visitorHash(req);
  await adminClient().from("tool_usage").insert({
    tool, visitor, user_id: data.userId ?? null, items: data.items ?? 1, tokens_in: data.tokensIn ?? 0, tokens_out: data.tokensOut ?? 0,
    cost_usd: data.costUsd ?? 0, model: data.model ?? null,
  });
}

/** Ziyaretçi başına saatlik sınır (giriş gerektirmeyen araçların kötüye kullanımına karşı) */
export async function toolRateOk(req: Request, tool: string, perHour: number): Promise<boolean> {
  const since = new Date(Date.now() - 3600_000).toISOString();
  const { count } = await adminClient().from("tool_usage").select("id", { count: "exact", head: true }).eq("visitor", visitorHash(req)).eq("tool", tool).gte("created_at", since);
  return (count ?? 0) < perHour;
}
