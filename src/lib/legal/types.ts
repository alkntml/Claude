/** Hukuki metin içeriği: bölüm başlığı + paragraf ({ p }) veya madde listesi ({ ul }) blokları */
export type LegalBlock = { p: string } | { ul: string[] };
export interface LegalSection { h: string; b: LegalBlock[] }
export type LegalDocId = "kvkk" | "terms" | "fair_use" | "cookies" | "integrity" | "distance" | "gdpr";
export type LegalContent = Record<LegalDocId, LegalSection[]>;
