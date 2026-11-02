"use client";
import { motion } from "framer-motion";
import { Activity, Building2, AlertOctagon, Bot, CheckCircle2, CircleDashed, Database, DollarSign, FileQuestion, Megaphone, MessagesSquare, Package, Plus, RefreshCw, Save, Search, Trash2, Users } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/components/ui/cn";
import { Badge, Empty } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/toast";
import { api } from "@/lib/client";
import { PROVIDER_LABELS } from "@/lib/sources/labels";
import { STAGE_LIBRARY } from "@/lib/workflows";
import { DailyBars } from "./chart";

/* eslint-disable @typescript-eslint/no-explicit-any */
type Tab = "overview" | "users" | "plans" | "orgs" | "ai" | "sources" | "announcements" | "feedback" | "help" | "errors";
const TABS: { id: Tab; label: string; icon: any }[] = [
  { id: "overview", label: "Genel bakış", icon: Activity }, { id: "users", label: "Kullanıcılar", icon: Users }, { id: "plans", label: "Paketler ve limitler", icon: Package }, { id: "orgs", label: "Kurumlar", icon: Building2 },
  { id: "ai", label: "Yapay zekâ", icon: Bot }, { id: "sources", label: "Veri kaynakları", icon: Database }, { id: "announcements", label: "Duyurular", icon: Megaphone },
  { id: "feedback", label: "Geri bildirim", icon: MessagesSquare }, { id: "help", label: "Yardım merkezi", icon: FileQuestion }, { id: "errors", label: "Hata kayıtları", icon: AlertOctagon },
];

function useRows(resource: string, q = "") {
  const [rows, setRows] = useState<any[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => {
    setLoading(true);
    try { const r = await api<{ rows: any[]; count: number }>(`/api/admin/${resource}?q=${encodeURIComponent(q)}`); setRows(r.rows); setCount(r.count); } finally { setLoading(false); }
  }, [resource, q]);
  useEffect(() => { load(); }, [load]);
  return { rows, setRows, count, loading, load };
}

export function AdminPanel({ selfId }: { selfId: string }) {
  const [tab, setTab] = useState<Tab>("overview");
  return (
    <div>
      <h1 className="font-serif text-4xl font-medium tracking-tight text-ink-950">Yönetim paneli</h1>
      <p className="mt-1 text-ink-500">Modeller, promptlar, limitler ve veri kaynakları kod değişikliği gerekmeden buradan yönetilir.</p>
      <div className="mt-6 flex gap-1 overflow-x-auto rounded-2xl bg-ink-100/70 p-1 [scrollbar-width:none]">
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} className={cn("relative flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-2 text-[13px] font-medium transition", tab === t.id ? "text-ink-900" : "text-ink-500 hover:text-ink-800")}>
            {tab === t.id && <motion.span layoutId="admin-tab" className="absolute inset-0 rounded-xl bg-white shadow-sm" transition={{ type: "spring", stiffness: 500, damping: 40 }} />}
            <t.icon className="relative h-4 w-4" /><span className="relative">{t.label}</span>
          </button>
        ))}
      </div>
      <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-6">
        {tab === "overview" && <Overview />}
        {tab === "users" && <UsersTab selfId={selfId} />}
        {tab === "plans" && <PlansTab />}
        {tab === "orgs" && <OrgsTab />}
        {tab === "ai" && <AiTab />}
        {tab === "sources" && <SourcesTab />}
        {tab === "announcements" && <AnnouncementsTab />}
        {tab === "feedback" && <FeedbackTab />}
        {tab === "help" && <HelpTab />}
        {tab === "errors" && <ErrorsTab />}
      </motion.div>
    </div>
  );
}

