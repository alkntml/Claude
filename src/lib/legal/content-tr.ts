import type { LegalContent } from "./types";

/** Hukuki metinler (TR). Türkçe metinler PDF’ten (13 Kasım 2026) olduğu gibi alınmıştır; GDPR metni İngilizce aslından çeviridir. Kaynak PDF metni: docs/legal/yasal-metinler-2026-11-13.txt (tests/legal.test.ts Türkçe metnin kelimesi kelimesine aynı olduğunu denetler). D162: Adil Kullanım Politikası’ndaki “Sınırsız Proje paketi” bölümü ve “İhlal sayılabilecek davranışlar” giriş cümlesi site sahibinin talimatıyla güncellendi (hukukçunun PDF metninden farklıdır). */
export const CONTENT: LegalContent = {
 "kvkk": [
  {
   "h": "Giriş ve veri sorumlusu",
   "b": [
    {
     "p": "Bu aydınlatma metni, www.academiana.com.tr adresinde sunulan Academiana platformunun kullanımı sırasında kişisel verilerin işlenmesine ilişkin bilgi vermek amacıyla hazırlanmıştır. Academiana; akademik araştırma ve yazım süreçlerine yardımcı olan, yapay zekâ destekli çevrim içi bir platformdur. Platformun işletilmesinden sorumlu gerçek veya tüzel kişinin ticaret unvanı ve tebligat/başvuru adresi, bu taslakta doğrulanmış bilgi bulunmadığından belirtilmemiştir. Yayına alınmadan önce veri sorumlusu kimliği ve KVKK başvuru kanalı açıkça eklenmelidir."
    }
   ]
  },
  {
   "h": "İşlenen kişisel veri kategorileri",
   "b": [
    {
     "p": "Platformun mevcut işleyişine göre aşağıdaki veri kategorileri işlenebilir:"
    },
    {
     "ul": [
      "Kimlik ve iletişim: ad-soyad, e-posta adresi ve kullanıcının isteğe bağlı girdiği kurum bilgisi.",
      "Hesap ve kimlik doğrulama: e-posta hesabı, parola doğrulama verisi ve Google/Apple ile girişte ilgili sağlayıcıdan alınan ad ve e-posta bilgisi. Parola, Supabase altyapısında geri çözülemeyecek biçimde saklanır; platform parolanın açık hâlini görüntülemez.",
      "Akademik içerik: çalışmalar, bölümler, sürüm geçmişi, yorumlar, kaynaklar ve notlar.",
      "Dosya ve dosya içeriği: PDF, Word, Excel/CSV dosyaları ve bunlardan çıkarılan metinler.",
      "Yapay zekâ etkileşimleri: kullanıcının mesajları, asistan yanıtları ve hizmetin sunulması için kullanılan çalışma bağlamı.",
      "Kullanım ve işlem kayıtları: yapay zekâ çıktılarının tam metni, tarih, çalışma/bölüm adı, kelime sayısı; token, maliyet, tarama ve sayfa sayaçları; silme kayıtları.",
      "Cihaz ve güvenlik verileri: tarayıcıda oluşturulan rastgele cihaz kimliği, bunun sunucuda tutulan geri çözülemeyen özeti ile ilk/son görülme tarihleri.",
      "Tek Proje paketi kullanım kayıtları: indirme kelime sayısı, metnin geri elde edilemeyen özeti ve kapak bilgileri (yazar, üniversite, bölüm ve danışman adı).",
      "Ödeme/paket tanımlama kayıtları: ödeyenin adı, telefon numarası, tutar ve not. Kart bilgisi Academiana sistemine girilmez.",
      "Davet ve paylaşım verileri: ortak yazar daveti için e-posta; danışman bağlantısı üzerinden erişim ve yorum bilgileri.",
      "Kurum lisansı verileri: kurum üyeliği, kullanım istatistikleri ve kurum işlem kayıtları.",
      "Destek ve teknik kayıtlar: kullanıcının geri bildirim/hata mesajı ve ilgili teknik hata bilgileri.",
      "Ziyaret istatistikleri: ziyaret edilen sayfa, yönlendiren site, kampanya etiketi, cihaz türü, arayüz dili ve günlük değişen anonim kod.",
      "Site içi bildirim ve başvuru kayıtları."
     ]
    }
   ]
  },
  {
   "h": "İşleme amaçları",
   "b": [
    {
     "p": "Kişisel veriler; üyelik oluşturma ve hesabı yönetme, kimlik doğrulama, akademik çalışma alanını ve dosya hizmetlerini sunma, yapay zekâ özelliklerini çalıştırma, kaynak arama ve atıf işlevlerini sağlama, istatistiksel analiz yapma, ortak yazar ve danışman paylaşımını yürütme, paket ve kullanım haklarını yönetme, ödeme sonrasında paketi tanımlama, müşteri desteği sağlama, güvenliği ve kötüye kullanımı önleme, teknik sorunları tespit etme, hizmet performansını ölçme ve hukuki yükümlülükleri yerine getirme amaçlarıyla işlenir. Veriler satılmaz ve reklam hedeflemesi amacıyla kullanılmaz. Platformda analitik veya reklam amaçlı üçüncü taraf çerezleri kullanılmadığı bildirilmiştir."
    }
   ]
  },
  {
   "h": "Verilerin elde edilme yöntemi",
   "b": [
    {
     "p": "Veriler; kayıt ve giriş ekranları, kullanıcının platforma yazdığı veya yüklediği içerikler, kullanıcı tarafından başlatılan paylaşım ve ödeme iletişimi, platformun otomatik olarak oluşturduğu kullanım/güvenlik kayıtları ve cihaz belleğinde oluşturulan rastgele cihaz kimliği aracılığıyla elektronik ortamda elde edilir."
    }
   ]
  },
  {
   "h": "Saklama süreleri",
   "b": [
    {
     "p": "Hesap, akademik içerik, dosyalar, sohbetler, sayaçlar, cihaz kimliği özeti ve bildirimler kural olarak hesap silinene kadar tutulur. Ortak yazar daveti 14 gün içinde geçersiz olur; davet kaydı çalışma ile birlikte tutulabilir. Danışman paylaşım bağlantısı, kullanıcı bağlantıyı iptal edene kadar erişime açık kalır. Kullanım kanıt kayıtları mevcut sistemde hesap silinene kadar tutulmaktadır; metinlerde geçen 12 aylık süre için otomatik silme uygulanmadığı bildirilmiştir. Geri bildirim ve hata kayıtları süresiz tutulabilmekte; hesap silindiğinde kullanıcıyla bağlantısı koparılmakta, metin içeriği kalabilmektedir. Ziyaret istatistikleri süresiz tutulmaktadır. Ödeme kayıtlarının saklanması, uygulanabilir vergi ve muhasebe yükümlülüklerine tabidir. Bu sürelerin mevzuata uygun nihai takvimi belirlenmeli ve gerekiyorsa otomatik silme mekanizması kurulmalıdır."
    }
   ]
  },
  {
   "h": "Verilerin aktarıldığı alıcı grupları ve yurt dışına aktarım",
   "b": [
    {
     "p": "Hizmetin sunulması kapsamında veriler; veritabanı, kimlik doğrulama ve dosya depolama hizmetleri için Supabase'e; barındırma ve dağıtım hizmetleri için Vercel'e; yapay zekâ özellikleri kullanıldığında Anthropic'e (Claude) aktarılabilir. OpenAI entegrasyonu kodda isteğe bağlı olarak bulunmaktadır; canlı ortamda kullanılıp kullanılmadığı teyit edilmediğinden bu metin, OpenAI'ı aktif alıcı olarak kabul etmez. Google ve Apple, yalnızca ilgili sosyal giriş yöntemi seçildiğinde kimlik doğrulama sürecine dahil olur. Akademik kaynak aramalarında OpenAlex, Crossref, PubMed/Europe PMC, arXiv, DOAJ, DataCite, ERIC, DBLP, PLOS, Zenodo, HAL, Open Library, INSPIRE-HEP ve Unpaywall gibi kaynak servislerine arama terimleri ve DOI gönderilebilir; kullanıcı kimliğinin bu arama servislerine gönderilmediği bildirilmiştir. Anahtar tanımlıysa Springer Nature, IEEE ve NASA ADS servisleri de kullanılabilir. Kullanıcının talebiyle Overleaf'e LaTeX dosyası aktarılabilir; Zotero entegrasyonunda kullanıcının girdiği anahtarın saklanmadığı bildirilmiştir. Ödeme iletişimi WhatsApp üzerinden yürütülebilir."
    }
   ]
  },
  {
   "h": "Yurt dışı veri konumları",
   "b": [
    {
     "p": "Bilgi notuna göre Supabase verileri Frankfurt/Avrupa Birliği bölgesinde, Vercel barındırma sunucuları Frankfurt'ta tutulmakta; Vercel'in küresel CDN ağı da kullanılmaktadır. Supabase ve Vercel ABD merkezli şirketlerdir. Yapay zekâ özelliği kullanıldığında kullanıcının metni, çalışma bağlamı ve seçilen kaynak/dosya parçaları ABD'deki Anthropic'e aktarılır. Akademik veri tabanlarının bir kısmı yurt dışındadır. Bu aktarımların her biri için KVKK'nın yurt dışına aktarım hükümlerine uygun hukuki mekanizma kurulmalıdır."
    }
   ]
  },
  {
   "h": "Üçüncü kişilere ve özel nitelikli verilere ilişkin uyarı",
   "b": [
    {
     "p": "Kullanıcıların yüklediği tez, görüşme dökümü, anket veya diğer belgelerde üçüncü kişilere ait kişisel veriler ya da özel nitelikli kişisel veriler bulunabilir. Kullanıcı, bu verileri platforma yüklemek ve işlemek için gerekli hukuki yetkiye sahip olduğunu; ilgili kişileri bilgilendirdiğini ve gerekli hukuki şartları sağladığını değerlendirmelidir. Araştırma anketlerinde katılımcılara karşı veri sorumlusu, araştırmayı yürüten araştırmacı olabilir; Academiana ilgili hizmet bakımından veri işleyen konumunda bulunabilir. Tarafların rolleri somut kullanım ve sözleşmeye göre belirlenmelidir. Gereksiz kimlik bilgileri, sağlık verileri ve diğer hassas bilgiler platforma yüklenmemelidir."
    }
   ]
  },
  {
   "h": "Otomatik izleme ve insan incelemesi",
   "b": [
    {
     "p": "Kötüye kullanım ihtimalini belirlemek amacıyla kullanım örüntüleri otomatik olarak izlenebilir ve yöneticiye uyarı üretilebilir. Sistem tek başına otomatik askıya alma kararı vermez; uyarı insan tarafından incelenir ve karar verilir. İlgili kişi, kendisini etkileyen işleme ilişkin bilgi ve itiraz talebini veri sorumlusuna iletebilir."
    }
   ]
  },
  {
   "h": "İlgili kişinin hakları ve başvuru",
   "b": [
    {
     "p": "İlgili kişiler, KVKK'nın 11. maddesi kapsamındaki haklarını kullanabilir. Platformda kullanıcılar hesap sayfasından verilerini JSON formatında indirebilir, hesaplarını ve hesapla ilişkili verilerini silebilir ve veri talebi oluşturabilir. Veri talebine 30 gün içinde ücretsiz yanıt verildiği bildirilmiştir. Başvurunun iletileceği e-posta/KEP/posta adresi bilgi notunda bulunmadığından bu taslakta belirtilmemiştir; yayımdan önce başvuru kanalı eklenmelidir."
    }
   ]
  },
  {
   "h": "Güncelleme",
   "b": [
    {
     "p": "Bu metin, platformun fiilî veri işleme faaliyetleri ve mevzuattaki değişiklikler doğrultusunda güncellenebilir. Önemli değişiklikler kullanıcıya uygun yöntemle duyurulur. Yeni amaç veya hukuki şart gerektiriyorsa gerekli bilgilendirme ve izin süreçleri ayrıca yürütülür."
    }
   ]
  }
 ],
 "terms": [
  {
   "h": "Kapsam ve hizmetin niteliği",
   "b": [
    {
     "p": "Bu koşullar, www.academiana.com.tr üzerinden sunulan Academiana platformunun kullanımını düzenler. Academiana; yapay zekâ destekli metin önerisi ve düzenleme, akademik kaynak arama, atıf/kaynakça oluşturma, istatistik analizi, anket hazırlama ve toplama, Word/PDF/LaTeX çıktısı, ortak yazarlık, danışmanla salt okunur paylaşım, savunma provası, PRISMA sistematik derleme, iddia denetimi ve çeviri gibi akademik çalışmaya yardımcı araçlar sunar. Platform bir akademik danışman, üniversite, hakem, yayıncı veya intihal tespit kuruluşu yerine geçmez."
    }
   ]
  },
  {
   "h": "Hesap oluşturma ve güvenlik",
   "b": [
    {
     "p": "Kayıt e-posta ile veya Google/Apple üzerinden yapılabilir. E-posta doğrulaması uygulanır. Kullanıcı doğru ve güncel bilgi vermek, hesap güvenliğini korumak ve hesabını başkalarıyla paylaşmamakla yükümlüdür. Hesap başkasına devredilemez veya ortak kullanılmak üzere kullandırılamaz. Geçici e-posta adresleriyle davet ödülü verilmez. Kullanıcı, hesabında gerçekleşen işlemlerden kendi kusuru ölçüsünde sorumludur."
    }
   ]
  },
  {
   "h": "Paketler, ücretler ve kullanım hakları",
   "b": [
    {
     "p": "Platformda Ücretsiz paket, aylık ücretli paketler, tek seferlik Tek Proje paketi ve kurum lisansı sunulabilir. Paketlerin kapsamı, fiyatı, süresi, kullanım limitleri ve indirme hakları satın alma veya paket tanımlama öncesinde kullanıcıya bildirilen güncel paket açıklamasına göre belirlenir. Aylık kullanım hakları; yapay zekâ kullanımı, kaynak tarama ve yapay zekâ ile oluşturulan sayfa sayısı üzerinden hesaplanabilir. Sayfa hesabında 1 sayfa 344 kelime olarak kabul edilir. Hak dolduğunda yalnızca ilgili özellik durur; çalışma silinmez veya kilitlenmez. Kullanıcı çalışmasını görüntüleyebilir, düzenleyebilir ve paketin izin verdiği biçimlerde indirebilir. Yapay zekâ tarafından üretilen metin sonradan silinse dahi ilgili kullanım hakkı geri yüklenmez."
    }
   ]
  },
  {
   "h": "Kullanıcı içerikleri ve fikrî mülkiyet",
   "b": [
    {
     "p": "Kullanıcı, platforma yüklediği veya oluşturduğu içerik üzerindeki hakların sahibi olduğunu ya da içeriği kullanmak için gerekli izinlere sahip bulunduğunu beyan eder. Kullanıcı; üçüncü kişilerin telif, kişilik, gizlilik ve veri koruma haklarını ihlal eden materyalleri yükleyemez. Academiana, kullanıcı içeriğini yalnızca hizmetin sunulması, güvenliğin sağlanması ve kullanıcının talep ettiği işlevlerin yerine getirilmesi için teknik olarak işleyebilir. Bu hüküm, platformun kullanıcı içeriği üzerinde mülkiyet hakkı kazandığı anlamına gelmez. Yapay zekâ çıktılarının hukuki statüsü ve üçüncü kişi hakları, uygulanabilir mevzuat ve somut içeriğe göre değerlendirilir; kullanıcı çıktıyı kullanmadan önce kontrol etmekle yükümlüdür."
    }
   ]
  },
  {
   "h": "Paylaşım ve ortak çalışma",
   "b": [
    {
     "p": "Çalışma sahibi, ortak yazarları “düzenleyebilir” veya “yorum yapabilir” rolleriyle davet edebilir. Ortak yazarlar çalışmayı, kaynakları ve yorumları görebilir; çalışma sahibinin özel dosyalarına ve asistan sohbetlerine erişemez. Danışman paylaşım bağlantısı, bağlantıya sahip kişilerin giriş yapmadan çalışmayı okuyup yorum yazmasına imkân verir. Bu nedenle kullanıcı, bağlantıyı yalnızca erişmesini istediği kişilerle paylaşmalı ve ihtiyaç sona erdiğinde iptal etmelidir. Kurum lisansında kurum yöneticisi üye listesini ve kullanım istatistiklerini görebilir; kullanıcıların akademik çalışma içeriklerini göremez."
    }
   ]
  },
  {
   "h": "Yapay zekâ ve akademik doğruluk",
   "b": [
    {
     "p": "Yapay zekâ çıktıları olasılıksal niteliktedir; hata, eksiklik, yanlış yorum veya güncelliğini yitirmiş bilgi içerebilir. Kaynak doğrulama, DOI/PMID/arXiv kimlik kontrolü ve iddia denetimi gibi araçlar hata riskini azaltmaya yardımcı olur; mutlak doğruluk garantisi vermez. Kaynakların hangi erişim seviyesinde incelendiği platformda gösterilebilir. Kullanıcı; kaynak künyesini, sayfa numarasını, doğrudan alıntıyı, istatistiksel sonucu ve akademik iddiaları özgün kaynağından doğrulamalıdır. Platform lisanslı bir intihal servisi sunmadığından intihal yüzdesi veya intihalsiz olma garantisi vermez."
    }
   ]
  },
  {
   "h": "Yasaklı ve sakıncalı kullanımlar",
   "b": [
    {
     "p": "Kullanıcı platformu; başkası adına akademik çalışma üretmek veya akademik hileyi kolaylaştırmak, intihal yapmak, kaynak/veri/istatistik uydurmak, başkasının hesabını kullanmak, güvenlik önlemlerini aşmak, hizmete zarar vermek, hukuka aykırı içerik işlemek veya üçüncü kişilerin haklarını ihlal etmek amacıyla kullanamaz. Kullanıcı, kurumunun ve yayıncısının yapay zekâ kullanım kurallarına uymalı; gerekli olduğu durumlarda yapay zekâ kullanımını beyan etmelidir."
    }
   ]
  },
  {
   "h": "Yönetim, denetim ve askıya alma",
   "b": [
    {
     "p": "Hizmet yöneticileri hesapları askıya alabilir, paket tanımlayabilir, site içi bildirim gönderebilir, kullanım kayıtlarını ve yapay zekâ çıktı metinlerini inceleyebilir ve kullanıcının talep ettiği veri dışa aktarım işlemlerini yürütebilir. Güvenlik ve kötüye kullanım kontrolleri kapsamında otomatik uyarılar üretilebilir; hesap otomatik olarak askıya alınmaz. Uyarı insan tarafından incelenir. İnceleme sonucunda sorun olmadığına karar verilebilir, kullanıcı uyarılabilir veya hesap askıya alınabilir. Kullanıcı, kararın gerekçesini talep edebilir ve itirazını destek kanalına iletebilir. Başvuru kanalı yayımdan önce açıkça belirtilmelidir."
    }
   ]
  },
  {
   "h": "Hizmetin değişmesi ve kesintiler",
   "b": [
    {
     "p": "Platformun özellikleri, teknik altyapısı ve paket kapsamı geliştirilebilir veya değiştirilebilir. Planlı bakım, üçüncü taraf hizmet sağlayıcılar, internet altyapısı, güvenlik olayları veya mücbir sebepler nedeniyle hizmette geçici kesinti yaşanabilir. Academiana, makul ölçüde kesintiyi azaltmak ve kullanıcı verilerinin güvenliğini sağlamak için gerekli tedbirleri alır. Emredici tüketici ve veri koruma mevzuatından doğan haklar saklıdır."
    }
   ]
  },
  {
   "h": "Sorumluluk",
   "b": [
    {
     "p": "Academiana akademik çalışmaya yardımcı araçlar sunar; akademik başarı, kabul, yayın, mezuniyet, etik kurul onayı, belirli bir not veya belirli bir sonuç garantisi vermez. Kullanıcı, çıktıları kendi değerlendirmesinden geçirerek kullanır ve kurumunun kurallarına uygunluğunu kontrol eder. Kanunen sınırlandırılması mümkün olmayan sorumluluklar, kast veya ağır kusurdan doğan sorumluluklar ve tüketici mevzuatından doğan zorunlu haklar saklıdır. Bu koşullar, emredici mevzuatın izin vermediği ölçüde kullanıcının haklarını ortadan kaldıracak şekilde yorumlanamaz."
    }
   ]
  },
  {
   "h": "Ücret ve koşul değişiklikleri",
   "b": [
    {
     "p": "Paket fiyatları ve koşulları değiştirilebilir. Değişiklikler, yeni satın alımlar ve yenilemeler bakımından, kullanıcıya önceden bildirilen yürürlük tarihinden itibaren uygulanır. Önceden satın alınmış dönemin veya süresiz Tek Proje hakkının kapsamı, emredici mevzuat ve satın alma sırasında bildirilen koşullar saklı kalmak üzere geriye dönük olarak daraltılmaz."
    }
   ]
  },
  {
   "h": "Uygulanacak hukuk ve dil",
   "b": [
    {
     "p": "Kullanım koşullarına Türk hukuku uygulanır. Tüketicinin yerleşim yerindeki emredici yetki ve görev kuralları saklıdır. Uyuşmazlıklarda, kanunen görevli tüketici hakem heyetleri ve mahkemeler ile genel görevli/yetkili mahkemeler bakımından ilgili mevzuat uygulanır. Platformun Türkçe, İngilizce ve Almanca arayüzleri bulunabilir. Bu taslakta bağlayıcı dil tercihi kesinleştirilmediğinden herhangi bir dilin diğerlerine üstün olduğu iddia edilmemektedir; yayına alınmadan önce dil hükmü belirlenmelidir."
    }
   ]
  },
  {
   "h": "Yaş ve kabul",
   "b": [
    {
     "p": "Platform için mevcut durumda yaş sınırı ve yaş doğrulama mekanizması bulunmadığı bildirilmiştir. Bu nedenle reşit olmayan kullanıcılar bakımından veli/vasinin izni ve özel veri koruma gereklilikleri ayrıca değerlendirilmelidir. Kullanıcı, kayıt veya kullanım sırasında kendisine sunulan güncel koşulları incelemekle yükümlüdür."
    }
   ]
  }
 ],
 "fair_use": [
  {
   "h": "Amaç ve genel ilke",
   "b": [
    {
     "p": "Bu politika, paketlerin makul ve kişisel kullanımını korumak, platformun sürdürülebilirliğini sağlamak ve diğer kullanıcıların hizmete erişimini güvence altına almak için hazırlanmıştır. “Sınırsız” ifadesi, bir kişinin kendi akademik çalışması için olağan kullanımını ifade eder; hesap paylaşımı, üçüncü kişiler adına toplu üretim veya paket kapsamını aşan farklı çalışmalar için sınırsız kullanım anlamına gelmez."
    }
   ]
  },
  {
   "h": "Sınırsız Proje paketi",
   "b": [
    {
     "p": "Sınırsız Proje paketi, tanımlandığı tarihten itibaren 1 ay geçerlidir; yıllık ödemede süre 1 yıldır. Bu süre boyunca proje sayısı dışında her şey tamamen sınırsızdır: yapay zekâ kullanımı, sayfa yazımı, kaynak taraması, depolama, ücretsiz araçlar ve tüm özellikler herhangi bir kota uygulanmadan kullanılabilir. Proje sayısı aylık ödemede en fazla 5, yıllık ödemede en fazla 60 aktif projedir. Süre sona erdiğinde paket kendiliğinden yenilenmez ve hesap Ücretsiz pakete geçer; çalışmalar silinmez. Daha önce eski koşullarla (süresiz ve tek bir çalışma için) satın alınmış Tek Proje paketleri, satın alındıkları koşullarla devam eder."
    }
   ]
  },
  {
   "h": "İhlal sayılabilecek davranışlar",
   "b": [
    {
     "p": "Aşağıdaki davranışlar, eski koşullarla satın alınmış Tek Proje paketinin amacıyla bağdaşmaz: çalışmayı tamamlayıp silerek yeni çalışma başlatmak veya aynı çalışma üzerine yazarak başka bir konu/çalışma üretmek; çalışmanın konusunu esaslı biçimde değiştirmek; paket kapsamında başkaları için çalışma hazırlamak; hesabı başka kişilerle paylaşmak; Tek Proje hakkını birden fazla bağımsız akademik çalışma için kullanmak."
    }
   ]
  },
  {
   "h": "Kötüye kullanım sinyalleri",
   "b": [
    {
     "p": "Sistem, inceleme amacıyla yöneticiye uyarı üretebilir. Uyarı sinyalleri şunları içerebilir: indirmeden sonra büyük miktarda içeriğin silinmesi; indirmeler arasında içeriğin büyük ölçüde değişmesi; kapakta yazar, üniversite veya danışman bilgisinin değiştirilmesi; çok sayıda cihazdan kullanım; olağan dışı sayıda bölüm oluşturulması; çalışmanın konusuyla ilgisiz uzun yapay zekâ metinleri üretilmesi. Maliyet göstergesinin paket ücretinin %40'ını aşması yalnızca bilgi amaçlıdır; tek başına kısıtlama sebebi değildir."
    }
   ]
  },
  {
   "h": "İnsan incelemesi ve karar",
   "b": [
    {
     "p": "Uyarı oluşması hesabın otomatik askıya alınacağı anlamına gelmez. Her uyarı yönetici tarafından incelenir. İnceleme sonucunda ihlal olmadığına karar verilebilir, kullanıcıdan açıklama istenebilir veya kullanıcı uyarılabilir. İhlalin niteliğine ve ağırlığına göre hesap askıya alınabilir. Kullanıcı, kararın gerekçesini öğrenmek ve karara itiraz etmek için platformun destek kanalını kullanabilir. Destek/başvuru iletişim bilgisi yayımdan önce açıkça gösterilmelidir."
    }
   ]
  },
  {
   "h": "Ücret iadesi",
   "b": [
    {
     "p": "Paketin bu politikaya aykırı kullanılması hâlinde, hukuken iade zorunluluğu doğmayan durumlarda ücret iadesi yapılmayabilir. Tüketicinin emredici mevzuattan doğan cayma, bedel iadesi ve diğer hakları saklıdır. Bu politika, kanunen zorunlu iade veya tüketici haklarını ortadan kaldırmaz."
    }
   ]
  },
  {
   "h": "Davet programı",
   "b": [
    {
     "p": "Davet ödülü; davet edilen kişinin e-posta adresini doğrulaması koşuluyla tanımlanır. Davet eden kişinin cihazından oluşturulan hesaplara ve geçici e-posta adreslerine ödül verilmez. Bu kontroller, davet programının kötüye kullanımını önleme amacıyla uygulanır."
    }
   ]
  },
  {
   "h": "Güncelleme",
   "b": [
    {
     "p": "Adil kullanım ölçütleri, teknik ve operasyonel ihtiyaçlar doğrultusunda güncellenebilir. Kullanıcıların haklarını önemli ölçüde etkileyen değişiklikler uygun şekilde duyurulur."
    }
   ]
  }
 ],
 "cookies": [
  {
   "h": "Kapsam",
   "b": [
    {
     "p": "Bu politika, Academiana web sitesinde çerezler, tarayıcı belleği ve benzeri teknolojilerin hangi amaçlarla kullanıldığını açıklar. Çerezler ve benzeri teknolojiler, oturumun sürdürülmesi, tercihlerin hatırlanması ve kötüye kullanımın önlenmesi gibi amaçlarla kullanılabilir."
    }
   ]
  },
  {
   "h": "Kullanılan teknolojiler",
   "b": [
    {
     "ul": [
      "Supabase oturum çerezleri: Kullanıcının oturumunu açık tutmak ve kimlik doğrulamayı sürdürmek için kullanılır. Birinci taraf ve hizmetin çalışması için zorunludur; süresi oturum ve yenileme mekanizmasına bağlıdır.",
      "acd_did çerezi ve tarayıcı belleği: Kötüye kullanımı önlemek (davet ödülü suistimali ve hesap paylaşımını tespit etmek) amacıyla rastgele cihaz kimliği tutar. Sunucuda bu kimliğin geri çözülemeyen özeti ve ilk/son görülme tarihleri saklanır. Süresi 400 gündür. Reklam amacıyla kullanılmaz.",
      "lang çerezi: Arayüz dilini hatırlamak için kullanılır; birinci taraf işlevsel çerezdir ve 1 yıl saklanır.",
      "localStorage: Gece modu, rehberli tur durumu ve çevrimdışı taslak yedeği gibi tercihleri kullanıcının cihazında tutabilir. Bu veriler yalnızca kullanıcının cihazındaki tarayıcı belleğinde saklanır.",
      "PWA servis çalışanı: Sitenin çevrimdışı açılabilmesine yardımcı olur."
     ]
    }
   ]
  },
  {
   "h": "Analitik ve reklam teknolojileri",
   "b": [
    {
     "p": "Bilgi notuna göre platformda analitik, reklam ve üçüncü taraf reklam çerezi bulunmamaktadır. Ziyaret sayımı çerezsiz yürütülür. IP adresi ve tarayıcı bilgisi yalnızca günlük değişen geri çözülemeyen kodu üretmek için anlık kullanılır; saklanmaz ve günler arasında aynı kişinin izlenmesine imkân verecek biçimde tutulmaz. Tarayıcı Do Not Track (DNT) veya Global Privacy Control (GPC) sinyali gönderiyorsa ziyaret sayımı yapılmaz."
    }
   ]
  },
  {
   "h": "Cihaz tanımlayıcısı ve tercih yönetimi",
   "b": [
    {
     "p": "Cihaz tanımlayıcısı reklam veya kullanıcı profili oluşturmak için değil, güvenlik ve kötüye kullanımı önlemek amacıyla kullanılmaktadır. Bununla birlikte cihaz tanımlayıcısının hukuken zorunlu teknoloji sayılıp sayılmadığı ve önceden izin gerektirip gerektirmediği somut teknik yapı ve mevzuat bakımından ayrıca değerlendirilmelidir. Kullanıcı tarayıcı ayarlarından çerezleri silebilir veya engelleyebilir; ancak zorunlu oturum çerezlerinin engellenmesi giriş ve bazı platform özelliklerinin çalışmasını etkileyebilir."
    }
   ]
  },
  {
   "h": "Üçüncü taraf bağlantılar",
   "b": [
    {
     "p": "Kullanıcı tarafından başlatılan Google veya Apple ile giriş, Overleaf/Zotero bağlantısı ya da WhatsApp üzerinden ödeme iletişimi gibi işlemlerde ilgili üçüncü tarafların kendi çerez ve gizlilik politikaları uygulanabilir. Academiana, üçüncü tarafların kendi ortamlarındaki veri işleme faaliyetlerini yönetmez."
    }
   ]
  },
  {
   "h": "Politika değişiklikleri",
   "b": [
    {
     "p": "Yeni bir çerez veya benzeri teknoloji kullanıma alınırsa bu politika güncellenir. Hukuken önceden izin alınması gereken bir teknoloji devreye alınırsa, gerekli izin mekanizması teknoloji etkinleştirilmeden önce sunulur."
    }
   ]
  }
 ],
 "integrity": [
  {
   "h": "Amaç ve temel ilke",
   "b": [
    {
     "p": "Academiana, akademik araştırma ve yazım süreçlerini destekleyen bir araçtır. Platform, kullanıcının yerine akademik sorumluluk üstlenmez. Araştırma sorusu, yöntem, veri, analiz, yorum, kaynak seçimi ve nihai metnin doğruluğundan kullanıcı sorumludur. Kullanıcı kendi üniversitesinin, enstitüsünün, dergisinin, fon sağlayıcısının ve etik kurulunun kurallarına uymalıdır."
    }
   ]
  },
  {
   "h": "Kaynakların bulunması ve doğrulanması",
   "b": [
    {
     "p": "Platformun kaynakları akademik veri tabanlarından getirilecek şekilde tasarlanmıştır. Yapay zekâ, projeye eklenmiş kaynaklara dayanarak atıf yapabilir. Kaynak, yazar, DOI, istatistik veya bulgu uydurmamak tasarım ilkesidir; desteklenemeyen bölümlerde “[KAYNAK GEREKLİ]”, veri gerektiren yerlerde “[VERİ GİRİLECEK]” uyarıları kullanılabilir. Buna rağmen yapay zekânın hata yapma olasılığı sıfır değildir. Kullanıcı her kaynağın künyesini ve ilgili içeriği özgün kaynaktan kontrol etmelidir."
    }
   ]
  },
  {
   "h": "Erişim seviyesinin gösterilmesi",
   "b": [
    {
     "p": "Kaynaklar için yalnızca bibliyografik kaydın mı, özetin mi yoksa tam metnin mi incelendiği gösterilebilir. Sayfa numarası ve doğrudan alıntı, yalnızca tam metni okunmuş kaynaklarda kullanılacak şekilde tasarlanmıştır. Kullanıcı, doğrudan alıntıları ve sayfa numaralarını kaynağın kendisinden doğrulamalıdır."
    }
   ]
  },
  {
   "h": "Kimlik doğrulama ve iddia denetimi",
   "b": [
    {
     "p": "DOI kayıtları Crossref ve DataCite; PMID kayıtları Europe PMC; arXiv kimlikleri arXiv üzerinden doğrulanabilir. Doğrulanamayan kayıt uyarıyla gösterilir. Kaynakça denetimi, kayıtların gerçekten var olup olmadığını kontrol etmeye yardımcı olur. İddia denetimi, atıflı bir cümlenin kaynak tarafından desteklenip desteklenmediğini “destekliyor”, “kısmen”, “desteklemiyor” veya “çelişiyor” şeklinde sınıflandırabilir. Bu kontroller yardımcı niteliktedir; nihai akademik değerlendirme yerine geçmez."
    }
   ]
  },
  {
   "h": "İstatistiksel analiz ve veri bütünlüğü",
   "b": [
    {
     "p": "Platformdaki istatistiksel hesaplamalar kullanıcının sağladığı veri üzerinden yapılır; yapay zekâ sonuçları yorumlamaya yardımcı olur. Kullanıcı veri setinin doğruluğunu, değişken tanımlarını, analiz varsayımlarını, örneklem özelliklerini ve raporlanan sonuçları kontrol etmelidir. Veri uydurmak, sonuçları çarpıtmak, istenmeyen bulguları gizlemek veya analizleri gerçeğe aykırı biçimde sunmak yasaktır."
    }
   ]
  },
  {
   "h": "İntihal ve özgünlük",
   "b": [
    {
     "p": "Platform lisanslı bir intihal tespit hizmeti sunmamaktadır ve intihal yüzdesi üretmez. Kaynakça kontrolü veya iddia denetimi, intihal taraması olarak değerlendirilmemelidir. Kullanıcı alıntı, paraphrase, kaynak gösterme ve özgün katkı kurallarına uymalıdır. Yapay zekâ ile oluşturulan metnin özgünlük veya intihalsizlik garantisi bulunmaz."
    }
   ]
  },
  {
   "h": "Yapay zekâ kullanımının beyanı",
   "b": [
    {
     "p": "Kullanıcı, kurumunun veya yayıncısının gerektirdiği hâllerde yapay zekâ kullanımını uygun biçimde beyan etmelidir. Yapay zekâ tarafından oluşturulan veya düzenlenen metin, kullanıcının kontrolü ve sorumluluğu olmaksızın kendi özgün akademik katkısıymış gibi sunulmamalıdır. Yapay zekâ kullanımı konusunda kurum politikası belirsizse kullanıcı ilgili kurumdan yazılı açıklama almalıdır."
    }
   ]
  },
  {
   "h": "Kabul edilemez akademik davranışlar",
   "b": [
    {
     "p": "Başkasına ait çalışmayı kendi çalışması gibi sunmak, başkası adına tez veya makale üretmek, kaynak veya veri uydurmak, sahte katılımcı yanıtları oluşturmak, analiz sonuçlarını değiştirmek, atıfları gerçeğe aykırı göstermek, etik kurul/onam gerekliliklerini atlamak ve akademik değerlendirmeyi yanıltmak platformun amaçlarıyla bağdaşmaz."
    }
   ]
  },
  {
   "h": "Kalite puanı",
   "b": [
    {
     "p": "Platformun kalite puanı yönteminin /yontem sayfasında açıklandığı bildirilmiştir. Yapay zekâ bulguları kalite puanını etkilemez. Kalite puanı, akademik kabul veya bilimsel geçerlilik garantisi olarak yorumlanmamalıdır."
    }
   ]
  },
  {
   "h": "Kişisel ve hassas araştırma verileri",
   "b": [
    {
     "p": "Kullanıcı, anket veya araştırma verilerine üçüncü kişilerin kimlik bilgilerini, sağlık verilerini veya diğer özel nitelikli verileri eklemeden önce gerekli etik kurul, aydınlatma, açık rıza ve veri güvenliği koşullarını sağlamalıdır. Araştırma katılımcılarının verileri mümkün olduğunca anonimleştirilmeli veya kimlikten arındırılmalıdır. Academiana'nın araştırmacıya örnek onam metni önermesi, araştırmacının hukuki ve etik sorumluluğunu ortadan kaldırmaz."
    }
   ]
  }
 ],
 "distance": [
  {
   "h": "Önemli kapsam notu",
   "b": [
    {
     "p": "Academiana'da mevcut satış akışı, fiyat veya uygulama içindeki “Yükselt” düğmesinden WhatsApp'ta paket adı ve varsa indirim kodu bulunan hazır mesaj açılması; ödemenin platform dışında alınması ve paketin yönetici tarafından manuel tanımlanması şeklindedir. Platformda çevrim içi ödeme sayfası bulunmadığı, kart bilgilerinin sisteme alınmadığı bildirilmiştir. Bu belge, mevcut akışa göre genel ön bilgilendirme ve sözleşme esaslarını düzenleyen taslaktır. Satıcı kimliği, iletişim/başvuru bilgileri, somut fiyat, ödeme yöntemi, KDV, fatura ve iade şartları doğrulanmadığı için bu bilgiler uydurulmamıştır."
    }
   ]
  },
  {
   "h": "Hizmetin konusu",
   "b": [
    {
     "p": "Academiana, akademik araştırma ve yazım süreçlerine yardımcı olan dijital platform erişimi ve ilgili yazılım özelliklerini sunar. Hizmet; yapay zekâ destekli metin önerisi ve düzenleme, akademik kaynak arama, atıf/kaynakça, istatistik analizi, anket araçları, dosya çıktıları ve iş birliği özelliklerini içerebilir. Hizmetin kapsamı satın alınan paketin güncel açıklamasına göre belirlenir."
    }
   ]
  },
  {
   "h": "Satış ve sözleşmenin kurulması",
   "b": [
    {
     "p": "Kullanıcı paket seçimini fiyatlar sayfasında veya uygulama içinde yapar ve WhatsApp üzerinden iletişim başlatır. Paket, ödeme ve tanımlama ayrıntıları kullanıcıyla ayrıca teyit edilir. Ödeme sonrasında yönetici paketi sistemde tanımlar ve hizmet başlar. Sözleşmenin kurulduğu an, satıcı kimliği, paket, fiyat, ödeme ve tanımlama bilgileri kullanıcıya kalıcı veri saklayıcısıyla teyit edilerek kayıt altına alınmalıdır. Bu teyit adımı mevcut akışta bulunmuyorsa devreye alınmalıdır."
    }
   ]
  },
  {
   "h": "Paket türleri",
   "b": [
    {
     "p": "Platformda Ücretsiz paket, aylık ücretli paketler, tek seferlik ve tek bir çalışma için süresiz Tek Proje paketi ve kurum lisansı bulunabilir. Kurum lisansları kurumla ayrıca yapılacak anlaşmaya tabi olabilir. İndirim kodları, davet programı ödülleri ve en az üç kişilik Akademik Ekip İndirimi (%30) uygulanabilir. İndirimin kapsamı ve hangi fiyat üzerinden hesaplandığı, satın alma öncesinde kullanıcıya açıkça bildirilmelidir."
    }
   ]
  },
  {
   "h": "Fiyat, vergi ve ödeme",
   "b": [
    {
     "p": "Ödenecek toplam bedel, varsa vergiler ve indirimler, ödeme yöntemi ve ödeme zamanı işlem öncesinde kullanıcıya açıkça bildirilmelidir. Mevcut bilgi notunda güncel paket fiyatları, KDV'nin fiyata dahil olup olmadığı, ödeme yöntemi (havale/EFT veya ödeme bağlantısı), fatura/e-arşiv düzeni ve satıcı bilgileri bulunmamaktadır. Bu nedenle bu taslakta tutar veya ödeme yöntemi belirtilmemiştir. Her satışta bu bilgiler yazılı olarak teyit edilmeden sözleşme tamamlanmış sayılmamalıdır."
    }
   ]
  },
  {
   "h": "Aylık paketlerin yenilenmesi",
   "b": [
    {
     "p": "Aylık paketlerde otomatik yenileme bulunmamaktadır. Dönem sonunda devam etmek isteyen kullanıcı yenilemeyi kendisi başlatır. Kullanıcıdan ayrıca onay alınmadan yeni dönem ücreti tahsil edilmez."
    }
   ]
  },
  {
   "h": "Hizmetin başlama zamanı ve dijital hizmet",
   "b": [
    {
     "p": "Ödeme sonrasında paket yönetici tarafından tanımlandığında hizmetin başladığı bildirilmiştir. Dijital hizmetin hemen başlatılması, cayma hakkının kapsamı ve olası istisnalar bakımından tüketici mevzuatındaki koşullar somut sözleşme türüne göre değerlendirilmelidir. Kullanıcıdan, gerekiyorsa hizmetin cayma süresi dolmadan başlatılmasına ilişkin ayrı ve açık talep/onay alınmalı; bunun hukuki sonuçları ayrıca açıklanmalıdır. Sadece genel kullanım koşullarının kabulü, tek başına geçerli bir feragat veya istisna oluşturduğu varsayımıyla kullanılmamalıdır."
    }
   ]
  },
  {
   "h": "Cayma hakkı ve iade",
   "b": [
    {
     "p": "Tüketicinin cayma hakkı ve dijital hizmetlerde uygulanabilecek istisnalar, hizmetin niteliğine, ifanın başlayıp başlamadığına, kullanıcının önceden verdiği açık talep/onaya ve yürürlükteki mevzuata göre belirlenir. Bu bilgi notunda mevcut bir cayma hakkı bilgilendirmesi, iade politikası veya hizmetin hemen başlatılmasına ilişkin ayrı onay bulunmadığı belirtilmiştir. Bu nedenle burada kesin bir cayma süresi veya “hiçbir koşulda iade yapılmaz” hükmü kurulmamaktadır. Satıcı, işlem öncesinde tüketiciye uygulanacak cayma/iade koşullarını açıkça bildirmeli ve zorunlu tüketici haklarını saklı tutmalıdır."
    }
   ]
  },
  {
   "h": "Tek Proje paketi",
   "b": [
    {
     "p": "Tek Proje paketi, tanımlama sırasında seçilen tek bir çalışma için geçerlidir ve süre sınırı bulunmaz. Paketin çalışma dışındaki yapay zekâ kullanımı, çalışma silme/değiştirme ve ikinci çalışma açma bakımından sınırlamaları Adil Kullanım Politikası'nda açıklanır. Kullanıcı satın almadan önce bu sınırlamaları incelemelidir."
    }
   ]
  },
  {
   "h": "Kurum lisansı",
   "b": [
    {
     "p": "Kurum lisansı, kurumla yapılacak ayrı anlaşmanın şartlarına göre sunulabilir. Kurum yöneticisinin üye listesi ve kullanım istatistiklerini görebildiği; kullanıcıların akademik çalışma içeriğini göremediği bildirilmiştir. Kurum lisansına özgü fiyat, süre, kullanıcı sayısı, destek seviyesi ve veri işleme hükümleri ayrıca yazılı olarak belirlenmelidir."
    }
   ]
  },
  {
   "h": "Şikâyet ve başvuru",
   "b": [
    {
     "p": "Kullanıcı, satın alma veya hizmetle ilgili sorunlarını platformun destek kanalı üzerinden bildirebilir. Resmî satıcı iletişim bilgileri ve başvuru adresi bilgi notunda bulunmadığından bu taslakta yer almamaktadır. Yayımdan önce satıcının unvanı, adresi, e-posta/telefon bilgileri ve uygulanabilir tüketici başvuru yolları eklenmelidir."
    }
   ]
  },
  {
   "h": "Siparişe özel teyit",
   "b": [
    {
     "p": "Her satın alma işleminde en azından satıcı bilgisi, kullanıcı bilgisi, paket adı, hizmet kapsamı, süre, limitler, toplam bedel, vergiler, ödeme yöntemi, hizmetin başlama zamanı, otomatik yenileme olup olmadığı ve uygulanacak cayma/iade şartları kullanıcıya işlemden önce sunulmalı; sipariş özeti ve sözleşme kalıcı veri saklayıcısıyla kullanıcıya iletilmelidir."
    }
   ]
  }
 ],
 "gdpr": [
  {
   "h": "Kapsam ve veri sorumlusu",
   "b": [
    {
     "p": "Bu bildirim, www.academiana.com.tr adresinde sunulan, yapay zekâ destekli bir akademik araştırma ve yazım platformu olan Academiana ile ilişkili kişisel veri işleme faaliyetlerini açıklar. Platform Türkiye’deki kullanıcıların erişimine açıktır ve başka ülkelerden de erişilebilir. Academiana’yı işleten gerçek veya tüzel kişinin kimliği ve posta/iletişim bilgileri kaynak bilgilerde sağlanmamıştır; bu nedenle bu taslakta bilerek belirtilmemiştir. Yayımdan önce eklenmeleri gerekir. GDPR’ın 3(2). maddesinin platformun faaliyetlerine uygulanıp uygulanmadığı ve 27. madde uyarınca bir AB temsilcisi gerekip gerekmediği, AB’deki kişilere yönelik fiilî hedefleme ve izleme esas alınarak değerlendirilmelidir."
    }
   ]
  },
  {
   "h": "Kişisel veri kategorileri",
   "b": [
    {
     "p": "Hizmetin nasıl kullanıldığına bağlı olarak Academiana şunları işleyebilir: hesap ve iletişim verileri (ad, e-posta adresi ve isteğe bağlı kurum); kimlik doğrulama verileri (parola doğrulama verisi veya Google ya da Apple ile girişte alınan ad/e-posta); akademik çalışma alanı içeriği (projeler, bölümler, sürüm geçmişi, yorumlar, kaynaklar ve notlar); yüklenen dosyalar ve çıkarılan metin; yapay zekâ istemleri ve yanıtları; yapay zekâ çıktılarının tam metni, zaman damgaları, proje/bölüm adları ve kelime sayıları dâhil kullanım kanıt kayıtları; kullanım sayaçları (token, maliyet, arama ve sayfa); rastgele oluşturulan bir cihaz tanımlayıcısı ve bunun sunucu tarafında tutulan geri çözülemeyen özeti; Tek Proje paketi için kelime sayısı, geri çözülemeyen bir içerik özeti ve kapak bilgileri dâhil sınırlı indirme kanıtları; ödeme ve paket tanımlama bilgileri (ödeyenin adı, telefon numarası, tutar ve not); ortak yazar daveti e-posta adresleri; danışman bağlantısı erişimleri ve yorumları; kurum üyeliği ve kullanım istatistikleri; destek mesajları ve teknik hata verileri; günlük değişen, kimlik belirlemeyen ziyaret istatistikleri; uygulama içi bildirimler ve ilgili kişi başvuru kayıtları."
    }
   ]
  },
  {
   "h": "Amaçlar ve hukuki dayanaklar",
   "b": [
    {
     "p": "Kişisel veriler; hesap oluşturmak ve yönetmek, kullanıcıların kimliğini doğrulamak, akademik çalışma alanını ve dosya işlevlerini sunmak, yapay zekâ özelliklerini sağlamak, akademik kaynak aramak, kaynakçayı yönetmek, istatistik ve anket araçları sunmak, iş birliğini ve danışmanla paylaşımı mümkün kılmak, paketleri ve kullanım sınırlarını yönetmek, ücretli paketleri tanımlamak, destek sağlamak, kötüye kullanımı önlemek, platform güvenliğini sürdürmek, hataları gidermek, hizmet performansını ölçmek ve hukuki yükümlülüklere uymak amacıyla işlenir. GDPR kapsamında muhtemel hukuki dayanaklar şunları içerebilir: hesap ve talep edilen hizmetler için sözleşmenin ifası (Madde 6(1)(b)); orantılı güvenlik, kötüye kullanımın önlenmesi ve hizmet istatistikleri için meşru menfaatler (Madde 6(1)(f)); kanunen gerekli kayıtlar için hukuki yükümlülüğe uyum (Madde 6(1)(c)). Bu dayanaklar, veri sorumlusunca belgelenmiş ve amaca özgü bir değerlendirme gerektirir. Açık rızaya yalnızca gerçekten gerekli olduğu ve geçerli biçimde alındığı durumlarda dayanılır."
    }
   ]
  },
  {
   "h": "Saklama",
   "b": [
    {
     "p": "Hesap verileri, akademik içerik, dosyalar, yapay zekâ sohbetleri, kullanım sayaçları, cihaz tanımlayıcısı özetleri ve uygulama içi bildirimler kural olarak hesap silinene kadar saklanır. Ortak yazar davetleri 14 gün sonra geçersiz olur; ancak davet kaydı projeyle birlikte kalabilir. Danışmanla paylaşım, kullanıcı bağlantıyı iptal edene kadar erişilebilir kalır. Tam metinli yapay zekâ kullanım kanıtları şu anda hesap silinene kadar saklanmaktadır; mevcut ifadelerde 12 aylık bir süreden söz edilse de otomatik silme şu anda uygulanmamaktadır. Geri bildirim ve hata kayıtları süresiz saklanabilir; hesap silindikten sonra kullanıcıyla bağlantısı kaldırılır, ancak metin kalabilir. Ziyaret istatistikleri süresiz saklanır. Ödeme kayıtları kanuni muhasebe ve vergi saklama gerekliliklerine tabi olabilir. Mevzuata uygun bir saklama takvimi ve otomatik silme kuralları belirlenmeli ve belgelenmelidir."
    }
   ]
  },
  {
   "h": "Alıcılar ve uluslararası aktarımlar",
   "b": [
    {
     "p": "Hizmet sağlayıcılar ve alıcılar şunları içerebilir: veritabanı, kimlik doğrulama ve dosya depolama için Supabase; barındırma ve içerik dağıtımı için Vercel; bir yapay zekâ özelliği kullanıldığında yapay zekâ işlemesi için Anthropic; kullanıcı ilgili giriş yöntemini seçtiğinde Google veya Apple. OpenAI kodda isteğe bağlı bir entegrasyon olarak bulunmaktadır; ancak canlı kullanımı teyit edilmemiştir ve bu taslakta aktif alıcı olarak değerlendirilmemektedir. Akademik arama servisleri, kullanıcının hesap kimliği olmadan arama terimlerini ve DOI tanımlayıcılarını alabilir; bunlar arasında OpenAlex, Crossref, PubMed/Europe PMC, arXiv, DOAJ, DataCite, ERIC, DBLP, PLOS, Zenodo, HAL, Open Library, INSPIRE-HEP ve Unpaywall bulunur; API erişim bilgileri tanımlandığında Springer Nature, IEEE ve NASA ADS de kullanılabilir. Kullanıcının talebi üzerine LaTeX dosyaları Overleaf’e gönderilebilir ve kullanıcının başlattığı ödeme iletişimi WhatsApp üzerinden yürütülebilir."
    }
   ]
  },
  {
   "h": "Veri konumları ve aktarım güvenceleri",
   "b": [
    {
     "p": "Sağlanan teknik bilgilere göre Supabase verileri AB sınırları içinde Frankfurt’ta barındırılmaktadır; Vercel barındırması da Frankfurt’tadır, Vercel ayrıca küresel bir CDN kullanır. Supabase ve Vercel ABD merkezli şirketlerdir. Bir yapay zekâ özelliği kullanıldığında kullanıcının istemi, ilgili çalışma alanı bağlamı ve seçilen kaynak/dosya parçaları Amerika Birleşik Devletleri’ndeki Anthropic’e aktarılır. Bazı akademik arama servisleri de kullanıcının ülkesi dışında bulunmaktadır. Veri sorumlusu, kısıtlamaya tabi her aktarım için uygun bir aktarım mekanizması belirlemeli ve belgelemelidir; örneğin uygulanabilir yeterlilik düzenlemeleri veya gerektiğinde ek önlemlerle birlikte Standart Sözleşme Maddeleri. Sağlayıcıların Veri İşleme Sözleşmeleri, alt işleyenler, aktarım etki değerlendirmeleri ve fiilî hizmet yapılandırmaları yayımdan önce doğrulanmalıdır."
    }
   ]
  },
  {
   "h": "Özel nitelikli veriler ve üçüncü kişi verileri",
   "b": [
    {
     "p": "Kullanıcılar; görüşme dökümleri, anket yanıtları veya sağlıkla ilgili bilgiler dâhil, üçüncü kişilere ilişkin kişisel veriler içeren araştırma materyalleri yükleyebilir. Olgulara ve sözleşmesel düzenlemelere bağlı olarak, araştırma faaliyeti bakımından kullanıcı veya araştırma kurumu veri sorumlusu olabilirken Academiana platform hizmeti bakımından veri işleyen olabilir. Kullanıcılar bu tür bilgileri yüklemeden önce geçerli bir hukuki dayanak, uygun bilgilendirmeler, gerekli her türlü açık rıza, etik kurul onayı ve uygun güvenceler sağlamalıdır. Veriler en aza indirilmeli ve mümkün olduğunda anonimleştirilmeli veya takma adlandırılmalıdır."
    }
   ]
  },
  {
   "h": "Otomatik izleme",
   "b": [
    {
     "p": "Platform, kötüye kullanıma işaret edebilecek kullanım örüntülerini otomatik olarak tespit edebilir ve insan incelemesi için uyarı üretebilir. Sistem bir hesabı otomatik olarak askıya almaz; bir insan yönetici uyarıyı inceler ve işlem yapılmamasının, uyarının veya askıya almanın uygun olup olmadığına karar verir. İlgili kişiler bu işlemeyle ilgili olarak, yasal koşullar sağlandığında itiraz hakkı dâhil, uygulanabilir haklarını kullanabilir."
    }
   ]
  },
  {
   "h": "Güvenlik",
   "b": [
    {
     "p": "Sağlanan teknik bilgiler; HTTPS, HSTS, İçerik Güvenlik Politikası, otomatik testlerle kullanıcı verisi izolasyonu, CSRF ve SSRF korumaları, sunucu tarafında gizli anahtar yönetimi, süreli dosya bağlantıları, bağımlılık güvenlik taraması ve 500’den fazla otomatik testi açıklamaktadır. Bu bilgiler ayrıca iki aşamalı kimlik doğrulamanın, yazılı bir kişisel veri ihlali prosedürünün ve bağımsız bir güvenlik testinin bulunmadığını belirtmektedir. Güvenlik önlemleri düzenli olarak gözden geçirilmeli ve GDPR’ın 32. maddesiyle uyumlu hâle getirilmelidir. Bir kişisel veri ihlali müdahale süreci; değerlendirmeyi ve gerektiğinde ihlalin öğrenilmesinden itibaren 72 saat içinde denetim makamına bildirimi, yasal eşik karşılandığında ise etkilenen kişilere bildirimi mümkün kılmalıdır."
    }
   ]
  },
  {
   "h": "İlgili kişi hakları",
   "b": [
    {
     "p": "GDPR’daki koşul ve sınırlamalara tabi olarak kişiler erişim, düzeltme, silme, kısıtlama ve veri taşınabilirliği talep edebilir ve meşru menfaatlere dayalı işlemeye itiraz edebilir. Kullanıcılar şu anda verilerini JSON biçiminde indirebilir, hesaplarını ve ilişkili hesap verilerini silebilir ve platform üzerinden veri talebi oluşturabilir. Sağlanan bilgilere göre veri taleplerine 30 gün içinde ücretsiz yanıt verilmektedir. Veri sorumlusunun iletişim bilgileri ve hakların kullanılacağı kanal sağlanmamıştır; yayımdan önce eklenmelidir. Kişiler ayrıca yetkili bir veri koruma denetim makamına, özellikle mutat meskenlerinin, işyerlerinin veya iddia edilen ihlalin gerçekleştiği AB üye devletinde şikâyette bulunabilir."
    }
   ]
  },
  {
   "h": "Kurumsal müşteriler",
   "b": [
    {
     "p": "Kurum lisanslarında Academiana, işlemenin fiilî amaç ve araçlarına bağlı olarak kurum adına veri işleyen sıfatıyla hareket edebilir. Yazılı bir Veri İşleme Sözleşmesi; işlemenin konusunu, süresini, niteliğini ve amacını, veri kategorilerini, ilgili kişi kategorilerini, güvenlik önlemlerini, alt işleyenleri, yardım yükümlülüklerini, verilerin silinmesini/iadesini ve denetim düzenlemelerini tanımlamalıdır."
    }
   ]
  },
  {
   "h": "Çocuklar",
   "b": [
    {
     "p": "Sağlanan bilgilere göre platformda şu anda yaş sınırı yoktur ve yaş doğrulaması yapılmamaktadır. Veri sorumlusu, hizmetin çocuklara sunulmasının muhtemel olup olmadığını değerlendirmeli ve uygulanabilir hukukun gerektirdiği durumlarda uygun yaşa ilişkin güvenceleri ve ebeveyn izni süreçlerini uygulamalıdır."
    }
   ]
  },
  {
   "h": "Değişiklikler",
   "b": [
    {
     "p": "Bu bildirim, işleme faaliyetlerindeki, hizmet sağlayıcılardaki veya uygulanabilir hukuktaki değişiklikleri yansıtmak üzere güncellenebilir. Önemli değişiklikler uygun bir kanal aracılığıyla bildirilir. Veri sorumlusunun kimliği ve iletişim bilgileri, gerekiyorsa AB temsilcisi bilgileri ve uygulanabilir denetim makamı bilgileri, bu bildirim nihai hukuki bildirim olarak yayımlanmadan önce tamamlanmalıdır."
    }
   ]
  }
 ]
};
