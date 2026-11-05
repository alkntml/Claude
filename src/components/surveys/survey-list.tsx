"use client";
import { ClipboardList, Plus, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import type { Question } from "@/lib/surveys";
import { Button } from "@/components/ui/button";
import { Badge, Tabs } from "@/components/ui/primitives";
import { SurveyAiCreate } from "./survey-ai-create";
import { useToast } from "@/components/ui/toast";
import { DeleteButton } from "@/components/ui/delete-button";
import { useT } from "@/i18n/client";
import { api } from "@/lib/client";

interface Row { id: string; title: string; project_id: string | null; is_open: boolean; response_count: number; closes_at: string | null; updated_at: string }

export function SurveyList({ surveys: initial, projects, defaultProject }: { surveys: Row[]; projects: { id: string; title: string }[]; defaultProject: string | null }) {
  const [surveys, setSurveys] = useState(initial);
  const { t } = useT();
  const toast = useToast();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [projectId, setProjectId] = useState<string>(defaultProject && projects.some((p) => p.id === defaultProject) ? defaultProject : "");
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState<"ai" | "manual">("ai");
  const pname = (id: string | null) => projects.find((p) => p.id === id)?.title;
  // Ücretsiz anket oluşturucuda (D90) hazırlanan taslak varsa hesaba aktarmayı öner
  const [draft, setDraft] = useState<{ title: string; description: string; questions: Question[] } | null>(null);
  useEffect(() => { try { const v = localStorage.getItem("academiana:tool-survey"); if (v) { const d = JSON.parse(v); if (d?.questions?.length) setDraft(d); } } catch { /* yok */ } }, []);
  async function importDraft() {
    if (!draft) return;
    setBusy(true);
    try {
      const questions = draft.questions.filter((q) => q.title?.trim() && ((q.type !== "single" && q.type !== "multi") || q.options.length >= 2) && (q.type !== "likert" || q.items.length >= 1));
      const r = await api<{ survey: { id: string } }>("/api/surveys", { method: "POST", json: { title: draft.title.trim() || t("Adsız anket"), projectId: projectId || null, draft: { description: draft.description ?? "", consent: "", questions } } });
      try { localStorage.removeItem("academiana:tool-survey"); } catch { /* yok */ }
      router.push(`/anketler/${r.survey.id}`);
    } catch (e) { toast({ tone: "error", title: t("Anket aktarılamadı"), detail: (e as Error).message }); setBusy(false); }
  }

  async function create() {
    setBusy(true);
    try {
      const r = await api<{ survey: { id: string } }>("/api/surveys", { method: "POST", json: { title: title.trim(), projectId: projectId || null } });
      router.push(`/anketler/${r.survey.id}`);
    } catch (e) { toast({ tone: "error", title: t("Anket oluşturulamadı"), detail: (e as Error).message }); setBusy(false); }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-3xl font-medium tracking-tight text-ink-950">{t("Anketlerim")}</h1>
        <p className="mt-1.5 text-ink-500">{t("Ölçek ve anketlerinizi hazırlayın, bağlantıyla katılımcılara gönderin; cevaplar tek tıkla istatistik analizine ve grafiklere aktarılır.")}</p>
      </div>
      {draft && (
        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-brand-200 bg-brand-50 p-4 text-sm text-ink-800">
          <Download className="h-5 w-5 shrink-0 text-brand-600" />
          <span className="min-w-0 flex-1">{t("Ücretsiz anket oluşturucuda hazırladığınız “{title}” anketi ({n} soru) bu tarayıcıda duruyor.", { title: draft.title || t("Adsız anket"), n: draft.questions.length })}</span>
          <Button size="sm" onClick={importDraft} loading={busy}>{t("Hesabıma aktar")}</Button>
          <button type="button" className="text-xs text-ink-500 hover:text-ink-800" onClick={() => { try { localStorage.removeItem("academiana:tool-survey"); } catch { /* yok */ } setDraft(null); }}>{t("Vazgeç")}</button>
        </div>
      )}
      <section className="card overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink-100 bg-brand-50/60 px-5 py-4">
          <div>
            <h2 className="flex items-center gap-2 font-semibold text-ink-900"><Sparkles className="h-4 w-4 text-brand-600" /> {t("Yeni anket")}</h2>
            <p className="text-sm text-ink-500">{t("Amacınızı yazın, yapay zekâ uygulanmaya hazır bir taslak çıkarsın; sonra dilediğiniz gibi düzenleyin.")}</p>
          </div>
          <Tabs className="w-full max-w-xs" value={mode} onChange={setMode} tabs={[{ id: "ai", label: t("Yapay zekâ ile") }, { id: "manual", label: t("Boş anket") }]} />
        </div>
        <div className="p-5">
          {mode === "ai" ? <SurveyAiCreate projects={projects} projectId={projectId} setProjectId={setProjectId} /> : (
            <>
              <div className="mt-3 grid gap-4 md:grid-cols-2">
                <label className="block"><span className="label">{t("Anketin adı")}</span><input className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t("ör. Üniversite öğrencilerinde dijital okuryazarlık anketi")} /></label>
                <label className="block">
                  <span className="label">{t("Cevaplar hangi çalışmanızda kullanılacak? (isteğe bağlı)")}</span>
                  <select className="input" value={projectId} onChange={(e) => setProjectId(e.target.value)}>
                    <option value="">{t("Şimdilik hiçbir çalışmaya bağlama")}</option>
                    {projects.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
                  </select>
                  <span className="mt-1 block text-xs text-ink-400">{t("Listede kendi tez ve makale çalışmalarınız görünür. Seçerseniz anket cevaplarını o çalışmaya tek tıkla aktarıp istatistik analizi ve grafik yapabilirsiniz. Daha sonra da değiştirebilirsiniz.")}</span>
                </label>
              </div>
              <Button className="mt-4" onClick={create} loading={busy} disabled={!title.trim()}><Plus className="h-4 w-4" /> {t("Anketi oluştur")}</Button>
            </>
          )}
        </div>
      </section>
      {surveys.length === 0 ? (
        <div className="card flex flex-col items-center p-10 text-center text-ink-500"><ClipboardList className="mb-3 h-8 w-8 text-ink-300" />{t("Henüz anketiniz yok.")}</div>
      ) : (
        <ul className="grid gap-3 md:grid-cols-2">
          {surveys.map((s) => {
            const closed = !!s.closes_at && new Date(s.closes_at) < new Date();
            return (
              <li key={s.id}>
                <Link href={`/anketler/${s.id}`} className="card block p-5 transition hover:-translate-y-0.5 hover:shadow-soft">
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-semibold text-ink-900">{s.title}</p>
                    {s.is_open && !closed ? <Badge tone="green">{t("Yayında")}</Badge> : <Badge>{closed ? t("Süresi doldu") : t("Taslak / kapalı")}</Badge>}
                  </div>
                  <div className="mt-1 flex items-center justify-between gap-2">
                    <p className="text-sm text-ink-500">{t("{n} cevap", { n: s.response_count })}{pname(s.project_id) ? ` · ${pname(s.project_id)}` : ""}</p>
                    <DeleteButton label={t("Anketi sil")} confirmText={t("“{title}” anketi ve tüm cevapları kalıcı olarak silinsin mi? Bu işlem geri alınamaz.", { title: s.title })} onDelete={() => api(`/api/surveys/${s.id}`, { method: "DELETE" })} onDone={() => setSurveys((l) => l.filter((x) => x.id !== s.id))} />
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