function Overview() {
  const [d, setD] = useState<any | null>(null);
  const [days, setDays] = useState(30);
  useEffect(() => { setD(null); api(`/api/admin/stats?days=${days}`).then(setD).catch(() => setD({ error: true })); }, [days]);
  if (!d) return <div className="grid gap-4 sm:grid-cols-4">{[0, 1, 2, 3].map((i) => <div key={i} className="skeleton h-28" />)}</div>;
  if (d.error) return <p className="text-rose-600">İstatistikler yüklenemedi (SUPABASE_SERVICE_ROLE_KEY tanımlı mı?).</p>;
  const tiles = [["Kullanıcı", d.users, `+${d.newUsers} yeni`], ["Proje", d.projects, ""], ["AI isteği", d.totals.ai, `${(d.totals.tokens / 1000).toFixed(0)}K token`], ["Tahmini API maliyeti", `$${d.totals.cost}`, `${days} gün`], ["Kaynak taraması", d.totals.search, ""], ["Dışa aktarma", d.totals.exports, ""], ["Hata", d.errors, `${days} gün`], ["Açık geri bildirim", d.openFeedback, ""]];
  return (
    <div className="space-y-6">
      <div className="flex justify-end gap-1">{[7, 30, 90].map((n) => <button key={n} onClick={() => setDays(n)} className={cn("rounded-lg px-3 py-1 text-sm", days === n ? "bg-ink-900 text-white" : "bg-white text-ink-600 ring-1 ring-ink-100")}>{n} gün</button>)}</div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{tiles.map(([l, v, sub]) => <div key={l as string} className="card p-4"><p className="text-[13px] text-ink-500">{l}</p><p className="mt-1 text-2xl font-semibold text-ink-900">{v}</p>{sub && <p className="text-xs text-ink-400">{sub}</p>}</div>)}</div>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card p-5"><DailyBars data={d.byDay} valueKey="ai" label="Günlük yapay zekâ istekleri" /></div>
        <div className="card p-5"><DailyBars data={d.byDay} valueKey="cost" label="Günlük tahmini API maliyeti (USD)" format={(v) => `$${v >= 10 ? v.toFixed(0) : v.toFixed(2)}`} /></div>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="card p-5">
          <h3 className="flex items-center gap-2 font-semibold"><DollarSign className="h-4 w-4" /> Modele göre kullanım</h3>
          <table className="mt-3 w-full text-sm"><thead className="text-left text-xs text-ink-400"><tr><th>Model</th><th>İstek</th><th>Token</th><th>Maliyet</th></tr></thead>
            <tbody>{Object.entries(d.byModel).map(([m, v]: any) => <tr key={m} className="border-t border-ink-100"><td className="py-1.5 font-mono text-[12px]">{m}</td><td>{v.requests}</td><td>{(v.tokens / 1000).toFixed(1)}K</td><td>${v.cost.toFixed(2)}</td></tr>)}</tbody></table>
          {Object.keys(d.byModel).length === 0 && <p className="mt-2 text-sm text-ink-400">Veri yok.</p>}
        </div>
        <div className="card p-5">
          <h3 className="font-semibold">Veri kaynağı sağlığı</h3>
          <div className="mt-3 space-y-1.5 text-sm">{Object.entries(d.providerHealth).map(([p, v]: any) => { const rate = Math.round((v.ok / (v.ok + v.fail)) * 100); return <div key={p} className="flex items-center justify-between"><span>{PROVIDER_LABELS[p as keyof typeof PROVIDER_LABELS] ?? p}</span><span className="flex items-center gap-1.5">{rate >= 90 ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> : <AlertOctagon className="h-3.5 w-3.5 text-amber-500" />}%{rate} başarı · {v.ok + v.fail} çağrı</span></div>; })}{Object.keys(d.providerHealth).length === 0 && <p className="text-ink-400">Henüz tarama yok.</p>}</div>
        </div>
        <div className="card p-5">
          <h3 className="font-semibold">Sistem entegrasyonları</h3>
          <div className="mt-3 space-y-1.5 text-sm">
            {Object.entries(d.integrations).map(([k, v]) => <p key={k} className="flex items-center gap-2">{v ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <CircleDashed className="h-4 w-4 text-ink-300" />}<span className={v ? "" : "text-ink-400"}>{k}</span></p>)}
            {d.payments.map((p: any) => <p key={p.id} className="flex items-center gap-2">{p.usable ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <CircleDashed className="h-4 w-4 text-ink-300" />}<span className={p.usable ? "" : "text-ink-400"}>{p.label}{!p.implemented && " (uygulanmadı)"}</span></p>)}
          </div>
          <h3 className="mt-5 font-semibold">Paket dağılımı</h3>
          <div className="mt-2 flex flex-wrap gap-1.5">{Object.entries(d.planDist).map(([k, v]) => <Badge key={k}>{k}: {v as number}</Badge>)}</div>
        </div>
      </div>
    </div>
  );
}

