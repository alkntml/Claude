/** Asistan eylemleri: her biri kullanıcının mesajına eklenen açık bir görev tanımıdır. */
/** D144: Almanca çalışmada “Özet ve Abstract”: Almanca Zusammenfassung + İngilizce Abstract */
export const ABSTRACT_INSTRUCTION_DE = "DİĞER BÖLÜMLERİN DURUMU kısmındaki çalışma metnine dayanarak (1) akademik Almanca bir Zusammenfassung yaz: 150–250 kelime, tek paragraf; çalışmanın türüne uygun sırayla (alan araştırmasında amaç–yöntem–bulgular–sonuç; kaynaklara dayalı makale, derleme ve kuramsal çalışmada amaç–kapsam–ana tartışma–sonuç); ardından 'Schlüsselwörter:' satırına 3–5 kavram. (2) Aynı içeriğin akademik İngilizce karşılığını yaz: 'Abstract' başlığı ve 'Keywords:' satırı. Metinde olmayan bulgu, sayı veya yöntem ayrıntısı EKLEME; çalışmanın Yöntem/Bulgular bölümü yoksa (kaynaklara dayalı makale, derleme) yöntem ve bulgu cümlesi yazma ve [VERİ GİRİLECEK] KULLANMA; yalnızca Bulgular bölümü olup henüz yazılmamışsa [VERİ GİRİLECEK] kullan. Özette kaynak gösterme. Her ikisini tek bir :::taslak bloğunda ## Zusammenfassung ve ## Abstract başlıklarıyla ver.";

