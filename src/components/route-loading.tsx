/**
 * Sayfa geçişlerinde anında görünen yükleme ekranı (D57, D213): üstte ilerleme çubuğu ve açılacak sayfanın
 * bulanık önizlemesi. Önizleme sayfanın gerçek düzenini (başlık, kartlar, menü, editör, panel) taklit eder; içerik
 * yerine yumuşak bloklar vardır ve hafif bulanıklıkla “sayfa geliyor” hissi verir. Sunucu bileşenidir, JS gerektirmez.
 */
type Variant = "page" | "app" | "list" | "account" | "workspace" | "quality" | "news";

const Line = ({ w, h = "h-2.5", c = "bg-ink-200" }: { w: string; h?: string; c?: string }) => <div className={`${h} ${c} rounded-full`} style={{ width: w }} />;
const Para = ({ n = 4 }: { n?: number }) => <div className="space-y-2">{Array.from({ length: n }, (_, i) => <Line key={i} w={i === n - 1 ? "62%" : `${92 - (i % 3) * 6}%`} c="bg-ink-200/80" />)}</div>;
const Card = ({ children, className = "" }: { children?: React.ReactNode; className?: string }) => <div className={`rounded-3xl border border-ink-100 bg-white p-5 ${className}`}>{children}</div>;

function Blur({ children }: { children: React.ReactNode }) {
  return (
    <div className="pointer-events-none relative select-none" aria-hidden>
      <div className="[filter:blur(2.5px)_saturate(.9)]">{children}</div>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[rgb(var(--bg)/0.15)] to-[rgb(var(--bg)/0.55)]" />
    </div>
  );
}

function AppPreview() {
  return (
    <Blur>
      <Line w="140px" h="h-3" c="bg-ink-200" />
      <div className="mt-3"><Line w="320px" h="h-7" c="bg-ink-300" /></div>
      <div className="mt-2"><Line w="220px" h="h-3" /></div>
      <Card className="mt-8 border-brand-100 bg-brand-50/50"><Line w="40%" h="h-3" c="bg-brand-200" /><div className="mt-2"><Line w="70%" c="bg-brand-100" /></div></Card>
      <Card className="mt-6"><Line w="30%" h="h-3.5" c="bg-ink-300" /><div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{Array.from({ length: 8 }, (_, i) => <div key={i} className="flex gap-3 rounded-2xl border border-ink-100 p-4"><div className="h-9 w-9 shrink-0 rounded-xl bg-brand-100" /><div className="flex-1 space-y-2"><Line w="80%" c="bg-ink-300" /><Line w="95%" h="h-2" /><Line w="60%" h="h-2" /></div></div>)}</div></Card>
      <div className="mt-6 grid gap-4 sm:grid-cols-4">{Array.from({ length: 4 }, (_, i) => <Card key={i}><Line w="30%" h="h-6" c="bg-ink-300" /><div className="mt-2"><Line w="60%" h="h-2" /></div></Card>)}</div>
    </Blur>
  );
}

function ListPreview() {
  return (
    <Blur>
      <Line w="260px" h="h-7" c="bg-ink-300" />
      <div className="mt-2"><Line w="380px" h="h-3" /></div>
      <div className="mt-6 flex gap-2"><div className="h-11 flex-1 rounded-2xl border border-ink-200 bg-white" /><div className="h-11 w-28 rounded-2xl bg-brand-600/80" /></div>
      <div className="mt-6 space-y-3">{Array.from({ length: 5 }, (_, i) => <Card key={i}><Line w={`${70 - i * 6}%`} h="h-3.5" c="bg-ink-300" /><div className="mt-2"><Line w="45%" h="h-2.5" /></div><div className="mt-3 flex gap-2"><div className="h-6 w-20 rounded-full bg-emerald-50" /><div className="h-6 w-24 rounded-full bg-ink-100" /></div></Card>)}</div>
    </Blur>
  );
}

