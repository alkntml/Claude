"use client";
import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/client";
import { Badge } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/components/ui/cn";

/* eslint-disable @typescript-eslint/no-explicit-any */

/** Kural adları ve kısa açıklamaları (D103, D104, D109) */
const RULES: Record<string, [string, string]> = {
  second_project: ["İkinci çalışma denemesi", "Engellendi."],
  delete_project: ["Pakete bağlı çalışmayı silme denemesi", "Engellendi."],
  worktype_change: ["Çalışma türünü değiştirme denemesi", "Engellendi."],
  delete_after_export: ["İndirdikten sonra büyük silme", "Bitirip yeni çalışmaya geçiyor olabilir."],
  mass_delete: ["Toplu silme", "Ürettiği metnin büyük kısmını sildi."],
  topic_change: ["Konu tamamen değişti", "Başlık veya konu, eskisiyle neredeyse hiç örtüşmüyor."],
  heavy_generation: ["Çok yüksek üretim", "Birden fazla tez büyüklüğünde metin üretildi."],
  cost_40: ["Maliyet %40’ı geçti", "Bilgi amaçlı; kullanım kısıtlanmadı."],
  content_replaced: ["İçerik değiştirilmiş", "Ardışık iki indirme birbirine çok az benziyor (silmeden üzerine yazma)."],
  cover_change: ["Kapak bilgisi değişti", "Yazar, üniversite, bölüm veya danışman indirmeler arasında değişti."],
  many_devices: ["Çok sayıda cihaz", "Hesap paylaşılıyor olabilir."],
  many_sections: ["Aşırı bölüm sayısı", "Aynı çalışmada ikinci bir metin yazılıyor olabilir."],
  off_topic: ["Konu dışı metin", "Üretilen uzun metinde çalışmanın konu terimleri hiç geçmiyor."],
};
const DECISION: Record<string, [string, "green" | "amber" | "red"]> = { ok: ["Sorun yok", "green"], warn: ["Kullanıcı uyarıldı", "amber"], suspend: ["Askıya alındı", "red"] };

/** Uyarının ayrıntılarından okunabilir kısa satır */
function details(a: any): string {
  const d = a.data ?? {};
  const n = (x: unknown) => Number(x ?? 0).toLocaleString("tr-TR");
  switch (a.rule) {
    case "content_replaced": return `Benzerlik %${d.similarity ?? 0} · ${n(d.words_before)} → ${n(d.words_after)} kelime`;
    case "cover_change": return (Array.isArray(d.fields) ? d.fields : []).map((f: string) => `${f}: “${d.before?.[f] ?? ""}” → “${d.after?.[f] ?? ""}”`).join(" · ");
    case "many_devices": return `${d.devices ?? "?"} farklı tarayıcı/cihaz · son ${d.days ?? 30} gün`;
    case "many_sections": return `${d.sections ?? "?"} bölüm (şablonda ${d.template ?? "?"})`;
    case "off_topic": return `${n(d.words)} kelime · ${d.stage_title ?? ""} · “${String(d.excerpt ?? "").slice(0, 120)}…”`;
    case "topic_change": return `“${d.old_title ?? d.old_topic ?? ""}” → “${d.project_title ?? d.new_topic ?? ""}”`;
    case "cost_40": return `$${d.cost ?? 0} / sınır $${d.budget ?? 0} (%${d.pct ?? 0})`;
    default: return d.words ? `${n(d.words)} kelime` : "";
  }
}

