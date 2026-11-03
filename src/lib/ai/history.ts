/**
 * Sohbet geçmişinin modele gönderilen hâli (D78). Geçmişteki uzun taslaklar her istekte yeniden gönderilirse
 * maliyet hızla büyür; bölümün güncel metni zaten bağlamda olduğu için eski taslaklar kısa bir notla
 * özetlenir. En son asistan yanıtı (“bunu kısalt”, “şunu değiştir” gibi devam istekleri için) aynen kalır.
 * Saf modül (test edilir).
 */
export interface HistoryMessage { role: "user" | "assistant"; content: string }

export const HISTORY_LIMIT = 12;
const KEEP_LAST_DRAFT_CHARS = 9000;
const OLD_USER_CHARS = 3000;

const words = (s: string) => s.split(/\s+/).filter(Boolean).length;

/** Bir yanıttaki :::taslak bloklarını kısa bir nota çevirir */
export function collapseDrafts(text: string): string {
  return text.replace(/:::taslak[^\n]*\n([\s\S]*?)\n:::/g, (_m, body: string) => {
    const heads = [...body.matchAll(/^#{1,4}\s+(.+)$/gm)].map((h) => h[1].trim()).slice(0, 6);
    return `[Bu yanıtta yaklaşık ${words(body)} kelimelik bir taslak verildi${heads.length ? ` (başlıklar: ${heads.join("; ")})` : ""}. Kullanıcı belgeye eklediyse güncel hâli bölümün mevcut metnindedir.]`;
  });
}

/** Geçmiş mesajlar (eskiden yeniye) → modele gidecek kısaltılmış geçmiş */
export function compactHistory(messages: HistoryMessage[], limit = HISTORY_LIMIT): HistoryMessage[] {
  const list = messages.slice(-limit);
  let lastAssistant = -1;
  for (let i = list.length - 1; i >= 0; i--) if (list[i].role === "assistant") { lastAssistant = i; break; }
  const out = list.map((m, i) => {
    if (m.role === "assistant") {
      if (i === lastAssistant && m.content.length <= KEEP_LAST_DRAFT_CHARS) return m;
      return { ...m, content: collapseDrafts(m.content) };
    }
    return i < list.length - 2 && m.content.length > OLD_USER_CHARS ? { ...m, content: `${m.content.slice(0, OLD_USER_CHARS)}…` } : m;
  });
  // API ilk mesajın kullanıcıdan gelmesini bekler
  while (out.length && out[0].role !== "user") out.shift();
  return out;
}
