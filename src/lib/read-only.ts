/**
 * Hak dolunca salt okunur kullanım (D155). Saf kurallar: istemci ve sunucuda kullanılabilir.
 *
 * Aylık **sayfa** hakkı veya **yapay zekâ** hakkı (istek sayısı; token ve maliyet tavanı da kullanıcıya yapay zekâ hakkı
 * olarak görünür) dolunca kullanıcı paketini yükseltene veya hakkı yenilenene kadar yalnızca:
 *   çalışmalarını görüntüleyebilir ve paketinin izin verdiği biçimlerde indirebilir; hesap/KVKK işlemleri, bildirimler,
 *   geri bildirim, paylaşım bağlantısı iptali ve herkese açık ücretsiz araçlar açıktır.
 * Elle düzenleme dâhil diğer her özellik kapalıdır. Yalnızca kaynak tarama hakkı dolarsa sadece tarama durur (değişmedi).
 * Varsayılan YASAK: aşağıdaki listede olmayan her API ucu salt okunur kullanıcıya kapalıdır (yeni özellikler de).
 */
export const READ_ONLY_ALLOWED_ROUTES = new Set<string>([
  // Hesap, KVKK ve hukuki işlemler
  "account.get", "account.update", "account.plans", "account.growth", "account.device", "account.shares", "account.data_request", "account.delete",
  "legal.accept", "legal.mine", "notifications.list", "notifications.read", "announcements.list", "feedback.create", "org.members", "org.leave",
  // Görüntüleme
  "projects.list", "projects.get", "stages.list", "stage.get", "revisions.list", "comments.list", "memory.list", "quality.latest", "claim_audit.get",
  "review.list", "project.sources.list", "source.get", "files.list", "ai.chat.history", "surveys.list", "survey.get", "survey.responses", "members.list",
  "shares.list", "project.presence", "structure.get", "templates.list",
  // İndirme
  "project.export", "project.sources.export", "file.get",
  // Gizlilik: danışman paylaşım bağlantısını iptal etmek her zaman serbest
  "shares.revoke",
]);

export type ReadOnlyReason = "pages" | "ai_requests" | "tokens" | "cost";

interface Limits { pages_month?: number | null; ai_requests_month?: number | null; tokens_month?: number | null; cost_usd_month?: number | null }
interface Usage { words: number; ai_requests: number; tokens: number; cost_usd?: number }

/** Salt okunur kullanıma geçiren nedenler (boşsa kullanıcı her şeyi kullanabilir) */
export function readOnlyReasons(limits: Limits, usage: Usage, wordsPerPage: number): ReadOnlyReason[] {
  const hit = (u: number, l: number | null | undefined) => l !== null && l !== undefined && u >= l;
  const out: ReadOnlyReason[] = [];
  if (limits.pages_month != null && hit(usage.words, limits.pages_month * wordsPerPage)) out.push("pages");
  if (hit(usage.ai_requests, limits.ai_requests_month)) out.push("ai_requests");
  if (hit(usage.tokens, limits.tokens_month)) out.push("tokens");
  if (hit(usage.cost_usd ?? 0, limits.cost_usd_month)) out.push("cost");
  return out;
}

export const READ_ONLY_MESSAGE = "Bu ayki kullanım hakkınız doldu. Çalışmalarınızı görüntüleyebilir ve indirebilirsiniz; diğer özellikler paketinizi yükseltene veya hakkınız yenilenene kadar kapalıdır.";
