"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { BarList, Donut, RangePicker, StatTile, TimeSeries } from "@/components/ui/charts";
import { api } from "@/lib/client";

const usd = (v: number) => (v === 0 ? "$0" : v < 0.01 ? `$${v.toFixed(4)}` : v < 10 ? `$${v.toFixed(2)}` : `$${v.toFixed(0)}`);
const num = (v: number) => Math.round(v).toLocaleString("tr-TR");

export function useInsights(days: number) {
  const [d, setD] = useState<any | null>(null);
  useEffect(() => { setD(null); api(`/api/admin/insights?days=${days}`).then(setD).catch(() => setD({ error: true })); }, [days]);
  return d;
}

/** API maliyeti: özellik ve ücretsiz araç bazında (D90) */
export function CostBreakdown({ days }: { days: number }) {
  const d = useInsights(days);
  if (!d) return <div className="skeleton h-72" />;
  if (d.error) return <p className="text-sm text-rose-600">Maliyet dökümü yüklenemedi.</p>;
  const toolCost = d.cost.tools.reduce((a: number, t: any) => a + t.cost, 0);
  return (
    <div className="space-y-4">
      <div className="card p-5">
        <TimeSeries data={d.cost.byDay} series={[{ key: "features", label: "Uygulama özellikleri" }, { key: "tools", label: "Ücretsiz araçlar" }]} title="Günlük API maliyeti" subtitle={`Toplam ${usd(d.cost.total)} · son ${d.days} gün`} format={usd} />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card p-5"><BarList title="Hangi özellik ne kadar harcadı?" subtitle="Yapay zekâ maliyeti (USD), çağrı sayısıyla" items={d.cost.features.map((f: any) => ({ label: f.label, value: f.value, sub: `${num(f.calls)} çağrı` }))} format={usd} limit={9} empty="Bu dönemde yapay zekâ maliyeti yok." /></div>
        <div className="card p-5">
          <BarList title="Ücretsiz araçlar" subtitle={`Kullanım sayısı · API maliyeti toplam ${usd(toolCost)}`} color={2} items={d.cost.tools.map((t: any) => ({ label: t.label, value: t.uses, sub: t.cost > 0 ? `${usd(t.cost)} · ${num(t.items)} kayıt` : "yapay zekâ yok · $0" }))} format={num} empty="Ücretsiz araçlar henüz kullanılmadı (veya veritabanı güncellemesi 21 yapılmadı)." />
        </div>
      </div>
    </div>
  );
}

/** Ziyaretçiler sekmesi: kişisel veri tutmayan ölçüm (D90) */
export function TrafficTab() {
  const [days, setDays] = useState(30);
  const d = useInsights(days);
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-2xl text-sm text-ink-500">Çerez kullanılmaz, IP adresi ve kişisel bilgi saklanmaz; ziyaretçiler her gün değişen anonim bir kodla sayılır. Botlar ve “izleme yapma” ayarı açık tarayıcılar sayılmaz.</p>
        <RangePicker value={days} onChange={setDays} />
      </div>
      {!d ? <div className="grid gap-3 sm:grid-cols-4">{[0, 1, 2, 3].map((i) => <div key={i} className="skeleton h-28" />)}</div> : d.error ? <p className="text-rose-600">Ölçüm verisi yüklenemedi.</p> : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <StatTile label="Tekil ziyaretçi" value={num(d.traffic.visitors)} sub={`${d.days} gün · günlük tekil toplamı`} spark={d.traffic.byDay.map((x: any) => x.visitors)} />
            <StatTile label="Sayfa görüntüleme" value={num(d.traffic.views)} sub={d.traffic.visitors ? `ziyaretçi başına ${(d.traffic.views / d.traffic.visitors).toFixed(1)}` : "—"} spark={d.traffic.byDay.map((x: any) => x.views)} />
            <StatTile label="Yeni kayıt" value={num(d.traffic.signups)} sub={d.traffic.conversion != null ? `ziyaretçilerin %${d.traffic.conversion}’i` : "—"} spark={d.traffic.byDay.map((x: any) => x.signups)} />
            <StatTile label="Ücretsiz araç kullanan" value={num(d.traffic.toolUsers)} sub="günlük tekil" />
            <StatTile label="Ücretli kullanıcı (toplam)" value={num(d.traffic.paidTotal)} sub={`bu dönemde kayıt olup ücretliye geçen: ${num(d.traffic.paidSignups)}`} />
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="card p-5"><TimeSeries data={d.traffic.byDay} series={[{ key: "visitors", label: "Tekil ziyaretçi" }, { key: "views", label: "Sayfa görüntüleme" }]} title="Günlük ziyaret" format={num} /></div>
            <div className="card p-5"><TimeSeries data={d.traffic.byDay} series={[{ key: "signups", label: "Yeni kayıt" }]} title="Günlük yeni kayıt" format={num} /></div>
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="card p-5"><BarList title="En çok görüntülenen sayfalar" items={d.traffic.pages} format={num} limit={10} empty="Henüz ziyaret yok (veritabanı güncellemesi 21 yapıldı mı?)." /></div>
            <div className="card p-5"><BarList title="Ziyaretçiler nereden geldi?" subtitle="Yönlendiren site veya kampanya (utm_source)" color={1} items={d.traffic.sources} format={num} limit={10} /></div>
            <div className="card p-5">
              <Donut title="Cihaz" parts={d.traffic.devices} format={num} centerLabel="görüntüleme" />
              <div className="mt-6">
                <BarList title="Dönüşüm hunisi" subtitle="Bu dönem" color={2} format={num} items={[
                  { label: "Ziyaretçi", value: d.traffic.visitors },
                  { label: "Ücretsiz araç kullanan", value: d.traffic.toolUsers },
                  { label: "Kayıt olan", value: d.traffic.signups },
                  { label: "Ücretliye geçen (yeni kayıtlar)", value: d.traffic.paidSignups },
                ]} />
              </div>
            </div>
          </div>
          <p className="text-xs text-ink-400">İpucu: Sosyal medya ve reklam bağlantılarına <code className="rounded bg-ink-100 px-1">?utm_source=instagram&amp;utm_campaign=tez-donemi</code> gibi ekler koyarsanız hangi paylaşımın ziyaretçi getirdiği burada ayrı görünür.</p>
        </>
      )}
    </div>
  );
}
