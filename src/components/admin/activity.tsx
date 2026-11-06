"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/client";
import { cn } from "@/components/ui/cn";

/* eslint-disable @typescript-eslint/no-explicit-any */
const KIND: Record<string, { label: string; tone: string }> = {
  ai_output: { label: "Yapay zekâ çıktısı", tone: "bg-brand-50 text-brand-700" },
  project_deleted: { label: "Çalışma silindi", tone: "bg-rose-50 text-rose-700" },
  stage_deleted: { label: "Bölüm silindi", tone: "bg-rose-50 text-rose-700" },
  text_removed: { label: "Metin silindi", tone: "bg-amber-50 text-amber-800" },
  abuse_alert: { label: "Kötüye kullanım uyarısı", tone: "bg-rose-100 text-rose-800" },
};
const n = (v: number) => Number(v || 0).toLocaleString("tr-TR");
const when = (iso: string) => new Date(iso).toLocaleString("tr-TR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });

/**
 * Kullanım geçmişi (D102): kullanıcının aldığı tüm yapay zekâ çıktıları ve sildikleri. Kullanıcı çalışmasını silse de
 * kayıt kalır; “ben paketimi kullanmadım” itirazlarında kanıt olarak kullanılır. Tam metin tıklayınca açılır.
 */
export function UserActivity({ userId }: { userId: string }) {
  const [d, setD] = useState<any | null>(null);
  const [open, setOpen] = useState<number | null>(null);
  const [text, setText] = useState<Record<number, string>>({});
  useEffect(() => { api<any>(`/api/admin/user/${userId}/activity`).then(setD).catch(() => setD({ error: true })); }, [userId]);

  async function show(id: number) {
    if (open === id) { setOpen(null); return; }
    setOpen(id);
    if (!text[id]) {
      try { const r = await api<any>(`/api/admin/user/${userId}/activity?log=${id}`); setText((x) => ({ ...x, [id]: r.item.output ?? "" })); } catch { setText((x) => ({ ...x, [id]: "Metin yüklenemedi." })); }
    }
  }

  if (!d) return <div className="skeleton h-40" />;
  if (d.error || d.missing) return <p className="text-sm text-ink-500">Kullanım geçmişi yüklenemedi (veritabanı güncellemesi 26 yapıldı mı?).</p>;
  const s = d.summary;
  return (
    <div className="space-y-3">
      <div className="grid gap-2 sm:grid-cols-4">
        {[["Toplam çıktı", `${n(s.outputs)} istek`], ["Üretilen metin", `${n(s.words)} kelime · ~${n(s.pages)} sayfa`], ["Bu ay", `${n(s.monthOutputs)} istek · ${n(s.monthWords)} kelime`], ["Silinen", `${n(s.deletedWords)} kelime · ${n(s.projectsDeleted)} çalışma`], ...(s.alerts ? [["Kötüye kullanım uyarısı", `${n(s.alerts)} uyarı`]] : [])].map(([l, v]) => (
          <div key={l} className="rounded-xl bg-ink-50 p-2.5"><p className="text-[11.5px] text-ink-500">{l}</p><p className="text-[13.5px] font-semibold text-ink-900">{v}</p></div>
        ))}
      </div>
      {s.months.length > 0 && (
        <div className="overflow-x-auto"><table className="w-full text-[12.5px] tabular-nums">
          <thead><tr className="text-ink-500"><th className="py-1 text-left font-medium">Ay</th><th className="text-right font-medium">Çıktı</th><th className="text-right font-medium">Üretilen kelime</th><th className="text-right font-medium">Silinen kelime</th></tr></thead>
          <tbody>{s.months.map((m: any) => <tr key={m.month} className="border-t border-ink-50"><td className="py-1">{m.month}</td><td className="text-right">{n(m.outputs)}</td><td className="text-right">{n(m.words)}</td><td className="text-right">{n(m.deleted)}</td></tr>)}</tbody>
        </table></div>
      )}
      <div className="max-h-[420px] space-y-1 overflow-y-auto pr-1">
        {d.items.length === 0 && <p className="text-sm text-ink-400">Kayıt yok. (Kayıt, veritabanı güncellemesi 26’dan sonraki kullanımla başlar.)</p>}
        {d.items.map((r: any) => (
          <div key={r.id} className="rounded-xl border border-ink-100 p-2.5">
            <div className="flex flex-wrap items-center gap-2 text-[12.5px]">
              <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-medium", KIND[r.kind]?.tone)}>{KIND[r.kind]?.label ?? r.kind}</span>
              <span className="text-ink-400">{when(r.created_at)}</span>
              <span className="font-medium text-ink-800">{n(r.words)} kelime{r.kind === "text_removed" && r.words_before ? ` (önce ${n(r.words_before)})` : ""}</span>
              {r.action && <span className="text-ink-500">· {r.action}</span>}
            </div>
            <p className="mt-0.5 truncate text-[12.5px] text-ink-600">{[r.project_title, r.stage_title].filter(Boolean).join(" › ") || "—"}</p>
            {r.kind === "ai_output" && (
              <>
                {r.preview && open !== r.id && <p className="mt-0.5 line-clamp-2 text-[12px] text-ink-400">{r.preview}</p>}
                <button onClick={() => show(r.id)} className="mt-1 text-[12px] font-medium text-brand-700 hover:underline">{open === r.id ? "Metni gizle" : "Tam metni göster"}</button>
                {open === r.id && <pre className="mt-1 max-h-72 overflow-auto whitespace-pre-wrap rounded-lg bg-ink-50 p-2 text-[12px] text-ink-700">{text[r.id] ?? "Yükleniyor…"}</pre>}
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
/* eslint-enable @typescript-eslint/no-explicit-any */
