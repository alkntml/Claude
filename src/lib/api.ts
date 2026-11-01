import "server-only";
import { makeT } from "@/i18n";
import { localeFromRequest } from "@/i18n/server";
import { NextResponse } from "next/server";
import { ZodError, type ZodTypeAny, type output } from "zod";
import { adminClient } from "@/lib/supabase/admin";

export class ApiError extends Error {
  constructor(public status: number, message: string, public code?: string, public extra?: Record<string, unknown>) {
    super(message);
  }
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
    await adminClient().from("error_logs").insert({ route, message: e.message.slice(0, 2000), stack: e.stack?.slice(0, 8000), user_id: userId ?? null, meta });
  } catch {
    console.error("[error_logs]", route, err);
  }
}

type Handler<C> = (req: Request, ctx: C) => Promise<Response>;

/** Ortak hata yakalama + CSRF kontrolü. */
export function route<C>(name: string, fn: Handler<C>): Handler<C> {
  return async (req, ctx) => {
    try {
      assertSameOrigin(req);
      return await fn(req, ctx);
    } catch (e) {
      // Hata mesajları kullanıcının arayüz diline çevrilir (sözlükte yoksa Türkçe kalır)
      const T = makeT(localeFromRequest(req));
      if (e instanceof ApiError) return json({ error: T(e.message), code: e.code, ...e.extra }, e.status);
      if (e instanceof ZodError) return json({ error: T("Geçersiz istek") }, 422);
      await logError(name, e);
      return json({ error: T("Beklenmeyen bir hata oluştu") }, 500);
    }
  };
}
