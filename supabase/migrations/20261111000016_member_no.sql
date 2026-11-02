-- Üye numarası (D56): her kullanıcıya kısa, değiştirilemez bir numara (AC001001 biçiminde gösterilir).
-- Mevcut kullanıcılara da otomatik atanır; GENERATED ALWAYS olduğu için kimse elle değiştiremez.
alter table public.profiles add column if not exists member_no bigint generated always as identity (start with 1001);
create unique index if not exists profiles_member_no on public.profiles (member_no);

select member_no, email from public.profiles order by member_no limit 5;
