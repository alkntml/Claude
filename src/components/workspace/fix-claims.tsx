"use client";
import { Check, Loader2, SkipForward, Sparkles, Wand2 } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/components/ui/cn";
import { Modal } from "@/components/ui/primitives";
import { useT } from "@/i18n/client";
import { streamChat } from "@/lib/ai/chat-client";
import { blockToTokenText, docToPlain, findPlaceholderBlocks, markdownToDoc, restoreTokens, type JSONNode } from "@/lib/editor/doc";
import { Markdown, parseAnswer } from "./markdown";

/* eslint-disable @typescript-eslint/no-explicit-any */
interface Found { stageId: string; stageTitle: string; plain: string; tokenText: string; tokens: JSONNode[] }
interface Proposal { state: "waiting" | "running" | "ready" | "applied" | "skipped" | "failed"; md?: string; map?: Record<string, string>; added?: number; error?: string }

/** Projedeki tüm yer tutucuları bulur */
export function collectPlaceholders(stages: any[]): Found[] {
  return stages.flatMap((st) => findPlaceholderBlocks(st.content as JSONNode).map((b) => {
    const { text, tokens } = blockToTokenText(b);
    return { stageId: st.id, stageTitle: st.title, plain: docToPlain({ type: "doc", content: b.content }), tokenText: text, tokens };
  }));
}

/**
 * Eski metinlerdeki [KAYNAK GEREKLİ] işaretlerini toplu düzeltir: her paragraf için kaynak aranır,
 * asistan paragrafı kaynakla destekler veya iddiayı yumuşatır; kullanıcı her öneriyi onaylar.
 */
