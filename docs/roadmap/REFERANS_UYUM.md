# Dinamik Akademik Yol Haritası Referansı (v1.0) — madde madde uyum tablosu

Kaynak: site sahibinin 13 Kasım 2026 tarihli “Academiana Dinamik Akademik Yol Haritası ve Metodoloji Referansı” belgesi.
Uygulama kararları: D171, D172, D173 (`DECISIONS.md`). Durum: ✅ karşılandı · ◐ kısmen / farklı yolla · ✗ yok.

## 1. Amaç ve temel ürün ilkeleri
| Madde | Durum | Nerede |
|---|---|---|
| Tek tip şablon yok; 9 hizmet türü ayrı | ✅ | `lib/workflows/templates.ts` → `buildTemplate` (tez, araştırma makalesi, dergi makalesi, bitirme projesi, derleme, öneri, fon, metin düzenleme, kaynak araştırması) |
| Yönteme duyarlılık (başlık, alt başlık, kalite kontrol) | ✅ | Yaklaşıma göre bölümler; `sectionFunctions`, `approachRules`, `approachSectionGuidance`; tutarlılık zinciri |
| Çalışma türüne duyarlılık | ✅ | `buildTemplate`, `workTypeGuidance` |
| Akademik düzeye duyarlılık (yalnızca başlık sayısı değil derinlik) | ✅ | `literatureDepth`, `levelGuidance` (lisans/YL/doktora/akademisyen), `scopeFor` |
| Disipline duyarlılık (sağlık, eğitim, mühendislik, işletme, sosyal, beşeri) | ✅ | `disciplineGuidance`, `disciplineGroup`, disipline göre desen filtresi ve raporlama standardı |
| Kullanıcı kontrolü (ekle, sil, yeniden adlandır, sırala, kapsam) | ✅ | Yeni projede yol haritası düzenleme; çalışma alanında bölüm ayarları ve “Yapıyı yönet” |
| Şeffaflık: neden önerildi / zorunlu / gizlendi | ✅ | Her bölümde gerekçe (`why`), zorunluluk etiketi; “Neden bazı bölümler yok?” (`omittedSections`) |
| Veri dürüstlüğü (kaynak, DOI, alıntı, veri, sonuç, etik onay, tarama sayısı uydurulmaz) | ✅ | Temel ilke 1; `approachRules` (alıntı uydurulmaz), ön sayfa ve etik kuralları, PRISMA “gerçek sayılarla” |
| Kritik bölüm silinirken açıklama + onay | ✅ | Çalışma alanı ve yeni proje düzenleyicisinde gerekçeli uyarı |

## 2. Dinamik yapılandırma motoru
| Boyut | Durum | Nerede |
|---|---|---|
| Çalışma türü | ✅ | `workType` |
| Akademik düzey | ✅ | `level` |
| Yaklaşım (nicel, nitel, karma, kuramsal, sistematik, meta-analiz) | ✅ | `methodology` |
| Araştırma deseni | ✅ | `DESIGNS` (18 desen) + yönetimden eklenen desenler |
| Disiplin | ✅ | `discipline` → yönerge, desen filtresi, standart seçimi |
| Belge amacı (enstitü, dergi, ders, fon, kongre) | ✅ | Yeni projede “Belge amacı”; `documentPurposeGuidance` |
| Kılavuz önceliği | ✅ | Kılavuz yükleme ve bölüm önerisi (Proje ayarları), `HEADING_RULES` (kılavuz terimleri öncelikli) |
| 2.1 Desen listeleri (nicel 6, nitel 7, karma 5) | ✅ | `DESIGNS` |
| Desen listesi kapalı değil; yönetimden eklenebilir | ✅ | Yönetim → Yapay zekâ → “Ek araştırma desenleri” (`workflows.designs`) |
| Disipline uygun olmayan desen gösterilmez | ✅ | `designsFor(approach, discipline)` (ör. kohort/vaka-kontrol yalnızca sağlıkta) |

