/** Sayfa geçişlerinde anında görünen hafif yükleme göstergesi (D57): üstte ilerleme çubuğu + iskelet */
export function RouteLoading({ variant = "page" }: { variant?: "page" | "app" | "workspace" }) {
  return (
    <div aria-busy="true" aria-live="polite">
      <div className="fixed inset-x-0 top-0 z-[60] h-0.5 overflow-hidden bg-brand-100">
        <div className="h-full w-1/3 animate-progress bg-gradient-to-r from-brand-500 to-brand-400" />
      </div>
      {variant === "page" && (
        <div className="mx-auto max-w-6xl px-6 pb-24 pt-36">
          <div className="skeleton mx-auto h-12 w-2/3 rounded-2xl" />
          <div className="skeleton mx-auto mt-5 h-5 w-1/2 rounded-xl" />
          <div className="mt-14 grid gap-5 md:grid-cols-3">{[0, 1, 2].map((i) => <div key={i} className="skeleton h-48 rounded-3xl" />)}</div>
        </div>
      )}
      {variant === "app" && (
        <div className="space-y-6">
          <div className="skeleton h-10 w-1/3 rounded-2xl" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{[0, 1, 2, 3].map((i) => <div key={i} className="skeleton h-28 rounded-3xl" />)}</div>
          <div className="skeleton h-64 rounded-3xl" />
        </div>
      )}
      {variant === "workspace" && (
        <div className="flex min-h-screen">
          <div className="hidden w-72 border-r border-ink-100 p-4 lg:block">{[0, 1, 2, 3, 4, 5].map((i) => <div key={i} className="skeleton mb-3 h-9 rounded-xl" />)}</div>
          <div className="flex-1 p-8"><div className="skeleton mx-auto h-10 max-w-3xl rounded-2xl" /><div className="skeleton mx-auto mt-6 h-[60vh] max-w-3xl rounded-3xl" /></div>
        </div>
      )}
    </div>
  );
}
