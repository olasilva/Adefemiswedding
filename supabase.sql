-- Run in Supabase SQL editor. Then create the couple's login under Authentication > Users.
create table reservations(
  id uuid primary key default gen_random_uuid(), code text unique not null,
  name text not null, phone text not null, email text,
  seats int not null check (seats between 1 and 6),
  traditional bool not null default false, court bool not null default false,
  note text, created_at timestamptz default now());
alter table reservations enable row level security;
create policy "couple read" on reservations for select to authenticated using (true);
create policy "couple delete" on reservations for delete to authenticated using (true);

create function seat_counts() returns json language sql security definer as $$
  select json_build_object(
    'traditional', coalesce(sum(seats) filter (where traditional),0),
    'court', coalesce(sum(seats) filter (where court),0)) from reservations $$;

create function reserve_seats(p_name text,p_phone text,p_email text,p_seats int,p_trad bool,p_court bool,p_note text)
returns text language plpgsql security definer as $$
declare c json; v text; cap int := 250;
begin
  perform pg_advisory_xact_lock(2027);
  c := seat_counts();
  if p_trad and (c->>'traditional')::int + p_seats > cap then raise exception 'Not enough seats left for the Traditional Engagement'; end if;
  if p_court and (c->>'court')::int + p_seats > cap then raise exception 'Not enough seats left for the Court Wedding'; end if;
  v := 'SL-' || upper(substr(md5(random()::text),1,5));
  insert into reservations(code,name,phone,email,seats,traditional,court,note)
  values (v,p_name,p_phone,p_email,p_seats,p_trad,p_court,p_note);
  return v;
end $$;
grant execute on function seat_counts(), reserve_seats(text,text,text,int,bool,bool,text) to anon, authenticated;
