/** D234: günlük yenileme görevi (cron) yetkisi */
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/api", () => ({ logError: vi.fn(async () => {}) }));
vi.mock("@/lib/payments/renewal", () => ({ runRenewals: vi.fn(async () => ({ checked: 0, noticed: 0, charged: 0, failed: 0, disabled: 0, skipped: 0 })) }));

const req = (auth?: string) => new Request("https://x.test/api/cron/renewals", { headers: auth ? { authorization: auth } : {} });
afterEach(() => { vi.unstubAllEnvs(); });

describe("/api/cron/renewals", () => {
  it("CRON_SECRET tanımlı değilse çalışmaz", async () => {
    vi.stubEnv("CRON_SECRET", "");
    const { GET } = await import("@/app/api/cron/renewals/route");
    expect((await GET(req("Bearer x"))).status).toBe(503);
  });
  it("yanlış veya eksik yetkiyle 401", async () => {
    vi.stubEnv("CRON_SECRET", "gizli-anahtar");
    const { GET } = await import("@/app/api/cron/renewals/route");
    expect((await GET(req())).status).toBe(401);
    expect((await GET(req("Bearer yanlis"))).status).toBe(401);
  });
  it("doğru yetkiyle ama otomatik yenileme kapalıyken hiçbir işlem yapılmaz", async () => {
    vi.stubEnv("CRON_SECRET", "gizli-anahtar");
    vi.stubEnv("PAYTR_MERCHANT_ID", "1"); vi.stubEnv("PAYTR_MERCHANT_KEY", "k"); vi.stubEnv("PAYTR_MERCHANT_SALT", "s"); vi.stubEnv("PAYTR_RECURRING", "");
    const { GET } = await import("@/app/api/cron/renewals/route");
    const r = await GET(req("Bearer gizli-anahtar"));
    expect(r.status).toBe(200);
    expect((await r.json()).skipped).toMatch(/kapalı/);
    const { runRenewals } = await import("@/lib/payments/renewal");
    expect(runRenewals).not.toHaveBeenCalled();
  });
  it("PAYTR_RECURRING=1 ve doğru yetkiyle yenilemeler çalışır", async () => {
    vi.stubEnv("CRON_SECRET", "gizli-anahtar");
    vi.stubEnv("PAYTR_MERCHANT_ID", "1"); vi.stubEnv("PAYTR_MERCHANT_KEY", "k"); vi.stubEnv("PAYTR_MERCHANT_SALT", "s"); vi.stubEnv("PAYTR_RECURRING", "1");
    const { GET } = await import("@/app/api/cron/renewals/route");
    const r = await GET(req("Bearer gizli-anahtar"));
    expect(r.status).toBe(200);
    expect(await r.json()).toMatchObject({ checked: 0 });
  });
});
