-- Paket özellikleri (D106): Ücretsiz pakete PDF dışa aktarma eklendi; Premium’dan “Öncelikli destek” kaldırıldı;
-- Basic kartında PDF artık ayrıcalık olmadığından satır “Word dışa aktarma” oldu. Tekrar çalıştırmak güvenlidir.

update public.plans
   set limits = jsonb_set(limits, '{export_formats}', coalesce(limits->'export_formats', '["txt","md"]'::jsonb) || '["pdf"]'::jsonb),
       updated_at = now()
 where id = 'free' and not coalesce(limits->'export_formats', '[]'::jsonb) ? 'pdf';

update public.plans set features = array_replace(features, 'TXT / Markdown dışa aktarma', 'TXT / PDF / Markdown dışa aktarma'), updated_at = now()
 where id = 'free' and 'TXT / Markdown dışa aktarma' = any(features);
update public.plans set features = array_replace(features, 'Word / PDF dışa aktarma', 'Word dışa aktarma'), updated_at = now()
 where id = 'basic' and 'Word / PDF dışa aktarma' = any(features);
update public.plans set features = array_remove(features, 'Öncelikli destek'), updated_at = now()
 where 'Öncelikli destek' = any(features);

select id, limits->'export_formats' as disa_aktarma, features from public.plans order by sort_order;
