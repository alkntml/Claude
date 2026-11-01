/**
 * Akademi AI — tarayıcı demosu giriş noktası.
 * Uygulamanın gerçek bileşenlerini kullanır; sunucu çağrıları mock-api.ts tarafından tarayıcıda yanıtlanır.
 */
import "./styles.css";
import { RotateCcw, X } from "lucide-react";
import { useEffect, useState, useSyncExternalStore } from "react";
import { createRoot } from "react-dom/client";
import { AdminPanel } from "@/components/admin/admin-panel";
import { AppShell } from "@/components/app-shell";
import { AccountView } from "@/components/dashboard/account";
import { Dashboard } from "@/components/dashboard/dashboard";
import { FilesView } from "@/components/dashboard/files";
import { LibraryView } from "@/components/dashboard/library";
import { NewProjectWizard } from "@/components/dashboard/new-project";
import { Hero } from "@/components/landing/hero";
import { HowItWorks, Pillars, PricingCards, Principles, SourcesStrip } from "@/components/landing/sections";
import { WorkTypePicker } from "@/components/landing/work-type-picker";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { FadeIn } from "@/components/ui/primitives";
import { ToastProvider } from "@/components/ui/toast";
import { QualityView } from "@/components/workspace/quality";
import { Workspace } from "@/components/workspace/workspace";
import { DEMO_PLANS, getDB, getVersion, installMockApi, resetDemo, subscribe } from "./mock-api";
import { getCurrentProject, navigate, setCurrentProject, useRoute } from "./shims/router";

installMockApi();
if (!getCurrentProject()) setCurrentProject(getDB().projects[0]?.id ?? "");

function useDB() {
  useSyncExternalStore(subscribe, getVersion, getVersion);
  return getDB();
}

const USER = { name: "Demo Kullanıcı", email: "demo@akademi.ai", plan: "pro", isAdmin: true };

function DemoBanner() {
  const [open, setOpen] = useState(true);
  const [note, setNote] = useState<string | null>(null);
  useEffect(() => {
    // Sunucu adresine giden düz bağlantılar (ör. veri indirme) demoda çalışmaz; sayfadan ayrılmayı engelle
    const fn = (e: MouseEvent) => {
      const a = (e.target as HTMLElement | null)?.closest?.("a");
      const href = a?.getAttribute("href") ?? "";
      if (href.startsWith("/api/") || href.startsWith("#/api/")) {
        e.preventDefault();
        setNote("Bu işlem bir dosya indirir. Demo sürümünde dosya indirme kapalıdır; tam sürümde çalışır.");
        setOpen(true);
      }
    };
    document.addEventListener("click", fn, true);
    return () => document.removeEventListener("click", fn, true);
  }, []);
  if (!open) return null;
  return (
    <div className="fixed bottom-3 left-3 z-[70] max-w-[min(92vw,420px)] rounded-2xl bg-ink-950/95 p-3.5 pr-9 text-[12.5px] leading-relaxed text-white/85 shadow-2xl backdrop-blur" style={{ marginBottom: "env(safe-area-inset-bottom, 0px)", marginLeft: "env(safe-area-inset-left, 0px)" }}>
      {note && <p className="mb-2 rounded-lg bg-amber-400/15 px-2 py-1.5 text-amber-200">{note}</p>}
      <p><b className="text-white">Tarayıcı demosu.</b> Veriler yalnızca bu tarayıcıda saklanır. Yapay zekâ, canlı kaynak araması, doğrulama ve dışa aktarma tam sürümde çalışır.</p>
      <button onClick={() => { resetDemo(); navigate("/panel"); }} className="mt-2 inline-flex items-center gap-1 rounded-lg bg-white/10 px-2 py-1 text-white transition hover:bg-white/20"><RotateCcw className="h-3 w-3" /> Demoyu sıfırla</button>
      <button onClick={() => setOpen(false)} className="absolute right-2.5 top-2.5 rounded-md p-0.5 text-white/60 hover:text-white" aria-label="Bilgi kutusunu kapat"><X className="h-4 w-4" /></button>
    </div>
  );
}

