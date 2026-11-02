-- Ücretlendirme sayaçlarının güvenilirliği (D51)

-- 1) Aylık kullanım toplamı veritabanında hesaplanır (API’nin 1000 satır sınırına takılmaz)
create or replace function public.usage_totals(p_user uuid, p_since timestamptz)
returns table (ai_requests bigint, tokens bigint, source_searches bigint, exports bigint, storage_bytes bigint)
language sql stable security definer set search_path = public as $$
  -- Yalnızca sunucu, yönetici veya kullanıcının kendisi (başkasının toplamı sıfır döner)
  with ok as (select (auth.uid() is null or auth.role() = 'service_role' or p_user = auth.uid() or public.is_admin()) as v)
  select
    coalesce(sum(e.quantity) filter (where e.kind = 'ai_request'), 0),
    coalesce(sum(e.tokens_in + e.tokens_out) filter (where e.kind = 'ai_request'), 0),
    coalesce(sum(e.quantity) filter (where e.kind = 'source_search'), 0),
    coalesce(sum(e.quantity) filter (where e.kind = 'export'), 0),
    case when (select v from ok) then (select coalesce(sum(size_bytes), 0) from public.files where user_id = p_user) else 0 end
  from public.usage_events e
  where e.user_id = p_user and e.created_at >= p_since and (select v from ok)
$$;
revoke all on function public.usage_totals(uuid, timestamptz) from public, anon, authenticated;

-- 2) Proje kotası atlatılamasın: projeleri yalnızca sunucu oluşturur (kota kontrolünden sonra)
drop policy if exists projects_owner_insert on public.projects;

-- 3) Arşivden çıkarma yalnızca sunucu üzerinden (kota kontrolüyle) yapılabilir
create or replace function public.protect_project_unarchive()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if old.status = 'archived' and new.status <> 'archived'
     and not (auth.uid() is null or auth.role() = 'service_role' or public.is_admin()) then
    raise exception 'Arşivden çıkarma yalnızca uygulama üzerinden yapılabilir';
  end if;
  return new;
end $$;
drop trigger if exists projects_protect_unarchive on public.projects;
create trigger projects_protect_unarchive before update on public.projects
  for each row execute function public.protect_project_unarchive();
