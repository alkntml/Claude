"use client";
/** İstemci tarafı API çağrısı: hata mesajlarını Türkçe olarak yüzeye çıkarır. */
export class ClientApiError extends Error {
  constructor(public status: number, message: string, public code?: string, public extra?: Record<string, unknown>) {
    super(message);
  }
}

/** Paket sınırı / kilitli özellik: yükseltme penceresini açar (UpgradeDialogHost dinler) */
export interface UpgradeRequest { code?: string; message?: string; feature?: string; plan?: string; target?: string; projectId?: string; projectTitle?: string; period?: "monthly" | "yearly" }

/** Açık çalışma (kilit penceresindeki “mevcut çalışmayı indir” mesajı için) */
let currentProject: { id: string; title: string } | null = null;
export function setCurrentProject(p: { id: string; title: string } | null) { currentProject = p; }
export function getCurrentProject() { return currentProject; }
export const UPGRADE_EVENT = "academiana:upgrade";
export function openUpgrade(detail: UpgradeRequest) {
  try { window.dispatchEvent(new CustomEvent<UpgradeRequest>(UPGRADE_EVENT, { detail })); } catch { /* sunucu tarafı */ }
}
/** 402 cevabı paket sınırıysa yükseltme penceresini açar */
export function handlePlanError(status: number, data: { error?: string; code?: string; feature?: string; plan?: string } | null | undefined) {
  if (status !== 402 || !data?.code) return;
  if (data.code === "feature_locked" || data.code === "work_locked" || data.code.startsWith("limit_")) openUpgrade({ code: data.code, message: data.error, feature: data.feature, plan: data.plan });
}

export async function api<T = unknown>(url: string, init: RequestInit & { json?: unknown } = {}): Promise<T> {
  const { json, ...rest } = init;
  const res = await fetch(url, {
    ...rest,
    headers: { ...(json !== undefined ? { "Content-Type": "application/json" } : {}), ...(rest.headers ?? {}) },
    body: json !== undefined ? JSON.stringify(json) : rest.body,
  });
  const ct = res.headers.get("content-type") ?? "";
  const data = ct.includes("application/json") ? await res.json() : null;
  if (!res.ok) {
    handlePlanError(res.status, data);
    throw new ClientApiError(res.status, data?.error ?? `İstek başarısız (${res.status})`, data?.code, data ?? undefined);
  }
  return data as T;
}
