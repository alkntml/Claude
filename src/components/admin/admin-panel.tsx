"use client";
import { AutopilotTab } from "./autopilot";
import { motion } from "framer-motion";
import { Activity, BarChart3, Building2, Gift, Lock, AlertOctagon, Bot, CheckCircle2, CircleDashed, Database, DollarSign, FileQuestion, Megaphone, MessagesSquare, Package, Plus, RefreshCw, Save, Search, Trash2, Users, Rocket } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/components/ui/cn";
import { Badge, Empty, Modal } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/toast";
import { api } from "@/lib/client";
import { PROVIDER_LABELS } from "@/lib/sources/labels";
import { STAGE_LIBRARY } from "@/lib/workflows";
import { BarList, Donut, RangePicker, StatTile, TimeSeries } from "@/components/ui/charts";
import { CostBreakdown, TrafficTab } from "./insights";
import { memberCode } from "@/lib/member";

/* eslint-disable @typescript-eslint/no-explicit-any */
type Tab = "autopilot" | "overview" | "traffic" | "users" | "plans" | "orgs" | "ai" | "sources" | "announcements" | "feedback" | "help" | "errors" | "locks" | "referrals";
const TABS: { id: Tab; label: string; icon: any }[] = [
  { id: "overview", label: "Genel bakış", icon: Activity }, { id: "traffic", label: "Ziyaretçiler", icon: BarChart3 }, { id: "autopilot", label: "Otomatik çalışma", icon: Rocket }, { id: "users", label: "Kullanıcılar", icon: Users }, { id: "plans", label: "Paketler ve limitler", icon: Package }, { id: "orgs", label: "Kurumlar", icon: Building2 },
  { id: "ai", label: "Yapay zekâ", icon: Bot }, { id: "sources", label: "Veri kaynakları", icon: Database }, { id: "announcements", label: "Duyurular", icon: Megaphone },
  { id: "feedback", label: "Geri bildirim", icon: MessagesSquare }, { id: "help", label: "Yardım merkezi", icon: FileQuestion }, { id: "errors", label: "Hata kayıtları", icon: AlertOctagon }, { id: "locks", label: "Kilitler ve indirme", icon: Lock }, { id: "referrals", label: "Davetler", icon: Gift },
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
  // ?sekme=otomatik ile doğrudan otomatik çalışma sekmesi açılır
  const [tab, setTab] = useState<Tab>("overview");
  useEffect(() => { if (new URLSearchParams(window.location.search).get("sekme") === "otomatik") setTab("autopilot"); }, []);
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
        {tab === "traffic" && <TrafficTab />}
        {tab === "autopilot" && <AutopilotTab />}
        {tab === "users" && <UsersTab selfId={selfId} />}
        {tab === "plans" && <PlansTab />}
        {tab === "orgs" && <OrgsTab />}
        {tab === "ai" && <AiTab />}
        {tab === "sources" && <SourcesTab />}
        {tab === "announcements" && <AnnouncementsTab />}
        {tab === "feedback" && <FeedbackTab />}
        {tab === "help" && <HelpTab />}
        {tab === "errors" && <ErrorsTab />}
        {tab === "locks" && <LocksTab />}
        {tab === "referrals" && <ReferralsTab />}
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
  const fmtN = (v: number) => Math.round(v).toLocaleString("tr-TR");
  const usd = (v: number) => (v < 10 ? `$${v.toFixed(2)}` : `$${v.toFixed(0)}`);
  const spark = (k: string) => d.byDay.map((x: any) => Number(x[k]) || 0);
  return (
    <div className="space-y-6">
      <div className="flex justify-end"><RangePicker value={days} onChange={setDays} /></div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile label="Kullanıcı" value={fmtN(d.users)} sub={`+${fmtN(d.newUsers)} yeni · ${days} gün`} />
        <StatTile label="Proje" value={fmtN(d.projects)} />
        <StatTile label="Yapay zekâ isteği" value={fmtN(d.totals.ai)} sub={`${(d.totals.tokens / 1000).toFixed(0)}K token`} spark={spark("ai")} />
        <StatTile label="Tahmini API maliyeti" value={usd(d.totals.cost)} sub={`${days} gün · ücretsiz araçlar dahil`} spark={spark("cost")} />
        <StatTile label="Kaynak taraması" value={fmtN(d.totals.search)} spark={spark("search")} />
        <StatTile label="Dışa aktarma" value={fmtN(d.totals.exports)} />
        <StatTile label="Hata" value={fmtN(d.errors)} sub={`${days} gün`} tone={d.errors > 0 ? "bad" : undefined} />
        <StatTile label="Açık geri bildirim" value={fmtN(d.openFeedback)} />
      </div>
      {d.money && (
        <div className="card p-5">
          <div className="flex flex-wrap items-center justify-between gap-2"><h3 className="flex items-center gap-2 font-semibold"><DollarSign className="h-4 w-4" /> Bu ay gelir ve kâr</h3><span className="text-xs text-ink-400">Kur: {d.money.usdTry} TL · gelir KDV hariç, süresi geçerli ücretli kullanıcılardan tahmini</span></div>
          <div className="mt-3 grid gap-3 sm:grid-cols-4">
            {[["Ücretli kullanıcı", d.money.paidUsers.toLocaleString("tr-TR"), ""], ["Aylık gelir", `${d.money.revenueTry.toLocaleString("tr-TR")} TL`, ""], ["API maliyeti", `${d.money.costTry.toLocaleString("tr-TR")} TL`, d.money.costShare != null ? `gelirin %${d.money.costShare}’i` : ""], ["Kâr", `${d.money.profitTry.toLocaleString("tr-TR")} TL`, d.money.costShare != null ? (d.money.costShare <= 33 ? "hedefte (≤ %33 maliyet)" : "maliyet hedefin üstünde") : ""]].map(([l, v, sub]) => (
              <div key={l} className="rounded-xl bg-ink-50 p-3"><p className="text-[12.5px] text-ink-500">{l}</p><p className={cn("mt-0.5 text-xl font-semibold", l === "Kâr" && d.money.profitTry < 0 ? "text-rose-600" : "text-ink-900")}>{v}</p>{sub && <p className="text-[11.5px] text-ink-400">{sub}</p>}</div>
            ))}
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm font-medium">7 gün içinde süresi bitecekler ({d.expiring.length})</p>
              {d.expiring.length === 0 && <p className="mt-1 text-sm text-ink-400">Yok.</p>}
              {d.expiring.map((u: any) => <p key={u.id} className="flex justify-between border-t border-ink-50 py-1 text-[13px]"><span className="truncate">{u.full_name || u.email} <span className="text-ink-400">· {u.plan_id}</span></span><span className="shrink-0 text-amber-700">{new Date(u.plan_expires_at).toLocaleDateString("tr-TR")}</span></p>)}
            </div>
          </div>
        </div>
      )}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card p-5"><TimeSeries data={d.byDay} series={[{ key: "ai", label: "Yapay zekâ isteği" }]} title="Günlük yapay zekâ istekleri" format={fmtN} /></div>
        <div className="card p-5"><TimeSeries data={d.byDay} series={[{ key: "search", label: "Kaynak taraması" }]} title="Günlük kaynak taramaları" format={fmtN} /></div>
      </div>
      {d.costHealth && <CostHealth h={d.costHealth} days={days} usdTry={d.money?.usdTry} />}
      <div>
        <h3 className="mb-3 flex items-center gap-2 font-semibold"><DollarSign className="h-4 w-4" /> API maliyeti sayacı: hangi özellik ve araç ne kadar harcıyor?</h3>
        <CostBreakdown days={days} />
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="card p-5">
          <Donut title="Modele göre API maliyeti" parts={Object.entries(d.byModel).map(([m, v]: any) => ({ label: m.replace(/^claude-/, ""), value: Math.round(v.cost * 100) / 100 }))} format={usd} centerLabel={`${days} gün`} />
          <div className="mt-4 space-y-1 text-xs text-ink-500">{Object.entries(d.byModel).map(([m, v]: any) => <p key={m} className="flex justify-between"><span className="font-mono">{m}</span><span>{fmtN(v.requests)} istek · {(v.tokens / 1000).toFixed(0)}K token</span></p>)}</div>
        </div>
        <div className="card p-5">
          <BarList title="Veri kaynağı sağlığı" subtitle="Başarılı çağrı oranı (%)" color={2} format={(v) => `%${Math.round(v)}`} items={Object.entries(d.providerHealth).filter(([p]) => p in PROVIDER_LABELS).map(([p, v]: any) => ({ label: PROVIDER_LABELS[p as keyof typeof PROVIDER_LABELS] ?? p, value: Math.round((v.ok / (v.ok + v.fail)) * 100), sub: `${v.ok + v.fail} çağrı${v.ok / (v.ok + v.fail) < 0.9 && v.lastError ? ` · son hata: ${v.lastError}` : ""}` }))} empty="Henüz tarama yok." />
        </div>
        <div className="card p-5">
          <h3 className="font-semibold">Sistem entegrasyonları</h3>
          <div className="mt-3 space-y-1.5 text-sm">
            {Object.entries(d.integrations).map(([k, v]) => <p key={k} className="flex items-center gap-2">{v ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <CircleDashed className="h-4 w-4 text-ink-300" />}<span className={v ? "" : "text-ink-400"}>{k}</span></p>)}
            {d.payments.map((p: any) => <p key={p.id} className="flex items-center gap-2">{p.usable ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <CircleDashed className="h-4 w-4 text-ink-300" />}<span className={p.usable ? "" : "text-ink-400"}>{p.label}{!p.implemented && " (uygulanmadı)"}</span></p>)}
          </div>
          <div className="mt-5"><Donut title="Paket dağılımı" parts={Object.entries(d.planDist).map(([k, v]) => ({ label: k, value: v as number }))} format={fmtN} centerLabel="kullanıcı" /></div>
        </div>
      </div>
    </div>
  );
}

