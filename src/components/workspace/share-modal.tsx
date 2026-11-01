"use client";
import { Copy, Link2, Share2, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge, Modal } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/toast";
import { api } from "@/lib/client";

/* eslint-disable @typescript-eslint/no-explicit-any */
export function ShareButton({ projectId }: { projectId: string }) {
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [shares, setShares] = useState<any[]>([]);
  const [label, setLabel] = useState("Danışman");
  const [days, setDays] = useState<number | null>(30);
  const [comments, setComments] = useState(true);
  const [busy, setBusy] = useState(false);
  useEffect(() => { if (open) api<{ shares: any[] }>(`/api/projects/${projectId}/shares`).then((r) => setShares(r.shares)).catch(() => {}); }, [open, projectId]);
  const url = (t: string) => `${window.location.origin}/paylasim/${t}`;
  async function create() {
    setBusy(true);
    try {
      const { share } = await api<{ share: any }>(`/api/projects/${projectId}/shares`, { method: "POST", json: { label, allowComments: comments, expiresInDays: days } });
      setShares((l) => [share, ...l]);
      await navigator.clipboard.writeText(url(share.token)).catch(() => {});
      toast({ tone: "success", title: "Bağlantı oluşturuldu ve kopyalandı" });
    } catch (e) { toast({ tone: "error", title: "Oluşturulamadı", detail: (e as Error).message }); } finally { setBusy(false); }
  }
  async function revoke(id: string) {
    await api(`/api/projects/${projectId}/shares`, { method: "DELETE", json: { shareId: id } });
    setShares((l) => l.map((s) => (s.id === id ? { ...s, revoked: true } : s)));
  }
  const active = (s: any) => !s.revoked && (!s.expires_at || new Date(s.expires_at) > new Date());
  return (
    <>
      <button onClick={() => setOpen(true)} className="hidden h-9 items-center gap-1.5 rounded-xl border border-ink-200 bg-white px-3 text-[13px] font-medium text-ink-700 transition hover:border-ink-300 sm:flex"><Share2 className="h-4 w-4" /> Paylaş</button>
      <Modal open={open} onClose={() => setOpen(false)} title="Danışmanla paylaş">
        <p className="text-sm text-ink-500">Salt okunur bir bağlantı oluşturun. Bağlantıya sahip kişi çalışmanızı (bölümler, atıflar, kaynakça) görebilir ama düzenleyemez. Bağlantıyı istediğiniz zaman iptal edebilirsiniz.</p>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <input className="input col-span-2" placeholder="Etiket (ör. Prof. Dr. …)" value={label} onChange={(e) => setLabel(e.target.value)} />
          <select className="input" value={days ?? 0} onChange={(e) => setDays(Number(e.target.value) || null)}><option value={7}>7 gün geçerli</option><option value={30}>30 gün geçerli</option><option value={90}>90 gün geçerli</option><option value={0}>Süresiz</option></select>
          <label className="flex items-center gap-2 text-sm text-ink-600"><input type="checkbox" checked={comments} onChange={(e) => setComments(e.target.checked)} /> Yorumlara izin ver</label>
        </div>
        <Button className="mt-3 w-full" onClick={create} loading={busy}><Link2 className="h-4 w-4" /> Bağlantı oluştur</Button>
        <div className="mt-5 space-y-2">
          {shares.map((s) => (
            <div key={s.id} className="flex items-center gap-2 rounded-xl border border-ink-100 px-3 py-2 text-sm">
              <div className="min-w-0 flex-1"><p className="truncate font-medium">{s.label || "Bağlantı"}</p><p className="text-xs text-ink-400">{s.view_count} görüntülenme{s.expires_at ? ` · ${new Date(s.expires_at).toLocaleDateString("tr-TR")} tarihine kadar` : ""}</p></div>
              {active(s) ? <>
                <button onClick={() => { navigator.clipboard.writeText(url(s.token)); toast({ tone: "success", title: "Kopyalandı" }); }} className="rounded-lg p-1.5 text-ink-500 hover:bg-ink-100" aria-label="Kopyala"><Copy className="h-4 w-4" /></button>
                <button onClick={() => revoke(s.id)} className="rounded-lg p-1.5 text-rose-500 hover:bg-rose-50" aria-label="İptal et"><XCircle className="h-4 w-4" /></button>
              </> : <Badge>{s.revoked ? "İptal edildi" : "Süresi doldu"}</Badge>}
            </div>
          ))}
        </div>
      </Modal>
    </>
  );
}
/* eslint-enable @typescript-eslint/no-explicit-any */