## 3. Kullanıcı yönetimi
| Madde | Durum | Nerede |
|---|---|---|
| Başlık ekleme (konum, açıklama, kapsam) | ✅ | “Bölüm ekle” (açıklama, zorunluluk, kapsam) |
| Başlık silme + kritik uyarı | ✅ | |
| Başlık düzenleme (ad, açıklama, sıra, alt başlık ilişkisi) | ✅ | Bölüm ayarları; sürükle-bırak; alt başlıklar editörde |
| Başlık çoğaltma | ✅ | Bölüm ayarları → Kopyala (alt başlıklar kopyalanır, metin kopyalanmaz) |
| Görünürlük (etkin, gizli, koşullu) | ✅ | Gizle + Zorunlu/Koşullu/İsteğe bağlı |
| Zorunluluk ayarı | ✅ | |
| Kapsam ayarı (kısa/orta/ayrıntılı) | ✅ | Yapay zekâ uzunluğu buna göre ayarlar (`scopeGuidance`) |
| Varsayılanlara dönme | ✅ | “Yapıyı yönet” → Varsayılana sıfırla; bölüm ayarlarında “Varsayılana döndür”; yeni projede “Varsayılana dön” |
| Şablon kaydetme | ✅ | `user_templates` |
| Şablon paylaşma/aktarma | ✅ | Dosya olarak indir / içe aktar |
| 3.2 Öncelik: varsayılan → kurumsal/dergi → kullanıcı → proje kopyası | ✅ | Proje bölümleri bağımsız kopya; kayıtlı şablon; kılavuz bağlamda öncelikli |
| Şablon değişikliği mevcut projeyi sessizce değiştirmez; önce farklar | ✅ | `TEMPLATE_VERSION`, “Yapıyı yönet” fark listesi |
| 3.3 Alanlar: kimlik, ad/açıklama, sıra, zorunluluk, görünürlük, kapsam, değiştirildi bilgisi | ✅ | `project_stages` (migration 43) |
| 3.3 İlgili asistan, kalite kuralları, standart referansı | ✅ | Bölüm ayarlarında “İlgili asistan”, “beklenen işlevler”, “Raporlama standardı” |
| 3.3 Üst başlık kimliği (alt başlık hiyerarşisi) | ◐ | Alt başlıklar bölüm içeriğinde başlık düzeyi olarak tutulur, ayrı tablo yok |

## 4. Hizmet türleri
| Tür | Durum | Notlar |
|---|---|---|
| 4.1 Tez: ön sayfalar (kapak, onay, beyan, özet, içindekiler, listeler) | ✅ | “Ön sayfalar” bölümü + “Özet ve Abstract”; kapak, içindekiler, tablo ve şekil listeleri Word/PDF/LaTeX’te otomatik |
| 4.1 Giriş, kuramsal çerçeve/literatür, yöntem, bulgular, tartışma, sonuç, kaynakça, ekler | ✅ | |
| 4.1 Nicel/nitel/karma koşullu alt başlıklar | ✅ | `sectionFunctions` (yapay zekâya işlev olarak; başlık birebir kopyalanmaz) |
| 4.2 Araştırma makalesi (tez kopyası değil, IMRaD, nicel/nitel/karma görünürlük, ek materyal, beyanlar) | ✅ | D172 |
| 4.3 Dergi makalesi / yayın uyarlama | ✅ | Dergi gereklilikleri, kapak mektubu; veri yoksa kaynaklara dayalı yapı |
| 4.4 Bitirme projesi (araştırma, yazılım, işletme, eğitim) | ✅ | Hedef grup “İhtiyaç analizi ve hedef grup” içinde |
| 4.5 Anlatı derleme, sistematik derleme, meta-analiz (7 ek adım) | ✅ | |
| 4.6 Araştırma önerisi (bulgu yok; nicel/nitel/karma ayrımı) | ✅ | |
| 4.7 TÜBİTAK/BAP (programa göre; güncel çağrı belirleyici; ekler) | ✅ | Bütçesiz programlar ayrı |
| 4.8 Metin düzenleme (anlamı değiştiren müdahale ayrıca işaretlenir; kabul/ret) | ✅ | Yapay zekâ yönergesi + öneri modu (kabul/ret) |
| 4.9 Kaynak ve literatür araştırması (ayrı çıktılar) | ✅ | Kaynak listesi dışa aktarma, literatür matrisi |

## 5. Nicel, nitel ve karma kurallar
| Madde | Durum |
|---|---|
| Karşılaştırma tablosu (odak, hipotez, örnekleme, veri, analiz, kalite, bulgu, tartışma) | ✅ `approachRules` |
| 5.1 Başlık görünürlüğü (hipotez, örneklem, normallik, kodlama, alıntı, entegrasyon, meta-çıkarım) | ✅ şablon + `sectionFunctions` + `approachRules` |
| Tablo mutlak değildir; desen ve veri türü dikkate alınır | ✅ desen rehberi bağlamda |

## 6. Literatür
| Madde | Durum |
|---|---|
| 6.1 Sekiz işlev | ✅ `LITERATURE_FUNCTIONS` |
| 6.2 Erken sonlandırma yok, dolgu yok, eksik alt alanlar bildirilir | ✅ |
| 6.3 Düzeye göre derinlik | ✅ `literatureDepth` |
| 6.4 Kontrol listesi: kapsam, temel–güncel denge, ardışık özet, çelişkiler, boşluk, doğrulanabilirlik | ✅ Tutarlılık zinciri (kapsam, güncellik, ardışık özet, çelişki, boşluk) + mevcut kaynak doğrulama ve iddia denetimi |