function UsersTab({ selfId }: { selfId: string }) {
  const toast = useToast();
  const [q, setQ] = useState("");
  const [query, setQuery] = useState("");
  const { rows, setRows, count, loading } = useRows("users", query);
  const plans = useRows("plans");
  async function patch(id: string, update: any) {
    try { const { row } = await api<{ row: any }>("/api/admin/users", { method: "PATCH", json: { id, ...update } }); setRows((l) => l.map((x) => (x.id === id ? { ...x, ...row } : x))); toast({ tone: "success", title: "Kullanıcı güncellendi" }); }
    catch (e) { toast({ tone: "error", title: "Güncellenemedi", detail: (e as Error).message }); }
  }
  return (
    <div className="card overflow-hidden">
      <form onSubmit={(e) => { e.preventDefault(); setQuery(q); }} className="flex gap-2 border-b border-ink-100 p-3"><div className="relative flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" /><input className="input pl-9" placeholder="E-posta ile ara" value={q} onChange={(e) => setQ(e.target.value)} /></div><Button type="submit" variant="secondary">Ara</Button></form>
      <div className="overflow-x-auto">
        <table className="w-full text-sm"><thead className="bg-ink-50 text-left text-xs uppercase text-ink-500"><tr><th className="px-4 py-2.5">Kullanıcı</th><th>Paket</th><th>Rol</th><th>Durum</th><th>Kayıt</th></tr></thead>
          <tbody>{rows.map((u) => (
            <tr key={u.id} className="border-t border-ink-100">
              <td className="px-4 py-2.5"><p className="font-medium text-ink-900">{u.full_name || "—"}</p><p className="text-xs text-ink-500">{u.email}</p></td>
              <td><select className="rounded-lg border border-ink-200 px-2 py-1 text-[13px]" value={u.plan_id} onChange={(e) => patch(u.id, { plan_id: e.target.value })}>{plans.rows.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></td>
              <td><select className="rounded-lg border border-ink-200 px-2 py-1 text-[13px]" value={u.role} disabled={u.id === selfId} onChange={(e) => patch(u.id, { role: e.target.value })}><option value="user">Kullanıcı</option><option value="admin">Yönetici</option></select></td>
              <td><button disabled={u.id === selfId} onClick={() => patch(u.id, { is_suspended: !u.is_suspended })}><Badge tone={u.is_suspended ? "red" : "green"}>{u.is_suspended ? "Askıda" : "Aktif"}</Badge></button></td>
              <td className="text-xs text-ink-500">{new Date(u.created_at).toLocaleDateString("tr-TR")}</td>
            </tr>
          ))}</tbody></table>
      </div>
      <p className="border-t border-ink-100 px-4 py-2 text-xs text-ink-400">{loading ? "Yükleniyor…" : `${count} kullanıcı`}</p>
    </div>
  );
}

const LIMIT_FIELDS: [string, string][] = [["ai_requests_month", "AI isteği / ay"], ["tokens_month", "Token / ay"], ["source_searches_month", "Kaynak taraması / ay"], ["projects", "Proje sayısı"], ["storage_mb", "Depolama (MB)"]];

function PlansTab() {
  const toast = useToast();
  const { rows, setRows, load } = useRows("plans");
  const [newId, setNewId] = useState("");
  function edit(id: string, update: any) { setRows((l) => l.map((p) => (p.id === id ? { ...p, ...update } : p))); }
  async function save(p: any) {
    try {
      await api("/api/admin/plans", { method: "PATCH", json: { id: p.id, name: p.name, description: p.description, price_monthly: Number(p.price_monthly), price_yearly: Number(p.price_yearly), is_active: p.is_active, features: p.features, limits: p.limits } });
      toast({ tone: "success", title: `${p.name} kaydedildi`, detail: "Yeni limitler hemen geçerli olur." });
    } catch (e) { toast({ tone: "error", title: "Kaydedilemedi", detail: (e as Error).message }); }
  }
  async function create() {
    try { await api("/api/admin/plans", { method: "POST", json: { id: newId, name: newId } }); setNewId(""); load(); } catch (e) { toast({ tone: "error", title: "Oluşturulamadı", detail: (e as Error).message }); }
  }
  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-2">
        {rows.map((p) => (
          <div key={p.id} className="card space-y-3 p-5">
            <div className="flex items-center justify-between"><input className="input !w-auto !py-1.5 font-semibold" value={p.name} onChange={(e) => edit(p.id, { name: e.target.value })} /><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={p.is_active} onChange={(e) => edit(p.id, { is_active: e.target.checked })} /> Aktif</label></div>
            <input className="input !py-2 text-sm" value={p.description} onChange={(e) => edit(p.id, { description: e.target.value })} />
            <div className="grid grid-cols-2 gap-2"><div><label className="label">Aylık fiyat ({p.currency})</label><input className="input !py-2" type="number" value={p.price_monthly} onChange={(e) => edit(p.id, { price_monthly: e.target.value })} /></div><div><label className="label">Yıllık fiyat</label><input className="input !py-2" type="number" value={p.price_yearly} onChange={(e) => edit(p.id, { price_yearly: e.target.value })} /></div></div>
            <div className="grid grid-cols-2 gap-2">
              {LIMIT_FIELDS.map(([k, l]) => <div key={k}><label className="label">{l}</label><input className="input !py-2" placeholder="Sınırsız" value={p.limits?.[k] ?? ""} onChange={(e) => edit(p.id, { limits: { ...p.limits, [k]: e.target.value === "" ? null : Number(e.target.value.replace(/\D/g, "")) } })} /></div>)}
              <div><label className="label">Dışa aktarma</label><div className="flex flex-wrap gap-2 pt-1">{["txt", "md", "docx", "pdf"].map((f) => <label key={f} className="flex items-center gap-1 text-[13px]"><input type="checkbox" checked={(p.limits?.export_formats ?? []).includes(f)} onChange={(e) => edit(p.id, { limits: { ...p.limits, export_formats: e.target.checked ? [...(p.limits?.export_formats ?? []), f] : (p.limits?.export_formats ?? []).filter((x: string) => x !== f) } })} />{f.toUpperCase()}</label>)}</div></div>
            </div>
            <div><label className="label">Özellikler (her satır bir madde)</label><textarea className="input min-h-[90px] text-sm" value={(p.features ?? []).join("\n")} onChange={(e) => edit(p.id, { features: e.target.value.split("\n").filter(Boolean) })} /></div>
            <Button size="sm" onClick={() => save(p)}><Save className="h-3.5 w-3.5" /> Kaydet</Button>
          </div>
        ))}
      </div>
      <div className="card flex items-center gap-2 p-4"><input className="input" placeholder="yeni-paket-kimligi (ör. kurumsal)" value={newId} onChange={(e) => setNewId(e.target.value.toLowerCase())} /><Button onClick={create} disabled={!/^[a-z0-9_-]{2,40}$/.test(newId)}><Plus className="h-4 w-4" /> Paket ekle</Button></div>
    </div>
  );
}

