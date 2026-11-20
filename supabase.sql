-- Run in the Supabase SQL editor. Create the couple's login under Authentication > Users.
create extension if not exists pgcrypto with schema extensions;
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create table if not exists public.reservations(
  id uuid primary key default gen_random_uuid(), code text unique not null,
  name text not null, phone text not null, email text,
  seats int not null check (seats between 1 and 6),
  traditional bool not null default false, court bool not null default false,
  note text, created_at timestamptz default now());
alter table public.reservations enable row level security;
drop policy if exists "couple read" on public.reservations;
drop policy if exists "couple delete" on public.reservations;
create policy "couple read" on public.reservations for select to authenticated using (true);
create policy "couple delete" on public.reservations for delete to authenticated using (true);

create table if not exists private.event_access_config(
  id smallint primary key check (id = 1),
  password_hash text not null);
create table if not exists private.event_access_sessions(
  token_hash text primary key,
  guest_name text not null,
  expires_at timestamptz not null);
revoke all on all tables in schema private from public, anon, authenticated;

create or replace function public.seat_counts()
returns json language sql security definer set search_path = '' as $$
  select pg_catalog.json_build_object(
    'traditional', coalesce(sum(seats) filter (where traditional),0),
    'court', coalesce(sum(seats) filter (where court),0))
  from public.reservations
$$;

create or replace function public.verify_event_access(p_name text, p_password text)
returns text language plpgsql security definer set search_path = '' as $$
declare
  v_password_hash text;
  v_token text;
begin
  if nullif(pg_catalog.btrim(p_name), '') is null or nullif(p_password, '') is null then
    raise exception 'Enter your name and invitation password.';
  end if;

  select password_hash into v_password_hash
  from private.event_access_config where id = 1;
  if v_password_hash is null then
    raise exception 'Invitation access has not been configured. Please contact the couple.';
  end if;
  if extensions.crypt(p_password, v_password_hash) is distinct from v_password_hash then
    raise exception 'Incorrect name or invitation password.';
  end if;

  v_token := pg_catalog.encode(extensions.gen_random_bytes(32), 'hex');
  delete from private.event_access_sessions where expires_at <= pg_catalog.now();
  insert into private.event_access_sessions(token_hash, guest_name, expires_at)
  values (
    pg_catalog.encode(extensions.digest(v_token, 'sha256'), 'hex'),
    pg_catalog.btrim(p_name),
    pg_catalog.now() + interval '2 hours'
  );
  return v_token;
end
$$;

drop function if exists public.reserve_seats(text,text,text,int,bool,bool,text);
create or replace function public.reserve_seats(
  p_name text, p_phone text, p_email text, p_seats int,
  p_trad bool, p_court bool, p_note text, p_access_token text
)
returns text language plpgsql security definer set search_path = '' as $$
declare
  c json;
  v text;
  cap int := 300;
  v_token_hash text;
  v_guest_name text;
begin
  v_token_hash := pg_catalog.encode(extensions.digest(p_access_token, 'sha256'), 'hex');
  perform pg_catalog.pg_advisory_xact_lock(2027);

  select guest_name into v_guest_name
  from private.event_access_sessions
  where token_hash = v_token_hash and expires_at > pg_catalog.now()
  for update;
  if not found then
    raise exception 'Your invitation access has expired. Please enter the event password again.';
  end if;
  if pg_catalog.btrim(p_name) is distinct from v_guest_name then
    raise exception 'Please use the name you entered on the invitation page.';
  end if;

  c := public.seat_counts();
  if p_trad and (c->>'traditional')::int + p_seats > cap then
    raise exception 'Not enough seats left for the Traditional Engagement';
  end if;
  if p_court and (c->>'court')::int + p_seats > cap then
    raise exception 'Not enough seats left for the Court Wedding';
  end if;

  v := 'SL-' || upper(substr(md5(random()::text),1,5));
  insert into public.reservations(code,name,phone,email,seats,traditional,court,note)
  values (v,v_guest_name,p_phone,p_email,p_seats,p_trad,p_court,p_note);
  delete from private.event_access_sessions where token_hash = v_token_hash;
  return v;
end
$$;

revoke all on function public.seat_counts() from public;
revoke all on function public.verify_event_access(text,text) from public;
revoke all on function public.reserve_seats(text,text,text,int,bool,bool,text,text) from public;
grant execute on function public.seat_counts(), public.verify_event_access(text,text),
  public.reserve_seats(text,text,text,int,bool,bool,text,text) to anon, authenticated;

-- Run separately after replacing the value with the celebrant's password.
-- insert into private.event_access_config (id, password_hash)
-- values (1, extensions.crypt('REPLACE_WITH_A_STRONG_PASSWORD', extensions.gen_salt('bf')))
-- on conflict (id) do update set password_hash = excluded.password_hash;
