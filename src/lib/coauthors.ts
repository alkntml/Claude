/**
 * Ortak yazım (D115): saf kurallar (istemci, sunucu ve testler ortak).
 * Sahip; Pro, Premium veya Tek Proje paketindeyse çalışmasına en fazla COAUTHOR_LIMIT kişi davet eder.
 * Roller: editor (yazar, kaynak ekler, yapay zekâyı kendi paketiyle kullanır), commenter (okur ve yorum yazar).
 */
import { isDisposableEmail } from "@/lib/disposable-email";

export const COAUTHOR_LIMIT = 5;
/** Varlık göstergesi: bu süre içinde sinyal gelen kişi “çalışmada” sayılır */
export const PRESENCE_WINDOW_MS = 75_000;
export const PRESENCE_INTERVAL_MS = 25_000;

export type CoauthorRole = "editor" | "commenter";
export const ROLE_LABEL: Record<CoauthorRole | "owner", string> = { owner: "Sahip", editor: "Ortak yazar", commenter: "Yorumcu" };
export const ROLE_HINT: Record<CoauthorRole, string> = {
  editor: "Bölümleri yazar ve düzenler, kaynak ekler, yapay zekâyı kendi paketiyle kullanır",
  commenter: "Çalışmayı okur ve bölümlere yorum yazar; metni değiştiremez",
};

export function coauthorEmailOk(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && !isDisposableEmail(email);
}

export type InviteProblem = "not_found" | "expired" | "used" | "wrong_email" | "own_project" | null;

/** Daveti bu kullanıcı şimdi kabul edebilir mi? */
export function inviteProblem(
  invite: { email: string; expires_at: string; accepted_at: string | null; accepted_by?: string | null } | null,
  user: { id: string; email: string | null },
  ownerId: string | null,
  now = Date.now(),
): InviteProblem {
  if (!invite) return "not_found";
  if (ownerId && ownerId === user.id) return "own_project";
  if (invite.accepted_at) return invite.accepted_by === user.id ? null : "used";
  if (new Date(invite.expires_at).getTime() < now) return "expired";
  if ((user.email ?? "").trim().toLowerCase() !== invite.email.trim().toLowerCase()) return "wrong_email";
  return null;
}

export const INVITE_PROBLEM_TEXT: Record<Exclude<InviteProblem, null>, string> = {
  not_found: "Davet bulunamadı. Bağlantı iptal edilmiş olabilir.",
  expired: "Bu davetin süresi dolmuş. Çalışmanın sahibinden yeni bir davet isteyin.",
  used: "Bu davet başka bir hesapla kullanılmış.",
  wrong_email: "Bu davet başka bir e-posta adresine gönderildi. Davetin gönderildiği adresle giriş yapın.",
  own_project: "Bu çalışma zaten sizin.",
};

/** E-postayı gizler: ay***@ornek.com */
export function maskEmail(email: string): string {
  const [u, d] = email.split("@");
  if (!d) return email;
  return `${u.slice(0, 2)}${"*".repeat(Math.max(1, Math.min(4, u.length - 2)))}@${d}`;
}
