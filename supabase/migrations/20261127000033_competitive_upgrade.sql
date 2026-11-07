-- D118–D125: Rakip analizi sonrası iyileştirmeler. Tekrar çalıştırmak güvenlidir.

-- 1) Paket kartı tutarlılığı (D118): eski sayısal tarama ifadeleri kalmışsa adil kullanım ifadesine çevrilir;
--    Tek Proje’de “sınırsız” ifadeleri adil kullanım ve tek çalışma koşuluyla netleştirilir.
update public.plans
   set features = array_replace(array_replace(features, 'Aylık 2.000 kaynak taraması', 'Sınırsız kaynak taraması (adil kullanım)'),
                                'Aylık 8.000 kaynak taraması', 'Sınırsız kaynak taraması (adil kullanım)'),
       updated_at = now()
 where features && array['Aylık 2.000 kaynak taraması', 'Aylık 8.000 kaynak taraması'];

update public.plans
   set features = array_replace(array_replace(features,
                    'Sınırsız yapay zekâ kullanımı ve sınırsız sayfa', 'Sınırsız yapay zekâ kullanımı ve sayfa (yalnızca bu çalışmada, adil kullanım)'),
                    'Sınırsız kaynak taraması', 'Sınırsız kaynak taraması (adil kullanım)'),
       description = 'Tek bir çalışma için tek ödeme: süresiz erişim, adil kullanımla sınırsız yapay zekâ.',
       updated_at = now()
 where id = 'single';

-- 2) Kaynak destekli iddia denetimi (D119): bölüm başına denetim sonuçları. Değişmeyen cümle + kaynak çifti bir sonraki
--    denetimde yeniden yapay zekâya gönderilmez. Kayıt çalışma sahibinindir; ortak yazarlar sunucu üzerinden görür.
create table if not exists public.claim_audits (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  stage_id uuid not null references public.project_stages(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  actor_id uuid references public.profiles(id) on delete set null,
  scope text not null default 'stage',
  summary jsonb not null default '{}'::jsonb,
  results jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists claim_audits_stage_idx on public.claim_audits (stage_id, created_at desc);
alter table public.claim_audits enable row level security;
drop policy if exists claim_audits_owner on public.claim_audits;
create policy claim_audits_owner on public.claim_audits for select using (user_id = auth.uid());
drop trigger if exists claim_audits_owner_guard on public.claim_audits;
create trigger claim_audits_owner_guard before insert or update on public.claim_audits for each row execute function public.assert_project_owner();

-- 3) Sistematik derleme / PRISMA 2020 (D122): taranan kayıtlar ve eleme kararları. Protokol projects.context.review’da.
create table if not exists public.review_records (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  key text not null check (char_length(key) <= 600),
  origin text not null default 'manual' check (char_length(origin) between 1 and 60),
  stage text not null default 'identified' check (stage in ('identified','duplicate','excluded_screening','sought','not_retrieved','excluded_eligibility','included')),
  reason text check (char_length(reason) <= 300),
  record jsonb not null,
  ai jsonb,
  source_id uuid references public.sources(id) on delete set null,
  decided_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists review_records_project_idx on public.review_records (project_id, stage);
alter table public.review_records enable row level security;
drop policy if exists review_records_owner on public.review_records;
create policy review_records_owner on public.review_records for select using (user_id = auth.uid());
drop trigger if exists review_records_owner_guard on public.review_records;
create trigger review_records_owner_guard before insert or update on public.review_records for each row execute function public.assert_project_owner();

-- 4) Gözlemlenebilirlik (D125): yapay zekâ çağrılarının süresi, hata ve token bilgisi (metin içermez). Yalnızca sunucu yazar/okur.
create table if not exists public.ai_calls (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  model text not null check (char_length(model) <= 120),
  ms integer not null,
  ttft_ms integer,
  ok boolean not null,
  error text check (char_length(error) <= 120),
  stop_reason text check (char_length(stop_reason) <= 40),
  input_tokens integer not null default 0,
  output_tokens integer not null default 0
);
create index if not exists ai_calls_created_idx on public.ai_calls (created_at desc);
alter table public.ai_calls enable row level security;

-- 5) Kurumsal yönetim (D125): kurum denetim kaydı (katılma, ayrılma, çıkarma, rol değişikliği). Yalnızca sunucu yazar;
--    kurum yöneticisi kendi kurumunun kaydını sunucu üzerinden görür.
create table if not exists public.org_audit_log (
  id bigint generated always as identity primary key,
  org_id uuid not null references public.organizations(id) on delete cascade,
  actor_id uuid references public.profiles(id) on delete set null,
  target_user uuid references public.profiles(id) on delete set null,
  action text not null check (char_length(action) <= 40),
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists org_audit_log_org_idx on public.org_audit_log (org_id, created_at desc);
alter table public.org_audit_log enable row level security;
