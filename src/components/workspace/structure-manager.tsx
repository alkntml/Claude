"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Copy, Download, Info, RotateCcw, Save, Trash2, Upload } from "lucide-react";
import { useT } from "@/i18n/client";
import { Button } from "@/components/ui/button";
import { cn } from "@/components/ui/cn";
import { Badge, Modal } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/toast";
import { api } from "@/lib/client";
import { buildTemplate, REQUIREMENT_LABEL, SCOPE_LABEL, STRUCTURE_ACTION_LABEL, type Requirement, type Scope, type TemplateSection } from "@/lib/workflows";

/** Projenin yol haritası girdileri (bağlamda saklanır, D171) */
export function templateInputOfProject(project: any) {
  const ctx = project?.context ?? {};
  return { workType: project.work_type, level: project.academic_level, methodology: ctx.methodology ?? null, program: ctx.program ?? null, design: ctx.design ?? null, variant: ctx.variant ?? null };
}

/** Projenin güncel varsayılan şablonunda bu bölümün tanımı */
export function defaultSectionOf(project: any, key: string): TemplateSection | undefined {
  try { return buildTemplate(templateInputOfProject(project)).find((x) => x.key === key); } catch { return undefined; }
}

const REQ_TONE: Record<Requirement, "red" | "amber" | "ink"> = { required: "red", conditional: "amber", optional: "ink" };

export function RequirementBadge({ value }: { value?: string | null }) {
  const { t } = useT();
  const r = (value && value in REQUIREMENT_LABEL ? value : "required") as Requirement;
  return <Badge tone={REQ_TONE[r]} className="!px-1.5 !py-0 text-[10px]">{t(REQUIREMENT_LABEL[r])}</Badge>;
}

