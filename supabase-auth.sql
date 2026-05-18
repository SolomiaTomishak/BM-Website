create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  role text not null default 'user',
  created_at timestamptz not null default now()
);

alter table profiles enable row level security;

create policy "Users can read own profile"
on profiles for select
using (auth.uid() = id);

create policy "Users can update own profile"
on profiles for update
using (auth.uid() = id)
with check (auth.uid() = id);

-- Run this after creating an admin user in Authentication > Users.
-- Replace the email with your real admin email.
insert into profiles (id, name, role)
select id, 'Адмін', 'admin'
from auth.users
where email = 'email@example.com'
on conflict (id) do update
set name = excluded.name,
    role = excluded.role;
