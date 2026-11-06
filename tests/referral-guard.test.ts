import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { DISPOSABLE_EMAIL_DOMAINS, isDisposableEmail } from "@/lib/disposable-email";

describe("davet ödülü: geçici e-posta (D106)", () => {
  it("geçici e-posta servislerini ve alt alan adlarını tanır, gerçek adresleri geçirir", () => {
    expect(isDisposableEmail("a@mailinator.com")).toBe(true);
    expect(isDisposableEmail("A@Mail.YopMail.com ")).toBe(true);
    expect(isDisposableEmail("ogrenci@gmail.com")).toBe(false);
    expect(isDisposableEmail("hoca@metu.edu.tr")).toBe(false);
    expect(isDisposableEmail("x@notmailinator.com")).toBe(false);
    expect(isDisposableEmail("")).toBe(false);
  });
  it("migration 29’daki liste koddaki listeyle aynı", () => {
    const dir = path.resolve(__dirname, "../supabase/migrations");
    const sql = fs.readFileSync(path.join(dir, fs.readdirSync(dir).find((f) => f.includes("referral_email_guard"))!), "utf8");
    const inSql = [...sql.matchAll(/^\s+\('([a-z0-9.-]+)'\)/gm)].map((m) => m[1]);
    expect(inSql.sort()).toEqual([...DISPOSABLE_EMAIL_DOMAINS].sort());
  });
});
