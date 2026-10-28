-- ============================================================
-- 근무복 신청(uniform_requests) / 휴양지 신청(resort_reservations)
-- Supabase SQL Editor에서 1회 실행하세요.
-- ============================================================

create table if not exists uniform_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  emp_id text,
  emp_name text,
  dept_name text,
  phone text,
  summer_top text,
  summer_bottom text,
  summer_color text,
  summer_qty int,
  winter_outer_type text,
  winter_outer_size text,
  winter_pants_size text,
  winter_inner_type text,
  winter_inner_size text,
  extra_gyeopjeompeo int default 0,
  extra_hotjeompeo int default 0,
  extra_pants int default 0,
  extra_tshirt int default 0,
  extra_vest int default 0,
  remark text,
  status text default '접수완료',
  created_at timestamptz default now()
);

alter table uniform_requests enable row level security;

create policy "본인 신청만 읽기" on uniform_requests
  for select using (auth.uid() = user_id);

create policy "본인 신청 생성" on uniform_requests
  for insert with check (auth.uid() = user_id);


create table if not exists resort_reservations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  emp_id text,
  emp_name text,
  dept_name text,
  phone text,
  resort_name text,
  checkin_date date,
  checkout_date date,
  guest_label text,
  adult_count int,
  child_count int,
  companions jsonb,
  request_note text,
  status text default '검토중',
  created_at timestamptz default now()
);

alter table resort_reservations enable row level security;

create policy "본인 예약만 읽기" on resort_reservations
  for select using (auth.uid() = user_id);

create policy "본인 예약 생성" on resort_reservations
  for insert with check (auth.uid() = user_id);

create policy "본인 예약 취소(상태변경)" on resort_reservations
  for update using (auth.uid() = user_id);
