-- D81: Çalışma kilidi kaldırıldı. Kullanıcı kendi çalışmasına erişimi hiçbir zaman kaybetmez;
-- aylık hak dolunca yalnızca yapay zekâ ve kaynak tarama durur (sunucuda kontrol edilir).
-- Eski bayraklar temizlenir ve içerik tablolarındaki kilit kuralı her zaman “kilitli değil” döner.
update public.profiles set work_locked = false where work_locked;

create or replace function public.work_locked() returns boolean
language sql stable security definer set search_path = public as $$
  select false
$$;