export const ASSISTANT_ACTIONS = {
  chat: { label: "Sohbet", instruction: "" },
  outline: { label: "Alt başlık öner", instruction: "Bu bölüm için yalnızca alt başlık önerisi yap; bölüm metni yazma. Önerileri tek bir :::taslak bloğu içinde, her satıra bir alt başlık olacak biçimde ver; numara veya açıklama ekleme. :::eksik ve :::hafiza blokları kullanma." },
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
  abstract: { label: "Özet ve Abstract", instruction: "DİĞER BÖLÜMLERİN DURUMU kısmındaki çalışma metnine dayanarak (1) Türkçe Özet yaz: 150–250 kelime, tek paragraf; çalışmanın türüne uygun sırayla (alan araştırmasında amaç–yöntem–bulgular–sonuç; kaynaklara dayalı makale, derleme ve kuramsal çalışmada amaç–kapsam–ana tartışma–sonuç); ardından 'Anahtar Kelimeler:' satırına 3–5 kavram. (2) Aynı içeriğin akademik İngilizce karşılığını yaz: 'Abstract' başlığı ve 'Keywords:' satırı. Metinde olmayan bulgu, sayı veya yöntem ayrıntısı EKLEME; çalışmanın Yöntem/Bulgular bölümü yoksa (kaynaklara dayalı makale, derleme) yöntem ve bulgu cümlesi yazma ve [VERİ GİRİLECEK] KULLANMA; yalnızca Bulgular bölümü olup henüz yazılmamışsa [VERİ GİRİLECEK] kullan. Özette kaynak gösterme. Her ikisini tek bir :::taslak bloğunda ## Özet ve ## Abstract başlıklarıyla ver." },
  ethics_docs: { label: "Etik kurul belgeleri", instruction: "Projenin yöntem bilgilerine dayanarak etik kurul başvurusu için iki taslak hazırla: (1) Araştırma özeti/başvuru metni: amaç, yöntem, katılımcılar ve seçim ölçütleri, veri toplama araçları ve süre, olası riskler ve önlemler, gizlilik, veri saklama ve imha, gönüllülük ve çekilme hakkı. (2) Bilgilendirilmiş Onam Formu: katılımcının anlayacağı sade dilde, araştırmanın amacı, süresi, gönüllülük, istediği an çekilme, gizlilik, iletişim bilgileri ve imza alanı. Projede olmayan bilgileri (kurum adı, kurul adı, onay numarası, araştırmacı iletişimi, süre vb.) UYDURMA; [DOLDURULACAK: …] ile işaretle. Her iki belgeyi tek bir :::taslak bloğunda ## başlıklarıyla ver. Bu belgeler taslaktır; kurumun kendi formu varsa ona uyarlanmalıdır." },
  cover_letter: { label: "Dergiye ön yazı", instruction: "Kullanıcının belirttiği dergiye gönderilecek makale için editöre hitaben resmî bir ön yazı (cover letter) taslağı yaz: çalışmanın başlığı, kısa amacı ve katkısı, derginin kapsamına uygunluğu, özgünlük ve başka yere gönderilmediği beyanı, çıkar çatışması beyanı yeri. Yalnızca proje bilgilerini kullan; editör adı, yazar listesi, kurum ve iletişim bilgileri gibi bilinmeyenleri [DOLDURULACAK: …] ile işaretle. Derginin dilinde yaz (belirtilmemişse İngilizce). Tek bir :::taslak bloğunda ver." },
  journal_checklist: { label: "Dergi kılavuzuna uygunluk", instruction: "YÜKLENEN DERGİ / KILAVUZ METNİ ile çalışmanın mevcut hâlini karşılaştır ve gönderim öncesi kontrol listesi çıkar: kelime sınırı, özet yapısı ve uzunluğu, anahtar kelime sayısı, bölüm başlıkları, atıf stili, tablo/şekil kuralları, beyanlar (etik onay, çıkar çatışması, finansman, yazar katkıları, veri erişilebilirliği, yapay zekâ kullanımı), dosya biçimi. Her madde için: kural (kılavuzdan kısa alıntı), çalışmanın durumu (✓ uygun / ✗ eksik / ? kontrol edin) ve yapılacak iş. Kılavuzda olmayan kural UYDURMA; kılavuz yüklenmemişse bunu söyle ve genel kontrol listesini 'genel öneri' olarak işaretle." },
  from_notes: { label: "Notları akademik metne çevir", instruction: "Kullanıcının (çoğunlukla sesle dikte ettiği) dağınık notlarını, anlamını koruyarak akademik, akıcı paragraflara dönüştür. Notlarda olmayan yeni bilgi, veri veya bulgu ekleme. Olgusal iddiaları KAYNAKLAR listesindeki çalışmalarla destekle; destekleyemediğin iddiayı kesin biçimde yazma." },
  fix_claim: { label: "Kaynakla düzelt", instruction: "Verilen paragraftaki [KAYNAK GEREKLİ] işaretli iddiaları KAYNAKLAR listesindeki uygun çalışmalarla destekle ve işareti kaldır. Uygun kaynak yoksa o iddiayı kaynak gerektirmeyecek biçimde yumuşat veya çıkar. Paragraftaki mevcut atıfları ve anlamı koru. Yalnızca düzeltilmiş paragrafı tek bir :::taslak bloğunda ver." },
  reduce_repetition: { label: "Tekrarları azalt", instruction: "Metindeki tekrarları gider: aynı fikri yeniden anlatan cümleleri birleştir veya çıkar; tekrar eden kalıp ifadeleri ve aynı geçiş ifadesiyle başlayan cümleleri çeşitlendir; her paragrafın yeni bir bilgi eklemesini sağla. Anlamı, bilimsel içeriği, başlıkları ve tüm [[kaynak:…]] atıflarını (sayfa bilgileriyle) aynen koru; yeni bilgi veya kaynak ekleme. Sonucu tek bir :::taslak bloğunda ver; blok dışında neleri değiştirdiğini en fazla 4 maddeyle yaz." },
  reviewer_response: { label: "Hakem yorumlarına cevap", instruction: "SEÇİLİ METİN olarak verilen editör ve hakem yorumlarına, çalışmanın mevcut hâline (ÜZERİNDE ÇALIŞILAN BÖLÜM ve DİĞER BÖLÜMLERİN DURUMU) dayanarak editöre hitaben, madde madde bir cevap mektubu (response to reviewers) hazırla. Kısa bir teşekkür paragrafıyla başla; sonra her hakem ve her yorum için sırasıyla: **Yorum** (kısaltılmış alıntı), **Yanıt** (nazik, somut, gerekçeli), **Yapılan değişiklik** (hangi bölümde ne değişti). Haklı yorumları kabul et; katılmadığın yorumu bilimsel gerekçeyle ve saygılı biçimde açıkla. Metinde henüz yapılmamış bir değişikliği yapılmış gibi YAZMA: [YAPILACAK: …] ile işaretle. Sayfa ve satır numarası uydurma, [s. __] bırak. Yeni kaynak gerekiyorsa yalnızca KAYNAKLAR listesindekileri kullan; uygun kaynak yoksa bunu belirt. Yorumlar hangi dildeyse mektubu o dilde yaz. Mektubu tek bir :::taslak bloğunda ver; blok dışında, metinde yapılması gereken en önemli 3–6 değişikliği öncelik sırasıyla madde madde yaz." },
  // D149: seçim menüsü — yazıyı güçlendir, akademik üslup, dönüştür (seçili metin üzerinde çalışır)
  fluency: { label: "Akıcılığı artır", instruction: "Seçili metnin akıcılığını artır: cümle geçişlerini, bağlaçları ve ritmi iyileştir; anlamı değiştirme. Atıf işaretlerini ([[kaynak:…]]) aynen koru; yeni kaynak, veri veya bulgu ekleme. Sonucu tek bir :::taslak bloğunda ver." },
  rephrase: { label: "Yeniden ifade et", instruction: "Seçili metni aynı anlamı koruyarak farklı sözcük ve cümle yapılarıyla yeniden ifade et. Atıf işaretlerini ([[kaynak:…]]) aynen koru; yeni kaynak, veri veya bulgu ekleme. Sonucu tek bir :::taslak bloğunda ver." },
  simplify: { label: "Basitleştir", instruction: "Seçili metni akademik düzeyi düşürmeden daha sade ve anlaşılır hâle getir: uzun cümleleri böl, gereksiz karmaşıklığı kaldır. Atıf işaretlerini ([[kaynak:…]]) aynen koru; yeni kaynak, veri veya bulgu ekleme. Sonucu tek bir :::taslak bloğunda ver." },
  strengthen_argument: { label: "Argümanı güçlendir", instruction: "Seçili metindeki argümanı güçlendir: iddia–gerekçe–kanıt bağını netleştir, mantıksal boşlukları kapat. Yeni kanıt gerekiyorsa yalnızca KAYNAKLAR listesindeki çalışmalara atıf yap; uygun kaynak yoksa [KAYNAK GEREKLİ] yaz. Atıf işaretlerini koru; veri veya bulgu uydurma. Sonucu tek bir :::taslak bloğunda ver." },
  counter_argument: { label: "Karşı argüman ekle", instruction: "Seçili metindeki görüşe akademik bir karşı argüman ve buna kısa bir yanıt ekle (metnin sonuna, yeni bir paragraf olarak). Karşı görüşü yalnızca KAYNAKLAR listesindeki çalışmalara dayandır; uygun kaynak yoksa [KAYNAK GEREKLİ] yaz. Mevcut metni ve atıflarını koru; veri veya bulgu uydurma. Sonucu (mevcut metin + eklenen paragraf) tek bir :::taslak bloğunda ver." },
  formal: { label: "Resmiliği artır", instruction: "Seçili metnin üslubunu daha resmî ve akademik yap: gündelik ifadeleri, birinci tekil şahsı ve abartılı nitelemeleri kaldır. Atıf işaretlerini ([[kaynak:…]]) aynen koru; yeni kaynak, veri veya bulgu ekleme. Sonucu tek bir :::taslak bloğunda ver." },
  technical: { label: "Teknik hassasiyet", instruction: "Seçili metinde terimleri alanın teknik terminolojisine göre kesinleştir; belirsiz ifadeleri (ör. ‘bazı’, ‘çok’) ölçülebilir veya tanımlı ifadelerle değiştir; metinde olmayan sayı ekleme, gerekirse [VERİ GİRİLECEK] kullan. Atıf işaretlerini ([[kaynak:…]]) aynen koru; yeni kaynak, veri veya bulgu ekleme. Sonucu tek bir :::taslak bloğunda ver." },
  assertive: { label: "İddia güvenini artır", instruction: "Seçili metinde, atıfla desteklenen iddiaları gereksiz çekinceler olmadan daha net ve kararlı ifade et. Atıfsız iddiaları güçlendirme. Atıf işaretlerini ([[kaynak:…]]) aynen koru; yeni kaynak, veri veya bulgu ekleme. Sonucu tek bir :::taslak bloğunda ver." },
  hedge: { label: "İddia güvenini yumuşat", instruction: "Seçili metindeki kesin iddiaları akademik temkinle yumuşat (ör. ‘göstermektedir’ yerine ‘işaret etmektedir’, ‘…olabilir’). Atıf işaretlerini ([[kaynak:…]]) aynen koru; yeni kaynak, veri veya bulgu ekleme. Sonucu tek bir :::taslak bloğunda ver." },
  tense_past: { label: "Geçmiş zamana çevir", instruction: "Seçili metnin zaman kipini geçmiş zamana çevir (ör. yöntem ve bulgular için ‘…yapılmıştır’, ‘…bulunmuştur’). Atıf işaretlerini ([[kaynak:…]]) aynen koru; yeni kaynak, veri veya bulgu ekleme. Sonucu tek bir :::taslak bloğunda ver." },
  tense_present: { label: "Şimdiki/geniş zamana çevir", instruction: "Seçili metnin zaman kipini geniş/şimdiki zamana çevir (ör. ‘…göstermektedir’, ‘…ele alınmaktadır’). Atıf işaretlerini ([[kaynak:…]]) aynen koru; yeni kaynak, veri veya bulgu ekleme. Sonucu tek bir :::taslak bloğunda ver." },
  to_bullets: { label: "Madde listesine dönüştür", instruction: "Seçili metni anlamı koruyarak madde işaretli bir listeye dönüştür (her madde ‘- ’ ile başlasın). Atıf işaretlerini ([[kaynak:…]]) aynen koru; yeni kaynak, veri veya bulgu ekleme. Sonucu tek bir :::taslak bloğunda ver." },
  to_numbered: { label: "Numaralı listeye dönüştür", instruction: "Seçili metni anlamı koruyarak numaralı bir listeye dönüştür (1. 2. 3.). Atıf işaretlerini ([[kaynak:…]]) aynen koru; yeni kaynak, veri veya bulgu ekleme. Sonucu tek bir :::taslak bloğunda ver." },
  to_table: { label: "Tabloya dönüştür", instruction: "Seçili metindeki bilgileri Markdown tablosuna dönüştür; uygun sütun başlıkları seç, tablonun üstüne italik ‘Tablo N. Başlık’ satırı yaz. Metinde olmayan değer ekleme; boş hücreye [VERİ GİRİLECEK] yaz. Atıf işaretlerini ([[kaynak:…]]) aynen koru; yeni kaynak, veri veya bulgu ekleme. Sonucu tek bir :::taslak bloğunda ver." },
  to_prose: { label: "Düzyazıya dönüştür", instruction: "Seçili liste veya tabloyu akıcı akademik paragraf(lar)a dönüştür. Atıf işaretlerini ([[kaynak:…]]) aynen koru; yeni kaynak, veri veya bulgu ekleme. Sonucu tek bir :::taslak bloğunda ver." },
  discussion: { label: "Tartışma geliştir", instruction: "Kullanıcının bulgularını literatürle karşılaştırarak tartışma paragrafları yaz; destekleyen ve çelişen çalışmaları göster. Bulgu uydurma." },
} as const;

