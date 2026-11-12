import { z } from "zod";
import { json, parseBody, route } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { LEGAL_DOC_IDS, type LegalDocId } from "@/lib/legal/docs";
import { acceptanceSource, recordLegal } from "@/lib/legal/server";

const Doc = z.enum(LEGAL_DOC_IDS as [LegalDocId, ...LegalDocId[]]);

/**
 * Hukuki belge kabulü (D154). Oturum açmış kullanıcı kendi adına kaydeder; belge sürümü ve zaman sunucuda belirlenir.
 * - Onay sayfası: { accept: ["terms"], notice: ["kvkk"] } → kaynak giriş yöntemi (email/google/apple)
 * - Satın alma öncesi: { notice: ["distance", "fair_use"], purpose: "purchase", plan } → kaynak "purchase"
 */
export const POST = route("legal.accept", async (req) => {
  const s = await requireUser();
  const b = await parseBody(req, z.object({
    accept: z.array(Doc).max(7).default([]),
    notice: z.array(Doc).max(7).default([]),
    purpose: z.enum(["consent", "purchase"]).default("consent"),
    plan: z.string().trim().max(40).regex(/^[a-z0-9_-]*$/).optional(),
  }));
  const items: { doc: LegalDocId; kind: "accept" | "notice" }[] = [
    ...[...new Set(b.accept)].map((doc) => ({ doc, kind: "accept" as const })),
    ...[...new Set(b.notice)].filter((d) => !b.accept.includes(d)).map((doc) => ({ doc, kind: "notice" as const })),
  ];
  if (!items.length) return json({ ok: true, recorded: 0 });
  const source = b.purpose === "purchase" ? "purchase" : acceptanceSource(s.user);
  await recordLegal(s.user.id, items, source, b.plan ? { plan: b.plan } : {});
  return json({ ok: true, recorded: items.length });
});

/** Kullanıcının kendi kabul/bilgilendirme kayıtları (Hesap → Gizlilik ve Veri Yönetimi) */
export const GET = route("legal.mine", async () => {
  const s = await requireUser();
  const { data } = await s.supabase.from("legal_acceptances").select("doc, version, kind, source, accepted_at").eq("user_id", s.user.id).order("accepted_at", { ascending: false }).limit(100);
  return json({ acceptances: data ?? [] });
});
