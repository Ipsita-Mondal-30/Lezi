-- Core application users table.
-- Supabase Auth identities live in auth.users; this table stores app-level user state.

create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  auth_id uuid not null unique references auth.users (id) on delete cascade,
  email text,
  current_journey text,
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint users_email_unique unique (email),
  constraint users_current_journey_check
    check (current_journey is null or current_journey in ('PLAY', 'CONNECT'))
);

create index if not exists users_auth_id_idx on public.users (auth_id);

create trigger users_set_updated_at
before update on public.users
for each row
execute procedure public.set_updated_at();

alter table public.users enable row level security;
