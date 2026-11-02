"use client";
import { ClipboardList, Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/toast";
import { useT } from "@/i18n/client";
import { api } from "@/lib/client";

interface Row { id: string; title: string; project_id: string | null; is_open: boolean; response_count: number; closes_at: string | null; updated_at: string }

export function SurveyList({ surveys, projects, defaultProject }: { surveys: Row[]; projects: { id: string; title: string }[]; defaultProject: string | null }) {
  const { t } = useT();
  const toast = useToast();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [projectId, setProjectId] = useState<string>(defaultProject && projects.some((p) => p.id === defaultProject) ? defaultProject : "");
  const [busy, setBusy] = useState(false);
  const pname = (id: string | null) => projects.find((p) => p.id === id)?.title;

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
      <section className="card p-5">
        <h2 className="font-semibold">{t("Yeni anket")}</h2>
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
                  <p className="mt-1 text-sm text-ink-500">{t("{n} cevap", { n: s.response_count })}{pname(s.project_id) ? ` · ${pname(s.project_id)}` : ""}</p>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
