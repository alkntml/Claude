-- Tek Proje paketi (D103): tek ödeme 3.999 TL, süresiz, tüm özellikler ve yapay zekâ kullanımı sınırsız; yalnızca
-- TEK bir çalışma. Kötüye kullanıma karşı: (1) engelleme — ikinci çalışma açılamaz, pakete bağlı çalışma kullanıcı
-- tarafından silinemez, çalışma türü değiştirilemez; (2) uyarı — indirdikten sonra büyük silme, toplu silme, konu
-- değişikliği ve olağan dışı üretimde yöneticilere bildirim ve kullanıcının kanıt kaydına (activity_log) not düşülür.

-- 0) Düzeltme (D102): hesap silinirken çalışmalar da silinir; kanıt kaydı silinen hesaba kayıt yazmaya çalışınca
-- hesap silme başarısız oluyordu. Hesap artık yoksa (silme sırasında) kayıt yazılmaz.
create or replace function public.log_project_delete()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from public.profiles where id = old.user_id) then return old; end if;
  insert into public.activity_log (user_id, kind, project_id, project_title, words)
  values (old.user_id, 'project_deleted', old.id, old.title,
          coalesce((select sum(word_count) from public.project_stages where project_id = old.id), 0));
  return old;
end $$;

-- 1) Paket
insert into public.plans (id, name, description, price_monthly, price_yearly, currency, limits, features, sort_order, is_active)
values ('single', 'Tek Proje', 'Tek bir çalışma için tek ödeme: süresiz ve sınırsız kullanım.', 3999, 3999, 'TRY',
  '{"ai_requests_month": null, "tokens_month": null, "source_searches_month": null, "projects": 1, "storage_mb": 15000, "export_formats": ["txt","md","docx","pdf"], "cost_usd_month": null, "one_time": true}'::jsonb,
  array['Tek seferlik ödeme, süre sınırı yok','1 çalışma (tez, makale, proje önerisi…)','Sınırsız yapay zekâ kullanımı ve sınırsız sayfa','Sınırsız kaynak taraması','Tüm özellikler (Premium dahil)','15 GB depolama'],
  4, true)
on conflict (id) do update set name = excluded.name, description = excluded.description, price_monthly = excluded.price_monthly,
  price_yearly = excluded.price_yearly, limits = excluded.limits, features = excluded.features, sort_order = excluded.sort_order, is_active = true, updated_at = now();

-- 2) Pakete bağlı çalışma
alter table public.profiles add column if not exists single_project_id uuid references public.projects(id) on delete set null;

-- Kullanıcı ayrıcalıklı alanları (pakete bağlı çalışma ve kayıt cihazı dahil) kendisi değiştiremez
create or replace function public.protect_profile_privileged_columns()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null or auth.role() = 'service_role' or public.is_admin() then
    return new;
  end if;
  if new.role is distinct from old.role
     or new.plan_id is distinct from old.plan_id
     or new.plan_expires_at is distinct from old.plan_expires_at
     or new.is_suspended is distinct from old.is_suspended
     or new.email is distinct from old.email
     or new.referral_code is distinct from old.referral_code
     or new.referred_by is distinct from old.referred_by
     or new.referral_rewarded_at is distinct from old.referral_rewarded_at
     or new.work_locked is distinct from old.work_locked
     or new.single_project_id is distinct from old.single_project_id
     or new.signup_device is distinct from old.signup_device then
    raise exception 'Bu alanları değiştirme yetkiniz yok';
  end if;
  return new;
end $$;

-- 3) Uyarılar: kanıt kaydına not + yöneticilere bildirim (aynı kural için 24 saatte bir)
alter table public.activity_log drop constraint if exists activity_log_kind_check;
alter table public.activity_log add constraint activity_log_kind_check check (kind in ('ai_output', 'project_deleted', 'stage_deleted', 'text_removed', 'abuse_alert'));

