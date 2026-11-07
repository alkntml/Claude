-- D113 + D115: Satır içi otomatik tamamlama kullanım türü ve ortak yazım (ortak yazarlar).
-- Tekrar çalıştırmak güvenlidir.

-- 1) Otomatik tamamlama ayrı kullanım türüdür: aylık yapay zekâ istek/token hakkından düşmez, maliyet sınırına dahildir.
alter type public.usage_kind add value if not exists 'autocomplete';

-- 2) Ortak yazarlar: çalışma sahibinin davet ettiği kişiler (editor = yazabilir, commenter = okur ve yorum yazar).
--    Çalışmanın içeriği (bölümler, kaynaklar, hafıza, sürümler) sahibinin kaydı olarak kalır; ortak yazarın erişimini
--    sunucu üyelik kontrolüyle verir. Ortak yazarın yapay zekâ kullanımı kendi paketinden düşer.
create table if not exists public.project_members (
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null check (role in ('editor', 'commenter')),
  invited_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  primary key (project_id, user_id)
);
create index if not exists project_members_user_idx on public.project_members (user_id);
alter table public.project_members enable row level security;
drop policy if exists project_members_read on public.project_members;
create policy project_members_read on public.project_members for select
  using (user_id = auth.uid() or exists (select 1 from public.projects p where p.id = project_id and p.user_id = auth.uid()));

create table if not exists public.project_invites (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  email text not null check (char_length(email) between 3 and 320),
  role text not null check (role in ('editor', 'commenter')),
  token text not null unique check (char_length(token) >= 32),
  invited_by uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default now() + interval '14 days',
  accepted_at timestamptz,
  accepted_by uuid references public.profiles(id) on delete set null
);
create index if not exists project_invites_project_idx on public.project_invites (project_id);
alter table public.project_invites enable row level security;
drop policy if exists project_invites_owner_read on public.project_invites;
create policy project_invites_owner_read on public.project_invites for select
  using (exists (select 1 from public.projects p where p.id = project_id and p.user_id = auth.uid()));

-- Kim hangi bölümde (çalışma alanında “Ayşe bu bölümde” göstergesi). Yalnızca sunucu yazar ve okur.
create table if not exists public.project_presence (
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  stage_id uuid references public.project_stages(id) on delete set null,
  seen_at timestamptz not null default now(),
  primary key (project_id, user_id)
);
alter table public.project_presence enable row level security;

-- Bölümü en son kim kaydetti (çakışma uyarısı), sürümü ve yorumu kim oluşturdu
alter table public.project_stages add column if not exists last_editor uuid references public.profiles(id) on delete set null;
alter table public.stage_revisions add column if not exists actor_id uuid references public.profiles(id) on delete set null;
alter table public.stage_comments add column if not exists actor_id uuid references public.profiles(id) on delete set null;

-- 3) Sahiplik denetimi: alt kayıtlar çalışma sahibine aittir. Tek istisna: ortak yazarın kendi asistan sohbeti
--    (ai_conversations) kendi adına tutulur; sohbetler kişiseldir, sahibi göremez.
create or replace function public.assert_project_owner()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.project_id is not null
     and not exists (select 1 from public.projects p where p.id = new.project_id and p.user_id = new.user_id)
     and not (tg_table_name = 'ai_conversations'
              and exists (select 1 from public.project_members m where m.project_id = new.project_id and m.user_id = new.user_id))
  then
    raise exception 'Proje bu kullanıcıya ait değil';
  end if;
  return new;
end $$;

-- 4) Paket kartları: Pro, Premium ve Tek Proje’de ortak yazar daveti
update public.plans set features = array_append(features, 'Ortak yazarlarla birlikte yazım'), updated_at = now()
 where id in ('pro', 'premium', 'single') and not ('Ortak yazarlarla birlikte yazım' = any(features));

-- Ücretsiz paket kartı (tüm paketlerde açık yeni özellikler): çeviri/dil denetimi ve kaynağa sor
update public.plans
   set features = array_cat(features[1:array_position(features, '10 atıf stili ve otomatik kaynakça')],
                  array['Atıfları koruyan akademik İngilizce çeviri ve dil denetimi', 'Kaynağa sor: makaleyle sayfa numaralı sohbet'])
                  || features[array_position(features, '10 atıf stili ve otomatik kaynakça') + 1:],
       updated_at = now()
 where id = 'free' and '10 atıf stili ve otomatik kaynakça' = any(features)
   and not ('Kaynağa sor: makaleyle sayfa numaralı sohbet' = any(features));
update public.plans set features = features || array['Atıfları koruyan akademik İngilizce çeviri ve dil denetimi', 'Kaynağa sor: makaleyle sayfa numaralı sohbet'], updated_at = now()
 where id = 'free' and not ('Kaynağa sor: makaleyle sayfa numaralı sohbet' = any(features));

select id, features from public.plans order by sort_order;
