-- D126: Paket kartlarında yeni özellikler görünsün. Tekrar çalıştırmak güvenlidir (eklenmişse yeniden eklemez).
-- Ücretsiz: iddia denetimi ve teslim öncesi kontrol listesi (“Başlık önerisi ve bölüm kontrolü” satırından sonra).
update public.plans
   set features = case
         when array_position(features, 'Başlık önerisi ve bölüm kontrolü') is null
           then features || array['İddia denetimi ve teslim öncesi kontrol listesi']
         else features[1:array_position(features, 'Başlık önerisi ve bölüm kontrolü')]
              || array['İddia denetimi ve teslim öncesi kontrol listesi']
              || features[array_position(features, 'Başlık önerisi ve bölüm kontrolü') + 1:]
       end,
       updated_at = now()
 where id = 'free' and not ('İddia denetimi ve teslim öncesi kontrol listesi' = any(features));

-- Basic: PRISMA ve literatür haritası (“Yapay zekâ destekli kalite raporu” satırından sonra).
update public.plans
   set features = case
         when array_position(features, 'Yapay zekâ destekli kalite raporu') is null
           then features || array['PRISMA 2020 sistematik derleme', 'Literatür haritası ve eksik kaynak önerisi']
         else features[1:array_position(features, 'Yapay zekâ destekli kalite raporu')]
              || array['PRISMA 2020 sistematik derleme', 'Literatür haritası ve eksik kaynak önerisi']
              || features[array_position(features, 'Yapay zekâ destekli kalite raporu') + 1:]
       end,
       updated_at = now()
 where id = 'basic' and not ('PRISMA 2020 sistematik derleme' = any(features));
