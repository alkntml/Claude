/** D204: KVKK veri dökümü — okuma rehberi her bölümü açıklar, HTML rapor güvenli ve kısa */
import { describe, expect, it } from "vitest";
import { EXPORT_GUIDE } from "@/lib/data-export-guide";
import { renderExportHtml } from "@/lib/data-export-html";

// lib/data-export.ts içindeki bölümler (sunucuya özel modül olduğu için burada listelenir)
const KEYS = ["profile", "projects", "project_stages", "stage_revisions", "stage_comments", "project_memory", "sources", "ai_conversations", "ai_messages", "files", "quality_reports", "subscriptions", "usage_events", "feedback",
  "surveys", "survey_responses", "project_shares", "notifications", "usage_credits", "claim_audits", "review_records", "download_passes", "data_requests", "legal_acceptances",
  "activity_log", "user_devices", "export_fingerprints", "plan_purchases", "source_links",
  "error_logs", "project_memberships", "project_invites_sent", "project_invites_received", "organization_memberships", "tool_usage", "user_templates", "template_change_logs", "org_audit_log"];

describe("D204: veri dökümü rehberi ve raporu", () => {
  it("her bölümün Türkçe adı ve açıklaması var; fazlası yok", () => {
    const g = EXPORT_GUIDE.sections.map((s) => s.key);
    expect(new Set(g).size).toBe(g.length);
    expect([...g].sort()).toEqual([...KEYS].sort());
    for (const s of EXPORT_GUIDE.sections) { expect(s.name.length).toBeGreaterThan(2); expect(s.desc.length).toBeGreaterThan(20); }
  });
  it("HTML raporu kaçışlı, uzun metni kısaltır, teknik değerleri Türkçeleştirir", () => {
    const html = renderExportHtml({
      exportedAt: "2026-11-15T18:48:24.042Z",
      profile: { full_name: "Ayşe <b>Y</b>", email: "a@example.com", member_no: 1001, locale: "tr", created_at: "2026-11-01T10:24:26Z" },
      sources: [{ title: "<script>alert(1)</script>", authors: [{ family: "Kaya", given: "E." }], year: 2021, access_level: "full_text", verified: true }],
      ai_messages: [{ role: "assistant", content: "x".repeat(5000), created_at: "2026-11-02T10:00:00Z" }],
    });
    expect(html).not.toContain("<script>alert");
    expect(html).toContain("alert(1)");
    expect(html).toContain("Ayşe Y");
    expect(html).toContain("AC001001");
    expect(html).toContain("Tam metin");
    expect(html).toContain("Asistan");
    expect(html).not.toContain("x".repeat(200));
    for (const s of EXPORT_GUIDE.sections) expect(html).toContain(s.name.replace(/&/g, "&amp;"));
  });
});
