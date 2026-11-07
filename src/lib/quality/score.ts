/**
 * Kalite puanı yöntemi (D120). Puan yalnızca kural tabanlı (deterministik) bulgulardan hesaplanır:
 * 100 − Σ (önem ağırlığı × bulgu çarpanı). Yapay zekâ jürisinin bulguları gösterilir ama puanı değiştirmez;
 * böylece aynı metin her seferinde aynı puanı alır. Puan bilimsel değeri, özgünlüğü veya intihali ölçmez.
 */
export type Severity = "info" | "warning" | "error";
export const SEVERITY_WEIGHTS: Record<Severity, number> = { error: 6, warning: 2.5, info: 0.6 };

export function scoreOf(issues: { id: string; severity: Severity; weight?: number }[]): number {
  const penalty = issues.filter((i) => !String(i.id).startsWith("ai-")).reduce((a, i) => a + SEVERITY_WEIGHTS[i.severity] * (i.weight ?? 1), 0);
  return Math.max(0, Math.min(100, Math.round(100 - penalty)));
}

/** Kategori başına düşülen puan (kural tabanlı bulgular) */
export function penaltyByCategory(issues: { id: string; category: string; severity: Severity; weight?: number }[]): Record<string, number> {
  const out: Record<string, number> = {};
  for (const i of issues) {
    if (String(i.id).startsWith("ai-")) continue;
    out[i.category] = Math.round(((out[i.category] ?? 0) + SEVERITY_WEIGHTS[i.severity] * (i.weight ?? 1)) * 10) / 10;
  }
  return out;
}
