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
  const [data, setData] = useState<{ org: any; members: any[]; summary?: any; audit?: any[] } | null>(null);
  const load = () => api<{ org: any; members: any[]; summary?: any; audit?: any[] }>("/api/org/members").then(setData).catch((e) => toast({ tone: "error", title: t("Yüklenemedi"), detail: (e as Error).message }));
  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  async function remove(m: any) {
    if (!confirm(t("{name} kurumdan çıkarılsın mı? Kişisel paketi yeniden geçerli olur.", { name: m.name || m.email }))) return;
    try { await api("/api/org/members", { method: "DELETE", json: { userId: m.userId } }); load(); }
    catch (e) { toast({ tone: "error", title: t("İşlem başarısız"), detail: (e as Error).message }); }
  }
  async function setRole(m: any, role: "admin" | "member") {
    try { await api("/api/org/members", { method: "PATCH", json: { userId: m.userId, role } }); load(); }
    catch (e) { toast({ tone: "error", title: t("İşlem başarısız"), detail: (e as Error).message }); }
  }
  function csv() {
    if (!data) return;
    const q = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const rows = [[t("Ad soyad"), t("E-posta"), t("Rol"), t("Katılım"), t("Bu ay AI isteği"), t("Tarama"), t("Dışa aktarma"), t("Proje")], ...data.members.map((m) => [m.name, m.email, m.role === "admin" ? t("Yönetici") : t("Üye"), new Date(m.joinedAt).toLocaleDateString(dl), m.usage.ai, m.usage.searches, m.usage.exports ?? 0, m.usage.projects])];
    const url = URL.createObjectURL(new Blob(["\uFEFF" + rows.map((r) => r.map(q).join(";")).join("\r\n")], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a"); a.href = url; a.download = `kurum-kullanim-${new Date().toISOString().slice(0, 7)}.csv`; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  const ACTION: Record<string, string> = { member_joined: "Kuruma katıldı", member_left: "Kurumdan ayrıldı", member_removed: "Kurumdan çıkarıldı", role_changed: "Rolü değişti" };
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
      {data.summary && (
        <div className="grid gap-3 sm:grid-cols-4">
          {([[t("Bu ay etkin üye"), `${data.summary.active} / ${data.summary.members}`], [t("Bu ay AI isteği"), data.summary.ai], [t("Kaynak taraması"), data.summary.searches], [t("Dışa aktarma"), data.summary.exports]] as [string, string | number][]).map(([l, v]) => <div key={l} className="card p-4"><p className="text-2xl font-semibold">{v}</p><p className="text-sm text-ink-500">{l}</p></div>)}
        </div>
      )}
      <section className="card overflow-hidden">
        <div className="flex items-center gap-2 border-b border-ink-100 px-5 py-3 font-semibold"><Users className="h-4 w-4" /> {t("Üyeler")}<button onClick={csv} className="ml-auto rounded-lg border border-ink-200 px-2.5 py-1 text-[12.5px] font-medium text-ink-700 hover:border-ink-300">{t("Kullanım raporu (CSV)")}</button></div>
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
                    <td className="whitespace-nowrap px-4 py-2.5 text-right"><button onClick={() => setRole(m, m.role === "admin" ? "member" : "admin")} className="mr-1 rounded-lg px-2 py-1 text-[12px] text-ink-500 hover:bg-ink-100">{m.role === "admin" ? t("Üyeliğe al") : t("Yönetici yap")}</button>{m.role !== "admin" && <button onClick={() => remove(m)} className="rounded-lg p-1.5 text-ink-300 hover:bg-rose-50 hover:text-rose-500" aria-label={t("Kurumdan çıkar")}><Trash2 className="h-4 w-4" /></button>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p className="border-t border-ink-100 px-5 py-3 text-xs text-ink-400">{t("Gizlilik: kurum yöneticileri üyelerin yalnızca kullanım sayılarını görür; proje başlıkları ve çalışma içerikleri kurumla paylaşılmaz.")}</p>
      </section>
      <section className="card overflow-hidden">
        <div className="border-b border-ink-100 px-5 py-3 font-semibold">{t("Denetim kaydı")}</div>
        {(data.audit ?? []).length === 0 ? <p className="p-5 text-sm text-ink-500">{t("Henüz kayıt yok. Katılma, ayrılma, çıkarma ve rol değişiklikleri burada listelenir.")}</p> : (
          <ul className="divide-y divide-ink-100 text-sm">{data.audit!.map((a, i) => <li key={i} className="flex flex-wrap gap-2 px-5 py-2.5"><span className="text-ink-400">{new Date(a.at).toLocaleString(dl)}</span><span className="font-medium text-ink-800">{a.target ?? a.actor}</span><span className="text-ink-600">{t(ACTION[a.action] ?? a.action)}{a.action === "role_changed" && a.data?.role ? ` → ${a.data.role === "admin" ? t("Yönetici") : t("Üye")}` : ""}</span>{a.actor && a.target && a.actor !== a.target && <span className="text-ink-400">({t("işlemi yapan: {n}", { n: a.actor })})</span>}</li>)}</ul>
        )}
      </section>
    </div>
  );
}
/* eslint-enable @typescript-eslint/no-explicit-any */
