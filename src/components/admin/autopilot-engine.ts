"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Otomatik çalışma motoru (D77): onaylanmış kurgudan çalışmayı uçtan uca yazar.
 * Her adım sitenin mevcut uçlarıyla yapılır (asistan, kaynak araştırma kuralları, kalite kontrol), böylece
 * uydurma yok, kelime hedefleri, başlık disiplini ve “gerektiğinde tarama” kuralları aynen geçerlidir.
 * Tarayıcıda çalışır; durum çalışmanın context.autopilot alanına kaydedilir, kaldığı yerden sürdürülebilir.
 */
import { api } from "@/lib/client";
import { streamChat } from "@/lib/ai/chat-client";
import { readBlueprint } from "@/lib/blueprint";
import { docToPlain, docToTokenMarkdown, findPlaceholderBlocks, blockToTokenText, markdownToDoc, restoreTokens, wordCount, type JSONNode } from "@/lib/editor/doc";
import { applyReview, decideNext, parseHeadingLines, pushLog, TARGET_SCORE, type AutoState, type IssueLike } from "@/lib/autopilot";
import { stageDef } from "@/lib/workflows";
import { writingOrder } from "@/lib/workflows/order";
import { sameHeading, subheadingBudget } from "@/lib/workflows/structure";
import { parseAnswer } from "@/components/workspace/markdown";

type T = (s: string, p?: Record<string, string | number>) => string;
export interface Live { stage?: string; step?: string; status?: string; sourcesAdded: number }

export class Autopilot {
  private state: AutoState;
  private abort = new AbortController();
  private live: Live = { sourcesAdded: 0 };
  private dataSummary = "";
  stopped = false;

  constructor(private projectId: string, initial: AutoState, private t: T, private onUpdate: (s: AutoState, live: Live) => void) {
    this.state = initial;
  }

  stop() { this.stopped = true; this.abort.abort(); }

  /** Kullanıcının bulgu seçimleriyle devam: seçilenler bir kez daha düzeltilir, diğerleri olduğu gibi kalır */
  async resolveReview(fix: string[]) {
    const n = (this.state.pending ?? []).length;
    this.state = applyReview(this.state, fix);
    this.log(this.t("Seçiminiz kaydedildi: {f} bulgu yeniden düzeltilecek, {k} bulgu olduğu gibi kalacak.", { f: fix.length, k: n - fix.length }));
    await this.save();
    await this.run();
  }

  /** Onay bekleyen bulgular varken “bu hâliyle teslim et” */
  async deliverAsIs() {
    this.state = { ...this.state, status: "done", phase: "done", pending: [], finishedAt: new Date().toISOString(), note: this.t("Puan {s}; çalışma sizin onayınızla bu hâliyle teslim edildi.", { s: this.state.score ?? 0 }) };
    this.log(this.t("Çalışma bu hâliyle teslim edildi."));
    await this.save();
    this.emit();
  }

  private emit() { this.onUpdate(this.state, { ...this.live }); }
  private log(text: string) { this.state = pushLog(this.state, text); this.emit(); }
  private setLive(p: Partial<Live>) { this.live = { ...this.live, ...p }; this.emit(); }
  private async save() {
    await api(`/api/projects/${this.projectId}`, { method: "PATCH", json: { context: { autopilot: this.state } } }).catch(() => {});
  }
  private check() { if (this.stopped) throw new DOMException("stopped", "AbortError"); }

  /** Asistana tek istek: metni, kaynak haritasını ve eklenen kaynak sayısını döndürür */
  private async ask(stageId: string | null, action: string, message: string, selection?: string): Promise<{ answer: string; map: Record<string, string> }> {
    this.check();
    let answer = "";
    let map: Record<string, string> = {};
    await streamChat({ projectId: this.projectId, stageId, conversationId: null, action, message, selection }, this.abort.signal, (ev, data) => {
      if (ev === "text") answer += data.text;
      // D97: hedef uzunluğa tamamlanan taslak birleşik olarak gelir
      else if (ev === "replace") answer = data.text;
      else if (ev === "meta") map = data.sourceMap ?? {};
      else if (ev === "status") this.setLive({ status: data.text });
      else if (ev === "sources_added" || ev === "gap_sources") this.setLive({ sourcesAdded: this.live.sourcesAdded + (data.sources?.length ?? 0) });
    }, this.t("Hata"));
    return { answer, map };
  }

