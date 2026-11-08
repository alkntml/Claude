-- 37: Gerçek zamanlı ortak yazım (D140)
-- Supabase Realtime’ın özel (private) yayın kanalı “project:<çalışma kimliği>” yalnızca çalışmanın sahibine ve
-- ortak yazarlarına açılır. Kanal üzerinden “kim burada / hangi bölümde / yazıyor mu” bilgisi ve bölüm içeriğinin
-- anlık kopyası iletilir; kalıcı kayıt yine normal kayıt ucuyla yapılır. Yorumcular dinleyebilir, yazamaz.

create or replace function public.collab_project_access(p_topic text, p_write boolean)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select case
    when p_topic is null or p_topic !~ '^project:[0-9a-fA-F-]{36}$' then false
    else exists (
      select 1 from public.projects p
      where p.id = split_part(p_topic, ':', 2)::uuid
        and (
          p.user_id = auth.uid()
          or exists (
            select 1 from public.project_members m
            where m.project_id = p.id and m.user_id = auth.uid()
              and (not p_write or m.role = 'editor')
          )
        )
    )
  end
$$;
revoke all on function public.collab_project_access(text, boolean) from public, anon;
grant execute on function public.collab_project_access(text, boolean) to authenticated;

-- Realtime şeması yalnızca Supabase’de vardır (yerel testlerde sahte şema kurulur)
do $$
begin
  if to_regclass('realtime.messages') is not null then
    execute 'drop policy if exists academiana_collab_read on realtime.messages';
    execute 'create policy academiana_collab_read on realtime.messages for select to authenticated using (public.collab_project_access(realtime.topic(), false))';
    execute 'drop policy if exists academiana_collab_write on realtime.messages';
    execute 'create policy academiana_collab_write on realtime.messages for insert to authenticated with check (public.collab_project_access(realtime.topic(), true))';
  end if;
end $$;
