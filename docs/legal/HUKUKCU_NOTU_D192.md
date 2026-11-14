# Hukukçu için not — Zotero/ORCID eşitlemesi ve danışman rolü (14 Kasım 2026)

Hukuki metinler değiştirilmedi. Aşağıdaki yeni işleyişin mevcut metinlerle uyumunu değerlendirmenizi rica ederiz.

## Sitenin yeni davranışı

1. **Zotero eşitlemesi (isteğe bağlı).**
   - Kullanıcı Zotero kütüphanesini bir çalışmaya bağlarken “Eşitle” kutusunu işaretlerse şu bilgiler saklanır: Zotero kullanıcı veya grup kimliği, isteğe bağlı koleksiyon anahtarı ve **yalnızca okuma izinli Zotero API anahtarı**.
   - Anahtar veritabanında AES-256-GCM ile **şifreli** tutulur. Bu kayda yalnızca sunucu erişir: kullanıcıya, ortak yazarlara ve yönetim paneline gösterilmez.
   - Anahtar şu durumlarda silinir:
     - Kullanıcı “Bağlantıyı kaldır” derse (hakkı dolmuş, salt okunur hesaplarda da kullanılabilir).
     - Çalışma silinirse.
     - Hesap silinirse.
   - Kutu işaretlenmezse eski davranış sürer: anahtar saklanmaz, yalnızca o aktarım için kullanılır.
   - Eşitleme tek yönlüdür. Zotero’dan kayıt okunur, Zotero’ya hiçbir şey yazılmaz. Çalışma açıldığında en fazla 6 saatte bir kendiliğinden çalışır.
2. **ORCID’den yayın aktarma.**
   - Kullanıcı bir ORCID numarası girer. Bu kendi numarası, danışmanının ya da herhangi bir araştırmacının numarası olabilir.
   - ORCID’in herkese açık API’sinden yalnızca **herkese açık** yayın kayıtları ve kayıt sahibinin adı okunur. Bu bilgiler çalışmanın kaynak listesine künye olarak eklenir.
   - “Eşitle” seçilirse ORCID numarası saklanır ve yeni yayınlar sonradan da eklenir.
3. **Danışman rolü.**
   - Çalışma sahibi, Academiana hesabı olan bir kişiyi e-posta adresiyle “Danışman” olarak davet edebilir. Bu her pakette mümkündür; bir çalışmaya en fazla 2 danışman eklenebilir.
   - Danışman çalışmayı okur ve yorum yazar; metni değiştiremez.
   - Danışman ayrıca bir “İlerleme” paneli görür:
     - bölüm başına yazılan kelime sayısı ve hedef,
     - son düzenleme tarihi,
     - açık yorum sayısı,
     - son kalite puanı.
   - Aynı ilerleme paneli, hesap gerektirmeyen “Danışmanla paylaş” bağlantısında da gösterilir.

## Kontrol edilmesi önerilen metinler

- **KVKK Aydınlatma Metni / Gizlilik Politikası**
  - İşlenen veri kategorileri arasında “üçüncü taraf hizmet bağlantı bilgileri (Zotero kimliği ve şifreli API anahtarı, ORCID numarası)” yer almalı mı?
  - Bu bilgilerin saklama süresi şöyledir: bağlantı kaldırılana, çalışma veya hesap silinene kadar.
- **Çerez ve üçüncü taraf bölümü**
  - Metinde “Overleaf/Zotero bağlantısı” anılıyor. ORCID (ORCID, Inc.) eklenmeli mi?
- **Danışman paylaşımı**
  - İlerleme bilgilerinin (kelime sayısı, son düzenleme tarihi, kalite puanı) danışmanla paylaşılması mevcut paylaşım ifadelerinin kapsamında mı?
- **Kullanıcının verisini indirme (JSON)**
  - Dışa aktarılan verilere bağlantı kayıtları da eklendi.
  - Şifreli anahtar bu dosyaya hiçbir zaman dahil edilmez.

Metinlerde değişiklik gerekirse, değiştirilen metnin `docs.ts` içindeki sürüm numarası artırılacak. Kullanım Koşulları değişirse kullanıcılardan yeniden onay istenecek.