/** Maliyet sağlığı (D94): ay sonu tahmini, ortalama istek maliyeti, önbellek tasarrufu, kaçak maliyetler, en çok harcayanlar */
function CostHealth({ h, days, usdTry }: { h: any; days: number; usdTry?: number }) {
  const usd = (v: number | null | undefined) => (v == null ? "—" : v < 0.1 ? `$${v.toFixed(4)}` : v < 10 ? `$${v.toFixed(2)}` : `$${v.toFixed(0)}`);
  const tl = (v: number | null | undefined) => (v == null || !usdTry ? "" : `≈ ${Math.round(v * usdTry).toLocaleString("tr-TR")} TL`);
  const avgOver = h.avgRequestUsd != null && h.assumedAvgRequestUsd && h.avgRequestUsd > h.assumedAvgRequestUsd * 1.15;
  return (
    <div className="card p-5">
      <h3 className="flex items-center gap-2 font-semibold"><DollarSign className="h-4 w-4" /> Maliyet sağlığı</h3>
      <p className="mt-0.5 text-xs text-ink-400">Fiyatlar model bazında hesaplanır (Opus önbellek okuma %5, diğerleri %10; Haiku’da 100 bin token üstü istem daha pahalı). Kesilen, iptal edilen ve yanıtı okunamayan çağrılar da maliyete dahildir.</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile label="Bu ay harcanan" value={usd(h.monthUsd)} sub={tl(h.monthUsd)} />
        <StatTile label="Ay sonu tahmini" value={usd(h.monthProjectionUsd)} sub={h.monthProjectionUsd != null ? tl(h.monthProjectionUsd) : "ayın ilk saatleri"} />
        <StatTile label="Ortalama istek maliyeti" value={usd(h.avgRequestUsd)} sub={`limit hesabındaki varsayım: ${usd(h.assumedAvgRequestUsd)}`} tone={avgOver ? "bad" : undefined} />
        <StatTile label="Önbellek tasarrufu" value={usd(h.cache.savingsUsd)} sub={`girdinin %${h.cache.hitRate}’i önbellekten · ${days} gün`} />
      </div>
      {avgOver && <p className="mt-3 rounded-xl bg-amber-50 p-3 text-[13px] text-amber-900">Gerçek ortalama istek maliyeti, paket sınırlarının hesaplandığı varsayımdan %15’ten fazla yüksek. Ayarlar → Kârlılık’taki “ortalama istek maliyeti”ni güncellemeyi veya paket sınırlarını gözden geçirmeyi düşünün.</p>}
      {h.fx?.stale && <p className="mt-3 rounded-xl bg-amber-50 p-3 text-[13px] text-amber-900">Dolar kuru ayarı ({h.fx.usdTry} TL) {h.fx.ageDays != null ? `${h.fx.ageDays} gündür` : "uzun süredir"} güncellenmedi. Paket bütçeleri ve sayfa vaatleri bu kura göre hesaplanıyor; kur yükseldiyse gerçek maliyet payı 1/3’ü aşar. Ayarlar → Kârlılık’tan güncel kuru girin (kur her %10 arttığında vaat edilebilecek sayfa ~%9 düşer).</p>}
      {h.unpriced?.length > 0 && <p className="mt-3 rounded-xl bg-amber-50 p-3 text-[13px] text-amber-900">Fiyat tablosunda birebir karşılığı olmayan model(ler): <span className="font-mono">{h.unpriced.join(", ")}</span>. Maliyetleri aynı ailenin fiyatından (ör. Opus) veya en yüksek fiyattan tahmin edildi; Ayarlar’daki fiyat tablosuna ekleyin.</p>}
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="space-y-1.5 text-[13px]">
          <p className="font-medium text-ink-800">Son {days} günün dökümü</p>
          <p className="flex justify-between gap-3"><span className="text-ink-500">Uygulama özellikleri (yapay zekâ)</span><span>{usd(h.aiCost)} · {h.requests.toLocaleString("tr-TR")} istek</span></p>
          <p className="flex justify-between gap-3"><span className="text-ink-500">Ücretsiz araçlar</span><span>{usd(h.toolCost)}</span></p>
          <p className="flex justify-between gap-3"><span className="text-ink-500">Yarıda kesilen / iptal edilen yanıtlar</span><span>{usd(h.partialUsd)}</span></p>
          <p className="flex justify-between gap-3"><span className="text-ink-500">Yanıtı okunamayan çağrılar (hak düşülmedi)</span><span>{usd(h.failedUsd)}</span></p>
          <p className="flex justify-between gap-3"><span className="text-ink-500">Önbellek: okunan / yazılan token</span><span>{(h.cache.readTokens / 1000).toFixed(0)}K / {(h.cache.writeTokens / 1000).toFixed(0)}K</span></p>
        </div>
        <BarList title="Bu ay en çok maliyet oluşturan kullanıcılar" subtitle="Kötüye kullanım veya paket uyumsuzluğu kontrolü için" color={1} format={(v) => usd(v)} limit={10} empty="Bu ay henüz maliyet yok." items={h.topUsers.map((u: any) => ({ label: `${u.name} · ${u.plan}`, value: u.cost }))} />
      </div>
    </div>
  );
}

