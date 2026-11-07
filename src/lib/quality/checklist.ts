/**
 * Teslim / yayın öncesi kontrol listesi (D121). Çalışmanın verilerinden (bölümler, kaynaklar, iddia denetimleri,
 * kalite raporu, ayarlar) deterministik olarak üretilir; yapay zekâ kullanmaz. Her madde neyin eksik olduğunu ve
 * nereden düzeltileceğini söyler.
 */
import { citedIdsInOrder, docToPlain, wordCount, type JSONNode } from "@/lib/editor/doc";

export type CheckStatus = "ok" | "warn" | "fail" | "todo";
export interface CheckItem { id: string; label: string; status: CheckStatus; detail: string; vars?: Record<string, string | number>; stageId?: string }

export interface ChecklistInput {
  workType: string;
  keywords: string[];
  hasFormat: boolean;
  stages: { id: string; key: string; title: string; content: JSONNode | null; generated?: boolean }[];
  sources: { id: string; verified: boolean; access_level: string }[];
  audits: Record<string, { not_supported: number; contradicts?: number; partial: number; insufficient: number; uncited: number; marked: number; total: number; created_at: string } | undefined>;
  qualityScore: number | null;
}

const ARTICLE = new Set(["research_article", "journal_article", "literature_review"]);

export function buildChecklist(o: ChecklistInput): CheckItem[] {
  const items: CheckItem[] = [];
  const writable = o.stages.filter((s) => !s.generated && s.key !== "references");
  const textOf = (s: { content: JSONNode | null }) => docToPlain(s.content);

  // 1) Bölümler
  const empty = writable.filter((s) => wordCount(textOf(s)) === 0);
  items.push(empty.length
    ? { id: "sections", label: "Tüm bölümler yazıldı", status: "fail", detail: "{n} bölüm boş: {list}", vars: { n: empty.length, list: empty.slice(0, 4).map((s) => s.title).join(", ") }, stageId: empty[0].id }
    : { id: "sections", label: "Tüm bölümler yazıldı", status: "ok", detail: "Bütün bölümlerde metin var." });

  // 2) Yer tutucular
  let need = 0, data = 0; let firstPh: string | undefined;
  for (const s of writable) {
    const t = textOf(s);
    const a = (t.match(/\[KAYNAK GEREKLİ\]/g) ?? []).length, b = (t.match(/\[VERİ GİRİLECEK\]/g) ?? []).length;
    if ((a || b) && !firstPh) firstPh = s.id;
    need += a; data += b;
  }
  items.push(need + data
    ? { id: "placeholders", label: "Kaynak ve veri işaretleri kapatıldı", status: "fail", detail: "{a} “[KAYNAK GEREKLİ]” ve {b} “[VERİ GİRİLECEK]” işareti duruyor.", vars: { a: need, b: data }, stageId: firstPh }
    : { id: "placeholders", label: "Kaynak ve veri işaretleri kapatıldı", status: "ok", detail: "Metinde açık işaret kalmadı." });

  // 3) İddia denetimi (atıflı bölümler)
  const cited = writable.filter((s) => citedIdsInOrder([s.content]).length > 0);
  const notAudited = cited.filter((s) => !o.audits[s.id]);
  const sum = cited.reduce((acc, s) => { const a = o.audits[s.id]; if (a) { acc.bad += a.not_supported + (a.contradicts ?? 0); acc.partial += a.partial; acc.unread += a.insufficient; acc.uncited += a.uncited + a.marked; } return acc; }, { bad: 0, partial: 0, unread: 0, uncited: 0 });
  const worst = cited.find((s) => (o.audits[s.id]?.not_supported ?? 0) + (o.audits[s.id]?.contradicts ?? 0) > 0) ?? notAudited[0];
  items.push(!cited.length
    ? { id: "claims", label: "İddia denetimi", status: "todo", detail: "Henüz atıflı cümle yok." }
    : sum.bad
      ? { id: "claims", label: "İddia denetimi: desteklenmeyen iddia yok", status: "fail", detail: "{bad} cümle kaynağında desteklenmiyor, {partial} cümle kısmen destekleniyor.", vars: { bad: sum.bad, partial: sum.partial }, stageId: worst?.id }
      : notAudited.length
        ? { id: "claims", label: "İddia denetimi: desteklenmeyen iddia yok", status: "todo", detail: "{n} atıflı bölüm henüz denetlenmedi: {list}", vars: { n: notAudited.length, list: notAudited.slice(0, 4).map((s) => s.title).join(", ") }, stageId: notAudited[0].id }
        : { id: "claims", label: "İddia denetimi: desteklenmeyen iddia yok", status: sum.partial || sum.unread ? "warn" : "ok", detail: sum.partial || sum.unread ? "Desteklenmeyen iddia yok; {partial} kısmen destek, {unread} cümlenin kaynağı okunamadı." : "Denetlenen bütün atıflı cümleler kaynaklarında destekleniyor.", vars: { partial: sum.partial, unread: sum.unread } });
  if (sum.uncited) items.push({ id: "uncited", label: "Atıfsız kesin iddia kalmadı", status: "warn", detail: "{n} cümle sayı, oran veya kesin ifade içeriyor ama atıf yok (kendi bulgunuz değilse kaynak ekleyin).", vars: { n: sum.uncited } });

  // 4) Kaynaklar
  const citedIds = new Set(citedIdsInOrder(writable.map((s) => s.content)));
  const byId = new Map(o.sources.map((s) => [s.id, s]));
  const missing = [...citedIds].filter((id) => !byId.has(id)).length;
  const unverified = [...citedIds].filter((id) => byId.get(id) && !byId.get(id)!.verified).length;
  const metaOnly = [...citedIds].filter((id) => byId.get(id)?.access_level === "metadata").length;
  items.push(missing
    ? { id: "sources", label: "Atıf yapılan kaynaklar doğrulandı", status: "fail", detail: "{n} atıfın kaynağı kütüphanede yok (silinmiş olabilir).", vars: { n: missing } }
    : unverified
      ? { id: "sources", label: "Atıf yapılan kaynaklar doğrulandı", status: "warn", detail: "{n} kaynak DOI/PMID gibi kalıcı bir tanımlayıcıyla doğrulanmadı.", vars: { n: unverified } }
      : { id: "sources", label: "Atıf yapılan kaynaklar doğrulandı", status: citedIds.size ? "ok" : "todo", detail: citedIds.size ? "Atıf yapılan {n} kaynağın hepsi doğrulandı." : "Henüz atıf yok.", vars: { n: citedIds.size } });
  if (metaOnly) items.push({ id: "access", label: "Kaynakların içeriği okundu", status: "warn", detail: "{n} kaynağın yalnızca künyesi biliniyor; bu kaynaklara dayalı cümleler denetlenemez.", vars: { n: metaOnly } });
  const unused = o.sources.filter((s) => !citedIds.has(s.id)).length;
  if (unused) items.push({ id: "unused", label: "Kaynakçada atıfsız kaynak yok", status: "warn", detail: "{n} kaynak çalışmada hiç atıf almıyor; kaynakçaya yalnızca atıf yapılanlar girer.", vars: { n: unused } });

  // 5) Özet ve anahtar kelimeler
  const abs = o.stages.find((s) => s.key === "title_abstract" || s.key === "grant_summary");
  if (abs) {
    const w = wordCount(textOf(abs));
    items.push(!w
      ? { id: "abstract", label: "Özet yazıldı", status: "fail", detail: "Özet bölümü boş. Özet en son, bütün bölümler bittikten sonra yazılır.", stageId: abs.id }
      : { id: "abstract", label: "Özet yazıldı", status: w < 120 || w > 600 ? "warn" : "ok", detail: "Özet ve Abstract toplam {n} kelime.", vars: { n: w }, stageId: abs.id });
  }
  const kw = o.keywords.filter(Boolean).length;
  items.push({ id: "keywords", label: "Anahtar kelimeler", status: kw >= 3 && kw <= 8 ? "ok" : "warn", detail: kw ? "{n} anahtar kelime tanımlı (çoğu kurum ve dergi 3–6 ister)." : "Anahtar kelime tanımlı değil (Proje ayarları).", vars: { n: kw } });

  // 6) Kalite, biçim, dergi
  items.push(o.qualityScore == null
    ? { id: "quality", label: "Kalite kontrolü yapıldı", status: "todo", detail: "Kalite kontrolünü çalıştırın." }
    : { id: "quality", label: "Kalite kontrolü yapıldı", status: o.qualityScore >= 80 ? "ok" : o.qualityScore >= 60 ? "warn" : "fail", detail: "Son kalite puanı {n}/100.", vars: { n: o.qualityScore } });
  items.push({ id: "format", label: "Biçim ve kapak ayarlandı", status: o.hasFormat ? "ok" : "todo", detail: o.hasFormat ? "Biçim ve kapak bilgileri kayıtlı." : "Dışa aktar → Biçim ve kapak ayarları ile üniversite/dergi biçimini seçin." });
  if (ARTICLE.has(o.workType)) items.push({ id: "journal", label: "Dergi kılavuzuna uygunluk", status: "todo", detail: "Asistandaki “Dergi kılavuzuna uygunluk” ile hedef derginin kurallarını kontrol edin." });
  items.push({ id: "language", label: "Dil denetimi", status: "todo", detail: "Araçlar → Dil ve çeviri → Dil denetimi ile her bölümü son kez gözden geçirin." });
  return items;
}

export function checklistScore(items: CheckItem[]): { done: number; total: number } {
  return { done: items.filter((i) => i.status === "ok").length, total: items.length };
}
