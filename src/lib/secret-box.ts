import "server-only";
import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import { env } from "@/lib/env";

/**
 * D192: Üçüncü taraf bağlantı anahtarlarının (Zotero API anahtarı) şifrelenmesi — AES-256-GCM.
 * Anahtar yalnızca sunucudaki gizli değerden türetilir (INTEGRATION_SECRET; yoksa veritabanı sunucu anahtarı).
 * Gizli değer değişirse eski kayıtlar çözülemez; kullanıcıdan bağlantıyı yenilemesi istenir.
 */
function key(): Buffer {
  const base = env.integrationSecret || env.supabaseServiceKey;
  if (!base) throw new Error("Şifreleme anahtarı yapılandırılmamış");
  return createHash("sha256").update(`academiana-integrations:${base}`).digest();
}

export function seal(plain: string): string {
  const iv = randomBytes(12);
  const c = createCipheriv("aes-256-gcm", key(), iv);
  const ct = Buffer.concat([c.update(plain, "utf8"), c.final()]);
  return ["v1", iv.toString("base64url"), c.getAuthTag().toString("base64url"), ct.toString("base64url")].join(":");
}

/** Çözülemezse (anahtar değişmiş veya kayıt bozuk) null döner */
export function open(sealed: string | null | undefined): string | null {
  if (!sealed) return null;
  const [v, iv, tag, ct] = sealed.split(":");
  if (v !== "v1" || !iv || !tag || !ct) return null;
  try {
    const d = createDecipheriv("aes-256-gcm", key(), Buffer.from(iv, "base64url"));
    d.setAuthTag(Buffer.from(tag, "base64url"));
    return Buffer.concat([d.update(Buffer.from(ct, "base64url")), d.final()]).toString("utf8");
  } catch { return null; }
}
