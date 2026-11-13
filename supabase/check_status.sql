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
  case when exists (select 1 from information_schema.tables where table_schema = 'public' and table_name = 'user_devices') then 'YAPILMIŞ' else 'EKSİK' end
union all select '26 Kullanım kanıt kaydı',
  case when exists (select 1 from information_schema.tables where table_schema = 'public' and table_name = 'activity_log') then 'YAPILMIŞ' else 'EKSİK' end
union all select '27 Tek Proje paketi',
  case when exists (select 1 from public.plans where id = 'single') and exists (select 1 from pg_trigger where tgname = 'projects_single_guard_del') then 'YAPILMIŞ' else 'EKSİK' end
union all select '28 Tek Proje maliyet uyarısı (%40)',
  case when exists (select 1 from pg_trigger where tgname = 'usage_single_cost_watch') then 'YAPILMIŞ' else 'EKSİK' end
union all select '29 Davet ödülü: e-posta doğrulaması + geçici e-posta engeli',
  case when exists (select 1 from pg_trigger where tgname = 'on_auth_user_email_confirmed') and to_regclass('public.disposable_email_domains') is not null then 'YAPILMIŞ' else 'EKSİK' end
union all select '30 Ücretsizde PDF, Premium’da öncelikli destek yok',
  case when exists (select 1 from public.plans where id = 'free' and limits->'export_formats' ? 'pdf') and not exists (select 1 from public.plans where 'Öncelikli destek' = any(features)) then 'YAPILMIŞ' else 'EKSİK' end
union all select '31 Tek Proje gözetimi (parmak izi, satın alma, kararlar)',
  case when to_regclass('public.export_fingerprints') is not null and to_regclass('public.plan_purchases') is not null and to_regclass('public.abuse_decisions') is not null then 'YAPILMIŞ' else 'EKSİK' end
union all select '32 Ortak yazım ve otomatik tamamlama',
  case when to_regclass('public.project_members') is not null and to_regclass('public.project_invites') is not null
        and exists (select 1 from pg_enum e join pg_type t on t.oid = e.enumtypid where t.typname = 'usage_kind' and e.enumlabel = 'autocomplete')
       then 'YAPILMIŞ' else 'EKSİK' end
union all select '33 İddia denetimi, PRISMA, gözlem, kurum denetim kaydı',
  case when to_regclass('public.claim_audits') is not null and to_regclass('public.review_records') is not null
        and to_regclass('public.ai_calls') is not null and to_regclass('public.org_audit_log') is not null
       then 'YAPILMIŞ' else 'EKSİK' end
union all select '34 Paket kartlarında iddia denetimi, PRISMA, literatür haritası',
  case when exists (select 1 from public.plans where id = 'free' and 'İddia denetimi ve teslim öncesi kontrol listesi' = any(features))
        and exists (select 1 from public.plans where id in ('basic', 'pro') and 'PRISMA 2020 sistematik derleme' = any(features))
       then 'YAPILMIŞ' else 'EKSİK' end
union all select '35 PRISMA ve literatür haritası Pro paketinde',
  case when exists (select 1 from public.plans where id = 'pro' and 'PRISMA 2020 sistematik derleme' = any(features))
        and not exists (select 1 from public.plans where id = 'basic' and 'PRISMA 2020 sistematik derleme' = any(features))
       then 'YAPILMIŞ' else 'EKSİK' end
union all select '36 PDF bölümleri, derleme oyları, veri çıkarma ve kalite',
  case when exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'source_chunks' and column_name = 'section')
        and exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'review_records' and column_name = 'appraisal')
       then 'YAPILMIŞ' else 'EKSİK' end
union all select '37 Gerçek zamanlı ortak yazım kanalı',
  case when exists (select 1 from pg_proc where proname = 'collab_project_access')
        and exists (select 1 from pg_policies where schemaname = 'realtime' and tablename = 'messages' and policyname = 'academiana_collab_read')
       then 'YAPILMIŞ' else 'EKSİK' end
union all select '38 İndirim kodları ve sayfa hakkı',
  case when exists (select 1 from information_schema.tables where table_schema = 'public' and table_name = 'discount_codes')
        and exists (select 1 from pg_proc where proname = 'usage_words')
       then 'YAPILMIŞ' else 'EKSİK' end
union all select '39 Hukuki belge kabul kayıtları',
  case when exists (select 1 from information_schema.tables where table_schema = 'public' and table_name = 'legal_acceptances')
        and exists (select 1 from pg_trigger where tgname = 'on_auth_user_legal')
       then 'YAPILMIŞ' else 'EKSİK' end
union all select '40 Yıllık ödeme ve Sınırsız Proje paketi',
  case when exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'profiles' and column_name = 'plan_period')
        and exists (select 1 from public.plans where id = 'single' and limits->>'projects' = '5')
       then 'YAPILMIŞ' else 'EKSİK' end
union all select '41 Paket adı: Sınırsız Proje',
  case when exists (select 1 from public.plans where id = 'single' and name = 'Sınırsız Proje') then 'YAPILMIŞ' else 'EKSİK' end;
