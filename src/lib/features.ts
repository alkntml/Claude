/**
 * Pakete göre özellik erişimi (D49). İstemci ve sunucu ortak, saf fonksiyonlar.
 * Paket kartlarındaki özellik listeleri bu tabloyla tutarlı olmalı (migration 10).
 */
import { PLAN_RANK } from "./pricing";

export type PlanId = "free" | "basic" | "pro" | "premium";

export type FeatureId =
  | "quality_ai" // yapay zekâ destekli kalite raporu
  | "stats" // istatistik analizleri ve APA grafikleri
  | "surveys" // anket oluşturucu
  | "bib_io" // Zotero / Mendeley / EndNote içe-dışa aktarma
  | "topics" // tez konusu bulma
  | "matrix" // literatür matrisi
  | "journals" // dergi önerisi ve dergi kılavuzu kontrolü
  | "guideline" // yazım kılavuzundan bölüm yapısı önerisi
  | "reviewer" // hakem yorumlarına cevap
  | "defense"; // savunma sunumu ve savunma provası

export const FEATURE_MIN_PLAN: Record<FeatureId, PlanId> = {
  quality_ai: "basic",
  stats: "basic",
  surveys: "basic",
  bib_io: "basic",
  topics: "basic",
  matrix: "pro",
  journals: "pro",
  guideline: "pro",
  reviewer: "pro",
  defense: "pro",
};

/** Kullanıcıya gösterilen özellik adları (t() ile çevrilir) */
export const FEATURE_LABEL: Record<FeatureId, string> = {
  quality_ai: "Yapay zekâ destekli kalite raporu",
  stats: "İstatistik analizleri ve grafikler",
  surveys: "Anket oluşturucu",
  bib_io: "Zotero / Mendeley / EndNote aktarımı",
  topics: "Tez konusu bulma",
  matrix: "Literatür matrisi",
  journals: "Dergi önerisi ve dergi kılavuzu kontrolü",
  guideline: "Yazım kılavuzu yükleme",
  reviewer: "Hakem yorumlarına cevap asistanı",
  defense: "Savunma sunumu ve savunma provası",
};

export const PLAN_NAME: Record<PlanId, string> = { free: "Ücretsiz", basic: "Basic", pro: "Pro", premium: "Premium" };

export function hasFeature(planId: string | null | undefined, feature: FeatureId): boolean {
  return (PLAN_RANK[planId ?? "free"] ?? 0) >= PLAN_RANK[FEATURE_MIN_PLAN[feature]];
}
