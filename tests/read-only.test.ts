import fs from "node:fs";
import path from "node:path";
import { describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
vi.mock("@/lib/supabase/admin", () => ({ adminClient: () => { throw new Error("veritabanı yok"); } }));
import { READ_ONLY_ALLOWED_ROUTES, readOnlyReasons } from "@/lib/read-only";
import { assertNotReadOnly } from "@/lib/usage";
import { WORDS_PER_PAGE } from "@/lib/pages";

const api = path.resolve(__dirname, "../src/app/api");
const walk = (d: string): string[] => fs.readdirSync(d).flatMap((f) => { const p = path.join(d, f); return fs.statSync(p).isDirectory() ? walk(p) : f === "route.ts" ? [p] : []; });
/** Her API ucunun route adı ve HTTP metodu */
const routes = walk(api).flatMap((f) => [...fs.readFileSync(f, "utf8").matchAll(/export const (GET|POST|PATCH|PUT|DELETE) = route(?:<[^>]+>)?\("([^"]+)"/g)].map((m) => ({ method: m[1], name: m[2], file: path.relative(api, f) })));

const limits = { pages_month: 25, ai_requests_month: 300, tokens_month: 800000, cost_usd_month: 5 };
const fresh = { words: 0, ai_requests: 0, tokens: 0, cost_usd: 0, source_searches: 0 };

describe("hak dolunca salt okunur kullanım (D155)", () => {
  it("sayfa veya yapay zekâ hakkı (istek, token, maliyet) dolunca salt okunur; yalnızca tarama dolarsa değil", () => {
    expect(readOnlyReasons(limits, fresh, WORDS_PER_PAGE)).toEqual([]);
    expect(readOnlyReasons(limits, { ...fresh, words: 25 * WORDS_PER_PAGE }, WORDS_PER_PAGE)).toEqual(["pages"]);
    expect(readOnlyReasons(limits, { ...fresh, words: 25 * WORDS_PER_PAGE - 1 }, WORDS_PER_PAGE)).toEqual([]);
    expect(readOnlyReasons(limits, { ...fresh, ai_requests: 300 }, WORDS_PER_PAGE)).toEqual(["ai_requests"]);
    expect(readOnlyReasons(limits, { ...fresh, tokens: 800000 }, WORDS_PER_PAGE)).toEqual(["tokens"]);
    expect(readOnlyReasons(limits, { ...fresh, cost_usd: 5 }, WORDS_PER_PAGE)).toEqual(["cost"]);
    // Sınırsız paket (null) hiçbir zaman salt okunur olmaz
    expect(readOnlyReasons({ pages_month: null, ai_requests_month: null, tokens_month: null, cost_usd_month: null }, { ...fresh, words: 1e9, ai_requests: 1e9 }, WORDS_PER_PAGE)).toEqual([]);
  });

  it("izinli listedeki her ad gerçek bir uca ait; değişiklik yapan izinli uçlar yalnızca hesap/KVKK/gizlilik işlemleri", () => {
    const names = new Set(routes.map((r) => r.name));
    for (const n of READ_ONLY_ALLOWED_ROUTES) expect(names.has(n), n).toBe(true);
    const mutating = routes.filter((r) => r.method !== "GET" && READ_ONLY_ALLOWED_ROUTES.has(r.name)).map((r) => r.name).sort();
    expect(mutating).toEqual(["account.data_request", "account.delete", "account.device", "account.update", "feedback.create", "legal.accept", "notifications.read", "org.leave", "project.presence", "shares.revoke"].sort());
  });

  it("çalışmayı değiştiren ve yapay zekâ/tarama kullanan uçlar salt okunurken kapalı (varsayılan yasak)", () => {
    for (const n of ["stage.update", "stages.add", "stage.delete", "projects.create", "projects.update", "projects.delete", "ai.chat", "ai.research", "sources.search", "project.sources.add", "files.upload", "comments.add", "memory.add", "surveys.create", "survey.update", "file.stats", "file.chart", "project.presentation", "project.journals", "shares.create", "members.invite", "revisions.restore", "quality.run", "claim_audit.run", "topics.explore"]) {
      expect(READ_ONLY_ALLOWED_ROUTES.has(n), n).toBe(false);
    }
    // İndirme açık
    for (const n of ["project.export", "project.sources.export", "file.get"]) expect(READ_ONLY_ALLOWED_ROUTES.has(n), n).toBe(true);
  });

  it("merkezi denetim: hak dolan kullanıcı düzenleme ucunda 402 alır, indirmede almaz; yönetici muaf", async () => {
    const full = async () => [limits, { ...fresh, words: 25 * WORDS_PER_PAGE, exports: 0, projects: 1, storage_mb: 0, pages: 25 }] as never;
    const ok = async () => [limits, { ...fresh, exports: 0, projects: 1, storage_mb: 0, pages: 0 }] as never;
    await expect(assertNotReadOnly("u1", "basic", "stage.update", false, full)).rejects.toMatchObject({ status: 402, code: "work_locked" });
    await expect(assertNotReadOnly("u1", "basic", "project.export", false, full)).resolves.toBeUndefined();
    await expect(assertNotReadOnly("u1", "basic", "account.delete", false, full)).resolves.toBeUndefined();
    await expect(assertNotReadOnly("u2", "basic", "ai.chat", true, full)).resolves.toBeUndefined();
    await expect(assertNotReadOnly("u3", "basic", "stage.update", false, ok)).resolves.toBeUndefined();
  });

  it("denetim her API ucunda çalışır: route() adı kaydeder, requireUser denetler; herkese açık ücretsiz araçlar oturum istemez", () => {
    const apiTs = fs.readFileSync(path.resolve(__dirname, "../src/lib/api.ts"), "utf8");
    expect(apiTs).toContain("requestCtx.run({ route: name }");
    const auth = fs.readFileSync(path.resolve(__dirname, "../src/lib/auth.ts"), "utf8");
    expect(auth).toMatch(/await assertNotReadOnly\(s\.user\.id, s\.profile\.plan_id, ctx\?\.route/);
    for (const f of walk(path.join(api, "public"))) expect(fs.readFileSync(f, "utf8"), f).not.toMatch(/requireUser\(/);
  });

  it("100 TL indirme hakkı kaldırıldı", () => {
    const src = (p: string) => fs.readFileSync(path.resolve(__dirname, "..", p), "utf8");
    expect(src("src/lib/pricing.ts")).not.toContain("DOWNLOAD_PRICE_TL");
    expect(src("src/lib/usage.ts")).not.toContain("hasDownloadPass");
    expect(src("src/app/api/admin/locks/route.ts")).not.toContain("download_passes");
    expect(src("src/components/admin/admin-panel.tsx")).not.toMatch(/100 TL/);
  });
});
