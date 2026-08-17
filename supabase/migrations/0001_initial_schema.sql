create extension if not exists "pgcrypto";

create type public.user_role as enum ('tutor', 'student');
create type public.lesson_status as enum ('confirmed', 'completed', 'cancelled');
create type public.payment_status as enum ('pending', 'paid', 'refunded', 'failed');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role public.user_role not null,
  display_name text not null,
  timezone text not null default 'UTC',
  created_at timestamptz not null default now()
);

create table public.tutor_accounts (
  id uuid primary key default gen_random_uuid(),
  owner_profile_id uuid not null unique references public.profiles(id) on delete cascade,
  business_name text not null,
  booking_slug text not null unique,
  currency text not null default 'USD',
  created_at timestamptz not null default now()
);

create table public.students (
  id uuid primary key default gen_random_uuid(),
  tutor_account_id uuid not null references public.tutor_accounts(id) on delete cascade,
  profile_id uuid references public.profiles(id) on delete set null,
  name text not null,
  email text not null,
  timezone text not null default 'UTC',
  language text,
  level text,
  goals text,
  private_notes text,
  created_at timestamptz not null default now(),
  unique (tutor_account_id, email)
);

create table public.lesson_types (
  id uuid primary key default gen_random_uuid(),
  tutor_account_id uuid not null references public.tutor_accounts(id) on delete cascade,
  name text not null,
  duration_minutes integer not null check (duration_minutes > 0),
  price_cents integer not null default 0 check (price_cents >= 0),
  active boolean not null default true
);

create table public.lessons (
  id uuid primary key default gen_random_uuid(),
  tutor_account_id uuid not null references public.tutor_accounts(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  lesson_type_id uuid references public.lesson_types(id) on delete set null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status public.lesson_status not null default 'confirmed',
  topic text,
  meeting_url text,
  tutor_notes text,
  student_summary text,
  created_at timestamptz not null default now(),
  check (ends_at > starts_at)
);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  tutor_account_id uuid not null references public.tutor_accounts(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  lesson_id uuid references public.lessons(id) on delete set null,
  amount_cents integer not null check (amount_cents >= 0),
  currency text not null default 'USD',
  status public.payment_status not null default 'pending',
  payment_method text,
  external_reference text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.tutor_accounts enable row level security;
alter table public.students enable row level security;
alter table public.lesson_types enable row level security;
alter table public.lessons enable row level security;
alter table public.payments enable row level security;

create policy "profiles_read_self" on public.profiles for select using (id = auth.uid());
create policy "profiles_update_self" on public.profiles for update using (id = auth.uid());
create policy "tutor_accounts_owner_all" on public.tutor_accounts for all using (owner_profile_id = auth.uid()) with check (owner_profile_id = auth.uid());

create or replace function public.owns_tutor_account(account_id uuid)
returns boolean language sql stable security definer set search_path = public
as $$ select exists(select 1 from public.tutor_accounts where id = account_id and owner_profile_id = auth.uid()) $$;

create policy "students_tutor_all" on public.students for all using (public.owns_tutor_account(tutor_account_id)) with check (public.owns_tutor_account(tutor_account_id));
create policy "lesson_types_tutor_all" on public.lesson_types for all using (public.owns_tutor_account(tutor_account_id)) with check (public.owns_tutor_account(tutor_account_id));
create policy "lessons_tutor_all" on public.lessons for all using (public.owns_tutor_account(tutor_account_id)) with check (public.owns_tutor_account(tutor_account_id));
create policy "payments_tutor_all" on public.payments for all using (public.owns_tutor_account(tutor_account_id)) with check (public.owns_tutor_account(tutor_account_id));
