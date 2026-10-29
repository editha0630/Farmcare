-- 감 수확 체험 예약 웹: Supabase 데이터베이스 설정
-- Supabase 대시보드 → SQL Editor → New query 에 이 파일 전체를 붙여넣고 Run 을 누른다.
-- 여러 번 실행해도 안전하다 (이미 있는 것은 건너뛰거나 덮어쓴다).
-- 근거: docs/specs/정상섭.md 5장(예약 규칙), 10장(개발 메모)

create extension if not exists pgcrypto;

-- ─────────────────────────────────────────────
-- 1. 테이블
-- ─────────────────────────────────────────────

-- 회차 4개. 정원은 회차당 5팀.
create table if not exists public.slots (
  id         text primary key,
  label      text not null,
  starts_at  timestamptz not null,
  capacity   int  not null default 5 check (capacity > 0)
);

insert into public.slots (id, label, starts_at, capacity) values
  ('1114-10', '11/14(토) 오전 10:00', '2026-11-14 10:00+09', 5),
  ('1114-14', '11/14(토) 오후 2:00',  '2026-11-14 14:00+09', 5),
  ('1115-10', '11/15(일) 오전 10:00', '2026-11-15 10:00+09', 5),
  ('1115-14', '11/15(일) 오후 2:00',  '2026-11-15 14:00+09', 5)
on conflict (id) do nothing;

-- 예약. 상태는 pending(입금 대기) / confirmed(예약 확정) / cancelled(취소).
create table if not exists public.bookings (
  id                uuid primary key default gen_random_uuid(),
  created_at        timestamptz not null default now(),
  slot_id           text not null references public.slots (id),
  name              text not null check (char_length(name) between 1 and 30),
  phone             text not null check (phone ~ '^01[0-9]{8,9}$'),  -- 숫자만 저장
  adults            int  not null check (adults >= 1),                -- 보호자 1명 이상
  children          int  not null check (children >= 0),
  infants           int  not null default 0 check (infants between 0 and 4),  -- 만 3세 미만, 인원 합계에서 제외
  depositor         text not null check (char_length(depositor) between 1 and 30),
  heard_from        text not null check (heard_from in ('지인 소개', 'SNS', '지역 커뮤니티', '기타')),
  privacy_agreed    boolean not null check (privacy_agreed),
  status            text not null default 'pending' check (status in ('pending', 'confirmed', 'cancelled')),
  status_changed_at timestamptz,
  check (adults + children <= 4)
);

create index if not exists bookings_slot_active_idx  on public.bookings (slot_id) where status <> 'cancelled';
create index if not exists bookings_phone_active_idx on public.bookings (phone)   where status <> 'cancelled';

-- 운영자 명단. 여기에 이메일이 있는 로그인 사용자만 명단을 보고 상태를 바꿀 수 있다.
create table if not exists public.operators (
  email text primary key
);

-- ─────────────────────────────────────────────
-- 2. 권한 (RLS: 누가 어떤 줄을 보고 쓸 수 있는지)
-- ─────────────────────────────────────────────

alter table public.slots     enable row level security;
alter table public.bookings  enable row level security;
alter table public.operators enable row level security;

-- 고객은 테이블을 직접 읽거나 쓰지 못한다. 예약은 아래 create_booking 함수로만 넣는다.
revoke all on public.bookings  from anon;
revoke all on public.operators from anon;
revoke all on public.slots     from anon;

create or replace function public.is_operator()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.operators
    where lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

drop policy if exists "operators read bookings" on public.bookings;
create policy "operators read bookings" on public.bookings
  for select to authenticated
  using (public.is_operator());

drop policy if exists "operators read slots" on public.slots;
create policy "operators read slots" on public.slots
  for select to authenticated
  using (public.is_operator());

-- ─────────────────────────────────────────────
-- 3. 고객용 함수
-- ─────────────────────────────────────────────

-- 회차별 남은 자리. 고객 화면에는 이 숫자만 보인다.
create or replace function public.get_availability()
returns table (id text, label text, starts_at timestamptz, capacity int, remaining int)
language sql
stable
security definer
set search_path = public
as $$
  select s.id, s.label, s.starts_at, s.capacity,
         greatest(s.capacity - count(b.id)::int, 0) as remaining
  from public.slots s
  left join public.bookings b on b.slot_id = s.id and b.status <> 'cancelled'
  group by s.id
  order by s.starts_at;
$$;

-- 예약 신청. 신청 마감, 같은 번호 2건 제한, 정원 확인, 저장을 한 번에 처리한다.
-- 두 사람이 동시에 마지막 자리를 신청해도 잠금(lock) 때문에 한 명만 성공한다.
create or replace function public.create_booking(
  p_slot_id        text,
  p_name           text,
  p_phone          text,
  p_adults         int,
  p_children       int,
  p_infants        int,
  p_depositor      text,
  p_heard_from     text,
  p_privacy_agreed boolean
)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  closes_at constant timestamptz := '2026-11-11 23:59:59+09';  -- 신청 마감 (한국 시간)
  v_phone   text := regexp_replace(coalesce(p_phone, ''), '[^0-9]', '', 'g');
  v_slot    public.slots%rowtype;
  v_taken   int;
  v_active  int;
  v_booking public.bookings%rowtype;
