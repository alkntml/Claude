/** Asistan eylemleri: her biri kullanıcının mesajına eklenen açık bir görev tanımıdır. */
export const ASSISTANT_ACTIONS = {
  chat: { label: "Sohbet", instruction: "" },
  plan: { label: "Çalışma planı öner", instruction: "Bu bölüm için adım adım bir çalışma planı öner. Önce eksik bilgileri belirle ve kullanıcıya en fazla 3 net soru sor." },
  draft: { label: "Bölümü yaz", instruction: "Bu bölüm için akademik standartlara uygun bir taslak yaz. Her olgusal/bilimsel iddiayı KAYNAKLAR listesindeki bir çalışmayla destekle. Destekleyemediğin iddiayı yazma; o konuyu :::eksik bloğunda bildir." },
  expand: { label: "Genişlet", instruction: "Seçili metni anlamını koruyarak, kaynaklarla desteklenmiş biçimde genişlet." },
  shorten: { label: "Kısalt", instruction: "Seçili metni temel argümanları ve atıfları koruyarak yaklaşık %40 kısalt." },
  academic_tone: { label: "Akademik dile çevir", instruction: "Seçili metnin dilini akademik, nesnel ve açık hâle getir. İçeriği ve atıfları değiştirme; yaptığın önemli değişiklikleri kısaca listele." },
  restructure: { label: "Yeniden yapılandır", instruction: "Seçili metnin paragraf yapısını ve mantıksal akışını iyileştir; her paragraf tek bir ana fikre hizmet etsin." },
  synthesize: { label: "Literatür sentezi", instruction: "KAYNAKLAR listesindeki çalışmaları tema temelinde sentezle; tutarlı ve çelişkili bulguları karşılaştır, boşluğu belirt. Erişim seviyesi 'metadata' olan kaynaklar hakkında içerik iddiasında bulunma." },
  research_questions: { label: "Araştırma soruları", instruction: "Proje bağlamına uygun, yanıtlanabilir 3–5 araştırma sorusu öner ve her birinin gerekçesini kaynaklara dayandır." },
  hypotheses: { label: "Hipotez oluştur", instruction: "Araştırma sorularına ve literatüre dayalı, yönlü ve test edilebilir hipotezler (H1, H2…) öner; her hipotezin dayanağını kaynakla göster." },
  methodology: { label: "Yöntem önerisi", instruction: "Araştırma sorularına uygun desen, örnekleme, veri toplama ve analiz seçeneklerini artı/eksi yönleriyle karşılaştır ve gerekçeli bir öneri sun." },
  consistency: { label: "Tutarlılık kontrolü", instruction: "Bu bölümü PROJE BAĞLAMI ve diğer bölümlerin özetleriyle karşılaştır; kavram, amaç, hipotez ve yöntem tutarsızlıklarını madde madde listele. Metin yazma." },
  interpret: { label: "Bulguları yorumla", instruction: "Kullanıcının sağladığı GERÇEK analiz sonuçlarını akademik dille yorumla. Sağlanmayan hiçbir değer, istatistik veya bulgu yazma; eksikler için [VERİ GİRİLECEK] kullan." },
  discussion: { label: "Tartışma geliştir", instruction: "Kullanıcının bulgularını literatürle karşılaştırarak tartışma paragrafları yaz; destekleyen ve çelişen çalışmaları göster. Bulgu uydurma." },
} as const;

export type AssistantAction = keyof typeof ASSISTANT_ACTIONS;

export const OUTPUT_PROTOCOL = `ÇIKTI BİÇİMİ:
- Belgeye eklenebilecek akademik metni ":::taslak" satırı ile başlayan ve ":::" satırı ile biten bir blok içine yaz. Blok içinde Markdown kullan (## başlık, paragraf, - liste, | tablo |, **kalın**, *italik*).
- Atıfları yalnızca [[kaynak:S1]] biçiminde ver. Birden çok kaynak: [[kaynak:S1,S4]]. Doğrudan alıntıda sayfa (yalnızca tam metni olan kaynaklarda): [[kaynak:S2|s. 14]]. Anlatı atfı (Yazar (Yıl) biçimi): [[kaynak:S3|anlatı]]. Yazar adı ve yılı elle YAZMA; atıf stilini sistem uygular.
- KAYNAK İLKESİ (önceki talimatlardaki "[KAYNAK GEREKLİ]" kullanımının yerine geçer): Olgusal, bilimsel veya kesin bir iddiayı yalnızca KAYNAKLAR listesindeki bir çalışmayla destekleyebiliyorsan yaz. Destekleyemiyorsan o cümleyi YAZMA ya da kaynak gerektirmeyen çerçeveleyici bir ifadeye dönüştür (ör. "Bu bölümde X kavramı ele alınacaktır."). Taslağa "[KAYNAK GEREKLİ]" yer tutucusu KOYMA.
- Kaynak bulunamadığı için yazmadığın veya zayıf bıraktığın konular varsa yanıtın sonunda ":::eksik" ile başlayan ve ":::" ile biten bir blok aç; her satıra o konu için akademik veri tabanlarında kullanılacak kısa bir İNGİLİZCE arama sorgusu yaz (2–6 kelime, en fazla 4 satır). Sistem bu sorgularla kaynak arayıp projeye ekleyecek. Eksik yoksa bu bloğu hiç yazma.
- Açıklamalar, sorular ve öneriler blok dışında, kısa ve maddeli olsun. Önerilerde KAYNAKLAR listesinde olmayan yazar veya eser adı verme; ek kaynak gerekiyorsa hangi konuda "Literatür araştır" yapılacağını söyle.
- Kullanıcının verdiği yeni ve kalıcı proje bilgilerini (karar, kavram tanımı, değişken, araştırma sorusu, hipotez) ":::hafiza" ile başlayan ve ":::" ile biten bloğa "tür: içerik" satırları olarak yaz. Türler: karar, kavram, değişken, soru, hipotez, bilgi. Yalnızca kullanıcının açıkça belirttiği veya onayladığı bilgileri ekle.`;
