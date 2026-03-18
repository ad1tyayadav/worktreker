create extension if not exists "pgcrypto";

-- Profiles (auto-created on signup)
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  created_at timestamptz default now()
);

-- Clients
create table if not exists clients (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade,
  name text not null,
  description text,
  color text default '#2D5BE3',
  created_at timestamptz default now()
);

-- Work Sections (e.g. "Instagram Reels - March 2025")
create table if not exists sections (
  id uuid default gen_random_uuid() primary key,
  client_id uuid references clients(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  title text not null,
  created_at timestamptz default now()
);

-- Work Entries (individual logged items)
create table if not exists entries (
  id uuid default gen_random_uuid() primary key,
  section_id uuid references sections(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  title text not null,
  unit_type text not null,
  unit_count numeric not null default 1,
  billable_units numeric not null default 1,
  rate_per_unit numeric,
  currency text default 'USD',
  notes text,
  reference_url text,
  status text default 'pending',
  created_at timestamptz default now()
);

alter table profiles enable row level security;
alter table clients enable row level security;
alter table sections enable row level security;
alter table entries enable row level security;

-- Profiles policies
create policy "Profiles are viewable by owner" on profiles
  for select using (auth.uid() = id);

create policy "Profiles can be inserted by owner" on profiles
  for insert with check (auth.uid() = id);

create policy "Profiles can be updated by owner" on profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- Clients policies
create policy "Clients are viewable by owner" on clients
  for select using (auth.uid() = user_id);

create policy "Clients can be inserted by owner" on clients
  for insert with check (auth.uid() = user_id);

create policy "Clients can be updated by owner" on clients
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Clients can be deleted by owner" on clients
  for delete using (auth.uid() = user_id);

-- Sections policies
create policy "Sections are viewable by owner" on sections
  for select using (auth.uid() = user_id);

create policy "Sections can be inserted by owner" on sections
  for insert with check (auth.uid() = user_id);

create policy "Sections can be updated by owner" on sections
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Sections can be deleted by owner" on sections
  for delete using (auth.uid() = user_id);

-- Entries policies
create policy "Entries are viewable by owner" on entries
  for select using (auth.uid() = user_id);

create policy "Entries can be inserted by owner" on entries
  for insert with check (auth.uid() = user_id);

create policy "Entries can be updated by owner" on entries
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Entries can be deleted by owner" on entries
  for delete using (auth.uid() = user_id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as 
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name')
  on conflict (id) do nothing;
  return new;
end;
;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- Ensure currency column exists for existing databases
alter table entries add column if not exists currency text default 'USD';

-- Share Links (public share tokens for clients)
create table if not exists share_links (
  id uuid default gen_random_uuid() primary key,
  client_id uuid references clients(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  token text unique not null default encode(gen_random_bytes(16), 'hex'),
  show_notes boolean default false,
  show_references boolean default false,
  show_rates boolean default false,
  show_status boolean default true,
  is_active boolean default true,
  created_at timestamptz default now()
);

alter table share_links enable row level security;

create policy "Share links are viewable by owner or public when active" on share_links
  for select using (is_active = true or auth.uid() = user_id);

create policy "Share links can be inserted by owner" on share_links
  for insert with check (auth.uid() = user_id);

create policy "Share links can be updated by owner" on share_links
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Share links can be deleted by owner" on share_links
  for delete using (auth.uid() = user_id);


