"use client";
import { AlertTriangle, CheckCircle2, HelpCircle, Loader2, SearchCheck, XCircle } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/components/ui/cn";
import { useT } from "@/i18n/client";
import { SignupCta } from "./shared";

type Status = "verified" | "partial" | "mismatch" | "not_found" | "unparsed";
interface Row { input: string; status: Status; note: string; found?: { title: string; authors: string; year: number | null; container: string | null; doi: string | null } | null }

const META: Record<Status, { label: string; icon: typeof CheckCircle2; cls: string }> = {
  verified: { label: "Doğrulandı", icon: CheckCircle2, cls: "bg-emerald-50 text-emerald-800 border-emerald-200" },
  partial: { label: "Künyede fark var", icon: AlertTriangle, cls: "bg-amber-50 text-amber-900 border-amber-200" },
  mismatch: { label: "DOI başka yayına ait", icon: XCircle, cls: "bg-rose-50 text-rose-800 border-rose-200" },
  not_found: { label: "Bulunamadı", icon: XCircle, cls: "bg-rose-50 text-rose-800 border-rose-200" },
  unparsed: { label: "Okunamadı", icon: HelpCircle, cls: "bg-ink-50 text-ink-700 border-ink-200" },
};

/** Uydurma kaynak kontrolü (D90): her kaynak Crossref, DataCite ve OpenAlex kayıtlarıyla karşılaştırılır */
export function FakeCheckTool() {
  const { t } = useT();
  const [text, setText] = useState("");
  const [rows, setRows] = useState<Row[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function run() {
    const lines: string[] = [];
    for (const raw of text.split("\n")) {
      const l = raw.replace(/^\s*(\[\d+\]|\d+[.)])\s*/, "").trim();
      if (!l) continue;
      if (lines.length && /^[\p{Ll}(,.;:&–-]/u.test(l)) lines[lines.length - 1] += ` ${l}`;
      else lines.push(l);
    }
    const list = lines.filter((l) => l.length >= 5).slice(0, 30);
    if (!list.length) return;
    setBusy(true); setError(""); setRows(null);
    try {
      const res = await fetch("/api/public/tools/fake-check", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ lines: list }) });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(j.error ?? t("Kontrol yapılamadı"));
      setRows(j.results);
    } catch (e) { setError((e as Error).message); } finally { setBusy(false); }
  }
  const count = (s: Status[]) => rows?.filter((r) => s.includes(r.status)).length ?? 0;
  return (
    <div className="space-y-6">
      <div className="card space-y-4 p-5">
        <textarea className="input min-h-[200px]" value={text} onChange={(e) => setText(e.target.value)} placeholder={t("Kaynakçanızı yapıştırın; her kaynak ayrı satırda olsun. En fazla 30 kaynak.")} />
        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={run} disabled={busy || text.trim().length < 10}>{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <SearchCheck className="h-4 w-4" />} {busy ? t("Kontrol ediliyor…") : t("Kaynakları kontrol et")}</Button>
          <span className="text-xs text-ink-500">{t("Her kaynak Crossref, DataCite ve OpenAlex kayıtlarında aranır. 30 kaynak yaklaşık 20 saniye sürer.")}</span>
        </div>
        {error && <p className="text-sm text-rose-600">{error}</p>}
      </div>
      {rows && (
        <>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="card p-4"><p className="text-xs text-ink-500">{t("Doğrulandı")}</p><p className="text-2xl font-semibold text-emerald-700">{count(["verified"])}</p></div>
            <div className="card p-4"><p className="text-xs text-ink-500">{t("Künyede fark var")}</p><p className="text-2xl font-semibold text-amber-700">{count(["partial"])}</p></div>
            <div className="card p-4"><p className="text-xs text-ink-500">{t("Bulunamadı / şüpheli")}</p><p className="text-2xl font-semibold text-rose-700">{count(["not_found", "mismatch", "unparsed"])}</p></div>
          </div>
          <ul className="space-y-2">
            {rows.map((r, i) => {
              const m = META[r.status]; const Icon = m.icon;
              return (
                <li key={i} className="card p-4">
                  <div className="flex flex-wrap items-start gap-3">
                    <span className={cn("inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold", m.cls)}><Icon className="h-3.5 w-3.5" /> {t(m.label)}</span>
                    <p className="min-w-0 flex-1 text-[14px] text-ink-800">{r.input}</p>
                  </div>
                  <p className="mt-2 text-[13px] text-ink-600">{t(r.note)}</p>
                  {r.found && r.status !== "verified" && (
                    <p className="mt-1.5 rounded-lg bg-ink-50 px-3 py-2 text-[12.5px] text-ink-700"><b>{t("Kayıttaki yayın")}:</b> {r.found.authors} ({r.found.year ?? "t.y."}). {r.found.title}.{r.found.container ? ` ${r.found.container}.` : ""}{r.found.doi ? ` https://doi.org/${r.found.doi}` : ""}</p>
                  )}
                </li>
              );
            })}
          </ul>
          <p className="text-xs text-ink-500">{t("“Bulunamadı” her zaman uydurma demek değildir: kitaplar, tezler, kongre bildirileri ve dizinlenmemiş dergiler bu veri tabanlarında olmayabilir. Bu kaynakları kütüphane kataloğunda veya YÖK Tez Merkezi’nde elle kontrol edin.")}</p>
          <SignupCta text={t("Academiana’da yapay zekâ yalnızca doğrulanmış kaynaklara atıf yapar; kaynak uydurmaz. Tezinizi baştan sona güvenle yazın.")} />
        </>
      )}
    </div>
  );
}