export type AssistantAction = keyof typeof ASSISTANT_ACTIONS;

/**
 * Her asistan eyleminin model katmanı (pakete bakılmaz):
 * fast = Haiku (basit dil düzenlemesi), balanced = Sonnet (yazım), default = Opus (karmaşık analiz ve muhakeme).
 */
export const ACTION_TIER: Record<AssistantAction, "fast" | "balanced" | "default"> = {
  // Basit
  shorten: "fast",
  academic_tone: "fast",
  reduce_repetition: "fast",
  from_notes: "fast",
  // Orta
  chat: "balanced",
  outline: "balanced",
  plan: "balanced",
  draft: "balanced",
  expand: "balanced",
  restructure: "balanced",
  abstract: "balanced",
  fix_claim: "balanced",
  ethics_docs: "balanced",
  cover_letter: "balanced",
  research_questions: "balanced",
  // Karmaşık
  synthesize: "default",
  methodology: "default",
  hypotheses: "default",
  interpret: "default",
  discussion: "default",
  // D149: seçim menüsü
  fluency: "fast", rephrase: "fast", simplify: "fast", formal: "fast", technical: "balanced", assertive: "fast", hedge: "fast",
  tense_past: "fast", tense_present: "fast", to_bullets: "fast", to_numbered: "fast", to_table: "fast", to_prose: "fast",
  strengthen_argument: "balanced", counter_argument: "balanced",
  consistency: "default",
  reviewer_response: "default",
  journal_checklist: "default",
};

