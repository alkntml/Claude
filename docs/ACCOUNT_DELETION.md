# Hesap silme ve kişisel veri yönetimi (D154)

## Kullanıcı ne yapabilir (Hesap → Gizlilik ve Veri Yönetimi)
- **Verilerimi JSON olarak indir** (`GET /api/account?export=1`): `lib/data-export.ts` — çalışmalar, bölümler, sürümler, yorumlar, notlar, kaynaklar, sohbetler, dosya kayıtları, kalite raporları, kullanım olayları, geri bildirimler, anketler ve cevapları, paylaşım bağlantıları, bildirimler, krediler, iddia denetimleri, derleme kayıtları, indirme hakları, veri talepleri, hukuki kabul kayıtları; ayrıca sunucunun tuttuğu kullanım kanıt kaydı, cihaz kimliği özetleri, Tek Proje indirme izleri ve ödeme/paket kayıtları. Dosyaların kendisi JSON’a girmez (dosya listesi girer). Çalışması kilitli kullanıcıda doğrudan indirme yerine veri talebi.
- **Veri talebi oluştur** (`POST /api/account/data-request`): yönetici 30 gün içinde ücretsiz yanıtlar (Yönetim → Kilitler).
- **Danışman paylaşım bağlantıları**: liste `GET /api/account/shares`, iptal `DELETE /api/projects/[id]/shares`. İptal edilen bağlantı açılmaz (`lib/shares.ts`).
- **Hesabımı ve verilerimi sil** (`DELETE /api/account`, “SİL” onayı).

## Silme sırasında ne olur
1. Depo (`user-files`): `<user_id>/` altındaki tüm dosyalar, alt klasörler dâhil (ör. Overleaf geçici ZIP’leri), 1000’erli sayfalar hâlinde listelenip silinir; ayrıca `files` tablosundaki yollar. Dosya silinemezse hesap silinmez (hata döner, kullanıcı tekrar dener).
2. `data_requests` tablosuna kişi bağı olmayan bir “silme tamamlandı” kaydı yazılır.
3. Auth kullanıcısı silinir → `profiles` ve `user_id` ile bağlı tüm tablolar **ON DELETE CASCADE** ile silinir: projects, project_stages, stage_revisions, stage_comments, sources, source_chunks, project_memory, files, ai_conversations, ai_messages, quality_reports, usage_events, usage_credits, subscriptions, project_shares, project_members, project_presence, project_invites (gönderdikleri), surveys, survey_responses, notifications, user_devices, activity_log, export_fingerprints, plan_purchases, claim_audits, review_records, download_passes, organization_members, legal_acceptances. Projeye bağlı her şey (başkalarının o projeye yazdığı yorumlar dâhil) proje ile silinir. tests/db.test.ts bunu doğrular.
4. **Kalanlar (kişi bağı koparılır, `user_id = null`)**: feedback (mesaj metni), error_logs (hata metni; e-posta/telefon/IP/belirteç zaten maskelenmiş), tool_usage (sayaç), data_requests. Başkalarının projelerinde sizin adınıza bırakılmış izler (`actor_id`, `last_editor`) null olur.
5. Oturum kapatılır; kullanıcıya silinen dosya sayısı ve kalanlar bildirilir.

## Hukuki karar bekleyenler
- **Ödeme/paket kayıtları (`plan_purchases`) ve hukuki kabul kayıtları** hesapla birlikte siliniyor. Vergi/muhasebe ve ispat amaçlı saklama yükümlülüğü varsa bunlar (kişi bağı korunarak veya ayrı bir arşivde) tutulmalı — hukukçu kararından sonra değiştirilecek.
- Geri bildirim ve hata kayıtları için saklama süresi ve otomatik silme (KVKK metnindeki “süresiz tutulabilmekte” ifadesi).

## Yedekler
Veritabanı ve dosya yedeklerini barındırma sağlayıcısı (Supabase) tutar. Silinen hesabın verisi, yedek saklama süresi dolunca yedeklerden de kalkar; yedekten geri yükleme yapılırsa silinmiş hesaplar yeniden silinmelidir. **Projenin Supabase planındaki yedek türü ve saklama süresi Supabase panelinden (Database → Backups) doğrulanmalı ve bu belgeye yazılmalıdır** — bu oturumda doğrulanamadı.
