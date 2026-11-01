"use client";
import { useT } from "@/i18n/client";
import { Copy, Link2, Share2, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge, Modal } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/toast";
import { api } from "@/lib/client";

/* eslint-disable @typescript-eslint/no-explicit-any */
export function ShareButton({ projectId, variant }: { projectId: string; variant?: "row" }) {
  const { t, dl } = useT();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [shares, setShares] = useState<any[]>([]);
  const [label, setLabel] = useState(() => t("Danışman"));
  const [days, setDays] = useState<number | null>(30);
  const [comments, setComments] = useState(true);
  const [busy, setBusy] = useState(false);
  useEffect(() => { if (open) api<{ shares: any[] }>(`/api/projects/${projectId}/shares`).then((r) => setShares(r.shares)).catch(() => {}); }, [open, projectId]);
  const url = (token: string) => `${window.location.origin}/paylasim/${token}`;
  async function create() {
    setBusy(true);
    try {
      const { share } = await api<{ share: any }>(`/api/projects/${projectId}/shares`, { method: "POST", json: { label, allowComments: comments, expiresInDays: days } });
      setShares((l) => [share, ...l]);
      await navigator.clipboard.writeText(url(share.token)).catch(() => {});
      toast({ tone: "success", title: t("Bağlantı oluşturuldu ve kopyalandı") });
    } catch (e) { toast({ tone: "error", title: t("Oluşturulamadı"), detail: (e as Error).message }); } finally { setBusy(false); }
  }
  async function revoke(id: string) {
    await api(`/api/projects/${projectId}/shares`, { method: "DELETE", json: { shareId: id } });
    setShares((l) => l.map((s) => (s.id === id ? { ...s, revoked: true } : s)));
  }
  const active = (s: any) => !s.revoked && (!s.expires_at || new Date(s.expires_at) > new Date());
  return (
    <>
      {variant === "row"
        ? <button onClick={() => setOpen(true)} className="flex items-center gap-3 rounded-2xl border border-ink-100 px-4 py-3 text-left text-[15px] font-medium text-ink-800"><Share2 className="h-5 w-5 text-brand-600" /> {t("Danışmanla paylaş")}</button>
        : <button onClick={() => setOpen(true)} className="hidden h-9 items-center gap-1.5 rounded-xl border border-ink-200 bg-white px-3 text-[13px] font-medium text-ink-700 transition hover:border-ink-300 lg:flex"><Share2 className="h-4 w-4" /> {t("Paylaş")}</button>}
      <Modal open={open} onClose={() => setOpen(false)} title={t("Danışmanla paylaş")}>
        <p className="text-sm text-ink-500">{t("Salt okunur bir bağlantı oluşturun. Bağlantıya sahip kişi çalışmanızı (bölümler, atıflar, kaynakça) görebilir ama düzenleyemez. Bağlantıyı istediğiniz zaman iptal edebilirsiniz.")}</p>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <input className="input col-span-2" placeholder={t("Etiket (ör. Prof. Dr. …)")} value={label} onChange={(e) => setLabel(e.target.value)} />
          <select className="input" value={days ?? 0} onChange={(e) => setDays(Number(e.target.value) || null)}><option value={7}>{t("{n} gün geçerli", { n: 7 })}</option><option value={30}>{t("{n} gün geçerli", { n: 30 })}</option><option value={90}>{t("{n} gün geçerli", { n: 90 })}</option><option value={0}>{t("Süresiz")}</option></select>
          <label className="flex items-center gap-2 text-sm text-ink-600"><input type="checkbox" checked={comments} onChange={(e) => setComments(e.target.checked)} /> {t("Yorumlara izin ver")}</label>
        </div>
        <Button className="mt-3 w-full" onClick={create} loading={busy}><Link2 className="h-4 w-4" /> {t("Bağlantı oluştur")}</Button>
        <div className="mt-5 space-y-2">
          {shares.map((s) => (
            <div key={s.id} className="flex items-center gap-2 rounded-xl border border-ink-100 px-3 py-2 text-sm">
              <div className="min-w-0 flex-1"><p className="truncate font-medium">{s.label || t("Bağlantı")}</p><p className="text-xs text-ink-400">{t("{n} görüntülenme", { n: s.view_count })}{s.expires_at ? ` · ${t("{date} tarihine kadar", { date: new Date(s.expires_at).toLocaleDateString(dl) })}` : ""}</p></div>
              {active(s) ? <>
                <button onClick={() => { navigator.clipboard.writeText(url(s.token)); toast({ tone: "success", title: t("Kopyalandı") }); }} className="rounded-lg p-1.5 text-ink-500 hover:bg-ink-100" aria-label={t("Kopyala")}><Copy className="h-4 w-4" /></button>
                <button onClick={() => revoke(s.id)} className="rounded-lg p-1.5 text-rose-500 hover:bg-rose-50" aria-label={t("İptal et")}><XCircle className="h-4 w-4" /></button>
              </> : <Badge>{s.revoked ? t("İptal edildi") : t("Süresi doldu")}</Badge>}
            </div>
          ))}
        </div>
      </Modal>
    </>
  );
}
/* eslint-enable @typescript-eslint/no-explicit-any */