function useSettings() {
  const { rows, load } = useRows("settings");
  const get = (k: string) => rows.find((r) => r.key === k)?.value;
  return { get, load, ready: rows.length > 0 };
}

function AiTab() {
  const toast = useToast();
  const { get, load, ready } = useSettings();
  const [models, setModels] = useState("");
  const [system, setSystem] = useState("");
  const [stageKey, setStageKey] = useState("concepts");
  const [stagePrompts, setStagePrompts] = useState<Record<string, string>>({});
  const [rate, setRate] = useState({ ai_per_minute: 12, search_per_minute: 30 });
  useEffect(() => {
    if (!ready) return;
    setModels(JSON.stringify(get("ai.models") ?? {}, null, 2));
    setSystem(get("ai.system_prompt")?.text ?? "");
    setStagePrompts(get("ai.stage_prompts") ?? {});
    setRate(get("limits.rate") ?? rate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);
  async function put(key: string, value: unknown) {
    try { await api("/api/admin/settings", { method: "PATCH", json: { id: key, value } }); toast({ tone: "success", title: "Ayar kaydedildi", detail: "En geç 30 saniye içinde tüm sunucularda geçerli olur." }); load(); }
    catch (e) { toast({ tone: "error", title: "Kaydedilemedi", detail: (e as Error).message }); }
  }
  function saveModels() {
    try { put("ai.models", JSON.parse(models)); } catch { toast({ tone: "error", title: "Geçersiz JSON" }); }
  }
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="card space-y-3 p-5">
        <h3 className="font-semibold">Model yapılandırması</h3>
        <p className="text-[13px] text-ink-500">Katmanlar: <code>default</code>, <code>balanced</code>, <code>fast</code>, <code>premium</code>. Her katman bir sağlayıcı (<code>anthropic</code> | <code>openai</code>) ve model kimliği içerir. Model pakete göre değil işe göre seçilir: <code>fast</code> basit düzenlemeler, <code>balanced</code> yazım, <code>default</code> karmaşık analiz; <code>pricing_per_mtok</code> maliyet tahmini içindir.</p>
        <textarea className="input min-h-[360px] font-mono text-[12px]" value={models} onChange={(e) => setModels(e.target.value)} spellCheck={false} />
        <Button size="sm" onClick={saveModels}><Save className="h-3.5 w-3.5" /> Kaydet</Button>
      </div>
      <div className="space-y-4">
        <div className="card space-y-3 p-5">
          <h3 className="font-semibold">Ana sistem promptu</h3>
          <textarea className="input min-h-[220px] text-[13px]" value={system} onChange={(e) => setSystem(e.target.value)} />
          <Button size="sm" onClick={() => put("ai.system_prompt", { text: system })}><Save className="h-3.5 w-3.5" /> Kaydet</Button>
        </div>
        <div className="card space-y-3 p-5">
          <h3 className="font-semibold">Bölüme özel talimatlar</h3>
          <select className="input" value={stageKey} onChange={(e) => setStageKey(e.target.value)}>{Object.values(STAGE_LIBRARY).map((s) => <option key={s.key} value={s.key}>{s.title}{stagePrompts[s.key] ? " ●" : ""}</option>)}</select>
          <textarea className="input min-h-[120px] text-[13px]" placeholder="Bu bölümün asistanına eklenecek talimat (boş = yok)" value={stagePrompts[stageKey] ?? ""} onChange={(e) => setStagePrompts({ ...stagePrompts, [stageKey]: e.target.value })} />
          <Button size="sm" onClick={() => put("ai.stage_prompts", Object.fromEntries(Object.entries(stagePrompts).filter(([, v]) => v.trim())))}><Save className="h-3.5 w-3.5" /> Kaydet</Button>
        </div>
        <div className="card space-y-3 p-5">
          <h3 className="font-semibold">Dakikalık hız sınırları (kullanıcı başına)</h3>
          <div className="grid grid-cols-2 gap-2"><div><label className="label">AI istekleri</label><input className="input" type="number" value={rate.ai_per_minute} onChange={(e) => setRate({ ...rate, ai_per_minute: Number(e.target.value) })} /></div><div><label className="label">Kaynak taramaları</label><input className="input" type="number" value={rate.search_per_minute} onChange={(e) => setRate({ ...rate, search_per_minute: Number(e.target.value) })} /></div></div>
          <Button size="sm" onClick={() => put("limits.rate", rate)}><Save className="h-3.5 w-3.5" /> Kaydet</Button>
        </div>
      </div>
    </div>
  );
}

function SourcesTab() {
  const toast = useToast();
  const { get, load, ready } = useSettings();
  const [enabled, setEnabled] = useState<Record<string, boolean>>({});
  useEffect(() => {
    if (ready) setEnabled({ turkiye: true, ...(get("sources.enabled") ?? {}) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);
  async function toggle(k: string) {
    const next = { ...enabled, [k]: !enabled[k] };
    setEnabled(next);
    try { await api("/api/admin/settings", { method: "PATCH", json: { id: "sources.enabled", value: next } }); load(); } catch (e) { toast({ tone: "error", title: "Kaydedilemedi", detail: (e as Error).message }); }
  }
  const notes: Record<string, string> = { turkiye: "OpenAlex üzerinden Türkçe ve Türkiye adresli yayınlar (DergiPark dergileri dahil).", core: "CORE_API_KEY gerektirir.", unpaywall: "Yalnızca DOI ile açık erişim bulma; ACADEMIC_CONTACT_EMAIL gerektirir.", google_books: "Yalnızca kitap künyesi; açıklamalar özet olarak kullanılmaz. Kullanım koşullarını kontrol edin.", semantic_scholar: "Anahtarsız kullanımda düşük hız limiti vardır.", openaire: "Graph API v1." };
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {Object.entries(PROVIDER_LABELS).map(([k, l]) => (
        <div key={k} className="card flex items-center justify-between gap-4 p-4">
          <div><p className="font-medium">{l}</p><p className="text-[13px] text-ink-500">{notes[k] ?? "Ücretsiz, açık API."}</p></div>
          <button onClick={() => toggle(k)} role="switch" aria-checked={!!enabled[k]} className={cn("relative h-6 w-11 shrink-0 rounded-full transition", enabled[k] ? "bg-brand-600" : "bg-ink-200")}><motion.span layout className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow" style={{ left: enabled[k] ? 22 : 2 }} /></button>
        </div>
      ))}
    </div>
  );
}

/** Büyüme ve iletişim ayarları: davet ödülü, iletişim e-postası */
function GrowthSettings() {
  const toast = useToast();
  const { get, load, ready } = useSettings();
  const [ref, setRef] = useState({ enabled: true, ai_requests: 50, source_searches: 50, valid_days: 60, monthly_cap: 20 });
  const [email, setEmail] = useState("");
  useEffect(() => {
    if (!ready) return;
    const rf = get("referral"); if (rf) setRef((r) => ({ ...r, ...rf }));
    setEmail(get("site.contact")?.email ?? "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);
  async function save() {
    try {
      await api("/api/admin/settings", { method: "PATCH", json: { id: "referral", value: { enabled: ref.enabled, ai_requests: Number(ref.ai_requests) || 0, source_searches: Number(ref.source_searches) || 0, valid_days: Number(ref.valid_days) || 30, monthly_cap: Number(ref.monthly_cap) || 0 } } });
      await api("/api/admin/settings", { method: "PATCH", json: { id: "site.contact", value: { email: email.trim() } } });
      toast({ tone: "success", title: "Ayarlar kaydedildi" }); load();
    } catch (e) { toast({ tone: "error", title: "Kaydedilemedi", detail: (e as Error).message }); }
  }
  const n = (v: number, f: (x: number) => void) => <input className="input !py-1.5" type="number" value={v} onChange={(e) => f(Number(e.target.value))} />;
  return (
    <div className="card h-fit space-y-3 p-5">
      <h3 className="font-semibold">Davet ve iletişim</h3>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={ref.enabled} onChange={(e) => setRef({ ...ref, enabled: e.target.checked })} /> Davet programı etkin</label>
      <div className="grid grid-cols-2 gap-2 text-xs text-ink-500">
        <label>AI isteği ödülü{n(ref.ai_requests, (x) => setRef({ ...ref, ai_requests: x }))}</label>
        <label>Tarama ödülü{n(ref.source_searches, (x) => setRef({ ...ref, source_searches: x }))}</label>
        <label>Geçerlilik (gün){n(ref.valid_days, (x) => setRef({ ...ref, valid_days: x }))}</label>
        <label>Aylık ödül sınırı (davet eden){n(ref.monthly_cap, (x) => setRef({ ...ref, monthly_cap: x }))}</label>
      </div>
      <label className="block text-xs text-ink-500">Kurum teklifleri için iletişim e-postası<input className="input !py-1.5" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="iletisim@alanadi.com" /></label>
      <Button onClick={save}>Kaydet</Button>
    </div>
  );
}

function OrgsTab() {
  const toast = useToast();
  const { rows, load } = useRows("organizations");
  const [form, setForm] = useState({ name: "", plan_id: "pro", seats: 50, email_domain: "", expires_at: "" });
  const [adminEmail, setAdminEmail] = useState<Record<string, string>>({});
  async function create() {
    try {
      await api("/api/admin/organizations", { method: "POST", json: { name: form.name, plan_id: form.plan_id, seats: Number(form.seats) || 1, email_domain: form.email_domain.trim() || null, expires_at: form.expires_at ? new Date(`${form.expires_at}T23:59:59`).toISOString() : null } });
      setForm({ name: "", plan_id: "pro", seats: 50, email_domain: "", expires_at: "" }); load();
    } catch (e) { toast({ tone: "error", title: "Oluşturulamadı", detail: (e as Error).message }); }
  }
  async function setAdmin(orgId: string) {
    try { await api("/api/admin/org-member", { method: "POST", json: { orgId, email: adminEmail[orgId], role: "admin" } }); toast({ tone: "success", title: "Kurum yöneticisi atandı" }); setAdminEmail((m) => ({ ...m, [orgId]: "" })); }
    catch (e) { toast({ tone: "error", title: "Atanamadı", detail: (e as Error).message }); }
  }
  return (
    <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
      <div className="space-y-4">
      <div className="card h-fit space-y-3 p-5">
        <h3 className="font-semibold">Yeni kurum lisansı</h3>
        <input className="input" placeholder="Kurum adı (ör. Hacettepe Üniversitesi SBE)" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <div className="grid grid-cols-2 gap-2">
          <select className="input" value={form.plan_id} onChange={(e) => setForm({ ...form, plan_id: e.target.value })}><option value="basic">Basic</option><option value="pro">Pro</option><option value="premium">Premium</option></select>
          <input className="input" type="number" min={1} placeholder="Kullanıcı sayısı" value={form.seats} onChange={(e) => setForm({ ...form, seats: Number(e.target.value) })} />
        </div>
        <input className="input" placeholder="E-posta alan adı (isteğe bağlı, ör. hacettepe.edu.tr)" value={form.email_domain} onChange={(e) => setForm({ ...form, email_domain: e.target.value })} />
        <label className="block"><span className="label">Bitiş tarihi (isteğe bağlı)</span><input className="input" type="date" value={form.expires_at} onChange={(e) => setForm({ ...form, expires_at: e.target.value })} /></label>
        <Button onClick={create} disabled={!form.name.trim()}>Oluştur</Button>
        <p className="text-xs text-ink-500">Oluşturduktan sonra kurum yöneticisinin e-postasını girip atayın. Katılım kodunu kuruma iletin; kullanıcılar Hesap sayfasından katılır.</p>
      </div>
      <GrowthSettings />
      </div>
      <div className="space-y-2">
        {rows.length === 0 && <Empty icon={<Users className="h-5 w-5" />} title="Kurum yok" />}
        {rows.map((o) => (
          <div key={o.id} className="card space-y-2 p-4">
            <div className="flex flex-wrap items-center gap-2">
              <p className="flex-1 font-medium">{o.name}</p>
              <Badge tone="brand">{o.plan_id}</Badge><Badge>{o.seats} kullanıcı</Badge>
              <code className="rounded bg-ink-100 px-2 py-0.5 text-xs">{o.join_code}</code>
              <button onClick={async () => { await api("/api/admin/organizations", { method: "PATCH", json: { id: o.id, active: !o.active } }); load(); }}><Badge tone={o.active ? "green" : "ink"}>{o.active ? "Etkin" : "Pasif"}</Badge></button>
            </div>
            <p className="text-xs text-ink-500">{o.email_domain ? `Yalnızca @${o.email_domain}` : "Alan adı kısıtı yok"}{o.expires_at ? ` · bitiş ${new Date(o.expires_at).toLocaleDateString("tr-TR")}` : ""}</p>
            <div className="flex gap-2"><input className="input !py-1.5 text-sm" placeholder="Kurum yöneticisi e-postası" value={adminEmail[o.id] ?? ""} onChange={(e) => setAdminEmail((m) => ({ ...m, [o.id]: e.target.value }))} /><Button size="sm" onClick={() => setAdmin(o.id)} disabled={!adminEmail[o.id]?.includes("@")}>Yönetici ata</Button></div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AnnouncementsTab() {
  const toast = useToast();
  const { rows, load } = useRows("announcements");
  const [form, setForm] = useState({ title: "", body: "", level: "info" });
  async function create() {
    try { await api("/api/admin/announcements", { method: "POST", json: form }); setForm({ title: "", body: "", level: "info" }); load(); } catch (e) { toast({ tone: "error", title: "Oluşturulamadı", detail: (e as Error).message }); }
  }
  return (
    <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
      <div className="card h-fit space-y-3 p-5">
        <h3 className="font-semibold">Yeni duyuru</h3>
        <input className="input" placeholder="Başlık" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <textarea className="input min-h-[100px]" placeholder="Metin" value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} />
        <select className="input" value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })}><option value="info">Bilgi</option><option value="success">Başarı</option><option value="warning">Uyarı</option><option value="critical">Kritik</option></select>
        <Button onClick={create} disabled={!form.title.trim()}>Yayınla</Button>
      </div>
      <div className="space-y-2">
        {rows.length === 0 && <Empty icon={<Megaphone className="h-5 w-5" />} title="Duyuru yok" />}
        {rows.map((a) => (
          <div key={a.id} className="card flex items-start gap-3 p-4">
            <div className="flex-1"><p className="font-medium">{a.title} <Badge tone={a.level === "critical" ? "red" : a.level === "warning" ? "amber" : "brand"}>{a.level}</Badge></p><p className="text-sm text-ink-600">{a.body}</p></div>
            <button onClick={async () => { await api("/api/admin/announcements", { method: "PATCH", json: { id: a.id, is_active: !a.is_active } }); load(); }}><Badge tone={a.is_active ? "green" : "ink"}>{a.is_active ? "Yayında" : "Pasif"}</Badge></button>
            <button onClick={async () => { await api("/api/admin/announcements", { method: "DELETE", json: { id: a.id } }); load(); }} className="text-ink-300 hover:text-rose-500" aria-label="Sil"><Trash2 className="h-4 w-4" /></button>
          </div>
        ))}
      </div>
    </div>
  );
}

function FeedbackTab() {
  const { rows, setRows } = useRows("feedback");
  async function patch(id: string, update: any) { await api("/api/admin/feedback", { method: "PATCH", json: { id, ...update } }); setRows((l) => l.map((x) => (x.id === id ? { ...x, ...update } : x))); }
  return (
    <div className="space-y-2">
      {rows.length === 0 && <Empty icon={<MessagesSquare className="h-5 w-5" />} title="Geri bildirim yok" />}
      {rows.map((f) => (
        <div key={f.id} className="card p-4">
          <div className="flex flex-wrap items-center gap-2 text-xs text-ink-500"><Badge>{f.category}</Badge><span>{f.page}</span><span>{new Date(f.created_at).toLocaleString("tr-TR")}</span>
            <select className="ml-auto rounded-lg border border-ink-200 px-2 py-1 text-[13px]" value={f.status} onChange={(e) => patch(f.id, { status: e.target.value })}><option value="open">Açık</option><option value="in_progress">İnceleniyor</option><option value="resolved">Çözüldü</option><option value="closed">Kapalı</option></select>
          </div>
          <p className="mt-2 whitespace-pre-line text-sm text-ink-800">{f.message}</p>
          <input className="input mt-2 !py-1.5 text-sm" placeholder="Yönetici notu" defaultValue={f.admin_note} onBlur={(e) => e.target.value !== f.admin_note && patch(f.id, { admin_note: e.target.value })} />
        </div>
      ))}
    </div>
  );
}

function HelpTab() {
  const toast = useToast();
  const { rows, setRows, load } = useRows("help");
  const [slug, setSlug] = useState("");
  async function save(a: any) {
    try { await api("/api/admin/help", { method: "PATCH", json: { id: a.id, title: a.title, body: a.body, category: a.category, is_published: a.is_published } }); toast({ tone: "success", title: "Makale kaydedildi" }); } catch (e) { toast({ tone: "error", title: "Kaydedilemedi", detail: (e as Error).message }); }
  }
  const edit = (id: string, u: any) => setRows((l) => l.map((x) => (x.id === id ? { ...x, ...u } : x)));
  return (
    <div className="space-y-3">
      <div className="card flex gap-2 p-4"><input className="input" placeholder="yeni-makale-slug" value={slug} onChange={(e) => setSlug(e.target.value.toLowerCase())} /><Button disabled={!/^[a-z0-9-]{2,80}$/.test(slug)} onClick={async () => { try { await api("/api/admin/help", { method: "POST", json: { slug, title: slug } }); setSlug(""); load(); } catch (e) { toast({ tone: "error", title: "Oluşturulamadı", detail: (e as Error).message }); } }}><Plus className="h-4 w-4" /> Makale ekle</Button></div>
      {rows.map((a) => (
        <div key={a.id} className="card space-y-2 p-4">
          <div className="flex gap-2"><input className="input font-medium" value={a.title} onChange={(e) => edit(a.id, { title: e.target.value })} /><input className="input !w-40" value={a.category} onChange={(e) => edit(a.id, { category: e.target.value })} /></div>
          <textarea className="input min-h-[100px] text-sm" value={a.body} onChange={(e) => edit(a.id, { body: e.target.value })} />
          <div className="flex items-center gap-3"><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={a.is_published} onChange={(e) => edit(a.id, { is_published: e.target.checked })} /> Yayında</label><Button size="sm" onClick={() => save(a)}><Save className="h-3.5 w-3.5" /> Kaydet</Button><button className="ml-auto text-sm text-rose-500" onClick={async () => { await api("/api/admin/help", { method: "DELETE", json: { id: a.id } }); load(); }}>Sil</button></div>
        </div>
      ))}
    </div>
  );
}

function ErrorsTab() {
  const { rows, load, loading } = useRows("errors");
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between border-b border-ink-100 px-4 py-2.5"><span className="text-sm text-ink-500">Son hata kayıtları</span><Button size="sm" variant="ghost" onClick={load} loading={loading}><RefreshCw className="h-3.5 w-3.5" /> Yenile</Button></div>
      {rows.length === 0 && <p className="p-6 text-center text-sm text-ink-400">Kayıt yok.</p>}
      {rows.map((e) => (
        <div key={e.id} className="border-t border-ink-100 px-4 py-2.5 text-sm">
          <button onClick={() => setOpen(open === e.id ? null : e.id)} className="flex w-full items-center gap-3 text-left"><code className="shrink-0 rounded bg-ink-100 px-1.5 text-[12px]">{e.route}</code><span className="flex-1 truncate text-ink-700">{e.message}</span><span className="shrink-0 text-xs text-ink-400">{new Date(e.created_at).toLocaleString("tr-TR")}</span></button>
          {open === e.id && <pre className="mt-2 max-h-72 overflow-auto rounded-xl bg-ink-950 p-3 text-[11px] text-ink-100">{e.stack ?? JSON.stringify(e.meta, null, 2)}</pre>}
        </div>
      ))}
    </div>
  );
}
/* eslint-enable @typescript-eslint/no-explicit-any */