begin
  if now() > closes_at then
    return json_build_object('ok', false, 'code', 'closed');
  end if;

  if v_phone !~ '^01[0-9]{8,9}$' then
    return json_build_object('ok', false, 'code', 'invalid_phone');
  end if;

  -- 같은 번호의 신청을 한 줄로 세운다 → 동시에 3건을 넣어도 2건까지만 통과
  perform pg_advisory_xact_lock(hashtext('phone:' || v_phone));

  -- 이 회차를 잠근다 → 동시에 마지막 자리를 신청해도 한 명만 통과
  select * into v_slot from public.slots where id = p_slot_id for update;
  if not found then
    return json_build_object('ok', false, 'code', 'bad_slot');
  end if;

  select count(*) into v_active
  from public.bookings where phone = v_phone and status <> 'cancelled';
  if v_active >= 2 then
    return json_build_object('ok', false, 'code', 'phone_limit');
  end if;

  select count(*) into v_taken
  from public.bookings where slot_id = p_slot_id and status <> 'cancelled';
  if v_taken >= v_slot.capacity then
    return json_build_object('ok', false, 'code', 'full');
  end if;

  insert into public.bookings
    (slot_id, name, phone, adults, children, infants, depositor, heard_from, privacy_agreed)
  values
    (p_slot_id, trim(p_name), v_phone, p_adults, p_children, coalesce(p_infants, 0),
     trim(p_depositor), p_heard_from, coalesce(p_privacy_agreed, false))
  returning * into v_booking;

  return json_build_object(
    'ok',         true,
    'id',         v_booking.id,
    'slot_label', v_slot.label,
    'created_at', v_booking.created_at,
    'deadline',   v_booking.created_at + interval '24 hours'
  );
exception
  when check_violation or not_null_violation then
    return json_build_object('ok', false, 'code', 'invalid');
end;
$$;

-- ─────────────────────────────────────────────
-- 4. 운영자용 함수
-- ─────────────────────────────────────────────

-- 상태 변경. 취소된 예약을 다시 살릴 때도 정원과 같은 번호 2건 제한을 지킨다.
create or replace function public.set_booking_status(p_id uuid, p_status text)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_booking public.bookings%rowtype;
  v_slot    public.slots%rowtype;
  v_taken   int;
  v_active  int;
begin
  if not public.is_operator() then
    return json_build_object('ok', false, 'code', 'forbidden');
  end if;

  if p_status not in ('pending', 'confirmed', 'cancelled') then
    return json_build_object('ok', false, 'code', 'invalid');
  end if;

  select * into v_booking from public.bookings where id = p_id;
  if not found then
    return json_build_object('ok', false, 'code', 'not_found');
  end if;

  if v_booking.status = 'cancelled' and p_status <> 'cancelled' then
    perform pg_advisory_xact_lock(hashtext('phone:' || v_booking.phone));
    select * into v_slot from public.slots where id = v_booking.slot_id for update;

    select count(*) into v_active
    from public.bookings where phone = v_booking.phone and status <> 'cancelled';
    if v_active >= 2 then
      return json_build_object('ok', false, 'code', 'phone_limit');
    end if;

    select count(*) into v_taken
    from public.bookings where slot_id = v_booking.slot_id and status <> 'cancelled';
    if v_taken >= v_slot.capacity then
      return json_build_object('ok', false, 'code', 'full');
    end if;
  end if;

  update public.bookings
  set status = p_status, status_changed_at = now()
  where id = p_id;

  return json_build_object('ok', true);
end;
$$;

-- ─────────────────────────────────────────────
-- 5. 함수 실행 권한
-- ─────────────────────────────────────────────

revoke all on function public.get_availability()   from public;
revoke all on function public.create_booking(text, text, text, int, int, int, text, text, boolean) from public;
revoke all on function public.set_booking_status(uuid, text) from public;
revoke all on function public.is_operator()        from public;
-- Supabase는 새 함수에 anon 실행 권한을 자동으로 주므로, 운영자용 함수는 anon에게서 따로 뺀다.
revoke all on function public.set_booking_status(uuid, text) from anon;
revoke all on function public.is_operator()        from anon;

grant execute on function public.get_availability() to anon, authenticated;
grant execute on function public.create_booking(text, text, text, int, int, int, text, text, boolean) to anon, authenticated;
grant execute on function public.set_booking_status(uuid, text) to authenticated;
grant execute on function public.is_operator()      to authenticated;

-- ─────────────────────────────────────────────
-- 6. 운영자 이메일 등록 (아래 이메일을 실제 운영자 이메일로 바꾼 뒤 실행)
-- ─────────────────────────────────────────────
-- insert into public.operators (email) values
--   ('operator1@example.com'),
--   ('operator2@example.com'),
--   ('operator3@example.com')
-- on conflict do nothing;
