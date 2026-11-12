import { ApiError, json, route } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { localeFromRequest } from "@/i18n/server";
import { makeT } from "@/i18n";
import { projectAccess } from "@/lib/project-access";
import { checkMagic } from "@/lib/files/extract";
import { addReferenceLines } from "@/lib/import/server";
import { splitReferences } from "@/lib/import/references";
import { buildSeeds, documentNodes, type WorkKind } from "@/lib/import/work";
import { sectionText } from "@/lib/import/whole";
import { docToPlain, wordCount } from "@/lib/editor/doc";
import { recordUsage } from "@/lib/usage";

type Ctx = { params: Promise<{ id: string }> };
export const maxDuration = 300;
const MAX_BYTES = 25 * 1024 * 1024;

/**
 * Mevcut bir çalışmaya tüm belgeyi aktarır (D149): belge bölümlere ayrılır; aynı türden BOŞ bir bölüm varsa
 * (ör. boş “Bulgular”) içine yazılır, yoksa yeni bölüm olarak sona (kaynakçanın önüne) eklenir. Dolu bölümlerin
 * üzerine yazılmaz. Kaynakça doğrulanıp eklenir, atıflar bağlanır. Yapay zekâ kullanılmaz.
 */
export const POST = route<Ctx>("project.import_work", async (req, { params }) => {
  const s = await requireUser();
  const { id } = await params;
  const T = makeT(localeFromRequest(req));
  const acc = await projectAccess(s, id, "edit");
  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) throw new ApiError(422, "Dosya gerekli");
  if (file.size > MAX_BYTES) throw new ApiError(413, "Dosya 25 MB sınırını aşıyor");
  const ext = file.name.toLowerCase().split(".").pop() ?? "";
  const kind: WorkKind | null = ext === "docx" ? "docx" : ext === "pdf" ? "pdf" : ext === "txt" || ext === "md" ? "txt" : null;
  if (!kind) throw new ApiError(422, "Word (.docx), PDF veya metin (.txt) dosyası yükleyin");
  const buffer = Buffer.from(await file.arrayBuffer());
  if (!checkMagic(kind, buffer)) throw new ApiError(422, "Dosya içeriği uzantısıyla uyuşmuyor");

  const { nodes } = await documentNodes(kind, buffer);
  const { body, refs } = splitReferences(nodes);
  if (sectionText(body).words < 20) throw new ApiError(422, "Belgede içe aktarılacak metin bulunamadı");
  const r = await addReferenceLines(acc.db, id, acc.ownerId, refs);
  const built = buildSeeds(body, r.keys, T("Ön metin"));

  const { data: existing } = await acc.db.from("project_stages").select("id, key, position, word_count").eq("project_id", id).eq("user_id", acc.ownerId).order("position");
  const list = existing ?? [];
  let pos = list.reduce((a, x) => Math.max(a, x.position), -1) + 1;
  let filled = 0, added = 0;
  const now = new Date().toISOString();
  for (const seed of built.seeds) {
    const text = docToPlain(seed.content!);
    const fields = { content: seed.content, content_text: text, word_count: wordCount(text), status: "in_progress", updated_at: now, last_editor: s.user.id };
    const empty = list.find((x) => x.key === seed.key && !(x.word_count > 0));
    if (empty) {
      await acc.db.from("project_stages").update(fields).eq("id", empty.id).eq("project_id", id);
      empty.word_count = fields.word_count;
      filled++;
    } else {
      let key = seed.key;
      if (list.some((x) => x.key === key)) key = `${key}_${Date.now().toString(36)}${added}`;
      const { data: row } = await acc.db.from("project_stages").insert({ project_id: id, user_id: acc.ownerId, key, title: seed.title, description: "", position: pos++, ...fields }).select("id, key, position, word_count").single();
      if (row) list.push(row);
      added++;
    }
  }
  // Kaynakça bölümü en sonda kalsın
  const ref = list.find((x) => x.key === "references");
  if (ref) await acc.db.from("project_stages").update({ position: pos }).eq("id", ref.id).eq("project_id", id);
  await recordUsage(s.user.id, "upload", { meta: { kind: "import_work_existing", bytes: file.size, refs: r.total } });
  const { data: stages } = await acc.db.from("project_stages").select("*").eq("project_id", id).order("position");
  return json({ stages: stages ?? [], sources: r.added, report: { sections: built.seeds.length, filled, added, refsTotal: r.total, refsAdded: r.added.length, linked: built.linked, unmatched: built.unmatched, unverified: r.unverified } });
});
