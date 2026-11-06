"use client";
import { Building2, Copy, Gift, LogOut, Share2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/toast";
import { useT } from "@/i18n/client";
import { api } from "@/lib/client";

interface Growth {
  referral: { code: string; link: string; invited: number; rewarded: number; reward: { ai_requests: number; source_searches: number; valid_days: number } } | null;
  credits: { ai_requests: number; source_searches: number };
  org: { id: string; name: string; plan_id: string; role: "admin" | "member" } | null;
  personalPlan: string;
}

/** Hesap sayfası: kurum lisansı, davet programı */
export function GrowthSection() {
  const { t } = useT();
  const toast = useToast();
  const router = useRouter();
  const [g, setG] = useState<Growth | null>(null);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const load = () => api<Growth>("/api/account/growth").then(setG).catch(() => {});
  useEffect(() => { load(); }, []);

  async function join() {
    setBusy(true);
    try {
      const r = await api<{ org: { name: string } }>("/api/org/join", { method: "POST", json: { code } });
      toast({ tone: "success", title: t("{name} kurumuna katıldınız", { name: r.org.name }), detail: t("Kurum paketiniz hemen geçerli.") });
      setCode(""); await load(); router.refresh();
    } catch (e) { toast({ tone: "error", title: t("Katılınamadı"), detail: (e as Error).message }); } finally { setBusy(false); }
  }
  async function leave() {
    if (!confirm(t("Kurumdan ayrılmak istediğinize emin misiniz? Kişisel paketiniz yeniden geçerli olur."))) return;
    await api("/api/org/leave", { method: "POST" }).catch(() => {});
    await load(); router.refresh();
  }
  function share() {
    if (!g?.referral) return;
    const text = t("Tez ve makale yazarken gerçek kaynaklarla çalışan bir akademik asistan kullanıyorum. Bu bağlantıyla kaydolursan ikimize de ek kullanım hakkı tanımlanıyor:");
    if (navigator.share) navigator.share({ title: "Academiana", text, url: g.referral.link }).catch(() => {});
    else window.open(`https://wa.me/?text=${encodeURIComponent(`${text} ${g.referral.link}`)}`, "_blank", "noopener");
  }

  if (!g) return null;
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <section className="card p-6">
        <h2 className="flex items-center gap-2 font-semibold"><Building2 className="h-4 w-4" /> {t("Kurum lisansı")}</h2>
        {g.org ? (
          <div className="mt-3 space-y-2 text-sm">
            <p className="text-ink-700"><b>{g.org.name}</b> {g.org.role === "admin" && <Badge tone="violet">{t("Kurum yöneticisi")}</Badge>}</p>
            <p className="text-ink-500">{t("Kurum paketi: {plan}", { plan: g.org.plan_id })}{g.personalPlan !== g.org.plan_id ? ` · ${t("kişisel paket: {plan}", { plan: g.personalPlan })}` : ""}</p>
            <div className="flex flex-wrap gap-2 pt-1">
              {g.org.role === "admin" && <Button size="sm" variant="soft" onClick={() => router.push("/kurum")}>{t("Kurumu yönet")}</Button>}
              <Button size="sm" variant="ghost" onClick={leave}><LogOut className="h-3.5 w-3.5" /> {t("Kurumdan ayrıl")}</Button>
            </div>
          </div>
        ) : (
          <div className="mt-3 space-y-2">
            <p className="text-sm text-ink-500">{t("Üniversiteniz veya enstitünüz Academiana lisansı aldıysa size verilen kurum kodunu girin.")}</p>
            <div className="flex gap-2"><input className="input" placeholder={t("Kurum kodu")} value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} /><Button onClick={join} loading={busy} disabled={code.trim().length < 6}>{t("Katıl")}</Button></div>
          </div>
        )}
      </section>

      {g.referral && (
        <section className="card p-6">
          <h2 className="flex items-center gap-2 font-semibold"><Gift className="h-4 w-4" /> {t("Arkadaşını davet et")}</h2>
          <p className="mt-2 text-sm text-ink-500">{t("Arkadaşınız bu bağlantıyla kaydolduğunda size {a} yapay zekâ isteği ve {s} kaynak tarama hakkı tanımlanır ({d} gün geçerli).", { a: g.referral.reward.ai_requests, s: g.referral.reward.source_searches, d: g.referral.reward.valid_days })}</p>
          <div className="mt-3 flex gap-2">
            <input className="input !text-[13px]" readOnly value={g.referral.link} onFocus={(e) => e.target.select()} aria-label={t("Davet bağlantısı")} />
            <Button size="sm" variant="secondary" className="!h-10" onClick={() => { navigator.clipboard.writeText(g.referral!.link); toast({ tone: "success", title: t("Kopyalandı") }); }} aria-label={t("Kopyala")}><Copy className="h-4 w-4" /></Button>
            <Button size="sm" className="!h-10" onClick={share} aria-label={t("Paylaş")}><Share2 className="h-4 w-4" /></Button>
          </div>
          <p className="mt-2 text-xs text-ink-500">{t("Davet ettiğiniz: {n} · ödül kazanan: {r}", { n: g.referral.invited, r: g.referral.rewarded })}{g.credits.ai_requests || g.credits.source_searches ? ` · ${t("aktif ek hakkınız: {a} AI isteği, {s} tarama", { a: g.credits.ai_requests, s: g.credits.source_searches })}` : ""}</p>
        </section>
      )}

    </div>
  );
}
