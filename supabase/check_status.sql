-- Canlı veritabanında hangi güncellemelerin yapıldığını gösterir. HİÇBİR ŞEYİ DEĞİŞTİRMEZ; istediğiniz kadar çalıştırabilirsiniz.
-- Supabase → SQL Editor → + New query → yapıştır → Run. Yeni migration eklenince buraya bir satır ekleyin.
select '05 Kaynak ilkesi (sistem talimatı)' as guncelleme,
  case when exists (select 1 from public.app_settings where key = 'ai.system_prompt' and value->>'text' like '%yer tutucusu koyma%') then 'YAPILMIŞ' else 'EKSİK' end as durum
union all select '06 Literatür matrisi',
  case when exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'sources' and column_name = 'summary') then 'YAPILMIŞ' else 'EKSİK' end
union all select '14 Maliyet tavanı',
  case when exists (select 1 from pg_proc where proname = 'usage_totals' and pg_get_function_result(oid) like '%cost_usd%') then 'YAPILMIŞ' else 'EKSİK' end
union all select '15 Paket bitiş tarihi',
  case when exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'profiles' and column_name = 'plan_expires_at') then 'YAPILMIŞ' else 'EKSİK' end
union all select '16 Üye numarası',
  case when exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'profiles' and column_name = 'member_no') then 'YAPILMIŞ' else 'EKSİK' end
union all select '17 Fiyat artışı',
  case when exists (select 1 from public.plans where id = 'basic' and price_monthly = 749) then 'YAPILMIŞ' else 'EKSİK' end
union all select '18 Sınırsız ekip üyesi',
  case when exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'organizations' and column_name = 'seats' and is_nullable = 'YES') then 'YAPILMIŞ' else 'EKSİK' end
union all select '19 ISNAD atıf stili',
  case when exists (select 1 from pg_enum e join pg_type t on t.oid = e.enumtypid where t.typname = 'citation_style' and e.enumlabel = 'isnad') then 'YAPILMIŞ' else 'EKSİK' end
union all select '20 Çalışma kilidini kaldırma',
  case when exists (select 1 from pg_proc where proname = 'work_locked' and prosrc ilike '%select false%') then 'YAPILMIŞ' else 'EKSİK' end
union all select '21 Ücretsiz araçlar ve ölçüm',
  case when exists (select 1 from information_schema.tables where table_schema = 'public' and table_name = 'analytics_events') then 'YAPILMIŞ' else 'EKSİK' end
union all select '22 Paket vaatleri (sayfa/ay)',
  case when exists (select 1 from public.plans where id = 'pro' and limits ? 'pages_month') then 'YAPILMIŞ' else 'EKSİK' end
union all select '23 Davet ödülü yalnız davet edene, kayıtta',
  case when exists (select 1 from pg_trigger where tgname = 'profiles_referral_reward') then 'YAPILMIŞ' else 'EKSİK' end
union all select '24 Bildirim kutusu',
  case when exists (select 1 from information_schema.tables where table_schema = 'public' and table_name = 'notifications') then 'YAPILMIŞ' else 'EKSİK' end
union all select '25 Davet: aynı cihaz önlemi',
  case when exists (select 1 from information_schema.tables where table_schema = 'public' and table_name = 'user_devices') then 'YAPILMIŞ' else 'EKSİK' end;
