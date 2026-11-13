import "server-only";
import type { ExportDoc } from "@/lib/export/model";
import { runsToPlain } from "@/lib/export/model";
import { minhash, normName, similarity, words } from "@/lib/fingerprint";
import { singleAlert, SINGLE_PLAN } from "@/lib/single-project";
import { adminClient } from "@/lib/supabase/admin";

/**
 * Tek Proje gözetimi (D109): engellemez, yalnızca yöneticiye uyarı gönderir (raise_abuse_alert, kural başına 24 saatte bir).
 * - content_replaced: aynı çalışmanın ardışık iki tam indirmesi birbirine çok az benziyor (silmeden üzerine yazma)
 * - cover_change: indirmeler arasında yazar, üniversite, bölüm veya danışman değişti (başkası adına yazım işareti)
 * - many_devices: 30 günde 5 veya daha fazla farklı tarayıcı/cihaz (hesap paylaşımı)
 * - many_sections: bölüm sayısı çalışma türü şablonunun iki katını aştı
 * - off_topic: uzun bir yapay zekâ çıktısında çalışmanın konu terimlerinden hiçbiri geçmiyor
 */
type Prof = { plan_id: string; role?: string; full_name?: string | null; email?: string | null; plan_expires_at?: string | null };
/** D157: içerik/tek çalışma uyarıları yalnızca eski (süresiz, tek çalışmalık) Tek Proje’de; hesap paylaşımı (cihaz) her Tek Proje’de */
const watched = (p: Prof) => p.plan_id === SINGLE_PLAN && !p.plan_expires_at && p.role !== "admin";
const watchedDevices = (p: Prof) => p.plan_id === SINGLE_PLAN && p.role !== "admin";

export const REPLACED_MIN_WORDS = 3000;
export const REPLACED_MAX_SIMILARITY = 0.3;
export const DEVICE_LIMIT = 5;

export function exportPlainText(doc: ExportDoc): string {
  return doc.blocks.map((b) => {
    if (b.kind === "heading" || b.kind === "paragraph") return runsToPlain(b.runs);
    if (b.kind === "caption") return b.lines.map(runsToPlain).join(" ");
    if (b.kind === "list") return b.items.map(runsToPlain).join("\n");
    if (b.kind === "table") return b.rows.map((r) => r.map(runsToPlain).join(" ")).join("\n");
    return "";
  }).join("\n");
}

type Cover = { university?: string; advisor?: string; department?: string };

/** Tam indirmede parmak izi saklanır ve bir önceki tam indirmeyle karşılaştırılır */
export async function watchExport(o: { userId: string; profile: Prof; projectId: string; projectTitle: string; doc: ExportDoc; cover: Cover }): Promise<void> {
  if (!watched(o.profile)) return;
  const db = adminClient();
  const text = exportPlainText(o.doc);
  const cur = {
    user_id: o.userId, project_id: o.projectId, words: words(text).length, sig: minhash(text),
    author: (o.profile.full_name || o.profile.email || "").slice(0, 200),
    university: (o.cover.university ?? "").slice(0, 300), department: (o.cover.department ?? "").slice(0, 300), advisor: (o.cover.advisor ?? "").slice(0, 300),
  };
  const { data: prev } = await db.from("export_fingerprints").select("words, sig, author, university, department, advisor, created_at")
    .eq("user_id", o.userId).eq("project_id", o.projectId).order("created_at", { ascending: false }).limit(1).maybeSingle();
  await db.from("export_fingerprints").insert(cur);
  if (!prev) return;
  const sim = similarity(prev.sig as number[], cur.sig);
  if (prev.words >= REPLACED_MIN_WORDS && cur.words >= REPLACED_MIN_WORDS && sim < REPLACED_MAX_SIMILARITY) {
    await singleAlert(o.userId, "content_replaced", { project_id: o.projectId, project_title: o.projectTitle, similarity: Math.round(sim * 100), words_before: prev.words, words_after: cur.words, exported_at: prev.created_at });
  }
  const fields = (["author", "university", "department", "advisor"] as const).filter((k) => {
    const a = normName(prev[k] as string), b = normName(cur[k]);
    return a && b && a !== b;
  });
  if (fields.length) {
    await singleAlert(o.userId, "cover_change", { project_id: o.projectId, project_title: o.projectTitle, fields, before: Object.fromEntries(fields.map((k) => [k, prev[k]])), after: Object.fromEntries(fields.map((k) => [k, cur[k]])) });
  }
}

/** Tek Proje kullanıcısının cihazı kaydedilir; 30 günde DEVICE_LIMIT ve üzeri farklı cihaz uyarı üretir */
export async function watchDevices(userId: string, profile: Prof, device: string | null): Promise<void> {
  if (!watchedDevices(profile) || !device) return;
  const db = adminClient();
  await db.from("user_devices").upsert({ user_id: userId, device, last_seen: new Date().toISOString() }, { onConflict: "user_id,device" }).then(() => undefined, () => undefined);
  const since = new Date(Date.now() - 30 * 86_400_000).toISOString();
  const { count } = await db.from("user_devices").select("device", { count: "exact", head: true }).eq("user_id", userId).gte("last_seen", since);
  if ((count ?? 0) >= DEVICE_LIMIT) await singleAlert(userId, "many_devices", { devices: count, days: 30 });
}

/** Bölüm eklenince: şablonun iki katını aşan bölüm sayısı */
export async function watchSections(o: { userId: string; profile: Prof; projectId: string; projectTitle: string; count: number; template: number }): Promise<void> {
  if (!watched(o.profile) || o.template <= 0) return;
  if (o.count > o.template * 2) await singleAlert(o.userId, "many_sections", { project_id: o.projectId, project_title: o.projectTitle, sections: o.count, template: o.template });
}

/** Çalışmanın konu terimleri: başlık, konu ve anahtar kelimelerden 4+ harfli kelimelerin ilk 5 harfi (Türkçe eklere dayanıklı) */
export function topicTerms(project: { title?: string | null; topic?: string | null; keywords?: string[] | null }): Set<string> {
  const STOP = new Set(["ilişkin", "üzerine", "yönelik", "arasındaki", "ilişki", "etkisi", "incelenmesi", "değerlendirilmesi", "örneği", "çalışma", "araştırma", "analysis", "study", "effect", "between", "among"]);
  const src = [project.title, project.topic, ...(project.keywords ?? [])].filter(Boolean).join(" ");
  return new Set(words(src).filter((w) => w.length >= 4 && !STOP.has(w)).map((w) => w.slice(0, 5)));
}

/** Uzun çıktıda konu terimlerinden hiçbiri yoksa (en az 3 terim varken) konu dışı sayılır */
export function isOffTopic(output: string, terms: Set<string>, minWords = 800): boolean {
  if (terms.size < 3) return false;
  const w = words(output);
  if (w.length < minWords) return false;
  return !w.some((x) => x.length >= 4 && terms.has(x.slice(0, 5)));
}

export async function watchOutput(o: { userId: string; profile: Prof; projectId: string; project: { title?: string | null; topic?: string | null; keywords?: string[] | null }; stageTitle?: string | null; output: string }): Promise<void> {
  if (!watched(o.profile)) return;
  if (isOffTopic(o.output, topicTerms(o.project))) {
    await singleAlert(o.userId, "off_topic", { project_id: o.projectId, project_title: o.project.title ?? "", stage_title: o.stageTitle ?? null, words: words(o.output).length, excerpt: o.output.replace(/\s+/g, " ").slice(0, 200) });
  }
}
