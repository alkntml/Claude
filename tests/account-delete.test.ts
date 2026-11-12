import { describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
import { listUserObjects, removeObjects } from "@/lib/account-delete";

/** Supabase depolama list()/remove() taklidi: klasörler id: null döner, sayfa başına en çok 1000 kayıt */
function fakeStore(paths: string[]) {
  const removed: string[] = [];
  const list = async (prefix: string, opts: { limit: number; offset: number }) => {
    const children = new Map<string, boolean>();
    for (const p of paths) {
      if (!p.startsWith(`${prefix}/`)) continue;
      const rest = p.slice(prefix.length + 1);
      const [head, ...tail] = rest.split("/");
      children.set(head, tail.length > 0 || children.get(head) === true);
    }
    const all = [...children.entries()].map(([name, isDir]) => ({ name, id: isDir ? null : `id-${name}` }));
    return { data: all.slice(opts.offset, opts.offset + opts.limit), error: null };
  };
  const remove = async (chunk: string[]) => { if (chunk.length > 1000) throw new Error("çok büyük"); removed.push(...chunk); return { data: [], error: null }; };
  return { store: { list, remove } as never, removed };
}

describe("hesap silme: depodaki tüm dosyalar (D154)", () => {
  it("alt klasörler (Overleaf geçici ZIP’leri) ve 1000’den fazla dosya dâhil listelenir ve silinir; başka kullanıcının dosyasına dokunulmaz", async () => {
    const uid = "11111111-1111-1111-1111-111111111111";
    const mine = [...Array.from({ length: 2345 }, (_, i) => `${uid}/f${i}.pdf`), `${uid}/overleaf/a.zip`, `${uid}/overleaf/b.zip`];
    const other = ["22222222-2222-2222-2222-222222222222/x.pdf"];
    const { store, removed } = fakeStore([...mine, ...other]);
    const listed = await listUserObjects(store, uid);
    expect(listed.sort()).toEqual([...mine].sort());
    const n = await removeObjects(store, listed);
    expect(n).toBe(mine.length);
    expect(removed.sort()).toEqual([...mine].sort());
    expect(removed).not.toContain(other[0]);
  });
});
