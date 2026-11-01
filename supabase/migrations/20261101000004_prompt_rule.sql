-- Mevcut kurulumlar için: sistem promptuna "listede olmayan eser adı anma" kuralını ekle
update public.app_settings
set value = jsonb_set(value, '{text}', to_jsonb((value->>'text') || E'\n8. KAYNAKLAR listesinde olmayan hiçbir yazar, eser veya yayın adını notlarda ya da önerilerde bile anma. Ek kaynak gerekiyorsa kullanıcıya "Literatür araştır" özelliğini kullanmasını ve hangi konuda arama yapılması gerektiğini öner.'))
where key = 'ai.system_prompt' and position('8. KAYNAKLAR listesinde olmayan' in value->>'text') = 0;