function AccountPreview() {
  return (
    <Blur>
      <Line w="240px" h="h-7" c="bg-ink-300" />
      <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">{Array.from({ length: 3 }, (_, i) => <Card key={i}><Line w="35%" h="h-3.5" c="bg-ink-300" /><div className="mt-4 space-y-3"><div className="h-10 rounded-xl border border-ink-200" /><div className="h-10 rounded-xl border border-ink-200" /></div></Card>)}</div>
        <Card className="border-brand-100"><Line w="50%" h="h-4" c="bg-brand-200" /><div className="mt-3"><Line w="40%" h="h-7" c="bg-ink-300" /></div><div className="mt-4"><Para n={4} /></div><div className="mt-5 h-10 rounded-xl bg-brand-600/80" /></Card>
      </div>
    </Blur>
  );
}

function NewsPreview() {
  return (
    <Blur>
      <div className="mx-auto max-w-3xl">
        <Line w="200px" h="h-8" c="bg-ink-300" />
        <div className="mt-3"><Line w="340px" h="h-3" /></div>
        <div className="mt-10 space-y-4 border-l border-ink-100 pl-6">{Array.from({ length: 4 }, (_, i) => <Card key={i}><div className="flex gap-2"><div className="h-5 w-12 rounded-full bg-brand-600/70" /><Line w="45%" h="h-3.5" c="bg-ink-300" /></div><div className="mt-3"><Para n={2} /></div></Card>)}</div>
      </div>
    </Blur>
  );
}

function QualityPreview() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <Blur>
        <Line w="160px" h="h-3" />
        <div className="mt-4"><Line w="380px" h="h-9" c="bg-ink-300" /></div>
        <div className="mt-2"><Line w="520px" h="h-3" /></div>
        <div className="mt-8 grid gap-4 md:grid-cols-[260px_1fr]">
          <Card className="flex items-center justify-center"><div className="h-36 w-36 rounded-full border-[14px] border-emerald-200" /></Card>
          <Card><div className="space-y-4">{Array.from({ length: 5 }, (_, i) => <div key={i} className="space-y-1.5"><Line w="30%" h="h-2.5" c="bg-ink-300" /><div className="h-2 rounded-full bg-ink-100"><div className="h-2 rounded-full bg-emerald-300" style={{ width: `${88 - i * 7}%` }} /></div></div>)}</div></Card>
        </div>
        <div className="mt-6 space-y-3">{Array.from({ length: 3 }, (_, i) => <Card key={i}><Line w="40%" h="h-3.5" c="bg-ink-300" /><div className="mt-3"><Para n={2} /></div></Card>)}</div>
      </Blur>
    </div>
  );
}

