"use client";
import { ArrowLeft, BookCopy, ChevronRight, FileText, FileUp, Library, Link2, Loader2, Terminal, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/toast";
import { useT } from "@/i18n/client";
import { api, handlePlanError } from "@/lib/client";
import { toSourceInput } from "@/lib/sources/to-input";

/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * İçe aktarma merkezi (D149): çalışmanın her anında açılır. Tüm çalışma (Word/PDF), bu bölüme Word, PDF makale
 * (kaynak olarak), Zotero (doğrudan), Mendeley/EndNote (dışa aktarılan dosya), DOI/PMID/arXiv, BibTeX/RIS.
 */
type View = "home" | "work" | "zotero" | "mendeley" | "doi" | "bib" | "pdf";

export function ImportHub({ open, onClose, projectId, onStages, onSources, onWordToSection }: {
  open: boolean; onClose: () => void; projectId: string;
  onStages: (stages: any[]) => void; onSources: (rows: any[]) => void; onWordToSection: () => void;
}) {
  const { t } = useT();
  const toast = useToast();
  const [view, setView] = useState<View>("home");
  const [busy, setBusy] = useState(false);
  const [z, setZ] = useState({ library: "user" as "user" | "group", libraryId: "", apiKey: "", collection: "" });
  const [doi, setDoi] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const close = () => { setView("home"); onClose(); };

  const fail = (e: unknown, title: string) => toast({ tone: "error", title, detail: (e as Error).message });
  const refsToast = (r: { added: any[]; duplicates: number; invalid: number; truncated?: number }) => toast({
    tone: r.added.length ? "success" : "info", title: t("{n} kaynak içe aktarıldı", { n: r.added.length }),
    detail: [t("{n} tanesi DOI ile doğrulandı", { n: r.added.filter((x) => x.verified).length }), r.duplicates ? t("{n} tanesi zaten projedeydi", { n: r.duplicates }) : "", r.invalid ? t("{n} kayıt eksik bilgi nedeniyle atlandı", { n: r.invalid }) : ""].filter(Boolean).join(" · "),
  });

  async function importWork(file: File) {
    setBusy(true);
    try {
      const fd = new FormData(); fd.append("file", file);
      const res = await fetch(`/api/projects/${projectId}/import-work`, { method: "POST", body: fd });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) { handlePlanError(res.status, j); throw new Error(j.error ?? t("İçe aktarılamadı")); }
      onStages(j.stages); onSources(j.sources);
      toast({ tone: "success", title: t("Çalışma içe aktarıldı"), detail: t("{s} bölüm ({f} boş bölüme yazıldı, {a} yeni) · {r} kaynak · {l} atıf bağlandı", { s: j.report.sections, f: j.report.filled, a: j.report.added, r: j.report.refsAdded, l: j.report.linked }) });
      close();
    } catch (e) { fail(e, t("İçe aktarılamadı")); } finally { setBusy(false); }
  }
  async function importRefsFile(file: File) {
    if (file.size > 4_000_000) { toast({ tone: "error", title: t("Dosya çok büyük"), detail: t("En fazla 4 MB’lık kaynak dosyası yükleyin.") }); return; }
    setBusy(true);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase();
      const format = ext === "bib" ? "bibtex" : ext === "ris" ? "ris" : ext === "json" ? "csljson" : null;
      const r = await api<any>(`/api/projects/${projectId}/sources/import`, { method: "POST", json: { text: await file.text(), format } });
      onSources(r.added); refsToast(r); close();
    } catch (e) { fail(e, t("İçe aktarılamadı")); } finally { setBusy(false); }
  }
  async function importZotero() {
    setBusy(true);
    try {
      const r = await api<any>(`/api/projects/${projectId}/sources/zotero`, { method: "POST", json: z });
      onSources(r.added); refsToast(r); setZ({ ...z, apiKey: "" }); close();
    } catch (e) { fail(e, t("Zotero’dan aktarılamadı")); } finally { setBusy(false); }
  }
  async function addDoi() {
    setBusy(true);
    try {
      const { record } = await api<{ record: any }>(`/api/sources/lookup?id=${encodeURIComponent(doi.trim())}`);
      const { sources } = await api<{ sources: any[] }>(`/api/projects/${projectId}/sources`, { method: "POST", json: { sources: [toSourceInput(record)] } });
      onSources(sources); toast({ tone: "success", title: t("Kaynak eklendi"), detail: record.title }); setDoi("");
    } catch (e) { fail(e, t("Kayıt bulunamadı")); } finally { setBusy(false); }
  }
  async function importPdfs(files: FileList) {
    setBusy(true);
    let ok = 0;
    for (const f of Array.from(files).slice(0, 10)) {
      try {
        const fd = new FormData(); fd.append("file", f); fd.append("projectId", projectId); fd.append("purpose", "source");
        const up = await fetch("/api/files", { method: "POST", body: fd });
        const j = await up.json().catch(() => ({}));
        if (!up.ok) { handlePlanError(up.status, j); throw new Error(j.error ?? f.name); }
        const { source } = await api<{ source: any }>(`/api/files/${j.file?.id ?? j.id}/to-source`, { method: "POST", json: { source: {} } });
        onSources([source]); ok++;
      } catch (e) { fail(e, t("{f} eklenemedi", { f: f.name })); }
    }
    setBusy(false);
    if (ok) { toast({ tone: "success", title: t("{n} PDF kaynak olarak eklendi", { n: ok }), detail: t("Tam metin okundu; atıflarda sayfa numarası kullanılabilir.") }); close(); }
  }

  const Row = ({ icon: Icon, title, desc, onClick }: { icon: any; title: string; desc: string; onClick: () => void }) => (
    <button onClick={onClick} className="flex w-full items-center gap-3 rounded-xl border border-ink-200/80 px-4 py-3 text-left transition hover:border-ink-300 hover:bg-ink-50">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-ink-50 text-ink-600"><Icon className="h-[18px] w-[18px]" /></span>
      <span className="min-w-0 flex-1"><span className="block text-[14px] font-medium text-ink-900">{title}</span><span className="block text-[12.5px] text-ink-500">{desc}</span></span>
      <ChevronRight className="h-4 w-4 text-ink-300" />
    </button>
  );
  const pick = (accept: string, multiple: boolean, fn: (files: FileList) => void) => {
    const el = fileRef.current!; el.accept = accept; el.multiple = multiple;
    el.onchange = () => { if (el.files?.length) fn(el.files); el.value = ""; };
    el.click();
  };
  const back = <button onClick={() => setView("home")} className="mb-3 inline-flex items-center gap-1 text-[13px] text-ink-500 hover:text-ink-900"><ArrowLeft className="h-3.5 w-3.5" /> {t("Geri")}</button>;

  return (
    <Modal open={open} onClose={close} title={t("İçe aktar")}>
      <input ref={fileRef} type="file" className="hidden" />
      {busy && <p className="mb-3 flex items-center gap-2 rounded-lg bg-brand-50 px-3 py-2 text-[13px] text-brand-800"><Loader2 className="h-4 w-4 animate-spin" /> {t("İşleniyor… Büyük belgelerde bir dakika sürebilir.")}</p>}
      {view === "home" && (
        <div className="space-y-5">
          <div className="space-y-2">
            <p className="text-[12px] font-medium uppercase tracking-wide text-ink-400">{t("Çalışma metni")}</p>
            <Row icon={FileUp} title={t("Tüm çalışmamı içe aktar")} desc={t("Word (.docx), PDF veya metin. Bölümlere ayrılır, kaynakça eklenir, atıflar bağlanır.")} onClick={() => setView("work")} />
            <Row icon={FileText} title={t("Bu bölüme Word’den aktar")} desc={t("Açık bölümün içine (alt başlıklarıyla) aktarır.")} onClick={() => { close(); onWordToSection(); }} />
          </div>
          <div className="space-y-2">
            <p className="text-[12px] font-medium uppercase tracking-wide text-ink-400">{t("Kaynaklar")}</p>
            <Row icon={Upload} title={t("PDF dosyaları yükle")} desc={t("Makale PDF’leri kaynak olarak eklenir; tam metin okunur.")} onClick={() => setView("pdf")} />
            <Row icon={Library} title={t("Zotero’dan içe aktar")} desc={t("Kütüphanenizden veya bir koleksiyondan doğrudan.")} onClick={() => setView("zotero")} />
            <Row icon={BookCopy} title={t("Mendeley’den içe aktar")} desc={t("Mendeley’den dışa aktardığınız BibTeX/RIS dosyasıyla.")} onClick={() => setView("mendeley")} />
            <Row icon={Link2} title={t("DOI / PMID / arXiv ile ekle")} desc={t("Kimliği yapıştırın; künye kayıt otoritesinden gelir.")} onClick={() => setView("doi")} />
            <Row icon={Terminal} title={t(".bib / .ris içe aktar")} desc={t("EndNote, JabRef ve diğer programların dosyaları.")} onClick={() => setView("bib")} />
          </div>
        </div>
      )}
      {view === "work" && (
        <div>{back}
          <p className="text-[14px] text-ink-700">{t("Yazdığınız çalışmayı yükleyin. Metniniz yeniden yazılmaz: en üst düzey başlıklarınız bölüm olur, boş bölümlere yerleşir; dolu bölümlerin üzerine yazılmaz. Kaynakça doğrulanıp eklenir, metin içi atıflar bağlanır.")}</p>
          <p className="mt-2 text-[12.5px] text-ink-500">{t("En iyi sonuç Word (.docx) ile alınır; PDF’te başlıklar ve paragraflar yaklaşık olarak çıkarılır.")}</p>
          <Button className="mt-4" loading={busy} onClick={() => pick(".docx,.pdf,.txt,.md", false, (f) => importWork(f[0]))}><FileUp className="h-4 w-4" /> {t("Dosya seç")}</Button>
        </div>
      )}
      {view === "pdf" && (
        <div>{back}
          <p className="text-[14px] text-ink-700">{t("Bilgisayarınızdan en fazla 10 makale PDF’i seçin. Künye DOI ile doğrulanır, tam metin okunur ve “Kaynağa sor” ile kullanılabilir.")}</p>
          <Button className="mt-4" loading={busy} onClick={() => pick(".pdf,application/pdf", true, importPdfs)}><Upload className="h-4 w-4" /> {t("PDF seç")}</Button>
        </div>
      )}
      {view === "zotero" && (
        <div className="space-y-3">{back}
          <ol className="list-decimal space-y-1 pl-5 text-[13px] text-ink-600">
            <li>{t("zotero.org → Settings → Security (Feeds/API) sayfasını açın.")} <a className="font-medium text-brand-700 hover:underline" href="https://www.zotero.org/settings/security" target="_blank" rel="noopener noreferrer">{t("Aç")}</a></li>
            <li>{t("“Your user ID for use in API calls” numarasını kopyalayın.")}</li>
            <li>{t("“Create new private key” ile yalnızca okuma izinli bir anahtar oluşturun.")}</li>
          </ol>
          <div className="grid gap-2 sm:grid-cols-2">
            <label className="text-sm"><span className="label">{t("Kütüphane")}</span><select className="input" value={z.library} onChange={(e) => setZ({ ...z, library: e.target.value as "user" | "group" })}><option value="user">{t("Kişisel kütüphanem")}</option><option value="group">{t("Grup kütüphanesi")}</option></select></label>
            <label className="text-sm"><span className="label">{z.library === "user" ? t("Kullanıcı kimliği (user ID)") : t("Grup kimliği")}</span><input className="input" inputMode="numeric" value={z.libraryId} onChange={(e) => setZ({ ...z, libraryId: e.target.value.replace(/\D/g, "") })} /></label>
            <label className="text-sm sm:col-span-2"><span className="label">{t("API anahtarı")}</span><input className="input font-mono" type="password" autoComplete="off" value={z.apiKey} onChange={(e) => setZ({ ...z, apiKey: e.target.value.trim() })} /></label>
            <label className="text-sm sm:col-span-2"><span className="label">{t("Koleksiyon anahtarı (isteğe bağlı)")}</span><input className="input font-mono uppercase" maxLength={8} placeholder="ABCD2345" value={z.collection} onChange={(e) => setZ({ ...z, collection: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "") })} /></label>
          </div>
          <p className="text-[12px] text-ink-500">{t("Anahtarınız saklanmaz; yalnızca bu aktarım için kullanılır. En fazla 300 kayıt aktarılır, ekler ve notlar alınmaz.")}</p>
          <Button loading={busy} disabled={!z.libraryId || z.apiKey.length < 10} onClick={importZotero}><Library className="h-4 w-4" /> {t("Zotero’dan aktar")}</Button>
        </div>
      )}
      {view === "mendeley" && (
        <div className="space-y-3">{back}
          <ol className="list-decimal space-y-1 pl-5 text-[13px] text-ink-600">
            <li>{t("Mendeley Reference Manager’da aktarmak istediğiniz kaynakları seçin (tümü için Ctrl/Cmd+A).")}</li>
            <li>{t("Sağ tık → “Export” (Dışa aktar) → BibTeX (.bib) veya RIS (.ris) seçip kaydedin.")}</li>
            <li>{t("Kaydettiğiniz dosyayı aşağıdan yükleyin.")}</li>
          </ol>
          <p className="text-[12px] text-ink-500">{t("Mendeley, üçüncü taraf uygulamalara doğrudan bağlantıyı kısıtladığı için aktarım dosya ile yapılır.")}</p>
          <Button loading={busy} onClick={() => pick(".bib,.ris,.json", false, (f) => importRefsFile(f[0]))}><FileUp className="h-4 w-4" /> {t("Dosya seç")}</Button>
        </div>
      )}
      {view === "bib" && (
        <div className="space-y-3">{back}
          <p className="text-[14px] text-ink-700">{t("BibTeX (.bib), RIS (.ris) veya CSL-JSON (.json) dosyası yükleyin. Kaynaklar DOI ile doğrulanır; projede olanlar atlanır.")}</p>
          <Button loading={busy} onClick={() => pick(".bib,.ris,.json", false, (f) => importRefsFile(f[0]))}><FileUp className="h-4 w-4" /> {t("Dosya seç")}</Button>
        </div>
      )}
      {view === "doi" && (
        <div className="space-y-3">{back}
          <label className="label">{t("DOI, PMID veya arXiv kimliği ile ekle")}</label>
          <div className="flex gap-2"><input className="input" placeholder="10.1016/j.jocrd.2013.12.005" value={doi} onChange={(e) => setDoi(e.target.value)} onKeyDown={(e) => e.key === "Enter" && doi.trim() && addDoi()} /><Button loading={busy} disabled={!doi.trim()} onClick={addDoi}>{t("Ekle")}</Button></div>
        </div>
      )}
    </Modal>
  );
}
/* eslint-enable @typescript-eslint/no-explicit-any */
