-- =====================================================================
-- D154: Hukuki belge kabul kayıtları
-- Kullanıcının hangi hukuki belgenin hangi sürümünü, ne zaman ve hangi yolla
-- (e-posta kaydı, Google, Apple, onay sayfası, satın alma öncesi) kabul ettiğini
-- veya hangi bilgilendirmenin kendisine gösterildiğini saklar.
--   kind = 'accept' : sözleşme kabulü (ör. Kullanım Koşulları)
--   kind = 'notice' : bilgilendirme gösterildi / okundu (ör. KVKK Aydınlatma Metni) — açık rıza DEĞİLDİR
-- Kayıtları yalnızca sunucu (service role) ve kayıt tetikleyicisi yazar; kullanıcı yalnızca kendi kayıtlarını,
-- yönetici tümünü okur. Kayıtlar sonradan değiştirilemez (UPDATE her rol için engellenir).
-- Hesap silindiğinde kayıtlar da silinir (on delete cascade).
-- =====================================================================

create table if not exists public.legal_acceptances (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  doc text not null check (doc in ('kvkk', 'terms', 'fair_use', 'cookies', 'integrity', 'distance', 'gdpr')),
  version text not null check (version ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$'),
  kind text not null default 'accept' check (kind in ('accept', 'notice')),
  source text not null check (source in ('email', 'google', 'apple', 'consent_page', 'purchase')),
  context jsonb not null default '{}'::jsonb check (jsonb_typeof(context) = 'object' and pg_column_size(context) < 2000),
  accepted_at timestamptz not null default now()
);

create index if not exists legal_acceptances_user_idx on public.legal_acceptances (user_id, doc, accepted_at desc);

alter table public.legal_acceptances enable row level security;

drop policy if exists legal_acceptances_select on public.legal_acceptances;
create policy legal_acceptances_select on public.legal_acceptances for select
  using (user_id = auth.uid() or public.is_admin());
-- Bilerek INSERT/UPDATE/DELETE politikası yok: istemci doğrudan yazamaz, sürüm ve zamanı sunucu belirler.

-- Değiştirilemezlik: kabul kaydı hiçbir rol tarafından güncellenemez
create or replace function public.legal_acceptances_immutable()
returns trigger language plpgsql as $$
begin
  raise exception 'Hukuki kabul kayıtları değiştirilemez';
end $$;

drop trigger if exists legal_acceptances_no_update on public.legal_acceptances;
create trigger legal_acceptances_no_update before update on public.legal_acceptances
  for each row execute function public.legal_acceptances_immutable();

-- E-posta ile kayıt: kayıt formundaki kabul, kullanıcı meta verisinde { "legal": { "terms": "2026-11-13", "kvkk": "2026-11-13" } }
-- olarak gelir; profil oluşturulduktan sonra (tetikleyiciler ada göre sırayla çalışır: on_auth_user_created → on_auth_user_legal)
-- kayda dönüştürülür. Google/Apple girişinde bu alan olmadığından kayıt oluşmaz; kabul ilk girişte onay sayfasında alınır.
create or replace function public.record_signup_legal()
returns trigger language plpgsql security definer set search_path = public as $$
declare k text; v text;
begin
  if jsonb_typeof(new.raw_user_meta_data->'legal') <> 'object' then return new; end if;
  for k, v in select key, value from jsonb_each_text(new.raw_user_meta_data->'legal') loop
    if k in ('terms', 'kvkk') and v ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$' then
      insert into public.legal_acceptances (user_id, doc, version, kind, source)
      values (new.id, k, v, case when k = 'terms' then 'accept' else 'notice' end, 'email');
    end if;
  end loop;
  return new;
end $$;

drop trigger if exists on_auth_user_legal on auth.users;
create trigger on_auth_user_legal after insert on auth.users
  for each row execute function public.record_signup_legal();