## 7. Başlıklandırma
| Madde | Durum |
|---|---|
| Örnek başlıklar birebir kopyalanmaz | ✅ |
| 7.1 Kurallar (işlev, tekrar yok, hiyerarşi, terminoloji, kılavuz adları, çeviri tutarlılığı, yeniden adlandırma) | ✅ `HEADING_RULES`, başlık disiplini |
| 7.2 İşlevsel kimlik ile görünen başlık ayrı | ✅ `key` ↔ `title` |
| 7.3 Tekrar ve düzey bozulması önlenir; kılavuz terimleri öncelikli; onaysız üzerine yazılmaz | ✅ “Yinelenen başlık” kontrolü + yapay zekâ kuralı |

## 8. Oluşturma akışı
| Adım | Durum |
|---|---|
| 1–5 Tür, düzey, disiplin, yaklaşım (veya öneri), desen | ✅ |
| 6 Konu, amaç ve mevcut araştırma soruları | ✅ (araştırma soruları ortak hafızaya da yazılır) |
| 7 Kılavuz | ◐ Üniversite/dergi adı oluştururken; kılavuz dosyası Proje ayarları’ndan yüklenir |
| 8–10 Yol haritası, inceleme/düzenleme, onay | ✅ |
| Yöntem bilmeyene gerekçeli öneri, karar kullanıcıda | ✅ |

## 9. Asistanlar ve ortak hafıza
| Madde | Durum |
|---|---|
| 11 asistan rolü | ✅ `assistantFor` (bölüme göre rol yapay zekâya verilir, ayarlarda görünür) |
| Tek proje bağlamı | ✅ |
| Araştırma sorusu değişince ilgili bölümlerin yeniden kontrolü | ✅ Hatırlatma + tutarlılık zinciri |
| Onaylı gerçek / varsayım / doğrulanmamış bilgi ayrımı | ✅ hafıza türleri |

## 10. Kalite kontrol motoru
| Madde | Durum |
|---|---|
| 10.1 On maddelik zincir | ✅ (9. madde mevcut atıf–kaynakça kontrolünde) |
| 10.2 Kritik / Önemli / İyileştirme | ✅ |
| Önce sorun + kanıt + öneri; otomatik düzeltme yok; kabul/ret/kendi çözümü | ✅ “Düzelt →”, “Bu öneriyi reddet”, reddedilenleri geri al |

## 11. Teknik mimari
| Madde | Durum |
|---|---|
| user_templates, template_change_logs | ✅ migration 43 |
| template_definitions, template_versions, template_sections, section_rules | ◐ Kodda sürümlü şablon motoru (`TEMPLATE_VERSION`); ayrı tablolar yok |
| project_template_snapshots | ◐ Proje bölümleri oluşturulduğu anın bağımsız kopyası; şablon sürümü ve kaynağı proje bağlamında |
| quality_rules | ◐ Kurallar kodda (`consistency-chain.ts`, `checks.ts`) |
| Mevcut veri korunur, sessiz güncelleme yok, farklar önce gösterilir, RLS | ✅ |
| Geri alma ve varsayılana dönme | ✅ Yapı geçmişinde “Geri al” (metinli bölüm silinmez) |

## 12. Testler
| Madde | Durum |
|---|---|
| 12.1 On iki senaryo | ✅ `tests/dynamic-roadmap.test.ts` |
| 12.2 Özelleştirme testleri | ✅ fark, temizleme, kritik uyarı; veritabanı yetkileri `tests/db.test.ts` |
| 12.3 Kabul ölçütleri | ✅ `tests/roadmap-reference.test.ts` |

## 13–14. Uygulama talimatı ve standartlar
| Madde | Durum |
|---|---|
| Standartlar desen ve disipline göre; hepsi dayatılmaz; güncel sürüm kontrol edilir | ✅ `reportingStandards(discipline)`; yapay zekâ ve bölüm ayarlarında “güncel sürümünü kontrol edin” |
| Kılavuzdaki belirsizlik kullanıcıya sorulur | ✅ `HEADING_RULES` |

## Bilinen sınırlar
- Şablon tanımları veritabanı tablosu değil, kodda sürümlü tutulur (yönetimden düzenlenebilen kısım: ek desenler ve bölüme özel yapay zekâ talimatları).
- Metni olan silinmiş bir bölüm yapı geçmişinden geri getirilemez (silmeden önce uyarı verilir; bölüm geçmişi ve dışa aktarılan kopyalar kalır).
- Yönetimden eklenen desenin adı yalnızca Türkçe görünür.
