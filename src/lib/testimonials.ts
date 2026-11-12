/**
 * Ana sayfa görüşleri (D147). Kullanıcının (site sahibi) ilettiği gerçek görüşlerdir; metinler özgün dilinde ve
 * DEĞİŞTİRİLMEDEN gösterilir (görüşü düzeltmek veya çevirip “onların sözü” gibi sunmak yanıltıcı olur).
 * Yapılandırılmış veriye (Review / AggregateRating) EKLENMEZ — Google’ın kendi ürününe ait yorum kuralı ve D107.
 * Yeni görüş: kişinin yayın izni alınmalı; yalnızca site sahibi iletirse eklenir, uydurulmaz.
 */
export interface Testimonial { name: string; role: string; country: string; lang: "tr" | "en" | "de"; quote: string; rating: 5 }

export const TESTIMONIALS: Testimonial[] = [
  { name: "Prof. Dr. Murat Karahan", role: "Akademisyen", country: "Türkiye", lang: "tr", rating: 5, quote: "Akademik araştırmalarda metodolojik tutarlılık ve bilimsel etik son derece önemlidir. Academiana'nın akademik süreçleri bütüncül bir yaklaşımla ele almasını ve farklı araştırma ihtiyaçlarına yönelik çözümler sunmasını başarılı buluyorum." },
  { name: "Prof. Dr. Alexander Weber", role: "Academic Researcher", country: "Germany", lang: "en", rating: 5, quote: "Academiana offers a structured approach to academic research and scientific publishing. I particularly appreciate its emphasis on research methodology, academic standards, and professional guidance." },
  { name: "Doç. Dr. Emre Aksoy", role: "İstatistik ve Araştırma", country: "Türkiye", lang: "tr", rating: 5, quote: "Nicel araştırmalarda doğru analiz yönteminin seçilmesi, sonuçların güvenilirliği açısından kritik öneme sahiptir. Academiana'nın istatistiksel analiz ve araştırma metodolojisi alanındaki hizmet çeşitliliği oldukça değerli." },
  { name: "Dr. Sophia Bennett", role: "Psychology Researcher", country: "United Kingdom", lang: "en", rating: 5, quote: "Finding reliable academic guidance throughout the research process can be challenging. Academiana brings together several valuable academic support services in one platform. A promising approach for researchers and postgraduate students." },
  { name: "Prof. Dr. Selin Yıldırım", role: "Eğitim Bilimleri", country: "Türkiye", lang: "tr", rating: 5, quote: "Akademik yayıncılık ve bilimsel araştırma süreçlerinde profesyonel rehberlik büyük önem taşıyor. Academiana'nın literatür taraması, akademik yazım ve yayın süreçlerini bir arada değerlendiren hizmet anlayışını başarılı buluyorum." },
  { name: "Prof. Dr. Matteo Ricci", role: "University Professor", country: "Italy", lang: "en", rating: 5, quote: "Academic research requires methodological rigor, reliable sources, and scientific integrity. Academiana's comprehensive approach to academic consultancy is noteworthy. It has the potential to become a valuable resource for researchers." },
  { name: "Elif Aydın", role: "PhD Researcher", country: "Türkiye", lang: "tr", rating: 5, quote: "Doktora sürecinde araştırma planlaması, literatür taraması ve istatistiksel değerlendirmeler ciddi zaman gerektiriyor. Academiana'nın farklı akademik hizmetleri tek bir platformda sunması araştırmacılar için önemli bir kolaylık." },
];

/** Ad baş harfleri (unvanlar atlanır): “Prof. Dr. Murat Karahan” → “MK” */
export function initials(name: string): string {
  const parts = name.replace(/\b(Prof|Doç|Dr|Assoc|Asst|Yrd)\.?\s*/gi, "").trim().split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] ?? "") + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toLocaleUpperCase("tr-TR");
}