export function AlertsTab() {
  const toast = useToast();
  const [rows, setRows] = useState<any[] | null>(null);
  const [onlyOpen, setOnlyOpen] = useState(true);
  const [open, setOpen] = useState<number | null>(null);
  const [form, setForm] = useState({ note: "", message: "" });
  const load = useCallback(async () => {
    try { setRows((await api<{ alerts: any[] }>("/api/admin/alerts")).alerts); }
    catch (e) { toast({ tone: "error", title: "Uyarılar yüklenemedi", detail: (e as Error).message }); setRows([]); }
  }, [toast]);
  useEffect(() => { load(); }, [load]);

  async function decide(a: any, decision: "ok" | "warn" | "suspend") {
    try {
      await api("/api/admin/alerts", { method: "POST", json: { alertId: a.id, decision, note: form.note, message: form.message } });
      toast({ tone: "success", title: DECISION[decision][0] });
      setOpen(null); setForm({ note: "", message: "" }); load();
    } catch (e) { toast({ tone: "error", title: "Karar kaydedilemedi", detail: (e as Error).message }); }
  }
  async function unsuspend(userId: string) {
    try { await api("/api/admin/users", { method: "PATCH", json: { id: userId, is_suspended: false } }); toast({ tone: "success", title: "Askı kaldırıldı" }); load(); }
    catch (e) { toast({ tone: "error", title: "İşlem yapılamadı", detail: (e as Error).message }); }
  }

  const list = (rows ?? []).filter((a) => !onlyOpen || !a.decision);
  const openCount = (rows ?? []).filter((a) => !a.decision).length;
  return (
    <div className="space-y-4">
      <div className="card flex flex-wrap items-center justify-between gap-3 p-4">
        <div>
          <p className="font-semibold">Kötüye kullanım uyarıları</p>
          <p className="text-[13px] text-ink-500">Tek Proje kurallarıyla ilgili uyarılar. Her uyarı için karar verin; “Uyar” kullanıcının bildirim kutusuna mesaj gönderir, “Askıya al” hesabı kapatır. Kararlar kaydedilir.</p>
        </div>
        <label className="flex items-center gap-2 text-[13px] text-ink-600"><input type="checkbox" checked={onlyOpen} onChange={(e) => setOnlyOpen(e.target.checked)} /> Yalnızca karar bekleyenler ({openCount})</label>
      </div>
      {rows === null ? <p className="text-sm text-ink-400">Yükleniyor…</p> : list.length === 0 ? <p className="card p-6 text-center text-sm text-ink-400">{onlyOpen ? "Karar bekleyen uyarı yok." : "Henüz uyarı yok."}</p> : (
        <div className="card divide-y divide-ink-100">
          {list.map((a) => {
            const [title, hint] = RULES[a.rule] ?? [a.rule, ""];
            return (
              <div key={a.id} className="p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-medium text-ink-900">{title} <span className="text-[12px] font-normal text-ink-400">· {new Date(a.createdAt).toLocaleString("tr-TR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</span></p>
                    <p className="text-[13px] text-ink-600">{a.user?.full_name || a.user?.email || a.userId}{a.user?.email && a.user?.full_name ? ` · ${a.user.email}` : ""}{a.projectTitle ? ` · “${a.projectTitle}”` : ""}</p>
                    <p className="mt-0.5 break-words text-[12.5px] text-ink-500">{hint} {details(a)}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {a.user?.is_suspended && <Badge tone="red">Hesap askıda</Badge>}
                    {a.decision ? <Badge tone={DECISION[a.decision.decision][1]}>{DECISION[a.decision.decision][0]}</Badge> : <Button size="sm" variant="secondary" onClick={() => { setOpen(open === a.id ? null : a.id); setForm({ note: "", message: "" }); }}>Karar ver</Button>}
                  </div>
                </div>
                {a.decision?.note && <p className="mt-1 text-[12px] text-ink-400">Not: {a.decision.note}</p>}
                {a.user?.is_suspended && <button type="button" className="mt-1 text-[12px] text-brand-700 hover:underline" onClick={() => unsuspend(a.userId)}>Askıyı kaldır</button>}
                {open === a.id && (
                  <div className={cn("mt-3 space-y-2 rounded-xl bg-ink-50 p-3")}>
                    <input className="input !py-1.5" placeholder="Not (yalnızca yöneticiler görür)" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
                    <textarea className="input min-h-[64px] !py-1.5" placeholder="Kullanıcıya mesaj (yalnızca “Uyar” kararında gönderilir; boş bırakılırsa standart uyarı metni gider)" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" variant="secondary" onClick={() => decide(a, "ok")}>Sorun yok</Button>
                      <Button size="sm" variant="secondary" onClick={() => decide(a, "warn")}>Kullanıcıyı uyar</Button>
                      <Button size="sm" variant="danger" onClick={() => decide(a, "suspend")}>Hesabı askıya al</Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