  private draftOf(answer: string): string { return parseAnswer(answer).parts.find((p) => p.kind === "draft")?.text?.trim() ?? ""; }

  private async loadStages(): Promise<any[]> { return (await api<{ stages: any[] }>(`/api/projects/${this.projectId}/stages`)).stages; }
  private async loadStage(id: string): Promise<any> { return (await api<{ stage: any }>(`/api/stages/${id}`)).stage; }
  private async saveStage(id: string, doc: JSONNode, note: string, status: "done" | "in_progress" = "done") {
    await api(`/api/stages/${id}`, { method: "PATCH", json: { content: doc, status, snapshot: { note, author: "ai" } } });
  }
  /** Taslak gelmezse bir kez daha dener */
  private async draftWithRetry(stageId: string, action: string, msg: string): Promise<{ md: string; map: Record<string, string> }> {
    for (let k = 0; k < 2; k++) {
      const { answer, map } = await this.ask(stageId, action, msg);
      const md = this.draftOf(answer);
      if (md) return { md, map };
    }
    return { md: "", map: {} };
  }

  /** Veri dosyası varsa bulgu bölümleri için deterministik özet (değerler uydurulmaz; platform hesaplar) */
  private async loadDataSummary() {
    const { files } = await api<{ files: any[] }>(`/api/files?projectId=${this.projectId}`).catch(() => ({ files: [] as any[] }));
    const data = files.filter((f) => f.project_id === this.projectId && (/csv|sheet/.test(f.mime_type) || /\.(csv|xlsx)$/i.test(f.name)));
    const parts: string[] = [];
    for (const f of data.slice(0, 2)) {
      try {
        const { summary } = await api<{ summary: any }>(`/api/files/${f.id}/stats`);
        const lines = [`VERİ ÖZETİ — “${f.name}” (platform tarafından hesaplandı, N = ${summary.rows})`];
        for (const c of summary.columns) lines.push(c.kind === "numeric" ? `- ${c.name}: n=${c.n}, M=${c.mean}, SD=${c.sd}, Min=${c.min}, Max=${c.max}` : `- ${c.name}: ${c.levels.slice(0, 6).map((l: any) => `${l.value} ${l.count} (%${l.pct})`).join("; ")}`);
        if (summary.correlations?.length) lines.push("Pearson korelasyonları:", ...summary.correlations.slice(0, 20).map((r: any) => `- ${r.a} × ${r.b}: r=${r.r} (n=${r.n})`));
        parts.push(lines.join("\n"));
      } catch { /* özet alınamazsa veri yer tutucusu kalır */ }
    }
    this.dataSummary = parts.join("\n\n");
  }