/**
 * Eylem başına düşünme seviyesi (D78). Verilmeyen eylemler ayarlardaki varsayılanı (medium) kullanır.
 * Kısa ve kalıbı belli işlerde (kısaltma, üslup, alt başlık önerisi) düşünme tokenı harcamaya gerek yoktur;
 * yazım ve analiz eylemleri varsayılan seviyede kalır, kaliteden ödün verilmez.
 */
export const ACTION_EFFORT: Partial<Record<AssistantAction, "low" | "medium" | "high">> = {
  outline: "low",
  shorten: "low",
  academic_tone: "low",
  reduce_repetition: "low",
  from_notes: "low",
  fluency: "low", rephrase: "low", simplify: "low", formal: "low", assertive: "low", hedge: "low",
  tense_past: "low", tense_present: "low", to_bullets: "low", to_numbered: "low", to_table: "low", to_prose: "low",
};

export const OUTPUT_PROTOCOL = `ÇIKTI BİÇİMİ:
- Belgeye eklenebilecek akademik metni ":::taslak" satırı ile başlayan ve ":::" satırı ile biten bir blok içine yaz. Blok içinde Markdown kullan (## başlık, paragraf, - liste, | tablo |, **kalın**, *italik*).
- BAŞLIK DİSİPLİNİ: Üzerinde çalışılan bölümün/aşamanın adını taslağın başına başlık olarak yazma. Alt başlık (##) yalnızca bölüm gerçekten ayrı alt konulardan oluşuyorsa ve BÖLÜM YAPISI kuralının izin verdiği sayıda açılır; her alt başlığın altında en az 2–3 paragraf olur. Her paragrafa veya her fikre başlık açma; tek alt-alt başlık (###) açma; başlık düzeyi atlama (## olmadan ### kullanma). Soru sorulduğunda veya açıklama istendiğinde taslak bloğu ve başlık kullanma.
- Atıfları yalnızca [[kaynak:S1]] biçiminde ver. Birden çok kaynak: [[kaynak:S1,S4]]. Sayfa numarası: bir bilgiyi TAM METİN PARÇALARI içindeki bir parçadan aldıysan ve parçanın sayfası (s. N) verilmişse, doğrudan alıntıda ZORUNLU, aktarmada (parafrazda) da mümkün olduğunca sayfayı ekle: [[kaynak:S2|s. 14]], birden çok sayfa: [[kaynak:S2|s. 14-15]]. Sayfa numarasını yalnızca parçada yazanı kullanarak ver; parça "sayfa bilgisi yok" diyorsa veya kaynak yalnızca özet/künye düzeyindeyse sayfa YAZMA, tahmin etme. Sayfa gösterimini (p./s./pp.) stil kurallarına göre sistem biçimlendirir. Anlatı atfı (Yazar (Yıl) biçimi): [[kaynak:S3|anlatı]]. Yazar adı ve yılı elle YAZMA; atıf stilini sistem uygular.
- KAYNAK İLKESİ (önceki talimatlardaki "[KAYNAK GEREKLİ]" kullanımının yerine geçer): Olgusal, bilimsel veya kesin bir iddiayı yalnızca KAYNAKLAR listesindeki bir çalışmayla destekleyebiliyorsan yaz. Destekleyemiyorsan o cümleyi YAZMA ya da kaynak gerektirmeyen çerçeveleyici bir ifadeye dönüştür (ör. "Bu bölümde X kavramı ele alınacaktır."). Taslağa "[KAYNAK GEREKLİ]" yer tutucusu KOYMA.
- Kaynak bulunamadığı için yazmadığın veya zayıf bıraktığın konular varsa yanıtın sonunda ":::eksik" ile başlayan ve ":::" ile biten bir blok aç; her satıra o konu için akademik veri tabanlarında kullanılacak kısa bir İNGİLİZCE arama sorgusu yaz (2–6 kelime, en fazla 4 satır). Sistem bu sorgularla kaynak arayıp projeye ekleyecek. Eksik yoksa bu bloğu hiç yazma.
- ÜSLUP VE TEKRAR (çok önemli): Her paragraf yeni bir bilgi, karşılaştırma veya argüman eklesin; aynı fikri farklı kelimelerle yeniden anlatma. Mevcut metinde, önceki alt başlıklarda veya diğer bölümlerde anlatılanları tekrar etme; gerekiyorsa tek cümlelik bir göndermeyle yetin. Alt başlık yazarken konuya veya çalışmanın amacına yeniden giriş yapma. Cümle başlangıçlarını çeşitlendir: "Bu bağlamda, Sonuç olarak, Ayrıca, Bununla birlikte, Öte yandan, Dolayısıyla, Nitekim, Bu nedenle" (İngilizcede "Moreover, Furthermore, Additionally, In this context, Overall") gibi geçiş ifadelerinin her birini bir taslakta en fazla bir kez kullan ve cümlelerin çoğunu geçiş ifadesi olmadan kur. "önemli bir rol oynamaktadır, büyük önem taşımaktadır, dikkat çekmektedir, ele alınmaktadır" gibi kalıp yüklemleri ardışık cümlelerde ve aynı paragrafta yineleme. Paragrafları özet cümlesiyle ("Sonuç olarak…", "Özetle…") bitirme; toparlama yalnızca bölümün son paragrafında ve gerekiyorsa yapılır. "TEKRARDAN KAÇIN" listesinde verilen ifadeleri yeni metinde kullanma.
- Açıklamalar, sorular ve öneriler blok dışında, kısa ve maddeli olsun. Önerilerde KAYNAKLAR listesinde olmayan yazar veya eser adı verme; ek kaynak gerekiyorsa hangi konuda "Literatür araştır" yapılacağını söyle.
- Kullanıcının verdiği yeni ve kalıcı proje bilgilerini (karar, kavram tanımı, değişken, araştırma sorusu, hipotez) ":::hafiza" ile başlayan ve ":::" ile biten bloğa "tür: içerik" satırları olarak yaz. Türler: karar, kavram, değişken, soru, hipotez, bilgi. Yalnızca kullanıcının açıkça belirttiği veya onayladığı bilgileri ekle.`;
