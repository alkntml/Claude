-- Kullanım kanıt kaydı (D102): paket kullanımı anlaşmazlıklarında yönetici, kullanıcının ne kadar yapay zekâ çıktısı
-- aldığını ve neyi sildiğini görebilsin. Kullanıcı çalışmasını veya metnini silse de kayıt kalır (12 ay saklanır;
-- hesap silinince silinir). Kullanıcılar bu tabloyu göremez; yalnızca sunucu ve tetikleyiciler yazar, yönetici okur.

create table if not exists public.activity_log (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  kind text not null check (kind in ('ai_output', 'project_deleted', 'stage_deleted', 'text_removed')),
  action text,
  project_id uuid,
  project_title text,
  stage_title text,
  words int not null default 0,
  words_before int,
  model text,
  output text,
  created_at timestamptz not null default now()
);
create index if not exists activity_log_user_idx on public.activity_log (user_id, created_at desc);
alter table public.activity_log enable row level security;
-- Politika yok: yalnızca sunucu (service role) ve tetikleyiciler

-- Çalışma silinince: başlık ve toplam kelime
create or replace function public.log_project_delete()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.activity_log (user_id, kind, project_id, project_title, words)
  values (old.user_id, 'project_deleted', old.id, old.title,
          coalesce((select sum(word_count) from public.project_stages where project_id = old.id), 0));
  return old;
end $$;
drop trigger if exists projects_log_delete on public.projects;
create trigger projects_log_delete before delete on public.projects for each row execute function public.log_project_delete();

-- Bölüm silinince (çalışmanın tamamı silinirken ayrıca yazılmaz)
create or replace function public.log_stage_delete()
returns trigger language plpgsql security definer set search_path = public as $$
declare ptitle text;
begin
  select title into ptitle from public.projects where id = old.project_id;
  if ptitle is null then return old; end if;
  if coalesce(old.word_count, 0) > 0 then
    insert into public.activity_log (user_id, kind, project_id, project_title, stage_title, words)
    values (old.user_id, 'stage_deleted', old.project_id, ptitle, old.title, old.word_count);
  end if;
  return old;
end $$;
drop trigger if exists stages_log_delete on public.project_stages;
create trigger stages_log_delete before delete on public.project_stages for each row execute function public.log_stage_delete();

-- Bölümden 300 kelime veya daha fazla metin silinince
create or replace function public.log_text_removed()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if coalesce(old.word_count, 0) - coalesce(new.word_count, 0) >= 300 then
    insert into public.activity_log (user_id, kind, project_id, project_title, stage_title, words, words_before)
    values (new.user_id, 'text_removed', new.project_id, (select title from public.projects where id = new.project_id), new.title,
            coalesce(old.word_count, 0) - coalesce(new.word_count, 0), old.word_count);
  end if;
  return new;
end $$;
drop trigger if exists stages_log_text_removed on public.project_stages;
create trigger stages_log_text_removed after update of word_count on public.project_stages for each row execute function public.log_text_removed();

select count(*) as kayit_sayisi from public.activity_log;
