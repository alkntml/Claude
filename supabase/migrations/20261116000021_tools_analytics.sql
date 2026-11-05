-- Ücretsiz araçlar ve ölçüm (D90).
-- tool_usage: ücretsiz araçların kullanımı ve (varsa) yapay zekâ maliyeti; giriş yapmamış ziyaretçiler de kullanır.
-- analytics_events: kişisel veri içermeyen ziyaret kaydı. IP ve tarayıcı bilgisi SAKLANMAZ; yalnızca her gün değişen,
-- geri çözülemeyen bir ziyaretçi karması tutulur (aynı kişi ertesi gün farklı görünür). Çerez kullanılmaz.
-- Her iki tabloya yalnızca sunucu (service role) yazar ve okur; kullanıcıların erişimi yoktur.
create table if not exists public.tool_usage (
  id bigint generated always as identity primary key,
  tool text not null check (char_length(tool) between 1 and 40),
  user_id uuid references public.profiles(id) on delete set null,
  visitor text check (char_length(visitor) <= 64),
  items int not null default 1,
  tokens_in int not null default 0,
  tokens_out int not null default 0,
  cost_usd numeric(12,6) not null default 0,
  model text,
  created_at timestamptz not null default now()
);
create index if not exists tool_usage_created_idx on public.tool_usage (created_at);
create index if not exists tool_usage_visitor_idx on public.tool_usage (visitor, created_at);
alter table public.tool_usage enable row level security;

create table if not exists public.analytics_events (
  id bigint generated always as identity primary key,
  kind text not null check (kind in ('pageview', 'tool')),
  path text not null default '' check (char_length(path) <= 300),
  referrer text check (char_length(referrer) <= 200),
  utm_source text check (char_length(utm_source) <= 100),
  utm_medium text check (char_length(utm_medium) <= 100),
  utm_campaign text check (char_length(utm_campaign) <= 100),
  visitor text check (char_length(visitor) <= 64),
  device text check (device in ('mobile', 'tablet', 'desktop')),
  locale text check (char_length(locale) <= 5),
  created_at timestamptz not null default now()
);
create index if not exists analytics_events_created_idx on public.analytics_events (created_at);
alter table public.analytics_events enable row level security;
