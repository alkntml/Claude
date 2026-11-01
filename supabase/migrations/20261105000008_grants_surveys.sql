-- 8) Proje önerisi çalışma türü ve anket oluşturucu

-- TÜBİTAK / BAP proje önerisi
alter type public.work_type add value if not exists 'grant_proposal';

-- Anketler: sahibi yönetir; herkese açık form token ile yalnızca sunucuda (service role) çözülür.
create table if not exists public.surveys (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  project_id uuid references public.projects(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 300),
  description text not null default '' check (char_length(description) <= 5000),
  consent text not null default '' check (char_length(consent) <= 8000),
  questions jsonb not null default '[]'::jsonb check (jsonb_typeof(questions) = 'array'),
  token text not null unique default (replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', '')) check (char_length(token) >= 24),
  is_open boolean not null default false,
  max_responses int check (max_responses is null or max_responses between 1 and 100000),
  closes_at timestamptz,
  response_count int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists surveys_user_idx on public.surveys(user_id);
create index if not exists surveys_project_idx on public.surveys(project_id);

alter table public.surveys enable row level security;
create policy surveys_owner_select on public.surveys for select using (user_id = auth.uid());
create policy surveys_owner_insert on public.surveys for insert with check (user_id = auth.uid());
create policy surveys_owner_update on public.surveys for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy surveys_owner_delete on public.surveys for delete using (user_id = auth.uid());
create trigger surveys_owner_guard before insert or update on public.surveys
  for each row execute function public.assert_project_owner();

-- Cevap sayacını kullanıcı değiştiremez (yalnızca sunucu)
create or replace function public.protect_survey_counter()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is not null and auth.role() <> 'service_role' and new.response_count is distinct from old.response_count then
    new.response_count := old.response_count;
  end if;
  new.updated_at := now();
  return new;
end $$;
create trigger surveys_protect_counter before update on public.surveys
  for each row execute function public.protect_survey_counter();

-- Cevaplar: katılımcı kimliği tutulmaz (IP, e-posta yok). Yalnızca sunucu yazar; sahibi okur ve siler.
create table if not exists public.survey_responses (
  id uuid primary key default gen_random_uuid(),
  survey_id uuid not null references public.surveys(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  answers jsonb not null check (jsonb_typeof(answers) = 'object'),
  duration_seconds int,
  created_at timestamptz not null default now()
);
create index if not exists survey_responses_survey_idx on public.survey_responses(survey_id, created_at);

alter table public.survey_responses enable row level security;
create policy survey_responses_owner_select on public.survey_responses for select using (user_id = auth.uid());
create policy survey_responses_owner_delete on public.survey_responses for delete using (user_id = auth.uid());
