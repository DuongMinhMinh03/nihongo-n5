-- =============================================================================
--  Schema cho ứng dụng Nihongo N5 (Supabase / PostgreSQL)
--
--  Cách dùng:
--    1. Tạo project tại https://supabase.com/dashboard (Free tier — 0đ)
--    2. Mở SQL Editor → dán toàn bộ file này → bấm Run
--    3. Copy URL + anon key vào file .env.local của ứng dụng
--
--  Sau khi tạo tài khoản admin đầu tiên, chạy lệnh cuối cùng trong file
--  README.md để cấp quyền admin.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Bảng profile + phân quyền
-- -----------------------------------------------------------------------------
create table if not exists public.profiles (
  id          uuid primary key references auth.users on delete cascade,
  email       text not null,
  full_name   text,
  role        text not null default 'user' check (role in ('user', 'admin')),
  created_at  timestamptz not null default now()
);

comment on table public.profiles is 'Thông tin người dùng + phân quyền (user | admin)';

-- Tự động tạo profile khi có user đăng ký mới
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data ->> 'full_name')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- -----------------------------------------------------------------------------
-- 2. Bảng nội dung (bản DRAFT do admin sửa trong dashboard)
--
--    kind + item_id = khoá duy nhất (vd: 'vocab' + 'n5-v001')
--    payload       = toàn bộ object nội dung ở dạng jsonb
--    deleted       = đánh dấu đã xoá (giữ lịch sử, không mất hoàn toàn)
-- -----------------------------------------------------------------------------
create table if not exists public.content_items (
  id          uuid primary key default gen_random_uuid(),
  kind        text not null check (kind in ('vocab', 'grammar', 'kanji')),
  item_id     text not null,
  payload     jsonb not null,
  deleted     boolean not null default false,
  updated_by  uuid references public.profiles (id) on delete set null,
  updated_at  timestamptz not null default now(),
  unique (kind, item_id)
);

create index if not exists content_items_kind_idx on public.content_items (kind);

comment on table public.content_items is
  'Nội dung do admin chỉnh sửa — ghi đè lên base JSON trong content/*.json khi app tải.';

-- Tự điền updated_by = người đang đăng nhập khi admin lưu nội dung
create or replace function public.set_content_updated_by()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.updated_by := auth.uid();
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists on_content_items_updated_by on public.content_items;
create trigger on_content_items_updated_by
  before insert or update on public.content_items
  for each row execute function public.set_content_updated_by();

-- -----------------------------------------------------------------------------
-- 3. Bảng tiến độ học (đồng bộ giữa nhiều thiết bị)
-- -----------------------------------------------------------------------------
create table if not exists public.user_progress (
  user_id     uuid primary key references auth.users on delete cascade,
  cards       jsonb not null default '{}'::jsonb,
  log         jsonb not null default '[]'::jsonb,
  study_days  text[] not null default '{}',
  updated_at  timestamptz not null default now()
);

comment on table public.user_progress is
  'Tiến độ SRS của từng user, đồng bộ qua nhiều thiết bị.';

-- -----------------------------------------------------------------------------
-- 4. Row Level Security — bảo mật tầng database
--
--    Quan trọng: quyền phải được kiểm tra ở DB, không chỉ ẩn nút trong UI.
-- -----------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.content_items enable row level security;
alter table public.user_progress enable row level security;

-- profiles: ai cũng đọc được, nhưng chỉ sửa được hàng của chính mình
drop policy if exists "profiles_select" on public.profiles;
create policy "profiles_select" on public.profiles
  for select using (true);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id)
  with check (auth.uid() = id);

-- Admin được sửa role của bất kỳ ai (trigger bên dưới vẫn chặn user tự nâng quyền)
drop policy if exists "profiles_admin_update" on public.profiles;
create policy "profiles_admin_update" on public.profiles
  for update using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  )
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );
-- content_items: ai cũng đọc được, chỉ admin mới sửa/xoá
drop policy if exists "content_items_select" on public.content_items;
create policy "content_items_select" on public.content_items
  for select using (true);

drop policy if exists "content_items_admin_write" on public.content_items;
create policy "content_items_admin_write" on public.content_items
  for all
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  )
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- user_progress: chỉ chính chủ đọc/ghi
drop policy if exists "user_progress_own" on public.user_progress;
create policy "user_progress_own" on public.user_progress
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- 5. Helper: hàm kiểm tra admin (tiện cho client gọi RPC)
-- -----------------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  );
$$;

grant execute on function public.is_admin() to authenticated;

-- -----------------------------------------------------------------------------
-- 5b. Chặn tự nâng quyền (privilege escalation)
--
--      Policy "profiles_update_own" cho phép user sửa hàng của chính mình, nhưng
--      nếu không chặn `role` thì user thường có thể tự set role = 'admin'.
--      Trigger này chỉ cho phép đổi role khi người thực hiện đã là admin.
-- -----------------------------------------------------------------------------
create or replace function public.guard_profile_role()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role is distinct from old.role then
    if not exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    ) then
      raise exception 'Không có quyền thay đổi role. Chỉ admin được phép.';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists on_profile_role_guard on public.profiles;
create trigger on_profile_role_guard
  before update on public.profiles
  for each row execute function public.guard_profile_role();

-- -----------------------------------------------------------------------------
-- 5c. Xoá tài khoản (chỉ admin)
--
--      Client không thể dùng supabase.auth.admin.* vì cần service_role key.
--      Hàm này chạy trong DB nên admin gọi được qua .rpc('delete_user', ...).
-- -----------------------------------------------------------------------------
create or replace function public.delete_user(target_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  ) then
    raise exception 'Chỉ admin được phép xoá người dùng.';
  end if;

  if target_id = auth.uid() then
    raise exception 'Không thể tự xoá tài khoản của chính mình.';
  end if;

  delete from auth.users where id = target_id;
  return true;
end;
$$;

grant execute on function public.delete_user(uuid) to authenticated;

-- -----------------------------------------------------------------------------
-- 6. Cấp quyền cho các role của Supabase
-- -----------------------------------------------------------------------------
grant usage on schema public to anon, authenticated;
grant select on public.profiles to anon, authenticated;
grant select on public.content_items to anon, authenticated;
grant select, insert, update on public.user_progress to authenticated;
grant insert, update, delete on public.content_items to authenticated;
grant update on public.profiles to authenticated;