function WorkspacePreview() {
  return (
    <div className="flex h-[100dvh] flex-col bg-white">
      <Blur>
        <div className="flex h-14 items-center gap-3 border-b border-ink-200/70 px-4">
          <div className="h-5 w-5 rounded bg-ink-200" /><Line w="300px" h="h-3.5" c="bg-ink-300" />
          <div className="ml-auto flex gap-2">{[70, 90, 70, 80, 60].map((w, i) => <div key={i} className="h-8 rounded-lg bg-ink-100" style={{ width: w }} />)}<div className="h-8 w-24 rounded-lg bg-brand-600/80" /></div>
        </div>
      </Blur>
      <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[264px_minmax(0,1fr)_420px]">
        <div className="hidden border-r border-ink-200/70 p-4 lg:block">
          <Blur>
            <Line w="50%" h="h-3.5" c="bg-ink-300" /><div className="mt-2"><Line w="70%" h="h-2.5" /></div>
            <div className="mt-3 h-1 rounded-full bg-brand-200" />
            <div className="mt-5 space-y-3">{Array.from({ length: 9 }, (_, i) => <div key={i} className="flex items-center gap-2.5"><div className={`h-5 w-5 rounded-full ${i < 3 ? "bg-emerald-100" : i === 3 ? "bg-brand-600/80" : "bg-ink-100"}`} /><div className="flex-1 space-y-1"><Line w={`${80 - (i % 4) * 10}%`} h="h-2.5" c="bg-ink-300" /><Line w="40%" h="h-2" /></div></div>)}</div>
          </Blur>
        </div>
        <div className="min-w-0 overflow-hidden px-6 py-8 sm:px-10">
          <Blur>
            <div className="mx-auto max-w-[720px]">
              <Line w="120px" h="h-3" />
              <div className="mt-4"><Line w="60%" h="h-8" c="bg-ink-300" /></div>
              <div className="mt-3"><Para n={2} /></div>
              <div className="mt-6 flex gap-3 border-b border-ink-100 pb-3">{Array.from({ length: 9 }, (_, i) => <div key={i} className="h-5 w-5 rounded bg-ink-100" />)}</div>
              <div className="mt-6 space-y-6"><Para n={5} /><Para n={4} /><Para n={5} /></div>
            </div>
          </Blur>
        </div>
        <div className="hidden border-l border-ink-200/70 p-4 lg:block">
          <Blur>
            <div className="flex gap-2">{Array.from({ length: 5 }, (_, i) => <div key={i} className={`h-8 flex-1 rounded-lg ${i === 0 ? "bg-ink-100" : "bg-ink-50"}`} />)}</div>
            <Card className="mt-4"><Line w="45%" h="h-3" c="bg-ink-300" /><div className="mt-3"><Para n={4} /></div></Card>
            <Card className="mt-3 border-brand-100 bg-brand-50/50"><Para n={3} /></Card>
            <div className="mt-24 h-20 rounded-2xl border border-ink-200" />
          </Blur>
        </div>
      </div>
    </div>
  );
}

function PagePreview() {
  return (
    <div className="mx-auto max-w-6xl px-6 pb-24 pt-36">
      <Blur>
        <div className="mx-auto flex max-w-3xl flex-col items-center">
          <Line w="140px" h="h-3" c="bg-brand-200" />
          <div className="mt-5 w-full space-y-3"><Line w="100%" h="h-10" c="bg-ink-300" /><div className="mx-auto w-2/3"><Line w="100%" h="h-10" c="bg-ink-300" /></div></div>
          <div className="mt-6 w-4/5 space-y-2"><Line w="100%" h="h-3" /><div className="mx-auto w-3/4"><Line w="100%" h="h-3" /></div></div>
          <div className="mt-8 flex gap-3"><div className="h-12 w-40 rounded-xl bg-brand-600/80" /><div className="h-12 w-40 rounded-xl border border-ink-200 bg-white" /></div>
        </div>
        <div className="mt-16 grid gap-5 md:grid-cols-3">{Array.from({ length: 3 }, (_, i) => <Card key={i} className="h-48"><div className="h-9 w-9 rounded-xl bg-brand-100" /><div className="mt-4"><Line w="60%" h="h-3.5" c="bg-ink-300" /></div><div className="mt-3"><Para n={3} /></div></Card>)}</div>
      </Blur>
    </div>
  );
}

export function RouteLoading({ variant = "page" }: { variant?: Variant }) {
  return (
    <div aria-busy="true" aria-live="polite">
      <div className="fixed inset-x-0 top-0 z-[60] h-0.5 overflow-hidden bg-brand-100">
        <div className="h-full w-1/3 animate-progress bg-gradient-to-r from-brand-500 to-sky-400" />
      </div>
      {variant === "page" && <PagePreview />}
      {variant === "app" && <AppPreview />}
      {variant === "list" && <ListPreview />}
      {variant === "account" && <AccountPreview />}
      {variant === "news" && <NewsPreview />}
      {variant === "quality" && <QualityPreview />}
      {variant === "workspace" && <WorkspacePreview />}
    </div>
  );
}
