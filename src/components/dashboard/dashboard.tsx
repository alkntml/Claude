"use client";
import { useT } from "@/i18n/client";
import { makeT, type TFn } from "@/i18n";
import { motion } from "framer-motion";
import { ArrowRight, BookMarked, Bot, CheckCircle2, Clock3, FileText, FolderOpen, Megaphone, Plus, Sparkles } from "lucide-react";
import Link from "next/link";
import { WORK_ICONS } from "@/components/icons";
import { Badge, Empty, ProgressBar, ProgressRing } from "@/components/ui/primitives";
import { STYLES } from "@/lib/citations/styles";
import type { CitationStyleId } from "@/lib/citations/types";
import { LEVEL_LABELS, WORK_TYPES, type AcademicLevel } from "@/lib/workflows";

/* eslint-disable @typescript-eslint/no-explicit-any */
interface Props {
  name: string; plan: string; projects: any[]; recentStages: any[]; sourcesCount: number; conversations: any[]; files: any[]; announcements: any[];
  usage: { ai_requests: number; tokens: number; source_searches: number; projects: number; storage_mb: number } | null; limits: any;
}

export function timeAgo(iso: string, t: TFn = makeT("tr"), dl = "tr-TR") {
  const d = (Date.now() - new Date(iso).getTime()) / 1000;
  if (d < 60) return t("az önce");
  if (d < 3600) return t("{n} dk önce", { n: Math.floor(d / 60) });
  if (d < 86400) return t("{n} sa önce", { n: Math.floor(d / 3600) });
  if (d < 86400 * 7) return t("{n} gün önce", { n: Math.floor(d / 86400) });
  return new Date(iso).toLocaleDateString(dl, { day: "numeric", month: "short" });
}

const item = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const } } };

