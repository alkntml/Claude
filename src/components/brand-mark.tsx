/**
 * D211: Academiana’nın üç imza zekâsının adı (Zenit yazar, Rasat okur, Mizan tartar) her yerde aynı görünür:
 * keskin indigo geçişli yazı ve arkasında yumuşak ışık halesi (globals.css → .sig-mark). Adlar çevrilmez.
 */
import { Fragment } from "react";
import { cn } from "@/components/ui/cn";

export const SIGNATURES = ["Zenit", "Rasat", "Mizan"] as const;
export type Signature = (typeof SIGNATURES)[number];

export function BrandMark({ name, className }: { name: Signature; className?: string }) {
  return <span className={cn("sig-mark", className)} data-text={name}>{name}</span>;
}

const RE = /(Zenit|Rasat|Mizan)/g;
/** Metindeki imza adlarını BrandMark ile gösterir (çevrilmiş metinde de adlar aynı kaldığı için çalışır) */
export function WithMarks({ text, className }: { text: string; className?: string }) {
  const parts = text.split(RE);
  if (parts.length === 1) return <>{text}</>;
  return <>{parts.map((p, i) => (i % 2 ? <BrandMark key={i} name={p as Signature} className={className} /> : <Fragment key={i}>{p}</Fragment>))}</>;
}
