import { json, route } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { childAccess } from "@/lib/project-access";
import { loadChunks } from "@/lib/sources/chunk-insert";
import { adminClient } from "@/lib/supabase/admin";

type Ctx = { params: Promise<{ id: string }> };

/**
 * Kaynak okuyucu (D207): kaynağın künyesi, yüklenmiş PDF’i varsa kısa ömürlü imzalı bağlantısı ve okunan tam metnin
 * sayfa ipuçlu parçaları. Görüntüleme işidir; yapay zekâ kullanmaz, haktan düşmez.
 */
export const GET = route<Ctx>("source.reader", async (_req, { params }) => {
  const s = await requireUser();
  const { id } = await params;
  const { row: src, access } = await childAccess(s, "sources", id, "read", "id, title, authors, year, pages, container_title, access_level, file_id, oa_url, doi");
  let pdf: { url: string; name: string } | null = null;
  if (src.file_id) {
    // Dosya, kaynağın sahibine ve aynı çalışmaya ait olmalı (açık kullanıcı ve çalışma filtresi)
    const admin = adminClient();
    const { data: f } = await admin.from("files").select("name, mime_type, storage_path, user_id, project_id").eq("id", src.file_id).eq("user_id", access.ownerId).maybeSingle();
    if (f && /pdf/i.test(f.mime_type ?? "") && (!src.project_id || f.project_id === src.project_id) && String(f.storage_path).startsWith(`${access.ownerId}/`)) {
      const { data: signed } = await admin.storage.from("user-files").createSignedUrl(f.storage_path, 600);
      if (signed?.signedUrl) pdf = { url: signed.signedUrl, name: f.name };
    }
  }
  const chunks = src.access_level === "full_text" ? await loadChunks(access.db, { sourceIds: [id], userId: access.ownerId, limit: 4000 }) : [];
  return json({
    source: { id: src.id, title: src.title, authors: src.authors, year: src.year, pages: src.pages, container_title: src.container_title, access_level: src.access_level, oa_url: src.oa_url, doi: src.doi },
    pdf,
    chunks: chunks.map((c) => ({ page: c.page_hint, section: c.section, content: c.content })),
  });
});
