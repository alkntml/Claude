-- D128: PRISMA 2020 sistematik derleme ve literatür haritası Pro ve üstü paketlerde. Tekrar çalıştırmak güvenlidir.
-- Basic kartından çıkarılır (migration 34 çalıştırıldıysa eklenmişti).
update public.plans
   set features = array_remove(array_remove(features, 'PRISMA 2020 sistematik derleme'), 'Literatür haritası ve eksik kaynak önerisi'),
       updated_at = now()
 where id = 'basic' and features && array['PRISMA 2020 sistematik derleme', 'Literatür haritası ve eksik kaynak önerisi'];

-- Pro kartına “Literatür matrisi” satırının hemen arkasına eklenir (Premium ve Tek Proje “Pro paketteki her şey” / “Tüm özellikler” ile kapsar).
update public.plans
   set features = case
         when array_position(features, 'Literatür matrisi') is null
           then features || array['PRISMA 2020 sistematik derleme', 'Literatür haritası ve eksik kaynak önerisi']
         else features[1:array_position(features, 'Literatür matrisi')]
              || array['PRISMA 2020 sistematik derleme', 'Literatür haritası ve eksik kaynak önerisi']
              || features[array_position(features, 'Literatür matrisi') + 1:]
       end,
       updated_at = now()
 where id = 'pro' and not ('PRISMA 2020 sistematik derleme' = any(features));
