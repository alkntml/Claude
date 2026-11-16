"use client";
/** D213: Yönetim → Yapay zekâ: Mizan doğruluk testi (canlı iddia denetimi motoru, gerçek makaleler, elle etiketli iddialar) */
import { Scale } from "lucide-react";
import { useEffect, useState } from "react";
import { BrandMark } from "@/components/brand-mark";
import { Button } from "@/components/ui/button";
import { cn } from "@/components/ui/cn";
import { useToast } from "@/components/ui/toast";
import { api } from "@/lib/client";
import type { BenchRun } from "@/lib/quality/mizan-bench";

const LABEL: Record<string, string> = { supports: "Destekliyor", partial: "Kısmen", not_supported: "Desteklemiyor", contradicts: "Çelişiyor", insufficient: "Yetersiz", no_answer: "Yanıt yok" };

export function MizanBenchCard() {
  const toast = useToast();
  const [last, setLast] = useState<BenchRun | null>(null);
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  useEffect(() => { api<{ last: BenchRun | null }>("/api/admin/mizan-bench").then((r) => setLast(r.last)).catch(() => {}); }, []);
  async function run() {
    setBusy(true);
    try {
      // D221: 200 iddia 4 parçada ölçülür (sunucu süre sınırı); her parça öncekine eklenir
      for (let part = 0; part < 4; part++) {
        setStep(part + 1);
        setLast((await api<{ last: BenchRun }>("/api/admin/mizan-bench", { method: "POST", json: { part } })).last);
      }
      toast({ tone: "success", title: "Ölçüm tamamlandı" });
    }
    catch (e) { toast({ tone: "error", title: "Ölçüm yapılamadı", detail: (e as Error).message }); }
    finally { setBusy(false); }
  }
  const s = last?.score;
  return (
    <div className="card space-y-3 p-5 lg:col-span-2">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="flex items-center gap-2 font-semibold"><Scale className="h-4 w-4 text-brand-600" /><BrandMark name="Mizan" /> doğruluk testi</h3>
        <Button size="sm" onClick={run} loading={busy}>{last ? "Yeniden ölç" : "Ölçümü başlat"}</Button>
      </div>
      <p className="text-[13px] text-ink-500">20 gerçek açık erişimli makalenin (Europe PMC tam metni) üzerinde, doğru cevabı elle belirlenmiş 200 iddia (50 destekleyen, 50 kısmen, 50 desteklemeyen, 50 çelişen) canlıdaki iddia denetimi motoruna dört parça hâlinde verilir. Bir ölçüm yaklaşık 5–12 dakika sürer; maliyeti sizin yönetici kullanımınıza yazılır.</p>
      {busy && <p className="text-[13px] text-brand-700">Ölçülüyor ({step}/4)… sayfadan ayrılmayın.</p>}
      {last && last.parts && (last.part ?? 0) < last.parts - 1 && !busy && <p className="text-[13px] text-amber-700">Son ölçüm yarım kaldı ({(last.part ?? 0) + 1}/{last.parts} parça); sonuçlar eksik iddialarla hesaplandı.</p>}
      {s && last && (
        <>
          <div className="grid gap-2 sm:grid-cols-4">
            {[["Tam isabet", `%${s.exactPct}`, `${s.exact}/${s.n} iddia`], ["Sorun yakalama", `%${s.detectionPct}`, `${s.caught}/${s.problems} sorunlu iddia`], ["Yanlış alarm", `%${s.falseAlarmPct}`, `${s.falseAlarms}/${s.fine} doğru iddia`], ["Tehlikeli kaçırma", String(s.dangerousMisses), "çelişen/olmayan iddiaya “destekliyor”"]].map(([a, b, c]) => (
              <div key={a} className="rounded-2xl border border-ink-100 p-3"><p className="text-[12px] text-ink-500">{a}</p><p className="text-2xl font-semibold text-ink-900">{b}</p><p className="text-[11.5px] text-ink-400">{c}</p></div>
            ))}
          </div>
          <p className="text-[12px] text-ink-500">Etiket bazında: {s.perLabel.map((p) => `${LABEL[p.label]} ${p.correct}/${p.n}`).join(" · ")} · Model: {last.model} · {last.calls} çağrı · ${last.costUsd.toFixed(3)} · {Math.round(last.durationMs / 1000)} sn · {new Date(last.at).toLocaleString("tr-TR")}</p>
          {s.perClass && (
            <div className="overflow-auto rounded-2xl border border-ink-100">
              <table className="w-full text-left text-[12.5px]">
                <thead className="bg-ink-50 text-ink-500"><tr><th className="p-2">Sınıf</th><th className="p-2">Kesinlik</th><th className="p-2">Duyarlılık</th><th className="p-2">F1</th><th className="p-2">Yanlış pozitif</th><th className="p-2">Yanlış negatif</th></tr></thead>
                <tbody>
                  {[...s.perClass.map((c) => ({ ...c, name: LABEL[c.label] })), { ...s.issue, name: "Sorun var (ikili)" }].map((c) => (
                    <tr key={c.name} className="border-t border-ink-100 align-top">
                      <td className="p-2 font-medium text-ink-800">{c.name}</td><td className="p-2">{c.precision.toFixed(3)}</td><td className="p-2">{c.recall.toFixed(3)}</td><td className="p-2">{c.f1.toFixed(3)}</td>
                      <td className="p-2 text-ink-500">{c.fp}{c.fpIds.length ? `: ${c.fpIds.join(", ")}` : ""}</td><td className="p-2 text-ink-500">{c.fn}{c.fnIds.length ? `: ${c.fnIds.join(", ")}` : ""}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="p-2 text-[12px] text-ink-500">Makro F1: {s.macroF1.toFixed(3)}</p>
            </div>
          )}
          <button className="text-[13px] font-medium text-brand-700 hover:underline" onClick={() => setOpen((o) => !o)}>{open ? "Ayrıntıyı gizle" : "İddia iddia sonuçları"}</button>
          {open && (
            <div className="max-h-[480px] overflow-auto rounded-2xl border border-ink-100">
              <table className="w-full text-left text-[12.5px]">
                <thead className="sticky top-0 bg-ink-50 text-ink-500"><tr><th className="p-2">İddia</th><th className="p-2">Doğru cevap</th><th className="p-2">Mizan</th></tr></thead>
                <tbody>
                  {last.rows.map((r) => (
                    <tr key={r.id} className="border-t border-ink-100 align-top">
                      <td className="p-2 text-ink-800"><span className="text-ink-400">{r.id} · </span>{r.sentence}<p className="mt-0.5 text-[11.5px] text-ink-400">{r.article} · {r.explanation}</p></td>
                      <td className="p-2">{LABEL[r.label]}</td>
                      <td className={cn("p-2 font-medium", r.predicted === r.label ? "text-emerald-700" : "text-rose-700")}>{LABEL[r.predicted] ?? r.predicted}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
