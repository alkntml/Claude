"use client";
/**
 * Ortak yazarlar (D115): üst çubukta çalışmadaki kişilerin baş harfleri + davet/üye yönetimi penceresi.
 * Sahip davet eder, rol değiştirir, çıkarır; ortak yazar listeyi görür ve çalışmadan ayrılabilir.
 */
import { Copy, Lock, LogOut, Mail, Trash2, UserPlus, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/components/ui/cn";
import { Modal } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/toast";
import { useT } from "@/i18n/client";
import { api, openUpgrade } from "@/lib/client";
import { ROLE_HINT, ROLE_LABEL, type CoauthorRole } from "@/lib/coauthors";
import { FEATURE_MIN_PLAN, hasFeature } from "@/lib/features";

/* eslint-disable @typescript-eslint/no-explicit-any */
const COLORS = ["bg-brand-600", "bg-emerald-600", "bg-amber-600", "bg-rose-600", "bg-violet-600", "bg-sky-600"];
function colorOf(id: string) { let h = 0; for (const c of id) h = (h * 31 + c.charCodeAt(0)) >>> 0; return COLORS[h % COLORS.length]; }
const initials = (name: string) => name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]!.toLocaleUpperCase("tr")).join("") || "?";

export function Avatar({ id, name, size = "md", ring }: { id: string; name: string; size?: "sm" | "md"; ring?: boolean }) {
  return (
    <span title={name} className={cn("grid shrink-0 place-items-center rounded-full font-semibold text-white", colorOf(id), size === "sm" ? "h-5 w-5 text-[9px]" : "h-7 w-7 text-[11px]", ring && "ring-2 ring-white")}>{initials(name)}</span>
  );
}

export interface PresencePerson { userId: string; name: string; stageId: string | null }

export function CoauthorsButton({ projectId, isOwner, planId, present, variant, onCountChange }: { projectId: string; isOwner: boolean; planId?: string; present: PresencePerson[]; variant?: "row"; onCountChange?: (n: number) => void }) {
  const { t } = useT();
  const [open, setOpen] = useState(false);
  return (
    <>
      {variant === "row"
        ? <button onClick={() => setOpen(true)} className="flex items-center gap-3 rounded-2xl border border-ink-100 px-4 py-3 text-left text-[15px] font-medium text-ink-800"><Users className="h-5 w-5 text-brand-600" /> {t("Ortak yazarlar")}</button>
        : (
          <button onClick={() => setOpen(true)} className="hidden h-9 items-center gap-1.5 rounded-xl border border-ink-200 bg-white px-2.5 text-[13px] font-medium text-ink-700 transition hover:border-ink-300 lg:flex" title={present.length ? t("Şu an çalışmada: {n}", { n: present.map((p) => p.name).join(", ") }) : t("Ortak yazarlar")}>
            {present.length ? <span className="flex -space-x-1.5">{present.slice(0, 3).map((p) => <Avatar key={p.userId} id={p.userId} name={p.name} size="sm" ring />)}</span> : <Users className="h-4 w-4" />}
            {t("Ortak yazarlar")}
          </button>
        )}
      {open && <CoauthorsModal projectId={projectId} isOwner={isOwner} planId={planId} present={present} onClose={() => setOpen(false)} onCountChange={onCountChange} />}
    </>
  );
}

