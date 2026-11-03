"use client";
import { Copy, Trash2, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { Badge, Empty, ProgressBar } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/toast";
import { useT } from "@/i18n/client";
import { api } from "@/lib/client";

/* eslint-disable @typescript-eslint/no-explicit-any */
/** Kurum yöneticisi paneli: koltuk kullanımı, katılım kodu, üyeler ve aylık kullanım sayıları (içerik görünmez). */
export function OrgAdminView() {
  const { t, dl } = useT();
  const toast = useToast();
  const [data, setData] = useState<{ org: any; members: any[] } | null>(null);
  const load = () => api<{ org: any; members: any[] }>("/api/org/members").then(setData).catch((e) => toast({ tone: "error", title: t("Yüklenemedi"), detail: (e as Error).message }));
  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  async function remove(m: any) {
    if (!confirm(t("{name} kurumdan çıkarılsın mı? Kişisel paketi yeniden geçerli olur.", { name: m.name || m.email }))) return;
    try { await api("/api/org/members", { method: "DELETE", json: { userId: m.userId } }); load(); }
    catch (e) { toast({ tone: "error", title: t("İşlem başarısız"), detail: (e as Error).message }); }
  }
  if (!data) return <div className="skeleton h-64" />;
  const { org, members } = data;
  return (
    <div className="space-y-6">
      <div><h1 className="font-serif text-4xl font-medium tracking-tight text-ink-950">{org.name}</h1><p className="mt-1 text-ink-500">{t("Kurum lisansı · {plan} paket", { plan: org.plan_id })}{org.expires_at ? ` · ${t("{date} tarihine kadar", { date: new Date(org.expires_at).toLocaleDateString(dl) })}` : ""}</p></div>
      <div className="grid gap-4 md:grid-cols-2">
        <section className="card p-5">
          <p className="text-sm font-medium text-ink-700">{t("Kullanıcı sayısı")}</p>
          <p className="mt-1 text-2xl font-semibold">{org.seats ? `${members.length} / ${org.seats}` : members.length}</p>
          {org.seats ? <div className="mt-2"><ProgressBar value={members.length} max={org.seats} /></div> : <p className="mt-1 text-xs text-ink-500">{t("Kişi sınırı yok; istediğiniz kadar üye katılabilir.")}</p>}
        </section>
        <section className="card p-5">
          <p className="text-sm font-medium text-ink-700">{t("Katılım kodu")}</p>
          <div className="mt-1 flex items-center gap-2"><code className="rounded-lg bg-ink-100 px-3 py-1.5 text-lg font-semibold tracking-widest">{org.join_code}</code>
            <button onClick={() => { navigator.clipboard.writeText(org.join_code); toast({ tone: "success", title: t("Kopyalandı") }); }} className="rounded-lg p-2 text-ink-500 hover:bg-ink-100" aria-label={t("Kopyala")}><Copy className="h-4 w-4" /></button></div>
          <p className="mt-2 text-xs text-ink-500">{org.email_domain ? t("Yalnızca @{d} uzantılı e-postalar katılabilir.", { d: org.email_domain }) : t("Kodu bilen herkes katılabilir; kodu yalnızca kurum içinde paylaşın.")} {t("Kullanıcılar Hesap sayfasında “Kurum lisansı” bölümüne kodu girer.")}</p>
        </section>
      </div>
      <section className="card overflow-hidden">
        <div className="flex items-center gap-2 border-b border-ink-100 px-5 py-3 font-semibold"><Users className="h-4 w-4" /> {t("Üyeler")}</div>
        {members.length === 0 ? <div className="p-6"><Empty icon={<Users className="h-5 w-5" />} title={t("Henüz üye yok")}>{t("Katılım kodunu paylaşın.")}</Empty></div> : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="bg-ink-50 text-xs uppercase text-ink-500"><tr><th className="px-4 py-2">{t("Ad soyad")}</th><th className="px-4 py-2">{t("E-posta")}</th><th className="px-4 py-2">{t("Katılım")}</th><th className="px-4 py-2">{t("Bu ay AI isteği")}</th><th className="px-4 py-2">{t("Tarama")}</th><th className="px-4 py-2">{t("Proje")}</th><th /></tr></thead>
              <tbody>
                {members.map((m) => (
                  <tr key={m.userId} className="border-t border-ink-100">
                    <td className="px-4 py-2.5">{m.name || "—"} {m.role === "admin" && <Badge tone="violet">{t("Yönetici")}</Badge>}</td>
                    <td className="px-4 py-2.5 text-ink-500">{m.email}</td>
                    <td className="px-4 py-2.5 text-ink-500">{new Date(m.joinedAt).toLocaleDateString(dl)}</td>
                    <td className="px-4 py-2.5">{m.usage.ai}</td><td className="px-4 py-2.5">{m.usage.searches}</td><td className="px-4 py-2.5">{m.usage.projects}</td>
                    <td className="px-4 py-2.5 text-right">{m.role !== "admin" && <button onClick={() => remove(m)} className="rounded-lg p-1.5 text-ink-300 hover:bg-rose-50 hover:text-rose-500" aria-label={t("Kurumdan çıkar")}><Trash2 className="h-4 w-4" /></button>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p className="border-t border-ink-100 px-5 py-3 text-xs text-ink-400">{t("Gizlilik: kurum yöneticileri üyelerin yalnızca kullanım sayılarını görür; proje başlıkları ve çalışma içerikleri kurumla paylaşılmaz.")}</p>
      </section>
    </div>
  );
}
/* eslint-enable @typescript-eslint/no-explicit-any */
