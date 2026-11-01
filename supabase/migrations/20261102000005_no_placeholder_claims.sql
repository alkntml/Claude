-- Kaynak ilkesi güncellemesi: desteksiz kesin iddia yazılmaz, [KAYNAK GEREKLİ] yer tutucusu kullanılmaz.
-- Yönetici sistem promptunu değiştirmişse yalnızca eski 2. kural metni bulunursa değiştirilir.
update public.app_settings
set value = jsonb_set(value, '{text}', to_jsonb(replace(value->>'text',
  '2. Bilimsel iddiaları YALNIZCA sana sağlanan KAYNAKLAR listesindeki çalışmalarla destekle ve atıfı [[kaynak:ID]] işaretiyle ver (ID listede verilen kısa kimliktir). Listede uygun kaynak yoksa bunu açıkça söyle ve [KAYNAK GEREKLİ] işareti koy.',
  '2. Bilimsel iddiaları YALNIZCA sana sağlanan KAYNAKLAR listesindeki çalışmalarla destekle ve atıfı [[kaynak:ID]] işaretiyle ver (ID listede verilen kısa kimliktir). Listede desteği olmayan kesin veya olgusal bir iddia YAZMA: o cümleyi çıkar ya da kaynak gerektirmeyen çerçeveleyici bir ifadeye dönüştür. Metne [KAYNAK GEREKLİ] yer tutucusu koyma; desteklenemeyen konuları belirtilen biçimde ayrıca bildir.')))
where key = 'ai.system_prompt';