/** Tek bölümün ayarları: ad, açıklama, zorunluluk, kapsam, görünürlük, kopyalama, varsayılana dönme */
export function StageSettingsModal({ stage, project, open, onClose, onSaved, onDuplicated, afterPosition }: {
  stage: any | null; project: any; open: boolean; onClose: () => void; onSaved: (s: any) => void; onDuplicated: (s: any) => void; afterPosition: number;
}) {
  const { t } = useT();
  const toast = useToast();
  const def = useMemo(() => (stage ? defaultSectionOf(project, stage.key) : undefined), [stage, project]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [requirement, setRequirement] = useState<Requirement>("required");
  const [scope, setScope] = useState<Scope>("standard");
  const [hidden, setHidden] = useState(false);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (!stage) return;
    setTitle(stage.title ?? "");
    setDescription(stage.description ?? "");
    setRequirement((stage.requirement ?? def?.requirement ?? "required") as Requirement);
    setScope((stage.scope ?? def?.scope ?? "standard") as Scope);
    setHidden(!!stage.hidden);
  }, [stage, def]);
  if (!stage) return null;
  const why = stage.why || (def ? t(def.why) : "");
  const critical = stage.critical ?? def?.critical;

  async function save() {
    setBusy(true);
    try {
      const r = await api<{ stage: any }>(`/api/stages/${stage.id}`, { method: "PATCH", json: { title: title.trim() || stage.title, description, requirement, scope, hidden } });
      onSaved({ ...stage, ...r.stage, requirement, scope, hidden });
      toast({ tone: "success", title: t("Bölüm ayarları kaydedildi") });
      onClose();
    } catch (e) { toast({ tone: "error", title: t("Kaydedilemedi"), detail: (e as Error).message }); } finally { setBusy(false); }
  }
  async function duplicate() {
    setBusy(true);
    try {
      const r = await api<{ stage: any }>(`/api/projects/${project.id}/stages`, { method: "POST", json: { title: t("{title} (kopya)", { title: stage.title }).slice(0, 200), description: stage.description ?? "", duplicateOf: stage.id, afterPosition } });
      onDuplicated(r.stage);
      toast({ tone: "success", title: t("Bölüm kopyalandı"), detail: t("Alt başlıklar kopyalandı; metin kopyalanmaz.") });
      onClose();
    } catch (e) { toast({ tone: "error", title: t("Kopyalanamadı"), detail: (e as Error).message }); } finally { setBusy(false); }
  }
  function resetToDefault() {
    if (!def) return;
    setTitle(t(def.title)); setDescription(t(def.description)); setRequirement(def.requirement); setScope(def.scope); setHidden(false);
  }

  return (
    <Modal open={open} onClose={onClose} title={t("Bölüm ayarları")} footer={
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex gap-2">
          <Button variant="secondary" onClick={duplicate} loading={busy}><Copy className="h-4 w-4" /> {t("Kopyala")}</Button>
          {def && <Button variant="ghost" onClick={resetToDefault} disabled={busy}><RotateCcw className="h-4 w-4" /> {t("Varsayılana döndür")}</Button>}
        </div>
        <Button onClick={save} loading={busy}>{t("Kaydet")}</Button>
      </div>
    }>
      {why && (
        <div className="mb-4 flex gap-2 rounded-xl bg-brand-50/60 p-3 text-[13px] text-ink-700">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
          <div><p className="font-medium text-ink-900">{t("Bu bölüm neden var?")}</p><p className="mt-0.5">{why}</p>{critical && <p className="mt-1 text-[12px] font-medium text-rose-600">{t("Bu çalışma türü için kritik bölüm.")}</p>}</div>
        </div>
      )}
      <label className="label">{t("Bölüm adı")}</label>
      <input className="input" value={title} maxLength={200} onChange={(e) => setTitle(e.target.value)} />
      <label className="label mt-4">{t("Bölümün amacı / açıklaması")}</label>
      <textarea className="input min-h-[80px]" value={description} maxLength={1000} onChange={(e) => setDescription(e.target.value)} />
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label">{t("Zorunluluk düzeyi")}</label>
          <select className="input" value={requirement} onChange={(e) => setRequirement(e.target.value as Requirement)}>
            {(Object.keys(REQUIREMENT_LABEL) as Requirement[]).map((k) => <option key={k} value={k}>{t(REQUIREMENT_LABEL[k])}</option>)}
          </select>
        </div>
        <div>
          <label className="label">{t("Kapsam")}</label>
          <select className="input" value={scope} onChange={(e) => setScope(e.target.value as Scope)}>
            {(Object.keys(SCOPE_LABEL) as Scope[]).map((k) => <option key={k} value={k}>{t(SCOPE_LABEL[k])}</option>)}
          </select>
          <p className="mt-1 text-[11.5px] text-ink-500">{t("Yapay zekâ bu bölümü yazarken uzunluğu buna göre ayarlar.")}</p>
        </div>
      </div>
      <label className="mt-4 flex items-start gap-2 text-[13px] text-ink-700">
        <input type="checkbox" className="mt-0.5" checked={hidden} onChange={(e) => setHidden(e.target.checked)} />
        <span><span className="font-medium">{t("Bu bölümü gizle")}</span><span className="block text-[12px] text-ink-500">{t("Gizli bölüm silinmez; dışa aktarılan belgeye, otomatik yazıma ve yapay zekâ bağlamına girmez. İstediğiniz zaman yeniden açabilirsiniz.")}</span></span>
      </label>
    </Modal>
  );
}