  /** Bir bölümü yazar: uzun bölümde alt başlık alt başlık, kısa bölümde tek parça */
  private async writeStage(st: any, words: number) {
    const def = stageDef(st.key);
    const budget = subheadingBudget(st.key, words);
    const dataNote = def?.requiresUserData ? (this.dataSummary ? `\n\n${this.dataSummary}\n\nBu bölümde YALNIZCA yukarıdaki gerçek veri özetindeki değerleri kullan; olmayan değer, test sonucu veya bulgu yazma, gerekiyorsa [VERİ GİRİLECEK] bırak.` : "\n\nGerçek araştırma verisi yüklenmedi: hiçbir değer veya bulgu uydurma; gereken yerlere [VERİ GİRİLECEK] yaz ve tablo şablonlarını boş bırak.") : "";
    const nodes: JSONNode[] = [];
    if (st.key === "title_abstract" || st.key === "grant_summary") {
      this.setLive({ step: this.t("Özet yazılıyor") });
      const { answer, map } = await this.ask(st.id, "abstract", this.t("Özet ve Abstract"));
      const md = this.draftOf(answer);
      if (md) nodes.push(...(markdownToDoc(md, (sid) => map[sid] ?? null).content ?? []));
    } else {
      let heads: string[] = [];
      if (budget > 0) {
        this.setLive({ step: this.t("Alt başlıklar planlanıyor") });
        const { answer } = await this.ask(st.id, "outline", `Bu bölüm için akademik usule uygun alt başlıklar öner: en fazla ${budget} tane; yalnızca birbirinden belirgin biçimde ayrı alt konular için başlık aç, bölüm adını tekrar eden başlık önerme. Kurgudaki bölüm planına uy. Yalnızca bir :::taslak bloğu içinde her satıra bir alt başlık yaz; numara veya açıklama ekleme.`);
        heads = parseHeadingLines(this.draftOf(answer), st.title, budget, sameHeading);
      }
      if (heads.length >= 2) {
        const per = words ? Math.max(250, Math.round(words / heads.length / 10) * 10) : 0;
        for (const [i, h] of heads.entries()) {
          this.setLive({ step: this.t("Alt başlık {i}/{n}: {h}", { i: i + 1, n: heads.length, h }) });
          const msg = `Bu bölümün yalnızca “${h}” alt başlığını yaz. Taslağı “## ${h}” başlığıyla başlat; diğer alt başlıkları yazma. Önceki alt başlıklarda yazılanları tekrar etme, konuya yeniden giriş yapma ve alt başlığı özet cümlesiyle bitirme.${per ? ` Uzunluk: yaklaşık ${per} kelime.` : ""}${dataNote}`;
          const r = await this.draftWithRetry(st.id, "draft", msg);
          let md = r.md;
          const map = r.map;
          if (!md) { this.log(this.t("“{h}” yazılamadı; atlandı.", { h })); continue; }
          if (!/^#{1,4}\s/.test(md)) md = `## ${h}\n\n${md}`;
          nodes.push(...(markdownToDoc(md, (sid) => map[sid] ?? null).content ?? []));
          // Her alt başlıktan sonra kaydet: asistan sonraki alt başlıkta mevcut metni görür (tekrar etmesin)
          await this.saveStage(st.id, { type: "doc", content: nodes }, this.t("Otomatik yazım (devam ediyor)"), "in_progress");
        }
      } else {
        this.setLive({ step: this.t("Bölüm yazılıyor") });
        const msg = `Bu bölümü yaz.${words ? ` Uzunluk: bölümün tamamı yaklaşık ${words} kelime.` : ""}${dataNote}`;
        const { md, map } = await this.draftWithRetry(st.id, "draft", msg);
        if (md) nodes.push(...(markdownToDoc(md, (sid) => map[sid] ?? null).content ?? []));
      }
    }
    // Bölüm adını tekrar eden ilk başlık eklenmez
    const first = nodes[0];
    if (first?.type === "heading" && sameHeading(docToPlain({ type: "doc", content: first.content }), st.title)) nodes.shift();
    if (!nodes.length) { this.log(this.t("“{s}” için metin üretilemedi.", { s: st.title })); return false; }
    await this.saveStage(st.id, { type: "doc", content: nodes }, this.t("Otomatik yazım"));
    return true;
  }

  /** [KAYNAK GEREKLİ] işaretli paragrafları kaynakla destekler (gerekirse kaynak arar) */
  private async fixPlaceholders(stageId: string) {
    const st = await this.loadStage(stageId);
    const doc = st.content as JSONNode;
    const blocks = findPlaceholderBlocks(doc).filter((b) => (doc.content ?? []).includes(b)).slice(0, 8);
    let changed = false;
    for (const b of blocks) {
      const { text, tokens } = blockToTokenText(b);
      const { answer, map } = await this.ask(stageId, "fix_claim", "Aşağıdaki paragraftaki [KAYNAK GEREKLİ] işaretli iddialar için kaynak bul ve paragrafı düzelt. ⟦C1⟧ gibi işaretler mevcut atıflardır; yerlerini ve yazımını aynen koru.", text);
      const md = this.draftOf(answer);
      if (!md) continue;
      const repl = restoreTokens(markdownToDoc(md, (sid) => map[sid] ?? null).content ?? [], tokens);
      const i = (doc.content ?? []).indexOf(b);
      if (i >= 0 && repl.length) { doc.content!.splice(i, 1, ...repl); changed = true; }
    }
    if (changed) await this.saveStage(stageId, doc, this.t("Otomatik düzeltme: kaynak gerektiren ifadeler"));
  }

  /** Bölümü sorunlarıyla birlikte gözden geçirir; atıflar ⟦Cn⟧ ile korunur, kısalırsa reddedilir */
  private async reviseStage(stageId: string, issues: IssueLike[]) {
    const st = await this.loadStage(stageId);
    const { md: src, tokens } = docToTokenMarkdown(st.content as JSONNode);
    if (!src.trim()) return;
    const list = issues.slice(0, 12).map((x, k) => `${k + 1}. ${x.title}${x.detail ? `: ${x.detail}` : ""}`).join("\n");
    const { answer, map } = await this.ask(stageId, "chat", `Aşağıda bu bölümün tamamı var. Şu kalite sorunlarını gider:\n${list}\n\nBölümün TAMAMINI düzeltilmiş hâliyle tek bir :::taslak bloğunda ver. ⟦C1⟧ gibi işaretler mevcut atıflardır; hepsini yerinde ve aynen koru. Başlık yapısını koru, yeni başlık açma; yeni bilgi, veri veya kaynak uydurma; [VERİ GİRİLECEK] işaretlerini koru. Uzunluğu yaklaşık aynı tut.`, src);
    const md = this.draftOf(answer);
    if (!md) return;
    const nodes = restoreTokens(markdownToDoc(md, (sid) => map[sid] ?? null).content ?? [], tokens);
    const before = wordCount(docToPlain(st.content)), after = wordCount(docToPlain({ type: "doc", content: nodes }));
    if (after < before * 0.75) { this.log(this.t("“{s}” düzeltmesi metni kısalttığı için uygulanmadı.", { s: st.title })); return; }
    await this.saveStage(stageId, { type: "doc", content: nodes }, this.t("Otomatik düzeltme: kalite sorunları"));
  }

  /** Doğrulanmamış kaynakları yeniden doğrular; doğrulanamayan ve hiç atıf almayanları çıkarır */
  private async fixSources(stages: any[]) {
    const { sources } = await api<{ sources: any[] }>(`/api/projects/${this.projectId}/sources`);
    const cited = new Set<string>();
    for (const s of stages) for (const id of JSON.stringify(s.content ?? {}).match(/"ids":\[[^\]]*\]/g) ?? []) for (const m of id.match(/[0-9a-f-]{36}/g) ?? []) cited.add(m);
    let verified = 0, removed = 0;
    for (const src of sources.filter((x) => !x.verified).slice(0, 30)) {
      this.check();
      const r = await api<{ source: any }>(`/api/sources/${src.id}/verify`, { method: "POST" }).catch(() => null);
      if (r?.source?.verified) verified++;
      else if (!cited.has(src.id)) { await api(`/api/sources/${src.id}`, { method: "DELETE" }).catch(() => {}); removed++; }
    }
    if (verified || removed) this.log(this.t("Kaynaklar: {v} doğrulandı, atıf almayan {r} doğrulanamayan kaynak çıkarıldı.", { v: verified, r: removed }));
  }