export function Dashboard(p: Props) {
  const { t, dl } = useT();
  const ago = (iso: string) => timeAgo(iso, t, dl);
  const active = p.projects.filter((x) => x.status === "active");
  const done = p.projects.filter((x) => x.status === "completed");
  const titles = Object.fromEntries(p.projects.map((x) => [x.id, x.title]));
  const hour = new Date().getHours();
  const greet = t(hour < 6 ? "İyi geceler" : hour < 12 ? "Günaydın" : hour < 18 ? "İyi günler" : "İyi akşamlar");

  return (
    <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.05 } } }} className="space-y-8">
      <motion.div variants={item} className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-ink-400">{new Date().toLocaleDateString(dl, { weekday: "long", day: "numeric", month: "long" })}</p>
          <h1 className="mt-1 font-serif text-[34px] font-medium tracking-tight text-ink-950">{greet}{p.name ? `, ${p.name}` : ""}.</h1>
          <p className="mt-1 text-ink-500">{active.length ? t("{n} devam eden çalışmanız var.", { n: active.length }) : t("İlk akademik çalışmanızı başlatın.")}</p>
        </div>
        <Link href="/yeni" className="inline-flex items-center gap-2 rounded-2xl bg-ink-900 px-5 py-3 text-sm font-medium text-white shadow-lg shadow-ink-900/20 transition hover:-translate-y-0.5"><Plus className="h-4 w-4" /> {t("Yeni çalışma")}</Link>
      </motion.div>

      {p.announcements.map((a) => (
        <motion.div variants={item} key={a.id} className={`flex items-start gap-3 rounded-2xl border px-4 py-3 ${a.level === "warning" || a.level === "critical" ? "border-amber-200 bg-amber-50" : "border-brand-100 bg-brand-50/70"}`}>
          <Megaphone className="mt-0.5 h-4 w-4 text-brand-600" />
          <div><p className="text-sm font-medium text-ink-900">{a.title}</p>{a.body && <p className="text-sm text-ink-600">{a.body}</p>}</div>
        </motion.div>
      ))}

      <motion.div variants={item} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Devam eden", value: active.length, icon: Clock3, tone: "from-brand-500 to-indigo-500" },
          { label: "Tamamlanan", value: done.length, icon: CheckCircle2, tone: "from-emerald-500 to-teal-500" },
          { label: "Kayıtlı kaynak", value: p.sourcesCount, icon: BookMarked, tone: "from-amber-500 to-orange-500" },
          { label: "Bu ay AI isteği", value: p.usage?.ai_requests ?? 0, icon: Sparkles, tone: "from-fuchsia-500 to-violet-500" },
        ].map((s) => (
          <div key={s.label} className="card group relative overflow-hidden p-5 transition hover:-translate-y-0.5">
            <div className={`absolute -right-6 -top-6 h-20 w-20 rounded-full bg-gradient-to-br ${s.tone} opacity-10 blur-xl transition group-hover:opacity-25`} />
            <s.icon className="h-5 w-5 text-ink-400" />
            <p className="mt-3 text-3xl font-semibold tracking-tight text-ink-900">{s.value}</p>
            <p className="text-sm text-ink-500">{t(s.label)}</p>
          </div>
        ))}
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <motion.section variants={item} className="min-w-0">
          <div className="mb-3 flex items-center justify-between"><h2 className="font-semibold text-ink-900">{t("Devam eden çalışmalarım")}</h2></div>
          {active.length === 0 ? (
            <Empty icon={<FileText className="h-5 w-5" />} title={t("Henüz çalışma yok")} action={<Link href="/yeni" className="text-sm font-medium text-brand-600">{t("Yeni çalışma oluştur →")}</Link>}>{t("Tez, makale veya araştırma önerinizi başlatın; sistem sizin için bir yol haritası hazırlasın.")}</Empty>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {active.map((pr) => {
                const wt = WORK_TYPES.find((w) => w.id === pr.work_type);
                const Icon = WORK_ICONS[wt?.icon ?? "FileText"] ?? FileText;
                return (
                  <Link key={pr.id} href={`/proje/${pr.id}`} className="card group flex flex-col p-5 transition duration-300 hover:-translate-y-1 hover:border-brand-200 hover:shadow-glow">
                    <div className="flex items-start justify-between">
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600"><Icon className="h-5 w-5" /></span>
                      <div className="relative flex items-center justify-center">
                        <ProgressRing value={pr.progress} />
                        <span className="absolute text-[11px] font-semibold text-ink-700">{pr.progress}%</span>
                      </div>
                    </div>
                    <h3 className="mt-3 line-clamp-2 font-semibold text-ink-900 group-hover:text-brand-700">{pr.title}</h3>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      <Badge>{t(wt?.title ?? "")}</Badge>
                      <Badge tone="brand">{t(LEVEL_LABELS[pr.academic_level as AcademicLevel])}</Badge>
                      <Badge tone="violet">{STYLES[pr.citation_style as CitationStyleId]?.label}</Badge>
                    </div>
                    <p className="mt-auto pt-4 text-xs text-ink-400">{t("Son düzenleme {x}", { x: ago(pr.updated_at) })}</p>
                  </Link>
                );
              })}
            </div>
          )}
          {done.length > 0 && (
            <div className="mt-6">
              <h3 className="mb-2 text-sm font-semibold text-ink-700">{t("Tamamlanan çalışmalarım")}</h3>
              <div className="card divide-y divide-ink-100">
                {done.map((pr) => (
                  <Link key={pr.id} href={`/proje/${pr.id}`} className="flex items-center gap-3 px-4 py-3 text-sm transition hover:bg-ink-50">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" /><span className="flex-1 truncate text-ink-800">{pr.title}</span><ArrowRight className="h-4 w-4 text-ink-300" />
                  </Link>
                ))}
              </div>
            </div>
          )}
        </motion.section>

        <motion.aside variants={item} className="min-w-0 space-y-6">
          <div className="card p-5">
            <div className="flex items-center justify-between"><h2 className="font-semibold text-ink-900">{t("Kullanım durumu")}</h2><Link href="/hesap" className="text-xs font-medium text-brand-600">{t("Paketi yönet")}</Link></div>
            <div className="mt-4 space-y-4">
              {[["Yapay zekâ istekleri", p.usage?.ai_requests ?? 0, p.limits?.ai_requests_month], ["Kaynak taramaları", p.usage?.source_searches ?? 0, p.limits?.source_searches_month], ["Projeler", p.usage?.projects ?? 0, p.limits?.projects], ["Depolama (MB)", p.usage?.storage_mb ?? 0, p.limits?.storage_mb]].map(([l, v, m]) => (
                <div key={l as string}>
                  <div className="mb-1.5 flex justify-between text-[13px]"><span className="text-ink-600">{t(l as string)}</span><span className="font-medium text-ink-800">{v as number}{m != null ? ` / ${m}` : " / ∞"}</span></div>
                  <ProgressBar value={v as number} max={m as number | null} />
                </div>
              ))}
            </div>
          </div>

          <div className="card p-5">
            <h2 className="font-semibold text-ink-900">{t("Son düzenlenen belgeler")}</h2>
            <div className="mt-3 space-y-1">
              {p.recentStages.length === 0 && <p className="text-sm text-ink-400">{t("Henüz düzenlenmiş bölüm yok.")}</p>}
              {p.recentStages.map((st) => (
                <Link key={st.id} href={`/proje/${st.project_id}?bolum=${st.id}`} className="flex items-center gap-3 rounded-xl px-2 py-2 transition hover:bg-ink-50">
                  <FileText className="h-4 w-4 shrink-0 text-ink-400" />
                  <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium text-ink-800">{st.title}</p><p className="truncate text-xs text-ink-400">{titles[st.project_id]} · {t("{n} kelime", { n: st.word_count })}</p></div>
                  <span className="text-[11px] text-ink-400">{ago(st.updated_at)}</span>
                </Link>
              ))}
            </div>
          </div>

          <div className="card p-5">
            <h2 className="font-semibold text-ink-900">{t("Son kullanılan asistanlar")}</h2>
            <div className="mt-3 space-y-1">
              {p.conversations.length === 0 && <p className="text-sm text-ink-400">{t("Henüz asistan sohbeti yok.")}</p>}
              {p.conversations.map((c) => (
                <Link key={c.id} href={`/proje/${c.project_id}${c.stage_id ? `?bolum=${c.stage_id}` : ""}`} className="flex items-center gap-3 rounded-xl px-2 py-2 transition hover:bg-ink-50">
                  <Bot className="h-4 w-4 shrink-0 text-brand-500" /><span className="flex-1 truncate text-sm text-ink-700">{c.title}</span><span className="text-[11px] text-ink-400">{ago(c.updated_at)}</span>
                </Link>
              ))}
            </div>
          </div>

          <div className="card p-5">
            <div className="flex items-center justify-between"><h2 className="font-semibold text-ink-900">{t("Dosyalarım")}</h2><Link href="/dosyalar" className="text-xs font-medium text-brand-600">{t("Tümü")}</Link></div>
            <div className="mt-3 space-y-1">
              {p.files.length === 0 && <p className="text-sm text-ink-400">{t("Yüklenmiş dosya yok.")}</p>}
              {p.files.map((f) => (
                <div key={f.id} className="flex items-center gap-3 rounded-xl px-2 py-2"><FolderOpen className="h-4 w-4 text-ink-400" /><span className="flex-1 truncate text-sm text-ink-700">{f.name}</span><span className="text-[11px] text-ink-400">{Math.round(f.size_bytes / 1024)} KB</span></div>
              ))}
            </div>
          </div>
        </motion.aside>
      </div>
    </motion.div>
  );
}
/* eslint-enable @typescript-eslint/no-explicit-any */
