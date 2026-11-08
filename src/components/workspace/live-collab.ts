"use client";
/**
 * Gerçek zamanlı ortak yazım (D140): Supabase Realtime özel kanalı “project:<id>”.
 * - Varlık (presence): kim burada, hangi bölümde, hangi paragrafta, şu an yazıyor mu — anında.
 * - Yayın (broadcast): bölümün güncel belgesi yazarken ~0,5 sn’de bir diğer yazarlara gider; kayıt sonrası “saved”.
 * Kanal yetkisi veritabanındaki RLS kuralıyla verilir (migration 37). Kanal açılamazsa (migration yok, ağ engeli)
 * durum “unavailable” olur ve çalışma alanı eski yoklama yöntemiyle devam eder.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import type { JSONNode } from "@/lib/editor/doc";
import { createBrowser } from "@/lib/supabase/browser";

export interface LivePeer { userId: string; name: string; stageId: string | null; block: number | null; typing: boolean }
export interface LiveDocMsg { stageId: string; doc: JSONNode; from: string; name: string }
export interface LiveSavedMsg { stageId: string; updatedAt: string; from: string; name: string; doc?: JSONNode }
export type LiveStatus = "off" | "connecting" | "live" | "unavailable";

/** Yayınla gönderilecek en büyük belge (bayt); daha büyük bölümlerde yalnızca “kaydedildi” sinyali gider */
export const MAX_LIVE_DOC = 180_000;

export function useLiveCollab(o: {
  projectId: string; enabled: boolean; me: { id: string; name: string }; canWrite: boolean;
  onDoc: (m: LiveDocMsg) => void; onSaved: (m: LiveSavedMsg) => void;
}) {
  const [status, setStatus] = useState<LiveStatus>("off");
  const [peers, setPeers] = useState<LivePeer[]>([]);
  const ch = useRef<RealtimeChannel | null>(null);
  const cb = useRef(o);
  cb.current = o;
  const mine = useRef<Omit<LivePeer, "userId" | "name">>({ stageId: null, block: null, typing: false });
  const trackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const supabase = useMemo(() => (o.enabled && typeof window !== "undefined" && process.env.NEXT_PUBLIC_SUPABASE_URL ? createBrowser() : null), [o.enabled]);

  useEffect(() => {
    if (!o.enabled || !supabase) { setStatus("off"); setPeers([]); return; }
    let closed = false;
    setStatus("connecting");
    (async () => {
      try { await supabase.realtime.setAuth(); } catch { /* oturum çerezinden alınır */ }
      if (closed) return;
      const channel = supabase.channel(`project:${o.projectId}`, { config: { private: true, broadcast: { self: false }, presence: { key: o.me.id } } });
      ch.current = channel;
      channel
        .on("presence", { event: "sync" }, () => {
          const state = channel.presenceState<LivePeer>();
          const list: LivePeer[] = [];
          for (const metas of Object.values(state)) {
            const m = metas[metas.length - 1];
            if (m && m.userId !== cb.current.me.id) list.push({ userId: m.userId, name: m.name, stageId: m.stageId ?? null, block: m.block ?? null, typing: !!m.typing });
          }
          setPeers(list);
        })
        .on("broadcast", { event: "doc" }, ({ payload }) => { if (payload?.stageId && payload.doc) cb.current.onDoc(payload as LiveDocMsg); })
        .on("broadcast", { event: "saved" }, ({ payload }) => { if (payload?.stageId) cb.current.onSaved(payload as LiveSavedMsg); })
        .subscribe(async (s) => {
          if (closed) return;
          if (s === "SUBSCRIBED") {
            setStatus("live");
            await channel.track({ userId: cb.current.me.id, name: cb.current.me.name, ...mine.current }).catch(() => {});
          } else if (s === "CHANNEL_ERROR" || s === "TIMED_OUT") {
            setStatus("unavailable");
          } else if (s === "CLOSED") {
            setStatus((x) => (x === "live" ? "unavailable" : x));
          }
        });
    })();
    return () => {
      closed = true;
      if (trackTimer.current) clearTimeout(trackTimer.current);
      const c = ch.current;
      ch.current = null;
      if (c) supabase.removeChannel(c).catch(() => {});
      setPeers([]);
    };
  }, [o.enabled, o.projectId, o.me.id, supabase]);

  /** Konumumu bildirir (en çok saniyede bir; yazmayı bırakınca “yazıyor” 2,5 sn sonra söner) */
  const update = useCallback((next: Partial<Omit<LivePeer, "userId" | "name">>) => {
    const prev = mine.current;
    mine.current = { ...prev, ...next };
    const changed = prev.stageId !== mine.current.stageId || prev.block !== mine.current.block || prev.typing !== mine.current.typing;
    if (!changed || !ch.current) return;
    if (trackTimer.current) clearTimeout(trackTimer.current);
    const urgent = prev.stageId !== mine.current.stageId || (!prev.typing && mine.current.typing);
    trackTimer.current = setTimeout(() => {
      ch.current?.track({ userId: cb.current.me.id, name: cb.current.me.name, ...mine.current }).catch(() => {});
    }, urgent ? 0 : 600);
  }, []);

  const sendDoc = useCallback((stageId: string, doc: JSONNode): boolean => {
    const c = ch.current;
    if (!c || !cb.current.canWrite) return false;
    const payload = { stageId, doc, from: cb.current.me.id, name: cb.current.me.name };
    if (JSON.stringify(payload).length > MAX_LIVE_DOC) return false;
    c.send({ type: "broadcast", event: "doc", payload }).catch(() => {});
    return true;
  }, []);

  const sendSaved = useCallback((stageId: string, updatedAt: string, doc?: JSONNode) => {
    const c = ch.current;
    if (!c || !cb.current.canWrite) return;
    const payload: LiveSavedMsg = { stageId, updatedAt, from: cb.current.me.id, name: cb.current.me.name };
    if (doc && JSON.stringify(doc).length < MAX_LIVE_DOC) payload.doc = doc;
    c.send({ type: "broadcast", event: "saved", payload }).catch(() => {});
  }, []);

  return { status, peers, update, sendDoc, sendSaved };
}