  async run() {
    this.stopped = false;
    this.abort = new AbortController();
    this.state = { ...this.state, status: "running" };
    this.emit();
    try {
      const { project } = await api<{ project: any }>(`/api/projects/${this.projectId}`);
      const bp = readBlueprint(project.context?.blueprint);
      const wordsOf = (id: string) => bp?.chapters.find((c) => c.stageId === id)?.words ?? 0;

      // 1) Başlık
      if (!project.context?.titleChosen) {
        this.state = { ...this.state, phase: "title" }; this.setLive({ stage: this.t("Başlık"), step: this.t("Başlık önerileri hazırlanıyor") });
        const { titles } = await api<{ titles: { title: string }[] }>(`/api/projects/${this.projectId}/titles`, { method: "POST", json: {} });
        if (titles[0]) { await api(`/api/projects/${this.projectId}`, { method: "PATCH", json: { title: titles[0].title, context: { titleChosen: true } } }); this.log(this.t("Başlık: {t}", { t: titles[0].title })); }
        await this.save();
      }

      // 2) Bölümler (önerilen yazım sırası; özet en son; kaynakça otomatik)
      await this.loadDataSummary();
      this.state = { ...this.state, phase: this.state.phase === "title" ? "write" : this.state.phase };
      if (this.state.phase === "write") {
        const stages = writingOrder(await this.loadStages());
        for (const st of stages) {
          this.check();
          if (st.status === "done" && st.word_count > 0) continue;
          this.setLive({ stage: st.title, step: "", status: "" });
          const ok = await this.writeStage(st, wordsOf(st.id));
          if (ok) this.log(this.t("“{s}” yazıldı.", { s: st.title }));
          await this.save();
        }
        this.state = { ...this.state, phase: "quality" };
        await this.save();
      }

      // 3) Kalite kontrol → düzeltme döngüsü (D78): yapay zekâ jüri incelemesi yalnızca ilk turda; her bulgu en fazla
      //    bir kez otomatik düzeltilir; düzeltilemeyen veya sürüp giden bulgularda kullanıcıya sorulur (döngü yok)
      while (true) {
        this.check();
        const withAi = !this.state.aiReviewed;
        this.setLive({ stage: this.t("Kalite kontrol"), step: this.t("Tur {n}", { n: this.state.round + 1 }), status: "" });
        const { report } = await api<{ report: any }>(`/api/projects/${this.projectId}/quality`, { method: "POST", json: { withAi } });
        if (withAi) this.state = { ...this.state, aiReviewed: true };
        const score = Number(report?.score ?? 0);
        const issues: IssueLike[] = report?.report?.issues ?? [];
        this.state = { ...this.state, score };
        this.log(this.t("Kalite puanı: {s} ({n} bulgu)", { s: score, n: issues.length }));
        const next = decideNext(score, issues, this.state);
        if (next.kind === "done") {
          const note = score >= TARGET_SCORE ? "" : this.t("Puan {s}; kalan bulgular sizin onayınızla olduğu gibi bırakıldı.", { s: score });
          this.state = { ...this.state, status: "done", phase: "done", pending: [], finishedAt: new Date().toISOString(), note };
          this.log(score >= TARGET_SCORE ? this.t("Çalışma tamamlandı ve teslim edildi.") : this.t("Çalışma tamamlandı; kalan bulgular onayınızla bırakıldı."));
          await this.save();
          this.emit();
          return;
        }
        if (next.kind === "review") {
          this.state = { ...this.state, status: "review", pending: next.pending };
          this.log(this.t("Otomatik düzeltilemeyen {n} bulgu var; hangilerinin düzeltileceğini seçmeniz bekleniyor.", { n: next.pending.length }));
          await this.save();
          this.emit();
          return;
        }
        // Düzeltmeler
        const plan = next.plan;
        this.state = { ...this.state, phase: "fix", round: this.state.round + 1, attempted: [...new Set([...(this.state.attempted ?? []), ...next.keys])], forceFix: [] };
        await this.save();
        const stages = await this.loadStages();
        const byKey = (k: string) => stages.find((s) => s.key === k);
        for (const k of plan.rewrite) {
          const st = byKey(k); if (!st) continue;
          this.setLive({ stage: st.title, step: this.t("Yeniden yazılıyor") });
          await this.writeStage(st, wordsOf(st.id));
          this.log(this.t("“{s}” yeniden yazıldı.", { s: st.title }));
        }
        for (const k of plan.placeholders) {
          const st = byKey(k); if (!st) continue;
          this.setLive({ stage: st.title, step: this.t("Kaynak gerektiren ifadeler düzeltiliyor") });
          await this.fixPlaceholders(st.id);
        }
        for (const [k, list] of Object.entries(plan.revise)) {
          const st = byKey(k); if (!st) continue;
          this.setLive({ stage: st.title, step: this.t("Kalite sorunları gideriliyor") });
          await this.reviseStage(st.id, list);
        }
        if (plan.verifySources) {
          this.setLive({ stage: this.t("Kaynaklar"), step: this.t("Doğrulanıyor") });
          const full = await Promise.all(stages.map((s) => this.loadStage(s.id).catch(() => s)));
          await this.fixSources(full);
        }
        this.log(this.t("Düzeltme turu {n} tamamlandı.", { n: this.state.round }));
        await this.save();
      }
    } catch (e) {
      if ((e as Error).name === "AbortError") { this.state = { ...this.state, status: "paused" }; this.log(this.t("Duraklatıldı; kaldığı yerden sürdürülebilir.")); }
      else { this.state = { ...this.state, status: "failed" }; this.log(this.t("Hata: {e}", { e: (e as Error).message })); }
      await this.save();
      this.emit();
    }
  }
}
/* eslint-enable @typescript-eslint/no-explicit-any */