create or replace function public.raise_abuse_alert(p_user uuid, p_rule text, p_data jsonb)
returns void language plpgsql security definer set search_path = public as $$
declare em text;
begin
  if exists (select 1 from public.activity_log where user_id = p_user and kind = 'abuse_alert' and action = p_rule and created_at > now() - interval '24 hours') then
    return;
  end if;
  select email into em from public.profiles where id = p_user;
  insert into public.activity_log (user_id, kind, action, project_id, project_title, words, output)
  values (p_user, 'abuse_alert', p_rule, nullif(p_data->>'project_id', '')::uuid, p_data->>'project_title', coalesce((p_data->>'words')::int, 0), p_data::text);
  insert into public.notifications (user_id, kind, data)
  select a.id, 'abuse_alert', p_data || jsonb_build_object('rule', p_rule, 'user_id', p_user, 'email', coalesce(em, ''))
  from public.profiles a where a.role = 'admin';
end $$;
revoke all on function public.raise_abuse_alert(uuid, text, jsonb) from public, anon, authenticated;

-- 4) Engelleme (veritabanı düzeyinde; uygulama arayüzü kullanıcıya açıklamayı ve uyarıyı ayrıca verir)
create or replace function public.single_project_guard()
returns trigger language plpgsql security definer set search_path = public as $$
declare pr record;
begin
  -- Yalnızca kullanıcının kendi işlemleri (yönetici ve sunucu serbest)
  if auth.uid() is null or auth.role() = 'service_role' or public.is_admin() then
    if tg_op = 'DELETE' then return old; end if;
    return new;
  end if;
  if tg_op = 'INSERT' then
    select plan_id, single_project_id into pr from public.profiles where id = new.user_id;
    if pr.plan_id = 'single' and pr.single_project_id is not null then
      raise exception 'Tek Proje paketinde yalnızca bir çalışma yapılabilir.';
    end if;
    return new;
  elsif tg_op = 'DELETE' then
    select plan_id, single_project_id into pr from public.profiles where id = old.user_id;
    if pr.plan_id = 'single' and pr.single_project_id = old.id then
      raise exception 'Tek Proje paketine bağlı çalışma silinemez.';
    end if;
    return old;
  else
    select plan_id, single_project_id into pr from public.profiles where id = new.user_id;
    if pr.plan_id = 'single' and pr.single_project_id = new.id and new.work_type is distinct from old.work_type then
      raise exception 'Tek Proje paketinde çalışma türü değiştirilemez.';
    end if;
    return new;
  end if;
end $$;
drop trigger if exists projects_single_guard_ins on public.projects;
create trigger projects_single_guard_ins before insert on public.projects for each row execute function public.single_project_guard();
drop trigger if exists projects_single_guard_del on public.projects;
create trigger projects_single_guard_del before delete on public.projects for each row execute function public.single_project_guard();
drop trigger if exists projects_single_guard_upd on public.projects;
create trigger projects_single_guard_upd before update of work_type on public.projects for each row execute function public.single_project_guard();

-- İlk çalışma pakete bağlanır
create or replace function public.single_project_bind()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  update public.profiles set single_project_id = new.id where id = new.user_id and plan_id = 'single' and single_project_id is null;
  return new;
end $$;
drop trigger if exists projects_single_bind on public.projects;
create trigger projects_single_bind after insert on public.projects for each row execute function public.single_project_bind();

-- Yönetici Tek Proje paketini atadığında: kullanıcının en son çalıştığı çalışma pakete bağlanır (yoksa ilk açacağı)
create or replace function public.single_project_bind_on_plan()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.plan_id = 'single' and new.single_project_id is null then
    select id into new.single_project_id from public.projects where user_id = new.id order by updated_at desc limit 1;
  end if;
  return new;
end $$;
drop trigger if exists profiles_single_bind on public.profiles;
create trigger profiles_single_bind before update of plan_id on public.profiles for each row execute function public.single_project_bind_on_plan();

-- 5) Uyarı kuralları
-- Eklentisiz kelime benzerliği (0–1, Jaccard): iki metnin ortak kelime oranı
create or replace function public.word_overlap(a text, b text)
returns numeric language sql immutable set search_path = public as $$
  with x as (select distinct w from regexp_split_to_table(lower(coalesce(a, '')), '[^[:alnum:]]+') w where length(w) > 2),
       y as (select distinct w from regexp_split_to_table(lower(coalesce(b, '')), '[^[:alnum:]]+') w where length(w) > 2)
  select case when (select count(*) from (select w from x union select w from y) u) = 0 then 1
              else (select count(*) from x join y using (w))::numeric / (select count(*) from (select w from x union select w from y) u) end
