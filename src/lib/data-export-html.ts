/**
 * D204: KVKK veri dökümünün okunabilir HTML raporu. İndirme anında üretilir, hiçbir yerde saklanmaz.
 * Uzun metinler (bölüm metni, sohbet, çıktı) kısaltılır; tam metin aynı anda indirilebilen JSON dosyasındadır.
 * Saf modül: girdi buildUserExport çıktısıdır.
 */
import { EXPORT_GUIDE } from "@/lib/data-export-guide";
import { memberCode } from "@/lib/member";

const COLS: Record<string, string> = {
  title: "Başlık", name: "Ad", full_name: "Ad soyad", email: "E-posta", institution: "Kurum", plan_id: "Paket", plan_expires_at: "Paket bitişi",
  member_no: "Üye no", locale: "Dil", default_citation_style: "Atıf stili", work_type: "Tür", academic_level: "Düzey", topic: "Konu",
  key: "Bölüm", word_count: "Kelime", status: "Durum", note: "Not", author: "Yazan", authors: "Yazarlar", year: "Yıl",
  container_title: "Dergi / kitap", doi: "DOI", access_level: "Okuma düzeyi", verified: "Doğrulandı", role: "Rol", content: "İçerik",
  kind: "Tür", action: "İşlem", project_title: "Çalışma", stage_title: "Bölüm", words: "Kelime", model: "Model", output: "Çıktı (kısaltılmış)",
  quantity: "Adet", tokens_in: "Token (giriş)", tokens_out: "Token (çıkış)", cost_usd: "Maliyet ($)", doc: "Belge", version: "Sürüm",
  source: "Kaynak", accepted_at: "Tarih", device: "Cihaz özeti", first_seen: "İlk görülme", last_seen: "Son görülme", score: "Puan",
  summary: "Özet", message: "Mesaj", page: "Sayfa", category: "Kategori", route: "Sayfa / işlem", tool: "Araç", items: "Kayıt",
  provider: "Sağlayıcı", last_synced_at: "Son eşitleme", expires_at: "Bitiş", accepted_at_: "Kabul", joined_at: "Katılım",
  your_role: "Rolünüz", detail: "Ayrıntı", question_count: "Soru", payer_name: "Ödeyen", amount_try: "Tutar (TL)", size_bytes: "Boyut (bayt)",
  mime_type: "Tür", created_at: "Tarih", updated_at: "Güncelleme", completed_at: "Tamamlanma", read_at: "Okunma",
};
/** Bölüm başına gösterilecek sütunlar (yoksa ilk anlamlı sütunlar seçilir) */
const PICK: Record<string, string[]> = {
  projects: ["title", "work_type", "academic_level", "status", "created_at"],
  project_stages: ["title", "word_count", "status", "updated_at"],
  stage_revisions: ["word_count", "author", "note", "created_at"],
  sources: ["title", "authors", "year", "container_title", "access_level", "verified"],
  ai_conversations: ["title", "created_at"],
  ai_messages: ["role", "content", "created_at"],
  activity_log: ["action", "project_title", "stage_title", "words", "output", "created_at"],
  usage_events: ["kind", "quantity", "model", "cost_usd", "created_at"],
  legal_acceptances: ["doc", "version", "kind", "source", "accepted_at"],
  user_devices: ["device", "first_seen", "last_seen"],
  quality_reports: ["score", "created_at"],
  claim_audits: ["scope", "created_at"],
  notifications: ["kind", "created_at", "read_at"],
  data_requests: ["kind", "status", "created_at", "completed_at"],
  feedback: ["page", "category", "message", "status", "created_at"],
  error_logs: ["route", "message", "created_at"],
  tool_usage: ["tool", "items", "model", "cost_usd", "created_at"],
  surveys: ["title", "is_open", "response_count", "created_at"],
  project_memory: ["kind", "content", "created_at"],
  files: ["name", "mime_type", "size_bytes", "created_at"],
};
const MAX_ROWS = 300, MAX_CELL = 160;
/** Teknik değerlerin Türkçe karşılıkları */
const VALUES: Record<string, Record<string, string>> = {
  access_level: { metadata: "Yalnızca künye", abstract: "Özet", full_text: "Tam metin" },
  role: { user: "Siz", assistant: "Asistan", editor: "Düzenleyici", commenter: "Yorumcu", admin: "Yönetici", member: "Üye" },
  locale: { tr: "Türkçe", en: "İngilizce", de: "Almanca" },
  status: { pending: "Bekliyor", completed: "Tamamlandı", rejected: "Reddedildi", open: "Açık", resolved: "Çözüldü", draft: "Taslak", in_progress: "Sürüyor", done: "Tamamlandı" },
  kind: { accept: "Kabul", notice: "Bilgilendirme", export: "Veri indirme", ai_request: "Yapay zekâ isteği", source_search: "Kaynak taraması", upload: "Dosya yükleme", quality_check: "Kalite kontrol" },
  doc: { terms: "Kullanım Koşulları", kvkk: "KVKK Aydınlatma Metni", fair_use: "Adil Kullanım Politikası", cookies: "Çerez Politikası", integrity: "Akademik Dürüstlük", distance: "Mesafeli Sözleşmeler ve Ön Bilgilendirme", gdpr: "GDPR / Data Protection" },
};

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
function cell(v: unknown, key: string): string {
  if (v == null || v === "") return "—";
  if (typeof v === "boolean") return v ? "Evet" : "Hayır";
  if (typeof v === "string" && VALUES[key]?.[v]) return esc(VALUES[key][v]);
  if (/(_at|_seen)$/.test(key) && typeof v === "string" && /^\d{4}-\d\d-\d\d/.test(v)) {
    const d = new Date(v);
    return isNaN(d.getTime()) ? esc(v) : d.toLocaleString("tr-TR", { timeZone: "Europe/Istanbul", dateStyle: "short", timeStyle: "short" });
  }
  if (key === "authors" && Array.isArray(v)) return esc(v.map((a) => (typeof a === "string" ? a : [a?.family, a?.given].filter(Boolean).join(", "))).slice(0, 3).join("; ") + (v.length > 3 ? " vd." : ""));
  let s = typeof v === "string" ? v : typeof v === "number" ? String(v) : JSON.stringify(v);
  s = s.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  return esc(s.length > MAX_CELL ? s.slice(0, MAX_CELL) + "…" : s);
}