function Landing() {
  return (
    <>
      <SiteHeader signedIn />
      <main>
        <Hero signedIn />
        <section id="tur-sec" className="relative scroll-mt-24 py-16">
          <div className="mx-auto max-w-6xl px-6">
            <FadeIn className="mx-auto mb-12 max-w-2xl text-center">
              <h2 className="font-serif text-4xl font-medium tracking-tight text-ink-950 sm:text-[44px]">Bugün hangi akademik çalışmayı hazırlamak istiyorsunuz?</h2>
              <p className="mt-4 text-ink-500">Her çalışma türünün kendine özgü bir akışı vardır. Seçiminize göre aşamalar, kurallar ve asistanlar hazırlanır.</p>
            </FadeIn>
            <WorkTypePicker signedIn />
          </div>
        </section>
        <Pillars />
        <HowItWorks />
        <SourcesStrip />
        <Principles />
        <section id="fiyatlar" className="py-20">
          <div className="mx-auto max-w-6xl px-6">
            <FadeIn className="mb-12 text-center"><h2 className="font-serif text-4xl font-medium tracking-tight text-ink-950">Size uygun paket</h2></FadeIn>
            <PricingCards plans={DEMO_PLANS} signedIn />
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

function App() {
  const route = useRoute();
  const db = useDB();
  const path = route.path;

  useEffect(() => { document.title = "Akademi AI Demo"; }, []);

  if (path === "/" || path === "/fiyatlar" || path === "/yardim" || path.startsWith("/gizlilik") || path.startsWith("/kosullar") || path.startsWith("/akademik")) return <Landing />;

  const proj = path.match(/^\/proje\/([^/]+)(\/kalite)?$/);
  if (proj) {
    const project = db.projects.find((p) => p.id === proj[1]);
    if (!project) { navigate("/panel", true); return null; }
    const stages = db.stages.filter((s) => s.project_id === project.id).sort((a, b) => a.position - b.position);
    if (proj[2]) return <div className="min-h-screen bg-[rgb(var(--bg))]"><QualityView project={project} initial={db.reports.find((r) => r.project_id === project.id) ?? null} stages={stages} /></div>;
    return (
      <Workspace key={project.id} project={project} stages={stages} sources={db.sources.filter((s) => s.project_id === project.id)} memory={db.memory.filter((m) => m.project_id === project.id)} files={[]} initialStageId={route.query.get("bolum")} />
    );
  }

  let page: React.ReactNode = null;
  if (path === "/panel") {
    const recentStages = db.stages.filter((s) => s.word_count > 0).sort((a, b) => b.updated_at.localeCompare(a.updated_at)).slice(0, 6);
    page = <Dashboard name="Demo" plan="pro" projects={db.projects} recentStages={recentStages} sourcesCount={db.sources.length} conversations={[]} files={[]} announcements={[{ id: "d", title: "Demo sürümüne hoş geldiniz", body: "Örnek tez projesini açıp bölümler arasında gezinin, atıf stilini değiştirin ve kalite kontrolünü çalıştırın.", level: "info" }]} usage={{ ai_requests: 0, tokens: 0, source_searches: 0, projects: db.projects.length, storage_mb: 0 }} limits={{ ai_requests_month: 1500, source_searches_month: 2000, projects: 20, storage_mb: 3000 }} />;
  } else if (path === "/yeni") page = <NewProjectWizard key={route.query.toString()} defaultStyle="apa7" />;
  else if (path === "/kaynaklar") page = <LibraryView projects={db.projects} sources={db.sources} />;
  else if (path === "/dosyalar") page = <FilesView files={[]} projects={db.projects} />;
  else if (path === "/hesap") page = <AccountView profile={{ full_name: "Demo Kullanıcı", email: "demo@akademi.ai", institution: "Örnek Üniversitesi", plan_id: "pro", default_citation_style: "apa7" }} usage={{ ai_requests: 0, tokens: 0, source_searches: 0, projects: db.projects.length, storage_mb: 0 }} limits={{ ai_requests_month: 1500, tokens_month: 4000000, source_searches_month: 2000, projects: 20, storage_mb: 3000, export_formats: ["txt", "md", "docx", "pdf"] }} plans={DEMO_PLANS} subscriptions={[]} payments={[{ id: "stripe", label: "Stripe", configured: false, implemented: true, usable: false }]} />;
  else if (path === "/yonetim") page = <><p className="mb-4 rounded-xl bg-amber-50 px-4 py-2.5 text-sm text-amber-800">Demo: Genel bakıştaki sayılar örnek verilerdir; gerçek kullanım değildir. Değişiklikler kaydedilmez.</p><AdminPanel selfId="demo" /></>;
  else { navigate("/panel", true); return null; }

  return <AppShell user={USER}>{page}</AppShell>;
}

createRoot(document.getElementById("root")!).render(
  <ToastProvider>
    <DemoBanner />
    <App />
  </ToastProvider>,
);