$$;

-- Başlık/konu belirgin biçimde değişirse (çalışmada en az 3.000 kelime varken)
create or replace function public.single_project_topic_watch()
returns trigger language plpgsql security definer set search_path = public as $$
declare pr record; w int;
begin
  select plan_id, single_project_id into pr from public.profiles where id = new.user_id;
  if pr.plan_id is distinct from 'single' or pr.single_project_id is distinct from new.id then return new; end if;
  select coalesce(sum(word_count), 0) into w from public.project_stages where project_id = new.id;
  if w >= 3000 and (
       (new.title is distinct from old.title and public.word_overlap(old.title, new.title) < 0.25)
    or (new.topic is distinct from old.topic and coalesce(old.topic, '') <> '' and public.word_overlap(old.topic, new.topic) < 0.25)) then
    perform public.raise_abuse_alert(new.user_id, 'topic_change', jsonb_build_object('project_id', new.id, 'project_title', new.title, 'old_title', old.title, 'old_topic', old.topic, 'new_topic', new.topic, 'words', w));
  end if;
  return new;
end $$;
drop trigger if exists projects_single_topic_watch on public.projects;
create trigger projects_single_topic_watch after update of title, topic on public.projects for each row execute function public.single_project_topic_watch();

-- Silme ve üretim kayıtları (kanıt kaydı) üzerinden: indirdikten sonra büyük silme, toplu silme, olağan dışı üretim
create or replace function public.single_project_activity_watch()
returns trigger language plpgsql security definer set search_path = public as $$
declare pr record; last_export timestamptz; del_after int; del_total int; gen_total int;
begin
  if new.kind = 'abuse_alert' then return new; end if;
  select plan_id, single_project_id into pr from public.profiles where id = new.user_id;
  if pr.plan_id is distinct from 'single' then return new; end if;
  if new.kind in ('text_removed', 'stage_deleted') then
    select max(created_at) into last_export from public.usage_events
     where user_id = new.user_id and kind = 'export' and meta->>'projectId' = coalesce(new.project_id::text, '');
    if last_export is not null then
      select coalesce(sum(words), 0) into del_after from public.activity_log
       where user_id = new.user_id and project_id = new.project_id and kind in ('text_removed', 'stage_deleted') and created_at > last_export;
      if del_after >= 3000 then
        perform public.raise_abuse_alert(new.user_id, 'delete_after_export', jsonb_build_object('project_id', new.project_id, 'project_title', new.project_title, 'words', del_after, 'exported_at', last_export));
      end if;
    end if;
    select coalesce(sum(words) filter (where kind in ('text_removed', 'stage_deleted')), 0), coalesce(sum(words) filter (where kind = 'ai_output'), 0)
      into del_total, gen_total from public.activity_log where user_id = new.user_id;
    if del_total >= 10000 and del_total >= gen_total * 0.6 then
      perform public.raise_abuse_alert(new.user_id, 'mass_delete', jsonb_build_object('project_id', new.project_id, 'project_title', new.project_title, 'words', del_total, 'generated', gen_total));
    end if;
  elsif new.kind = 'ai_output' then
    select coalesce(sum(words), 0) into gen_total from public.activity_log where user_id = new.user_id and kind = 'ai_output';
    -- Her 120.000 kelimede bir (≈ 4 yüksek lisans tezi ana metni)
    if gen_total >= 120000 and (gen_total - new.words) / 120000 < gen_total / 120000 then
      perform public.raise_abuse_alert(new.user_id, 'heavy_generation', jsonb_build_object('project_id', new.project_id, 'project_title', new.project_title, 'words', gen_total));
    end if;
  end if;
  return new;
end $$;
drop trigger if exists activity_single_watch on public.activity_log;
create trigger activity_single_watch after insert on public.activity_log for each row execute function public.single_project_activity_watch();

select id, name, price_monthly, limits->>'projects' as proje from public.plans where id = 'single';