function table(key: string, rows: Record<string, unknown>[]): string {
  if (!rows.length) return '<p class="empty">Bu türde kaydınız yok.</p>';
  const avail = Object.keys(rows[0]);
  const cols = (PICK[key] ?? avail.filter((c) => c in COLS && !/^(id|user_id|project_id|stage_id)$/.test(c)).slice(0, 6)).filter((c) => avail.includes(c));
  const use = cols.length ? cols : avail.filter((c) => !/(^id$|_id$)/.test(c)).slice(0, 5);
  const shown = rows.slice(0, MAX_ROWS);
  return `<table><thead><tr>${use.map((c) => `<th>${esc(COLS[c] ?? c)}</th>`).join("")}</tr></thead><tbody>${shown.map((r) => `<tr>${use.map((c) => `<td>${cell(r[c], c)}</td>`).join("")}</tr>`).join("")}</tbody></table>` +
    (rows.length > MAX_ROWS ? `<p class="more">İlk ${MAX_ROWS} kayıt gösterildi; toplam ${rows.length} kaydın tamamı JSON dosyasında.</p>` : "");
}

export function renderExportHtml(data: Record<string, unknown>): string {
  const g = EXPORT_GUIDE.header;
  const p = (data.profile ?? {}) as Record<string, unknown>;
  const when = new Date(String(data.exportedAt ?? new Date().toISOString())).toLocaleString("tr-TR", { timeZone: "Europe/Istanbul", dateStyle: "long", timeStyle: "short" });
  const count = (k: string) => (Array.isArray(data[k]) ? (data[k] as unknown[]).length : data[k] ? 1 : 0);
  const groups = [...new Set(EXPORT_GUIDE.sections.map((s) => s.group))];
  const profileRows = ["full_name", "email", "institution", "member_no", "plan_id", "plan_expires_at", "locale", "default_citation_style", "created_at"]
    .map((k) => `<tr><th>${esc(k === "created_at" ? "Kayıt tarihi" : COLS[k] ?? k)}</th><td>${k === "member_no" && p[k] != null ? esc(memberCode(p[k] as number)) : cell(p[k], k)}</td></tr>`).join("");
  const summary = groups.map((gr) => `<tr class="grp"><td colspan="3">${esc(gr)}</td></tr>` + EXPORT_GUIDE.sections.filter((s) => s.group === gr)
    .map((s) => `<tr><td><a href="#${s.key}">${esc(s.name)}</a></td><td>${esc(s.desc)}</td><td class="n">${count(s.key)}</td></tr>`).join("")).join("");
  const details = EXPORT_GUIDE.sections.filter((s) => s.key !== "profile").map((s) => `<section id="${s.key}"><h3>${esc(s.name)} <span class="c">${count(s.key)} kayıt</span></h3><p class="d">${esc(s.desc)}</p>${table(s.key, (Array.isArray(data[s.key]) ? data[s.key] : []) as Record<string, unknown>[])}</section>`).join("");
  return `<!doctype html><html lang="tr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Academiana · Kişisel veri dökümü</title>
<style>
body{font:15px/1.55 system-ui,-apple-system,"Segoe UI",sans-serif;color:#1a1d2c;background:#f6f7fb;margin:0}
main{max-width:1040px;margin:0 auto;padding:32px 20px 60px}
h1{font:600 30px Georgia,serif;margin:0}h2{font:600 21px Georgia,serif;margin:34px 0 10px}h3{font-size:17px;margin:0}
.box{background:#fff;border:1px solid #eceef4;border-radius:16px;padding:18px 22px;margin-top:14px}
.box p{margin:6px 0}.box b{color:#4338ca}
table{width:100%;border-collapse:collapse;background:#fff;font-size:13.5px;margin-top:8px}
th,td{border-bottom:1px solid #eceef4;padding:7px 9px;text-align:left;vertical-align:top}th{background:#f4f5f9;font-weight:600}
td.n{text-align:right;font-weight:600;white-space:nowrap}tr.grp td{background:#eef2ff;color:#4338ca;font-weight:700}
section{background:#fff;border:1px solid #eceef4;border-radius:16px;padding:16px 18px;margin-top:14px;overflow-x:auto}
.c{font-size:13px;color:#6c7189;font-weight:500}.d{color:#555a71;margin:4px 0 0}.empty{color:#8f94aa;margin:8px 0 0}.more{color:#6c7189;font-size:13px}
.meta{color:#6c7189}a{color:#4338ca}
@media print{body{background:#fff}section,.box{break-inside:avoid-page;border-color:#ddd}}
</style></head><body><main>
<h1>${esc(g.baslik)}</h1>
<p class="meta">Hazırlanma: ${esc(when)} (Türkiye saati) · Bu rapor indirme anında oluşturulmuştur.</p>
<div class="box"><p>${esc(g.amac)}</p><p><b>Okuma:</b> ${esc(g.nasil_okunur)}</p></div>
<h2>Kimlik ve hesap</h2><table>${profileRows}</table>
<h2>Verileriniz kimlerle paylaşılır, ne kadar saklanır?</h2>
<div class="box"><p><b>Aktarılan taraflar:</b> ${esc(g.alicilar)}</p><p><b>Saklama:</b> ${esc(g.saklama)}</p><p><b>Dökümde olmayanlar:</b> ${esc(g.disarida_kalanlar)}</p><p><b>Haklarınız:</b> ${esc(g.haklariniz)}</p><p><b>İletişim:</b> ${esc(g.iletisim)}</p></div>
<h2>Özet: hangi bölümde ne var?</h2><table><thead><tr><th>Bölüm</th><th>İçerik</th><th>Kayıt</th></tr></thead><tbody>${summary}</tbody></table>
<h2>Ayrıntılar</h2><p class="meta">Uzun metinler kısaltılmıştır; tam metinler aynı sayfadan indirilebilen JSON dosyasındadır.</p>
${details}
</main></body></html>`;
}
