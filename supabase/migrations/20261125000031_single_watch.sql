-- Tek Proje gözetimi ve yönetim kararları (D109). Tekrar çalıştırmak güvenlidir.
--  1) export_fingerprints: tam indirmelerin parmak izi (metnin kendisi saklanmaz; 64 sayılık MinHash imzası + kelime sayısı +
--     kapak bilgisi). Ardışık indirmeler karşılaştırılır: içerik değişimi ve yazar/üniversite/danışman değişimi uyarısı.
--  2) plan_purchases: paket tanımlanırken ödeyen kişinin adı, telefonu, tutar ve not (ödeme WhatsApp üzerinden alındığı için).
--  3) abuse_decisions: yönetici her kötüye kullanım uyarısı için karar verir (sorun yok / kullanıcıyı uyar / askıya al).
-- Tablolara yalnızca sunucu (service role) erişir; kullanıcılar göremez.

create table if not exists public.export_fingerprints (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  project_id uuid not null,
  words int not null default 0,
  sig int[] not null check (cardinality(sig) = 64),
  author text not null default '',
  university text not null default '',
  department text not null default '',
  advisor text not null default '',
  created_at timestamptz not null default now()
);
create index if not exists export_fingerprints_idx on public.export_fingerprints (user_id, project_id, created_at desc);
alter table public.export_fingerprints enable row level security;

create table if not exists public.plan_purchases (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  plan_id text not null,
  payer_name text not null default '' check (char_length(payer_name) <= 200),
  payer_phone text not null default '' check (char_length(payer_phone) <= 40),
  amount_try numeric check (amount_try is null or amount_try >= 0),
  note text not null default '' check (char_length(note) <= 1000),
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);
create index if not exists plan_purchases_user_idx on public.plan_purchases (user_id, created_at desc);
alter table public.plan_purchases enable row level security;

create table if not exists public.abuse_decisions (
  alert_id bigint primary key references public.activity_log(id) on delete cascade,
  decision text not null check (decision in ('ok', 'warn', 'suspend')),
  note text not null default '' check (char_length(note) <= 2000),
  decided_by uuid references public.profiles(id) on delete set null,
  decided_at timestamptz not null default now()
);
alter table public.abuse_decisions enable row level security;

select
  to_regclass('public.export_fingerprints') is not null as parmak_izi,
  to_regclass('public.plan_purchases') is not null as satin_alma,
  to_regclass('public.abuse_decisions') is not null as kararlar;
