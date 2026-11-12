import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";

type Store = ReturnType<SupabaseClient["storage"]["from"]>;
const PAGE = 1000;

/**
 * Kullanıcının depodaki tüm dosya yolları (D154): `<user_id>/` altı alt klasörler dâhil (ör. `<user_id>/overleaf/…`),
 * sayfa sayfa. Supabase list() klasörleri `id: null` olarak döndürür; bunların içine de inilir.
 */
export async function listUserObjects(store: Store, userId: string, maxObjects = 50_000): Promise<string[]> {
  const out: string[] = [];
  const queue = [userId];
  while (queue.length && out.length < maxObjects) {
    const prefix = queue.shift()!;
    for (let offset = 0; ; offset += PAGE) {
      const { data, error } = await store.list(prefix, { limit: PAGE, offset });
      if (error) throw error;
      for (const f of data ?? []) {
        const p = `${prefix}/${f.name}`;
        if (f.id == null) queue.push(p);
        else out.push(p);
      }
      if (!data || data.length < PAGE) break;
    }
  }
  return out;
}

/** Yolları 1000’erli gruplar hâlinde siler; silinen sayısını döndürür */
export async function removeObjects(store: Store, paths: string[]): Promise<number> {
  let n = 0;
  for (let i = 0; i < paths.length; i += PAGE) {
    const chunk = paths.slice(i, i + PAGE);
    const { error } = await store.remove(chunk);
    if (error) throw error;
    n += chunk.length;
  }
  return n;
}