export function FixClaimsModal({ open, onClose, projectId, stages, sourceExists, onSourcesAdded, applyBlock }: {
  open: boolean; onClose: () => void; projectId: string; stages: any[];
  sourceExists: (id: string) => boolean;
  onSourcesAdded: (rows: any[]) => void;
  /** Paragrafı değiştir (true = başarılı) */
  applyBlock: (stageId: string, plain: string, nodes: JSONNode[]) => Promise<boolean>;
}) {
  const { t } = useT();
  const found = useMemo(() => (open ? collectPlaceholders(stages) : []), [open, stages]);
  const [snapshot, setSnapshot] = useState<Found[]>([]);
  const [props, setProps] = useState<Proposal[]>([]);
  const [running, setRunning] = useState(false);
  const abort = useRef<AbortController | null>(null);
  const list = snapshot.length ? snapshot : found;
  const upd = (i: number, p: Partial<Proposal>) => setProps((l) => l.map((x, k) => (k === i ? { ...x, ...p } : x)));

  async function run() {
    const items = found.slice(0, 20);
    setSnapshot(items);
    setProps(items.map(() => ({ state: "waiting" })));
    setRunning(true);
    for (let i = 0; i < items.length; i++) {
      upd(i, { state: "running" });
      abort.current = new AbortController();
      let answer = "";
      let map: Record<string, string> = {};
      let added = 0;
      try {
        await streamChat({
          projectId, stageId: items[i].stageId, conversationId: null, action: "fix_claim",
          message: t("Aşağıdaki paragraftaki [KAYNAK GEREKLİ] işaretli iddialar için kaynak bul ve paragrafı düzelt. ⟦C1⟧ gibi işaretler mevcut atıflardır; yerlerini ve yazımını aynen koru."),
          selection: items[i].tokenText,
        }, abort.current.signal, (ev, data) => {
          if (ev === "meta") map = data.sourceMap;
          else if (ev === "text") answer += data.text;
          else if (ev === "sources_added" || ev === "gap_sources" || ev === "fulltext_read") { onSourcesAdded(data.sources); if (ev !== "fulltext_read") added += data.sources.length; }
        }, t("Hata"));
        const md = parseAnswer(answer).parts.find((p) => p.kind === "draft")?.text?.trim();
        upd(i, md ? { state: "ready", md, map, added } : { state: "failed", error: t("Öneri üretilemedi") });
      } catch (e) {
        if ((e as Error).name === "AbortError") { upd(i, { state: "skipped" }); break; }
        upd(i, { state: "failed", error: (e as Error).message });
      }
    }
    abort.current = null;
    setRunning(false);
  }

  async function accept(i: number) {
    const f = list[i]; const p = props[i];
    if (!p?.md) return;
    const doc = markdownToDoc(p.md, (sid) => (p.map?.[sid] && sourceExists(p.map[sid]) ? p.map[sid] : null));
    const nodes = restoreTokens(doc.content ?? [], f.tokens);
    const ok = await applyBlock(f.stageId, f.plain, nodes);
    upd(i, ok ? { state: "applied" } : { state: "failed", error: t("Paragraf metinde bulunamadı (değiştirilmiş olabilir).") });
  }

  function close() { abort.current?.abort(); setSnapshot([]); setProps([]); onClose(); }
  const pending = props.filter((p) => p.state === "ready").length;

  return (
    <Modal open={open} onClose={close} title={t("Kaynak gerektiren ifadeleri düzelt")} wide
      footer={running
        ? <Button variant="secondary" onClick={() => abort.current?.abort()}>{t("Durdur")}</Button>
        : props.length
          ? <>{pending > 0 && <Button onClick={async () => { for (let i = 0; i < props.length; i++) if (props[i].state === "ready") await accept(i); }}><Check className="h-4 w-4" /> {t("Hepsini uygula ({n})", { n: pending })}</Button>}<Button variant="dark" onClick={close}>{t("Kapat")}</Button></>
          : <><Button variant="ghost" onClick={close}>{t("Vazgeç")}</Button><Button onClick={run} disabled={!found.length}><Wand2 className="h-4 w-4" /> {t("Kaynak bul ve düzelt")}</Button></>}>
      {!props.length ? (
        <div className="space-y-3">
          <p className="text-sm text-ink-500">{found.length ? t("Projede {n} paragrafta “[KAYNAK GEREKLİ]” işareti var. Her biri için veri tabanlarında kaynak aranır; asistan paragrafı bulunan kaynaklarla destekler, kaynak bulunamazsa iddiayı yumuşatır. Hiçbir değişiklik onayınız olmadan uygulanmaz.", { n: found.length }) : t("Projede “[KAYNAK GEREKLİ]” işareti bulunmadı.")}</p>
          {found.slice(0, 20).map((f, i) => <div key={i} className="rounded-xl border border-ink-100 p-3 text-[13px]"><p className="text-xs font-semibold text-ink-500">{f.stageTitle}</p><p className="mt-1 line-clamp-3 text-ink-700">{f.plain}</p></div>)}
          {found.length > 20 && <p className="text-xs text-ink-400">{t("Tek seferde en fazla 20 paragraf işlenir.")}</p>}
        </div>
      ) : (
        <div className="space-y-3">
          {list.map((f, i) => {
            const p = props[i] ?? { state: "waiting" };
            return (
              <div key={i} className={cn("rounded-2xl border p-3.5", p.state === "applied" ? "border-emerald-200 bg-emerald-50/40" : p.state === "running" ? "border-brand-200 bg-brand-50/30" : "border-ink-100")}>
                <div className="flex items-center gap-2">
                  {p.state === "running" && <Loader2 className="h-4 w-4 animate-spin text-brand-600" />}
                  {p.state === "applied" && <Check className="h-4 w-4 text-emerald-600" />}
                  <p className="min-w-0 flex-1 truncate text-xs font-semibold text-ink-500">{f.stageTitle}</p>
                  {p.added ? <span className="text-xs text-ink-400">{t("{n} yeni kaynak", { n: p.added })}</span> : null}
                </div>
                <p className="mt-1.5 text-[13px] text-ink-500 line-through decoration-ink-300">{f.plain}</p>
                {p.md && p.state !== "applied" && <div className="mt-2 rounded-xl bg-white p-3 ring-1 ring-brand-100"><Markdown text={p.md.replace(/⟦C\d+⟧/g, `[${t("mevcut atıf")}]`)} sourceMap={p.map ?? {}} serif /></div>}
                {p.error && <p className="mt-1.5 text-xs text-rose-600">{p.error}</p>}
                {p.state === "ready" && (
                  <div className="mt-2 flex flex-wrap justify-end gap-2">
                    <Button size="sm" variant="ghost" onClick={() => upd(i, { state: "skipped" })}><SkipForward className="h-3.5 w-3.5" /> {t("Atla")}</Button>
                    <Button size="sm" onClick={() => accept(i)}><Sparkles className="h-3.5 w-3.5" /> {t("Uygula")}</Button>
                  </div>
                )}
                {p.state === "waiting" && <p className="mt-1 text-xs text-ink-400">{t("Sırada")}</p>}
                {p.state === "skipped" && <p className="mt-1 text-xs text-ink-400">{t("Atlandı")}</p>}
              </div>
            );
          })}
        </div>
      )}
    </Modal>
  );
}
/* eslint-enable @typescript-eslint/no-explicit-any */