function CoauthorsModal({ projectId, isOwner, planId, present, onClose, onCountChange }: { projectId: string; isOwner: boolean; planId?: string; present: PresencePerson[]; onClose: () => void; onCountChange?: (n: number) => void }) {
  const { t, dl } = useT();
  const toast = useToast();
  const router = useRouter();
  const [data, setData] = useState<{ members: any[]; invites: any[]; limit: number; myRole: string } | null>(null);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<CoauthorRole>("editor");
  const [busy, setBusy] = useState(false);
  const allowed = hasFeature(planId, "coauthors");
  const link = (token: string) => `${window.location.origin}/ortak/${token}`;

  const load = useCallback(() => api<any>(`/api/projects/${projectId}/members`).then((r) => { setData(r); onCountChange?.(r.members.length - 1 + r.invites.length); }).catch((e) => toast({ tone: "error", title: t("Yüklenemedi"), detail: (e as Error).message })), [projectId, toast, t, onCountChange]);
  useEffect(() => { load(); }, [load]);

  async function invite(e: React.FormEvent) {
    e.preventDefault();
    if (!allowed) { openUpgrade({ code: "feature_locked", feature: "coauthors", plan: FEATURE_MIN_PLAN.coauthors }); return; }
    setBusy(true);
    try {
      const r = await api<{ invite: any; registered: boolean }>(`/api/projects/${projectId}/members`, { method: "POST", json: { email, role } });
      await navigator.clipboard.writeText(link(r.invite.token)).catch(() => {});
      toast({ tone: "success", title: t("Davet bağlantısı oluşturuldu ve kopyalandı"), detail: r.registered ? t("Bu kişi Academiana’ya kayıtlı; bildirim kutusuna davet de gönderildi. Bağlantıyı ayrıca WhatsApp veya e-postayla iletebilirsiniz.") : t("Bağlantıyı WhatsApp veya e-postayla iletin. Kişi bu adresle ücretsiz kaydolup daveti kabul edebilir.") });
      setEmail("");
      load();
    } catch (err) { toast({ tone: "error", title: t("Davet oluşturulamadı"), detail: (err as Error).message }); } finally { setBusy(false); }
  }
  async function changeRole(userId: string, r: CoauthorRole) {
    try { await api(`/api/projects/${projectId}/members`, { method: "PATCH", json: { userId, role: r } }); load(); }
    catch (err) { toast({ tone: "error", title: t("Değiştirilemedi"), detail: (err as Error).message }); }
  }
  async function remove(body: { userId?: string; inviteId?: string }, confirmText: string) {
    if (!window.confirm(confirmText)) return;
    try {
      await api(`/api/projects/${projectId}/members`, { method: "DELETE", json: body });
      if (!isOwner && !body.inviteId) { toast({ tone: "success", title: t("Çalışmadan ayrıldınız") }); router.push("/panel"); return; }
      load();
    } catch (err) { toast({ tone: "error", title: t("İşlem yapılamadı"), detail: (err as Error).message }); }
  }
  const presentIds = new Set(present.map((p) => p.userId));
  const used = (data?.members.length ?? 1) - 1 + (data?.invites.length ?? 0);

  return (
    <Modal open onClose={onClose} title={t("Ortak yazarlar")}>
      <p className="text-[13.5px] leading-relaxed text-ink-600">{t("Çalışmayı birlikte yazacağınız kişileri davet edin. Ortak yazarlar bölümleri düzenler, kaynak ekler ve yapay zekâyı kendi paketleriyle kullanır; yorumcular yalnızca okur ve yorum yazar. Kim hangi bölümdeyse adı görünür; aynı bölümü aynı anda kaydederseniz hiçbir metin kaybolmaz, sürüm geçmişine saklanır.")}</p>

      <ul className="mt-4 divide-y divide-ink-100 rounded-2xl border border-ink-100">
        {!data && <li className="px-4 py-3 text-[13px] text-ink-400">{t("Yükleniyor…")}</li>}
        {data?.members.map((m) => (
          <li key={m.userId} className="flex items-center gap-3 px-3.5 py-2.5">
            <span className="relative"><Avatar id={m.userId} name={m.name} />{presentIds.has(m.userId) && <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white" title={t("Şu an çalışmada")} />}</span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[14px] font-medium text-ink-800">{m.name}{m.me ? ` (${t("siz")})` : ""}</span>
              {m.email && <span className="block truncate text-[12px] text-ink-400">{m.email}</span>}
            </span>
            {isOwner && m.role !== "owner" ? (
              <>
                <select aria-label={t("Rol")} className="h-8 rounded-lg border border-ink-200 bg-white px-2 text-[12.5px]" value={m.role} onChange={(e) => changeRole(m.userId, e.target.value as CoauthorRole)}>
                  <option value="editor">{t(ROLE_LABEL.editor)}</option><option value="commenter">{t(ROLE_LABEL.commenter)}</option>
                </select>
                <button onClick={() => remove({ userId: m.userId }, t("{n} çalışmadan çıkarılsın mı? Yazdıkları çalışmada kalır.", { n: m.name }))} className="rounded-lg p-1.5 text-rose-500 hover:bg-rose-50" aria-label={t("Çıkar")}><Trash2 className="h-4 w-4" /></button>
              </>
            ) : <span className="rounded-full bg-ink-100 px-2 py-0.5 text-[11.5px] font-medium text-ink-600">{t(ROLE_LABEL[m.role as "owner"])}</span>}
          </li>
        ))}
        {isOwner && data?.invites.map((v) => (
          <li key={v.id} className="flex items-center gap-3 px-3.5 py-2.5">
            <span className="grid h-7 w-7 place-items-center rounded-full bg-ink-100 text-ink-500"><Mail className="h-3.5 w-3.5" /></span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[14px] text-ink-700">{v.email}</span>
              <span className="block text-[12px] text-ink-400">{t("Davet bekliyor · {r} · {d} tarihine kadar", { r: t(ROLE_LABEL[v.role as CoauthorRole]), d: new Date(v.expires_at).toLocaleDateString(dl) })}</span>
            </span>
            <button onClick={() => { navigator.clipboard.writeText(link(v.token)); toast({ tone: "success", title: t("Davet bağlantısı kopyalandı") }); }} className="rounded-lg p-1.5 text-ink-500 hover:bg-ink-100" aria-label={t("Bağlantıyı kopyala")}><Copy className="h-4 w-4" /></button>
            <button onClick={() => remove({ inviteId: v.id }, t("Bu davet iptal edilsin mi? Bağlantı artık çalışmaz."))} className="rounded-lg p-1.5 text-rose-500 hover:bg-rose-50" aria-label={t("Daveti iptal et")}><Trash2 className="h-4 w-4" /></button>
          </li>
        ))}
      </ul>

      {isOwner ? (
        <form onSubmit={invite} className="mt-4 space-y-2.5 rounded-2xl border border-ink-100 bg-ink-50/50 p-3.5">
          <p className="flex items-center gap-2 text-[13.5px] font-semibold text-ink-800"><UserPlus className="h-4 w-4 text-brand-600" /> {t("Kişi davet et")}{!allowed && <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700"><Lock className="h-3 w-3" />Pro</span>}</p>
          <input type="email" required className="input" placeholder={t("ornek@universite.edu.tr")} value={email} onChange={(e) => setEmail(e.target.value)} aria-label={t("E-posta adresi")} />
          <div className="grid gap-1.5 sm:grid-cols-2">
            {(["editor", "commenter"] as const).map((r) => (
              <label key={r} className={cn("cursor-pointer rounded-xl border px-3 py-2 text-[12.5px] transition", role === r ? "border-brand-300 bg-brand-50" : "border-ink-200 bg-white hover:border-ink-300")}>
                <input type="radio" name="role" className="sr-only" checked={role === r} onChange={() => setRole(r)} />
                <span className="block font-semibold text-ink-800">{t(ROLE_LABEL[r])}</span>
                <span className="block text-ink-500">{t(ROLE_HINT[r])}</span>
              </label>
            ))}
          </div>
          <Button type="submit" className="w-full" loading={busy} disabled={!email.trim() || (!!data && used >= data.limit)}><UserPlus className="h-4 w-4" /> {t("Davet bağlantısı oluştur")}</Button>
          <p className="text-[12px] text-ink-500">{data && used >= data.limit ? t("Bir çalışmaya en fazla {n} ortak yazar eklenebilir.", { n: data.limit }) : t("Davet yalnızca bu e-posta adresiyle giriş yapan kişi tarafından kabul edilebilir ve 14 gün geçerlidir. En fazla {n} kişi.", { n: data?.limit ?? 5 })}</p>
        </form>
      ) : (
        <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl border border-ink-100 p-3.5">
          <p className="text-[13px] text-ink-600">{t("Bu çalışmada {r} olarak bulunuyorsunuz. Yapay zekâ kullanımınız kendi paketinizden düşer.", { r: t(ROLE_LABEL[(data?.myRole ?? "editor") as CoauthorRole]) })}</p>
          <Button size="sm" variant="secondary" onClick={() => remove({}, t("Bu çalışmadan ayrılmak istiyor musunuz? Yeniden katılmak için yeni davet gerekir."))}><LogOut className="h-4 w-4" /> {t("Ayrıl")}</Button>
        </div>
      )}
    </Modal>
  );
}
/* eslint-enable @typescript-eslint/no-explicit-any */
