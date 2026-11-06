"use client";
import type { CaptionFormat } from "@/lib/citations/captions";

/** Tablo/şekil başlığının seçili atıf stilindeki önizlemesi (D106) */
export function CaptionPreview({ fmt }: { fmt: CaptionFormat }) {
  return (
    <div className={`text-[13px] text-ink-700 ${fmt.align === "center" ? "text-center" : "text-left"}`}>
      {fmt.lines.map((l, k) => <p key={k}>{l.map((r, j) => <span key={j} className={`${r.bold ? "font-semibold" : ""} ${r.italic ? "italic" : ""}`}>{r.text}</span>)}</p>)}
    </div>
  );
}