const USER_FILTERS: [string, string][] = [["all", "Tümü"], ["paid", "Ücretli"], ["expiring", "7 gün içinde bitiyor"], ["expired", "Süresi doldu"], ["locked", "Kilitli"], ["suspended", "Askıda"]];

function expiryBadge(u: any) {
  if (u.plan_id === "free") return <span className="text-xs text-ink-400">—</span>;
  if (!u.plan_expires_at) return <Badge tone="ink">Süresiz</Badge>;
  const left = Math.ceil((new Date(u.plan_expires_at).getTime() - Date.now()) / 86400_000);
  const date = new Date(u.plan_expires_at).toLocaleDateString("tr-TR");
  if (left < 0) return <Badge tone="red">Doldu · {date}</Badge>;
  return <Badge tone={left <= 7 ? "amber" : "green"}>{date} · {left} gün</Badge>;
}

function UsersTab({ selfId }: { selfId: string }) {
  const toast = useToast();
  const [q, setQ] = useState("");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [data, setData] = useState<{ rows: any[]; count: number } | null>(null);
  const [open, setOpen] = useState<string | null>(null);
  const plans = useRows("plans");
  const load = useCallback(async () => {
    try { setData(await api(`/api/admin/users-list?filter=${filter}&q=${encodeURIComponent(query)}`)); } catch (e) { toast({ tone: "error", title: "Yüklenemedi", detail: (e as Error).message }); }
  }, [filter, query, toast]);
  useEffect(() => { load(); }, [load]);
  async function patch(id: string, update: any) {
    try { await api("/api/admin/users", { method: "PATCH", json: { id, ...update } }); toast({ tone: "success", title: "Kullanıcı güncellendi" }); load(); }
    catch (e) { toast({ tone: "error", title: "Güncellenemedi", detail: (e as Error).message }); }
  }
  async function setPlan(id: string, planId: string) {
    // Ücretli paket atanınca varsayılan 30 günlük süre başlar (D53)
    try { await api(`/api/admin/user/${id}`, { method: "POST", json: { action: "set_plan", planId, days: planId === "free" ? null : 30 } }); toast({ tone: "success", title: "Paket atandı", detail: planId === "free" ? "" : "30 günlük süre başladı; ayrıntıdan değiştirebilirsiniz." }); load(); }
    catch (e) { toast({ tone: "error", title: "Atanamadı", detail: (e as Error).message }); }
  }
  return (
    <div className="card overflow-hidden">
      <form onSubmit={(e) => { e.preventDefault(); setQuery(q); }} className="flex flex-wrap gap-2 border-b border-ink-100 p-3">
        <div className="relative min-w-[200px] flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" /><input className="input !pl-9" placeholder="Üye no (AC001234), e-posta veya ad ara…" value={q} onChange={(e) => setQ(e.target.value)} /></div>
        <Button type="submit" variant="secondary">Ara</Button>
      </form>
      <div className="flex flex-wrap gap-1.5 border-b border-ink-100 px-3 py-2">
        {USER_FILTERS.map(([id, label]) => <button key={id} onClick={() => setFilter(id)} className={cn("rounded-full px-3 py-1 text-[12.5px] font-medium", filter === id ? "bg-ink-900 text-white" : "bg-ink-100 text-ink-600 hover:bg-ink-200")}>{label}</button>)}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm"><thead className="bg-ink-50 text-left text-xs uppercase text-ink-500"><tr><th className="px-4 py-2.5">Üye no</th><th>Kullanıcı</th><th>Paket</th><th>Bitiş</th><th>Rol</th><th>Durum</th><th>Kayıt</th><th /></tr></thead>
          <tbody>{(data?.rows ?? []).map((u) => (
            <tr key={u.id} className="border-t border-ink-100">
              <td className="px-4 py-2.5 font-mono text-[12.5px] text-ink-600">{memberCode(u.member_no)}</td>
              <td className="py-2.5"><button className="text-left" onClick={() => setOpen(u.id)}><p className="font-medium text-ink-900 hover:underline">{u.full_name || "—"}</p><p className="text-xs text-ink-500">{u.email}</p></button></td>
              <td><select className="rounded-lg border border-ink-200 px-2 py-1 text-[13px]" value={u.plan_id} onChange={(e) => setPlan(u.id, e.target.value)}>{plans.rows.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></td>
              <td>{expiryBadge(u)}</td>
              <td><select className="rounded-lg border border-ink-200 px-2 py-1 text-[13px]" value={u.role} disabled={u.id === selfId} onChange={(e) => patch(u.id, { role: e.target.value })}><option value="user">Kullanıcı</option><option value="admin">Yönetici</option></select></td>
              <td className="space-x-1"><button disabled={u.id === selfId} onClick={() => patch(u.id, { is_suspended: !u.is_suspended })}><Badge tone={u.is_suspended ? "red" : "green"}>{u.is_suspended ? "Askıda" : "Aktif"}</Badge></button>{u.work_locked && <Badge tone="amber">Kilitli</Badge>}</td>
              <td className="text-xs text-ink-500">{new Date(u.created_at).toLocaleDateString("tr-TR")}</td>
              <td className="pr-3"><Button size="sm" variant="ghost" onClick={() => setOpen(u.id)}>Ayrıntı</Button></td>
            </tr>
          ))}</tbody></table>
      </div>
      <p className="border-t border-ink-100 px-4 py-2 text-xs text-ink-400">{data ? `${data.count} kullanıcı` : "Yükleniyor…"}</p>
      {open && <UserDetail id={open} plans={plans.rows} onClose={() => setOpen(null)} onChanged={load} />}
    </div>
  );
}

/** Kullanıcı ayrıntısı: kullanım ve maliyet, paket süresi (uzat / tarih), ek hak, projeler */
function UserDetail({ id, plans, onClose, onChanged }: { id: string; plans: any[]; onClose: () => void; onChanged: () => void }) {
  const toast = useToast();
  const [d, setD] = useState<any | null>(null);
  const [days, setDays] = useState(30);
  const [date, setDate] = useState("");
  const [credit, setCredit] = useState({ ai: 10, search: 0, days: 30, note: "" });
  const load = useCallback(async () => { try { const r = await api<any>(`/api/admin/user/${id}`); setD(r); setDate(r.profile.plan_expires_at ? r.profile.plan_expires_at.slice(0, 10) : ""); } catch (e) { toast({ tone: "error", title: "Yüklenemedi", detail: (e as Error).message }); } }, [id, toast]);
  useEffect(() => { load(); }, [load]);
  async function act(body: any, ok: string) {
    try { await api(`/api/admin/user/${id}`, { method: "POST", json: body }); toast({ tone: "success", title: ok }); await load(); onChanged(); }
    catch (e) { toast({ tone: "error", title: "İşlem yapılamadı", detail: (e as Error).message }); }
  }
  const row = (l: string, used: number, lim: number | null | undefined) => (
    <div key={l} className="flex justify-between border-t border-ink-50 py-1 text-[13px]"><span className="text-ink-500">{l}</span><span className="font-medium">{Number(used).toLocaleString("tr-TR")} / {lim == null ? "∞" : Number(lim).toLocaleString("tr-TR")}</span></div>
  );
  return (
    <Modal open onClose={onClose} title={d ? `${d.profile.full_name || d.profile.email}` : "Kullanıcı"} wide>
      {!d ? <p className="text-sm text-ink-400">Yükleniyor…</p> : (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-4">
            <div className="rounded-2xl border border-ink-100 p-4">
              <p className="text-sm text-ink-500">{d.profile.email}{d.profile.institution ? ` · ${d.profile.institution}` : ""}</p>
              <div className="mt-2 flex flex-wrap items-center gap-2"><Badge tone="brand">{d.plan?.name ?? d.profile.plan_id}</Badge>{expiryBadge(d.profile)}{d.profile.work_locked && <Badge tone="amber">Kilitli: {d.reasons.join(", ") || "—"}</Badge>}{d.org && <Badge tone="violet">Kurum: {d.org.organizations?.name}</Badge>}</div>
              <p className="mt-2 text-sm">Üye no: <b className="font-mono">{memberCode(d.profile.member_no)}</b></p>
              <p className="mt-1 text-xs text-ink-400">Kayıt: {new Date(d.profile.created_at).toLocaleDateString("tr-TR")} · Sistem kimliği: <span className="font-mono">{d.profile.id}</span></p>
            </div>
            <div className="rounded-2xl border border-ink-100 p-4">
              <p className="mb-1 font-semibold">Bu ay</p>
              {row("Yapay zekâ isteği", d.usage.ai_requests, d.limits.ai_requests_month)}
              {row("Kaynak taraması", d.usage.source_searches, d.limits.source_searches_month)}
              {row("Token", d.usage.tokens, d.limits.tokens_month)}
              {row("Aktif proje", d.usage.projects, d.limits.projects)}
              {row("Depolama (MB)", d.usage.storage_mb, d.limits.storage_mb)}
              <div className="mt-2 rounded-xl bg-ink-50 p-2.5 text-[13px]">API maliyeti: <b>{d.money.cost_try.toLocaleString("tr-TR")} TL</b> · Gelir (KDV hariç): <b>{d.money.revenue_try.toLocaleString("tr-TR")} TL</b>{d.money.cost_share != null && <> · Maliyet payı: <b className={d.money.cost_share > 33 ? "text-rose-600" : "text-emerald-700"}>%{d.money.cost_share}</b></>}</div>
            </div>
            <div className="rounded-2xl border border-ink-100 p-4">
              <p className="mb-2 font-semibold">Projeler ({d.projects.length})</p>
              {d.projects.length === 0 && <p className="text-sm text-ink-400">Proje yok.</p>}
              {d.projects.map((p: any) => <p key={p.id} className="flex justify-between border-t border-ink-50 py-1 text-[13px]"><span className="truncate">{p.title}</span><span className="shrink-0 text-ink-400">{p.status} · {new Date(p.updated_at).toLocaleDateString("tr-TR")}</span></p>)}
            </div>
          </div>
          <div className="space-y-4">
            <div className="rounded-2xl border border-ink-100 p-4">
              <p className="font-semibold">Paket ve süre</p>
              <label className="mt-2 block text-xs text-ink-500">Paket ata (ücretli paketler gün sayısı kadar geçerli olur)</label>
              <div className="mt-1 flex gap-2">
                <select id="plan-pick" className="input !py-2" defaultValue={d.profile.plan_id}>{plans.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select>
                <input className="input !w-24 !py-2" type="number" min={1} value={days} onChange={(e) => setDays(Number(e.target.value) || 30)} />
                <Button size="sm" onClick={() => { const v = (document.getElementById("plan-pick") as HTMLSelectElement).value; act({ action: "set_plan", planId: v, days: v === "free" ? null : days }, "Paket atandı"); }}>Ata</Button>
              </div>
              <p className="mt-3 text-xs text-ink-500">Ek gün ver (bitiş tarihinden, süresi geçtiyse bugünden itibaren)</p>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {[7, 15, 30, 90, 365].map((n) => <Button key={n} size="sm" variant="secondary" disabled={d.profile.plan_id === "free"} onClick={() => act({ action: "extend", days: n }, `${n} gün eklendi`)}>+{n} gün</Button>)}
                <Button size="sm" variant="ghost" disabled={d.profile.plan_id === "free"} onClick={() => { const n = Number(prompt("Kaç gün eklensin? (eksi değer süreyi kısaltır)", "10")); if (n) act({ action: "extend", days: n }, `${n} gün eklendi`); }}>Özel…</Button>
              </div>
              <p className="mt-3 text-xs text-ink-500">Bitiş tarihini değiştir</p>
              <div className="mt-1 flex gap-2">
                <input className="input !py-2" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                <Button size="sm" variant="secondary" disabled={!date} onClick={() => act({ action: "set_expiry", expiresAt: new Date(`${date}T23:59:00+03:00`).toISOString() }, "Bitiş tarihi güncellendi")}>Kaydet</Button>
                <Button size="sm" variant="ghost" onClick={() => act({ action: "set_expiry", expiresAt: null }, "Süresiz yapıldı")}>Süresiz</Button>
              </div>
            </div>
            <div className="rounded-2xl border border-ink-100 p-4">
              <p className="font-semibold">Ek kullanım hakkı ver</p>
              <p className="mt-0.5 text-xs text-ink-500">Paket değiştirmeden bu ayın sınırına ekler (ör. telafi, kampanya). Kilit varsa hemen yeniden değerlendirilir.</p>
              <div className="mt-2 grid grid-cols-3 gap-2 text-xs text-ink-500">
                <label>YZ isteği<input className="input !py-1.5" type="number" min={0} value={credit.ai} onChange={(e) => setCredit({ ...credit, ai: Number(e.target.value) || 0 })} /></label>
                <label>Tarama<input className="input !py-1.5" type="number" min={0} value={credit.search} onChange={(e) => setCredit({ ...credit, search: Number(e.target.value) || 0 })} /></label>
                <label>Geçerlilik (gün)<input className="input !py-1.5" type="number" min={1} value={credit.days} onChange={(e) => setCredit({ ...credit, days: Number(e.target.value) || 30 })} /></label>
              </div>
              <input className="input mt-2 !py-1.5" placeholder="Not (isteğe bağlı)" value={credit.note} onChange={(e) => setCredit({ ...credit, note: e.target.value })} />
              <Button className="mt-2" size="sm" onClick={() => act({ action: "grant_credits", aiRequests: credit.ai, sourceSearches: credit.search, days: credit.days, note: credit.note }, "Ek hak verildi")}>Hakkı ver</Button>
              {d.credits.length > 0 && <div className="mt-3 space-y-0.5">{d.credits.map((c: any, i: number) => <p key={i} className="text-[12px] text-ink-500">+{c.amount} {c.kind === "ai_requests" ? "YZ isteği" : "tarama"} · {c.reason} · {c.expires_at ? `${new Date(c.expires_at).toLocaleDateString("tr-TR")}’e kadar` : "süresiz"}</p>)}</div>}
            </div>
          </div>
        </div>
      )}
    </Modal>
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
  const [margin, setMargin] = useState({ usd_try: 48, vat_rate: 0.2, cost_share: 0.3333, avg_request_usd: 0.07 });
  useEffect(() => {
    if (!ready) return;
    const mg = get("billing.margin"); if (mg) setMargin((x) => ({ ...x, ...mg }));
    const rf = get("referral"); if (rf) setRef((r) => ({ ...r, ...rf }));
    setEmail(get("site.contact")?.email ?? "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);
  async function save() {
    try {
      await api("/api/admin/settings", { method: "PATCH", json: { id: "referral", value: { enabled: ref.enabled, ai_requests: Number(ref.ai_requests) || 0, source_searches: Number(ref.source_searches) || 0, valid_days: Number(ref.valid_days) || 30, monthly_cap: Number(ref.monthly_cap) || 0 } } });
      await api("/api/admin/settings", { method: "PATCH", json: { id: "site.contact", value: { email: email.trim() } } });
      await api("/api/admin/settings", { method: "PATCH", json: { id: "billing.margin", value: { usd_try: Math.max(1, Number(margin.usd_try) || 48), vat_rate: Number(margin.vat_rate) || 0, cost_share: Math.min(1, Math.max(0.05, Number(margin.cost_share) || 0.3333)), avg_request_usd: Number(margin.avg_request_usd) || 0.07 } } });
      toast({ tone: "success", title: "Ayarlar kaydedildi" }); load();
    } catch (e) { toast({ tone: "error", title: "Kaydedilemedi", detail: (e as Error).message }); }
  }
  const n = (v: number, f: (x: number) => void) => <input className="input !py-1.5" type="number" value={v} onChange={(e) => f(Number(e.target.value))} />;
  return (
    <div className="card h-fit space-y-3 p-5">
      <h3 className="font-semibold">Davet ve iletişim</h3>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={ref.enabled} onChange={(e) => setRef({ ...ref, enabled: e.target.checked })} /> Davet programı etkin</label>
      <div className="grid grid-cols-2 gap-2 text-xs text-ink-500">
        <label>Geçerlilik (gün){n(ref.valid_days, (x) => setRef({ ...ref, valid_days: x }))}</label>
        <label>Aylık ödül sınırı (davet eden){n(ref.monthly_cap, (x) => setRef({ ...ref, monthly_cap: x }))}</label>
      </div>
      <p className="text-xs text-ink-500">Ödül, her iki tarafa Ücretsiz paketin aylık hakları kadardır (yapay zekâ isteği ve kaynak taraması; Paketler → Ücretsiz’den değişir). Tek seferliktir: kullanıldıkça azalır, her ay yenilenmez.</p>
      <div className="rounded-xl bg-ink-50 p-3">
        <p className="text-sm font-medium">Kârlılık (maliyet tavanı)</p>
        <p className="mt-0.5 text-xs text-ink-500">Her paketin aylık API maliyeti, KDV hariç gelirinin bu payını aşamaz (aşınca kullanıcının yapay zekâ hakkı dolmuş sayılır). Dolar kurunu ayda bir güncelleyin.</p>
        <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-ink-500">
          <label>Dolar kuru (TL){n(margin.usd_try, (x) => setMargin({ ...margin, usd_try: x }))}</label>
          <label>Maliyet payı (0,33 = 1/3){n(margin.cost_share, (x) => setMargin({ ...margin, cost_share: x }))}</label>
        </div>
      </div>
      <label className="block text-xs text-ink-500">Kurum teklifleri için iletişim e-postası<input className="input !py-1.5" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="iletisim@alanadi.com" /></label>
      <Button onClick={save}>Kaydet</Button>
    </div>
  );
}

function OrgsTab() {
  const toast = useToast();
  const { rows, load } = useRows("organizations");
  const [form, setForm] = useState({ name: "", plan_id: "pro", seats: "", email_domain: "", expires_at: "" });
  const [adminEmail, setAdminEmail] = useState<Record<string, string>>({});
  async function create() {
    try {
      await api("/api/admin/organizations", { method: "POST", json: { name: form.name, plan_id: form.plan_id, seats: Number(form.seats) > 0 ? Number(form.seats) : null, email_domain: form.email_domain.trim() || null, expires_at: form.expires_at ? new Date(`${form.expires_at}T23:59:59`).toISOString() : null } });
      setForm({ name: "", plan_id: "pro", seats: "", email_domain: "", expires_at: "" }); load();
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
          <input className="input" type="number" min={1} placeholder="Kişi sınırı (boş = sınırsız)" title="Boş bırakılırsa sınırsız kişi katılabilir" value={form.seats} onChange={(e) => setForm({ ...form, seats: e.target.value })} />
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
              <Badge tone="brand">{o.plan_id}</Badge><Badge>{o.seats ? `${o.seats} kişi sınırı` : "Sınırsız kişi"}</Badge>
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

/** Çalışma kilidi (D50): 100 TL indirme hakkı tanımlama, kilitli kullanıcılar, bekleyen KVKK veri talepleri */
function LocksTab() {
  const toast = useToast();
  const [data, setData] = useState<{ passes: any[]; requests: any[]; locked: any[] } | null>(null);
  const [projectId, setProjectId] = useState("");
  const [days, setDays] = useState(7);
  const [note, setNote] = useState("");
  const load = useCallback(async () => { try { setData(await api("/api/admin/locks")); } catch (e) { toast({ tone: "error", title: "Yüklenemedi", detail: (e as Error).message }); } }, [toast]);
  useEffect(() => { load(); }, [load]);
  async function grant() {
    try {
      const r = await api<{ pass: any }>("/api/admin/locks", { method: "POST", json: { projectId: projectId.trim(), days, note } });
      toast({ tone: "success", title: "İndirme hakkı tanımlandı", detail: `${r.pass.title} · ${days} gün` }); setProjectId(""); setNote(""); load();
    } catch (e) { toast({ tone: "error", title: "Tanımlanamadı", detail: (e as Error).message }); }
  }
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <div className="card space-y-3 p-5">
        <h3 className="font-semibold">“Mevcut çalışmayı indir” hakkı tanımla (100 TL)</h3>
        <p className="text-sm text-ink-500">WhatsApp mesajındaki <b>çalışma kodunu</b> yapıştırın. Ödeme alındıktan sonra tanımlayın; kullanıcı çalışma sayfasında Word / PDF / TXT indirme düğmelerini görür.</p>
        <label className="block text-xs text-ink-500">Çalışma kodu<input className="input !py-2 font-mono" value={projectId} onChange={(e) => setProjectId(e.target.value)} placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" /></label>
        <div className="grid grid-cols-2 gap-2">
          <label className="text-xs text-ink-500">Geçerlilik (gün)<input className="input !py-2" type="number" min={1} max={60} value={days} onChange={(e) => setDays(Number(e.target.value) || 7)} /></label>
          <label className="text-xs text-ink-500">Not<input className="input !py-2" value={note} onChange={(e) => setNote(e.target.value)} placeholder="ör. havale 12.11" /></label>
        </div>
        <Button onClick={grant} disabled={!/^[0-9a-f-]{36}$/i.test(projectId.trim())}>Hakkı tanımla</Button>
        <div className="border-t border-ink-100 pt-3">
          <p className="mb-2 text-sm font-medium">Son tanımlanan haklar</p>
          {(data?.passes ?? []).length === 0 && <p className="text-sm text-ink-400">Kayıt yok.</p>}
          {(data?.passes ?? []).map((p) => (
            <div key={p.id} className="flex items-center gap-2 border-t border-ink-50 py-1.5 text-[13px]">
              <span className="flex-1 truncate">{p.title ?? p.project_id} · <span className="text-ink-500">{p.email}</span></span>
              <Badge tone={new Date(p.expires_at) > new Date() ? "green" : "ink"}>{new Date(p.expires_at).toLocaleDateString("tr-TR")}</Badge>
              <button className="text-ink-400 hover:text-rose-600" title="İptal et" onClick={async () => { await api("/api/admin/locks", { method: "DELETE", json: { passId: p.id } }); load(); }}><Trash2 className="h-3.5 w-3.5" /></button>
            </div>
          ))}
        </div>
      </div>
      <div className="space-y-5">
        <div className="card p-5">
          <h3 className="font-semibold">Bekleyen KVKK veri talepleri</h3>
          <p className="mt-1 text-sm text-ink-500">Kilitli kullanıcılar anında indiremez; talebi 30 gün içinde, ücretsiz olarak kullanıcının e-postasına iletmeniz yasal zorunluluktur.</p>
          {(data?.requests ?? []).length === 0 && <p className="mt-3 text-sm text-ink-400">Bekleyen talep yok.</p>}
          {(data?.requests ?? []).map((r) => (
            <div key={r.id} className="mt-2 flex flex-wrap items-center gap-2 rounded-xl border border-ink-100 p-2.5 text-[13px]">
              <span className="flex-1">{r.email ?? r.user_id} · {new Date(r.created_at).toLocaleDateString("tr-TR")}</span>
              {r.user_id && <a className="font-medium text-brand-700 hover:underline" href={`/api/admin/user-export?userId=${r.user_id}`}>JSON indir</a>}
              <Button size="sm" variant="secondary" onClick={async () => { await api("/api/admin/locks", { method: "PATCH", json: { requestId: r.id } }); load(); }}>Tamamlandı</Button>
            </div>
          ))}
        </div>
        <div className="card p-5">
          <div className="flex items-center justify-between"><h3 className="font-semibold">Kilitli kullanıcılar</h3><Button size="sm" variant="ghost" onClick={load}><RefreshCw className="h-3.5 w-3.5" /></Button></div>
          {(data?.locked ?? []).length === 0 && <p className="mt-3 text-sm text-ink-400">Kilitli kullanıcı yok.</p>}
          {(data?.locked ?? []).map((u) => <p key={u.id} className="border-t border-ink-50 py-1.5 text-[13px]">{u.email} <span className="text-ink-400">· {u.plan_id}</span></p>)}
          <p className="mt-2 text-xs text-ink-400">Paket yükseltmek için Kullanıcılar sekmesinden paketini değiştirin; kilit kullanıcı sayfayı yenilediğinde kalkar.</p>
        </div>
      </div>
    </div>
  );
}

/** Davet kampanyası sayaçları (D55): ödüller otomatik verilir; burada izlenir */
function ReferralsTab() {
  const [d, setD] = useState<any | null>(null);
  const load = useCallback(() => { api("/api/admin/referrals").then(setD).catch(() => setD({ error: true })); }, []);
  useEffect(() => { load(); }, [load]);
  if (!d) return <div className="skeleton h-40" />;
  if (d.error) return <p className="text-rose-600">Davet istatistikleri yüklenemedi.</p>;
  const tiles: [string, number, string][] = [
    ["Toplam davetle kayıt", d.totals.invited, ""],
    ["Ödül verilen", d.totals.rewarded, "e-postasını doğrulayanlar"],
    ["Doğrulama bekleyen", d.totals.pending, "henüz ödül verilmedi"],
    ["Bu ay ödül", d.totals.rewardedMonth, `${d.totals.aiGrantedMonth} YZ isteği dağıtıldı`],
  ];
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
        <span>Ödüller <b>otomatik</b> verilir: davet edilen kişi e-postasını doğruladığında ikisine de {d.settings.ai_requests} YZ isteği + {d.settings.source_searches} tarama ({d.settings.valid_days} gün). Davet eden ayda en fazla {d.settings.monthly_cap} ödül alır.{!d.settings.enabled && " — Kampanya şu an KAPALI (Ayarlar)."}</span>
        <Button size="sm" variant="ghost" onClick={load}><RefreshCw className="h-3.5 w-3.5" /></Button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{tiles.map(([l, v, sub]) => <div key={l} className="card p-4"><p className="text-[13px] text-ink-500">{l}</p><p className="mt-1 text-2xl font-semibold text-ink-900">{v}</p>{sub && <p className="text-xs text-ink-400">{sub}</p>}</div>)}</div>
      {d.totals.cappedMonth > 0 && <p className="rounded-xl bg-amber-50 px-4 py-2 text-sm text-amber-900">Bu ay {d.totals.cappedMonth} davette, davet eden aylık sınıra ulaştığı için yalnızca davet edilene ödül verildi.</p>}
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="card p-5">
          <h3 className="font-semibold">En çok davet edenler</h3>
          <table className="mt-2 w-full text-sm"><thead className="text-left text-xs text-ink-400"><tr><th>Kullanıcı</th><th>Davet</th><th>Ödüllü</th><th>Bu ay</th></tr></thead>
            <tbody>{d.top.map((u: any) => <tr key={u.id} className="border-t border-ink-100"><td className="py-1.5 pr-2">{u.email ?? u.id}</td><td>{u.invited}</td><td>{u.rewarded}</td><td>{u.month}</td></tr>)}</tbody></table>
          {d.top.length === 0 && <p className="mt-2 text-sm text-ink-400">Henüz davet yok.</p>}
        </div>
        <div className="card p-5">
          <h3 className="font-semibold">Son davetle kayıtlar</h3>
          {d.recent.length === 0 && <p className="mt-2 text-sm text-ink-400">Henüz davet yok.</p>}
          {d.recent.map((r: any, i: number) => (
            <div key={i} className="flex items-center justify-between gap-2 border-t border-ink-100 py-1.5 text-[13px]">
              <span className="min-w-0 truncate">{r.email} <span className="text-ink-400">← {r.inviter}</span></span>
              {r.rewarded_at ? <Badge tone="green">Ödül · {new Date(r.rewarded_at).toLocaleDateString("tr-TR")}</Badge> : <Badge tone="amber">Doğrulama bekliyor</Badge>}
            </div>
          ))}
        </div>
      </div>
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