/** Yapıyı yönet: varsayılan/kayıtlı şablonla karşılaştır, seçilen farkları uygula, şablon kaydet, geçmişi gör */
export function StructureModal({ open, onClose, project, isOwner, onApplied }: { open: boolean; onClose: () => void; project: any; isOwner: boolean; onApplied: () => void }) {
  const { t, dl } = useT();
  const toast = useToast();
  const [source, setSource] = useState("default");
  const [templates, setTemplates] = useState<any[]>([]);
  const [unavailable, setUnavailable] = useState(false);
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [pick, setPick] = useState<{ add: Set<string>; remove: Set<string>; rename: Set<string> }>({ add: new Set(), remove: new Set(), rename: new Set() });
  const [busy, setBusy] = useState(false);
  const [name, setName] = useState("");

  async function loadTemplates() {
    try { const r = await api<{ templates: any[]; unavailable?: boolean }>("/api/templates"); setTemplates(r.templates); setUnavailable(!!r.unavailable); } catch { /* liste isteğe bağlı */ }
  }
  async function load(src: string) {
    setLoading(true);
    try {
      const r = await api<any>(`/api/projects/${project.id}/structure?source=${encodeURIComponent(src)}`);
      setData(r);
      setPick({ add: new Set(), remove: new Set(), rename: new Set() });
    } catch (e) { toast({ tone: "error", title: t("Yapı yüklenemedi"), detail: (e as Error).message }); } finally { setLoading(false); }
  }
  useEffect(() => { if (open) { loadTemplates(); load(source); } }, [open, source]); // eslint-disable-line react-hooks/exhaustive-deps

  function toggle(kind: "add" | "remove" | "rename", id: string) {
    setPick((p) => { const n = new Set(p[kind]); if (n.has(id)) n.delete(id); else n.add(id); return { ...p, [kind]: n }; });
  }
  function selectAll() {
    if (!data) return;
    setPick({ add: new Set(data.diff.add.map((x: any) => x.key)), remove: new Set(data.diff.remove.filter((x: any) => !x.hasText).map((x: any) => x.id)), rename: new Set(data.diff.rename.map((x: any) => x.id)) });
  }
  async function apply() {
    setBusy(true);
    try {
      const r = await api<{ skipped: string[] }>(`/api/projects/${project.id}/structure`, { method: "POST", json: { source, add: [...pick.add], remove: [...pick.remove], rename: [...pick.rename] } });
      toast({ tone: "success", title: t("Seçilen değişiklikler uygulandı"), detail: r.skipped.length ? t("Metni olduğu için kaldırılmayan bölümler: {list}", { list: r.skipped.join(", ") }) : undefined });
      onApplied();
      load(source);
    } catch (e) { toast({ tone: "error", title: t("Uygulanamadı"), detail: (e as Error).message }); } finally { setBusy(false); }
  }
  async function saveTemplate() {
    if (!name.trim()) return;
    setBusy(true);
    try {
      await api("/api/templates", { method: "POST", json: { projectId: project.id, name: name.trim() } });
      setName("");
      toast({ tone: "success", title: t("Şablon kaydedildi"), detail: t("Yeni proje oluştururken “Kayıtlı şablonum” bölümünden seçebilirsiniz.") });
      loadTemplates();
    } catch (e) { toast({ tone: "error", title: t("Şablon kaydedilemedi"), detail: (e as Error).message }); } finally { setBusy(false); }
  }
  // D172: şablon paylaşma/aktarma — dosya olarak indir, dosyadan içe aktar (metin içermez)
  async function exportTemplate(id: string, tname: string) {
    try {
      const r = await api<any>(`/api/templates/${id}`);
      const a = document.createElement("a");
      a.href = URL.createObjectURL(new Blob([JSON.stringify(r, null, 2)], { type: "application/json" }));
      a.download = `${tname.replace(/[^\p{L}\p{N}]+/gu, "-").slice(0, 60) || "sablon"}.academiana.json`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    } catch (e) { toast({ tone: "error", title: t("Şablon indirilemedi"), detail: (e as Error).message }); }
  }
  async function importTemplate(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    try {
      if (f.size > 300_000) throw new Error(t("Şablon dosyası geçersiz"));
      const raw = JSON.parse(await f.text());
      const tpl = raw?.format === "academiana-template" ? raw.template : null;
      if (!tpl) throw new Error(t("Şablon dosyası geçersiz"));
      await api("/api/templates", { method: "PUT", json: { name: String(tpl.name ?? f.name).slice(0, 120), work_type: tpl.work_type, methodology: tpl.methodology ?? null, sections: tpl.sections } });
      toast({ tone: "success", title: t("Şablon içe aktarıldı") });
      loadTemplates();
    } catch (err) { toast({ tone: "error", title: t("Şablon içe aktarılamadı"), detail: (err as Error).message }); }
  }
  async function removeTemplate(id: string, tname: string) {
    if (!confirm(t("“{name}” şablonu silinsin mi? Bu şablonla oluşturulmuş projeler etkilenmez.", { name: tname }))) return;
    try { await api(`/api/templates/${id}`, { method: "DELETE" }); if (source === id) setSource("default"); loadTemplates(); }
    catch (e) { toast({ tone: "error", title: t("Silinemedi"), detail: (e as Error).message }); }
  }

  const diff = data?.diff;
  const empty = diff && !diff.add.length && !diff.remove.length && !diff.rename.length;
  const count = pick.add.size + pick.remove.size + pick.rename.size;
  const outdated = data && source === "default" && data.version.project < data.version.current;

  return (
    <Modal open={open} onClose={onClose} wide title={t("Yapıyı yönet")}>
      <p className="text-[13px] text-ink-600">{t("Bölüm yapınızı Academiana’nın güncel şablonuyla veya kaydettiğiniz bir şablonla karşılaştırın. Hiçbir değişiklik siz seçip onaylamadan uygulanmaz; metni olan bölümler silinmez.")}</p>

      <div className="mt-4 flex flex-wrap items-end gap-3">
        <div className="min-w-[220px] flex-1">
          <label className="label">{t("Karşılaştırılacak yapı")}</label>
          <select className="input" value={source} onChange={(e) => setSource(e.target.value)}>
            <option value="default">{t("Academiana varsayılan şablonu")}</option>
            {templates.map((x) => <option key={x.id} value={x.id}>{x.name} · {t("{n} bölüm", { n: x.count })}</option>)}
          </select>
        </div>
        {isOwner && diff && !empty && <Button variant="secondary" onClick={selectAll}>{source === "default" ? t("Varsayılana sıfırla (tümünü seç)") : t("Tümünü seç")}</Button>}
      </div>

      {outdated && (
        <div className="mt-3 flex gap-2 rounded-xl bg-amber-50 p-3 text-[13px] text-amber-800">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>{t("Academiana şablonu güncellendi (sürüm {a} → {b}). Projeniz kendiliğinden değişmez; aşağıdaki farkları inceleyip istediklerinizi uygulayabilirsiniz.", { a: data.version.project, b: data.version.current })}</p>
        </div>
      )}

      <div className="mt-4 max-h-[46vh] space-y-4 overflow-y-auto pr-1">
        {loading && <p className="text-sm text-ink-500">{t("Yükleniyor…")}</p>}
        {!loading && empty && <p className="rounded-xl bg-emerald-50 p-3 text-[13px] text-emerald-700">{t("Yapınız seçilen şablonla uyumlu; uygulanacak fark yok.")}</p>}
        {!loading && diff?.add.length > 0 && (
          <section>
            <p className="mb-1.5 text-[13px] font-medium text-ink-800">{t("Eklenebilecek bölümler")}</p>
            {diff.add.map((x: any) => (
              <label key={x.key} className="flex items-start gap-2 rounded-lg px-2 py-1.5 hover:bg-ink-50">
                <input type="checkbox" className="mt-1" disabled={!isOwner} checked={pick.add.has(x.key)} onChange={() => toggle("add", x.key)} />
                <span className="min-w-0 flex-1 text-[13px]"><span className="font-medium text-ink-900">{x.title}</span> <RequirementBadge value={x.requirement} />{x.why && <span className="block text-[12px] text-ink-500">{x.why}</span>}</span>
              </label>
            ))}
          </section>
        )}
        {!loading && diff?.rename.length > 0 && (
          <section>
            <p className="mb-1.5 text-[13px] font-medium text-ink-800">{t("Adı farklı olan bölümler")}</p>
            {diff.rename.map((x: any) => (
              <label key={x.id} className="flex items-start gap-2 rounded-lg px-2 py-1.5 hover:bg-ink-50">
                <input type="checkbox" className="mt-1" disabled={!isOwner} checked={pick.rename.has(x.id)} onChange={() => toggle("rename", x.id)} />
                <span className="text-[13px] text-ink-700">{x.from} <span className="text-ink-400">→</span> <span className="font-medium text-ink-900">{x.to}</span></span>
              </label>
            ))}
          </section>
        )}
        {!loading && diff?.remove.length > 0 && (
          <section>
            <p className="mb-1.5 text-[13px] font-medium text-ink-800">{t("Şablonda olmayan bölümler")}</p>
            {diff.remove.map((x: any) => (
              <label key={x.id} className={cn("flex items-start gap-2 rounded-lg px-2 py-1.5", x.hasText ? "opacity-70" : "hover:bg-ink-50")}>
                <input type="checkbox" className="mt-1" disabled={!isOwner || x.hasText} checked={pick.remove.has(x.id)} onChange={() => toggle("remove", x.id)} />
                <span className="text-[13px] text-ink-700">{x.title}{x.hasText && <span className="block text-[12px] text-ink-500">{t("Metni olduğu için kaldırılmaz; isterseniz bölüm ayarlarından gizleyebilirsiniz.")}</span>}</span>
              </label>
            ))}
          </section>
        )}
      </div>

      {isOwner && diff && !empty && (
        <div className="mt-3 flex justify-end"><Button onClick={apply} loading={busy} disabled={!count}>{t("Seçilenleri uygula ({n})", { n: count })}</Button></div>
      )}

      <div className="mt-6 border-t border-ink-100 pt-4">
        <p className="text-[13px] font-medium text-ink-800">{t("Bu yapıyı şablon olarak kaydet")}</p>
        <p className="text-[12px] text-ink-500">{t("Başlıklar, sıra, açıklamalar, zorunluluk ve kapsam kaydedilir; metin kaydedilmez.")}</p>
        {unavailable ? <p className="mt-2 text-[12px] text-amber-700">{t("Şablon kaydı için veritabanı güncellemesi henüz yapılmamış.")}</p> : (
          <div className="mt-2 flex gap-2"><input className="input" maxLength={120} placeholder={t("ör. Nitel yüksek lisans tezi yapım")} value={name} onChange={(e) => setName(e.target.value)} /><Button onClick={saveTemplate} loading={busy} disabled={!name.trim()}><Save className="h-4 w-4" /> {t("Kaydet")}</Button></div>
        )}
        {!unavailable && (
          <label className="mt-2 inline-flex cursor-pointer items-center gap-1.5 text-[12.5px] font-medium text-brand-700 hover:underline">
            <Upload className="h-3.5 w-3.5" /> {t("Şablon dosyası içe aktar")}
            <input type="file" accept=".json,application/json" className="hidden" onChange={importTemplate} />
          </label>
        )}
        {templates.length > 0 && (
          <ul className="mt-3 space-y-1">
            {templates.map((x) => (
              <li key={x.id} className="flex items-center gap-2 rounded-lg px-2 py-1 text-[13px] text-ink-700 hover:bg-ink-50">
                <span className="min-w-0 flex-1 truncate">{x.name} <span className="text-ink-400">· {t("{n} bölüm", { n: x.count })}</span></span>
                <button onClick={() => exportTemplate(x.id, x.name)} className="rounded-md p-1 text-ink-400 hover:bg-ink-100 hover:text-ink-700" aria-label={t("Şablonu dosya olarak indir")} title={t("Şablonu dosya olarak indir")}><Download className="h-3.5 w-3.5" /></button>
                <button onClick={() => removeTemplate(x.id, x.name)} className="rounded-md p-1 text-ink-400 hover:bg-rose-50 hover:text-rose-500" aria-label={t("Şablonu sil")}><Trash2 className="h-3.5 w-3.5" /></button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {data?.log?.length > 0 && (
        <div className="mt-6 border-t border-ink-100 pt-4">
          <p className="mb-1.5 text-[13px] font-medium text-ink-800">{t("Yapı değişiklik geçmişi")}</p>
          <ul className="max-h-40 space-y-0.5 overflow-y-auto text-[12px] text-ink-600">
            {data.log.map((l: any, i: number) => (
              <li key={i} className="flex gap-2"><span className="shrink-0 text-ink-400">{new Date(l.created_at).toLocaleString(dl)}</span><span>{t(STRUCTURE_ACTION_LABEL[l.action] ?? "Yapı değişti")}{l.detail?.title ? ` · ${l.detail.title}` : ""}</span></li>
            ))}
          </ul>
        </div>
      )}
    </Modal>
  );
}

/* eslint-enable @typescript-eslint/no-explicit-any */
