/**
 * schema.org yapılandırılmış verileri (JSON-LD). Yalnızca gerçek bilgiler kullanılır:
 * sahte puan/yorum (aggregateRating, review) EKLENMEZ — Google kurallarına aykırıdır.
 */
import type { Locale } from "@/i18n";
import { absoluteUrl, localizedPath } from "./seo";
import { SITE_NAME, SITE_URL } from "./site";
import { priceNumber } from "@/lib/pricing";

const ORG_ID = `${SITE_URL}/#organization`;
const SITE_ID = `${SITE_URL}/#website`;

export function organizationLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": ORG_ID,
    name: SITE_NAME,
    alternateName: ["Academiana AI", "Akademi AI"],
    url: SITE_URL,
    logo: { "@type": "ImageObject", url: `${SITE_URL}/icons/icon-512.png`, width: 512, height: 512 },
    image: `${SITE_URL}/brand/academiana-logo.png`,
    slogan: "Akademik destek ve danışmanlık",
    description: "Yapay zekâ destekli, gerçek akademik kaynaklarla çalışan tez, makale ve araştırma yazım platformu. / AI-assisted academic writing platform that works with real, verified sources.",
    areaServed: ["TR", "Worldwide"],
    knowsLanguage: ["tr", "en"],
  };
}

export function websiteLd(locale: Locale) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": SITE_ID,
    name: SITE_NAME,
    url: SITE_URL,
    inLanguage: ["tr-TR", "en"],
    publisher: { "@id": ORG_ID },
    description: locale === "en" ? "AI thesis and academic writing assistant with real sources." : "Gerçek kaynaklarla yapay zekâ destekli tez ve akademik yazım platformu.",
  };
}

interface PlanLike { id: string; name: string; price_monthly: number | string; currency?: string | null }

export function softwareLd(locale: Locale, plans: PlanLike[], usdTry?: number) {
  const en = locale === "en";
  // İngilizce sayfada fiyatlar dolar (D59)
  const prices = plans.map((p) => priceNumber(Number(p.price_monthly), locale, usdTry).amount).filter((n) => Number.isFinite(n));
  const currency = en ? "USD" : plans.find((p) => p.currency)?.currency ?? "TRY";
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "@id": `${SITE_URL}/#software`,
    name: SITE_NAME,
    url: absoluteUrl(localizedPath("/", locale)),
    applicationCategory: "EducationalApplication",
    applicationSubCategory: en ? "Academic writing and research assistant" : "Akademik yazım ve araştırma asistanı",
    operatingSystem: "Web, Android, iOS",
    inLanguage: ["tr", "en"],
    publisher: { "@id": ORG_ID },
    image: `${SITE_URL}/icons/icon-512.png`,
    description: en
      ? "Write theses, research papers, literature reviews and research proposals step by step with verified academic sources, automatic citations in 9 styles, statistics, surveys and charts."
      : "Tez, makale, literatür taraması ve araştırma önerisini doğrulanmış akademik kaynaklarla adım adım yazın; 9 stilde otomatik atıf, istatistik, anket ve grafik.",
    featureList: en
      ? ["Search 10+ academic databases (OpenAlex, Crossref, PubMed, DergiPark…)", "Source verification via DOI — no fabricated references", "Automatic citations and bibliography (APA 7, MLA, Chicago, IEEE, Vancouver, Harvard, AMA…)", "Section-by-section thesis roadmap with completion checks", "Statistical analysis with APA tables (t-test, ANOVA, regression…)", "Survey builder with Likert scales", "APA-style charts", "Defence rehearsal and reviewer response assistant", "Word and PDF export"]
      : ["10’dan fazla akademik veri tabanında arama (OpenAlex, Crossref, PubMed, DergiPark…)", "DOI ile kaynak doğrulama — uydurma kaynak yok", "Otomatik atıf ve kaynakça (APA 7, MLA, Chicago, IEEE, Vancouver, Harvard, AMA…)", "Bölüm bölüm tez yol haritası ve bölüm kontrolü", "APA tablolu istatistik analizi (t testi, ANOVA, regresyon…)", "Likert ölçekli anket oluşturucu", "APA tarzı grafikler", "Savunma provası ve hakem cevabı asistanı", "Word ve PDF çıktısı"],
    offers: prices.length
      ? { "@type": "AggregateOffer", priceCurrency: currency, lowPrice: Math.min(...prices), highPrice: Math.max(...prices), offerCount: plans.length, url: absoluteUrl(localizedPath("/fiyatlar", locale)) }
      : undefined,
  };
}

export function offersLd(locale: Locale, plans: PlanLike[], usdTry?: number) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: locale === "en" ? "Academiana plans" : "Academiana paketleri",
    itemListElement: plans.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: { "@type": "Offer", name: `${SITE_NAME} ${p.name}`, price: priceNumber(Number(p.price_monthly), locale, usdTry).amount, priceCurrency: priceNumber(0, locale).currency, url: absoluteUrl(localizedPath("/fiyatlar", locale)), category: "subscription", itemOffered: { "@id": `${SITE_URL}/#software` } },
    })),
  };
}

export function breadcrumbLd(locale: Locale, items: { name: string; path: string }[]) {
  const home = { name: SITE_NAME, path: localizedPath("/", locale) };
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [home, ...items].map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, item: absoluteUrl(it.path) })),
  };
}

export function webPageLd(locale: Locale, o: { path: string; name: string; description: string; type?: string }) {
  return {
    "@context": "https://schema.org",
    "@type": o.type ?? "WebPage",
    name: o.name,
    description: o.description,
    url: absoluteUrl(o.path),
    inLanguage: locale === "en" ? "en" : "tr-TR",
    isPartOf: { "@id": SITE_ID },
    publisher: { "@id": ORG_ID },
  };
}
