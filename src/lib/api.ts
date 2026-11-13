import "server-only";
import { AsyncLocalStorage } from "node:async_hooks";
import { makeT } from "@/i18n";
import { localeFromRequest } from "@/i18n/server";
import { NextResponse } from "next/server";
import { ZodError, type ZodTypeAny, type output } from "zod";
import { adminClient } from "@/lib/supabase/admin";
import { scrubMeta, scrubPII } from "@/lib/pii";

/** İstek kapsamı: oturum açan kullanıcı (requireUser yazar); hata hâlinde harcanan yapay zekâ maliyetini kaydetmek için (D94) */
export const requestCtx = new AsyncLocalStorage<{ userId?: string; route?: string }>();

/**
 * Yapay zekâ çağrısı faturalandı ama yanıt kullanılamadı (ör. JSON bozuk). `route()` bu hatayı yakalayınca maliyeti
 * kullanıcının hakkından düşmeden (quantity 0) kaydeder ve kullanıcıya hata mesajını gösterir.
 */
export class AiSpentError extends Error {
  constructor(message: string, public spent: { tokensIn: number; tokensOut: number; costUsd: number; model: string; provider: string; action: string; cache?: { r: number; w: number } }) {
    super(message);
  }
}

/** Kullanılamayan ama faturalanan yapay zekâ çağrısının maliyetini kaydeder (kullanıcı hakkından düşmez) */
export async function recordAiSpent(e: AiSpentError, userId: string | null) {
  if (!userId) return;
  const sp = e.spent;
  await adminClient().from("usage_events").insert({
    user_id: userId, kind: "ai_request", quantity: 0, tokens_in: sp.tokensIn, tokens_out: sp.tokensOut, cost_usd: sp.costUsd, provider: sp.provider, model: sp.model,
    meta: { action: sp.action, failed: true, ...(sp.cache ? { cache: sp.cache } : {}) },
  }).then(() => undefined, () => undefined);
}

export class ApiError extends Error {
  constructor(public status: number, message: string, public code?: string, public extra?: Record<string, unknown>) {
    super(message);
  }
}

/**
 * Silme sonucunu doğrular: hata varsa fırlatır, hiçbir satır silinmediyse 404 verir.
 * Böylece “silindi” yanıtı yalnızca kayıt veritabanından gerçekten kalktığında döner.
 * Kullanım: `assertDeleted(await q.delete().eq(...).select("id"))`
 */
export function assertDeleted(res: { data: unknown[] | null; error: unknown }, message = "Kayıt bulunamadı veya silinemedi") {
  if (res.error) throw res.error;
  if (!res.data?.length) throw new ApiError(404, message);
}

export const json = (data: unknown, status = 200) => NextResponse.json(data, { status });

export async function parseBody<S extends ZodTypeAny>(req: Request, schema: S): Promise<output<S>> {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    throw new ApiError(400, "Geçersiz JSON gövdesi");
  }
  const r = schema.safeParse(raw);
  if (!r.success) throw new ApiError(422, "Geçersiz istek", "validation", { issues: r.error.issues.map((i) => ({ path: i.path.join("."), message: i.message })) });
  return r.data;
}

/** Durum değiştiren isteklerde aynı köken kontrolü (CSRF savunması; çerezler ayrıca SameSite=Lax). */
export function assertSameOrigin(req: Request) {
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) return;
  const origin = req.headers.get("origin");
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  if (!origin || !host) throw new ApiError(403, "Köken doğrulanamadı");
  try {
    if (new URL(origin).host !== host) throw new ApiError(403, "Farklı kökenden istek reddedildi");
  } catch (e) {
    if (e instanceof ApiError) throw e;
    throw new ApiError(403, "Köken doğrulanamadı");
  }
}

export async function logError(route: string, err: unknown, userId?: string | null, meta: Record<string, unknown> = {}) {
  try {
    const e = err instanceof Error ? err : new Error(String(err));
    // D154: e-posta, telefon, IP ve belirteçler kayda girmeden maskelenir
    await adminClient().from("error_logs").insert({ route, message: scrubPII(e.message).slice(0, 2000), stack: e.stack ? scrubPII(e.stack).slice(0, 8000) : undefined, user_id: userId ?? null, meta: scrubMeta(meta) });
  } catch {
    console.error("[error_logs]", route, err);
  }
}

type Handler<C> = (req: Request, ctx: C) => Promise<Response>;

/** Ortak hata yakalama + CSRF kontrolü. */
export function route<C>(name: string, fn: Handler<C>): Handler<C> {
  return (req, ctx) => requestCtx.run({ route: name }, async () => {
    try {
      assertSameOrigin(req);
      return await fn(req, ctx);
    } catch (e) {
      // Hata mesajları kullanıcının arayüz diline çevrilir (sözlükte yoksa Türkçe kalır)
      const T = makeT(localeFromRequest(req));
      if (e instanceof ApiError) return json({ error: T(e.message), code: e.code, ...e.extra }, e.status);
      if (e instanceof AiSpentError) {
        const userId = requestCtx.getStore()?.userId ?? null;
        await recordAiSpent(e, userId);
        await logError(name, e, userId, { action: e.spent.action, costUsd: e.spent.costUsd });
        return json({ error: T(e.message) }, 502);
      }
      if (e instanceof ZodError) return json({ error: T("Geçersiz istek") }, 422);
      await logError(name, e);
      return json({ error: T("Beklenmeyen bir hata oluştu") }, 500);
    }
  });
}
