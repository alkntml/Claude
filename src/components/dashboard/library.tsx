"use client";
import { useT } from "@/i18n/client";
import { BookMarked } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Empty, Tabs } from "@/components/ui/primitives";
import { SourceCard, SourceSearch } from "@/components/workspace/sources";
import { DeleteButton } from "@/components/ui/delete-button";
import { api } from "@/lib/client";

/* eslint-disable @typescript-eslint/no-explicit-any */
export function LibraryView({ projects, sources: initial }: { projects: any[]; sources: any[] }) {
  const [tab, setTab] = useState<"search" | "saved">("search");
  const [projectId, setProjectId] = useState(projects[0]?.id ?? "");
  const [sources, setSources] = useState(initial);
  const { t } = useT();
  const titles = Object.fromEntries(projects.map((p) => [p.id, p.title]));
  const existing = useMemo(() => new Set(sources.filter((s) => s.project_id === projectId).map((s) => s.doi).filter(Boolean)), [sources, projectId]);
  return (
    <div>
      <h1 className="font-serif text-4xl font-medium tracking-tight text-ink-950">{t("Kaynak araştırması")}</h1>
      <p className="mt-1 max-w-2xl text-ink-500">{t("OpenAlex, Crossref, PubMed/Europe PMC, arXiv, DOAJ, OpenAIRE, ERIC, DBLP ve DataCite’ta eşzamanlı arama. Sonuçlar birleştirilir, yinelenen kayıtlar ayıklanır ve her kaynağın erişim seviyesi gösterilir.")}</p>
      <Tabs className="mt-6 max-w-sm" value={tab} onChange={setTab} tabs={[{ id: "search", label: t("Veri tabanında ara") }, { id: "saved", label: t("Kayıtlı kaynaklarım"), count: sources.length }]} />
      <div className="mt-6">
        {tab === "search" && (
          <div className="grid gap-6 lg:grid-cols-[1fr_260px]">
            <div className="card p-5">
              {projects.length === 0 ? <Empty icon={<BookMarked className="h-5 w-5" />} title={t("Önce bir çalışma oluşturun")} action={<Link href="/yeni" className="text-sm font-medium text-brand-600">{t("Yeni çalışma →")}</Link>}>{t("Kaynaklar bir projeye bağlanarak saklanır.")}</Empty> : <SourceSearch projectId={projectId} existingDois={existing} onAdded={(rows) => setSources((l) => [...rows, ...l])} />}
            </div>
            {projects.length > 0 && (
              <div className="card h-fit p-5">
                <label className="label">{t("Eklenecek proje")}</label>
                <select className="input" value={projectId} onChange={(e) => setProjectId(e.target.value)}>{projects.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}</select>
                <p className="mt-3 text-xs text-ink-500">{t("Eklenen kaynaklar DOI/PMID/arXiv üzerinden otomatik doğrulanır ve eksik künye alanları kayıt otoritesinden tamamlanır.")}</p>
              </div>
            )}
          </div>
        )}
        {tab === "saved" && (
          <div className="grid gap-3 md:grid-cols-2">
            {sources.length === 0 && <div className="md:col-span-2"><Empty icon={<BookMarked className="h-5 w-5" />} title={t("Kayıtlı kaynak yok")} /></div>}
            {sources.map((s) => (
              <SourceCard key={s.id} s={s} actions={<>
                {s.project_id && <Link href={`/proje/${s.project_id}`} className="text-[12px] font-medium text-brand-600">{titles[s.project_id] ?? t("Proje")} →</Link>}
                <DeleteButton className="ml-auto" withText label={t("Kaynağı sil")} confirmText={t("“{title}” kaynağı kalıcı olarak silinsin mi? Metinde bu kaynağa verilen atıflar kaynaksız kalır.", { title: s.title.slice(0, 80) })} onDelete={() => api(`/api/sources/${s.id}`, { method: "DELETE" })} onDone={() => setSources((l) => l.filter((x) => x.id !== s.id))} />
              </>} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
/* eslint-enable @typescript-eslint/no-explicit-any */
