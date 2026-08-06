-- ============================================================
-- Kushal Enterprises — Supabase setup
-- Run this in your Supabase project: SQL Editor → New query → Run
-- ============================================================

-- ---------- TABLES ----------
create table if not exists public.properties (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  type text,
  category text,
  location text not null,
  area_buildup text,
  area_carpet text,
  floor text,
  total_floors text,
  construction_age text,
  price text not null,
  price_negotiable boolean default false,
  description text,
  features text,
  contact_name text default 'Anil',
  contact_phone text default '9029847968',
  office_phone text default '9326313320',
  photos text[],
  is_featured boolean default false,
  status text default 'Active',
  created_at timestamptz default now()
);

create table if not exists public.team_members (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text not null,
  phone text,
  photo_url text,
  display_order integer default 0,
  created_at timestamptz default now()
);

create table if not exists public.inquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text,
  phone text not null,
  subject text,
  message text,
  property_id uuid,
  property_title text,
  created_at timestamptz default now(),
  is_read boolean default false
);

create table if not exists public.admin_users (
  id uuid primary key references auth.users on delete cascade,
  email text not null,
  name text,
  role text default 'admin',
  created_at timestamptz default now()
);

-- ---------- GRANTS (required for the Data API) ----------
grant select on public.properties to anon, authenticated;
grant all on public.properties to authenticated, service_role;

grant select on public.team_members to anon, authenticated;
grant all on public.team_members to authenticated, service_role;

grant insert on public.inquiries to anon, authenticated;
grant all on public.inquiries to authenticated, service_role;

grant select, insert on public.admin_users to authenticated;
grant all on public.admin_users to service_role;

-- ---------- RLS ----------
alter table public.properties enable row level security;
alter table public.team_members enable row level security;
alter table public.inquiries enable row level security;
alter table public.admin_users enable row level security;

-- properties
create policy "Public can view active properties" on public.properties
  for select using (status = 'Active');
create policy "Admins can do everything on properties" on public.properties
  for all using (auth.uid() in (select id from public.admin_users));

-- team_members
create policy "Public can view team" on public.team_members
  for select using (true);
create policy "Admins can manage team" on public.team_members
  for all using (auth.uid() in (select id from public.admin_users));

-- inquiries
create policy "Anyone can submit inquiry" on public.inquiries
  for insert with check (true);
create policy "Admins can view inquiries" on public.inquiries
  for select using (auth.uid() in (select id from public.admin_users));
create policy "Admins can manage inquiries" on public.inquiries
  for all using (auth.uid() in (select id from public.admin_users));

-- admin_users
create policy "Admins can view admin list" on public.admin_users
  for select using (auth.uid() in (select id from public.admin_users));
create policy "First 5 users become admin" on public.admin_users
  for insert with check ((select count(*) from public.admin_users) < 5);

-- ---------- STORAGE ----------
insert into storage.buckets (id, name, public)
values ('property-photos', 'property-photos', true)
on conflict (id) do nothing;

create policy "Public can read property photos" on storage.objects
  for select using (bucket_id = 'property-photos');
create policy "Authenticated can upload property photos" on storage.objects
  for insert to authenticated with check (bucket_id = 'property-photos');
create policy "Authenticated can update property photos" on storage.objects
  for update to authenticated using (bucket_id = 'property-photos');
create policy "Authenticated can delete property photos" on storage.objects
  for delete to authenticated using (bucket_id = 'property-photos');

-- ---------- SEED DATA ----------
insert into public.team_members (name, role, phone, display_order) values
  ('Anil Chandrakant Patil', 'Founder & Consultant', '9029847968', 1),
  ('Team Member 2', 'Senior Property Advisor', '9326313320', 2),
  ('Team Member 3', 'Property Consultant', '8424872525', 3),
  ('Team Member 4', 'Documentation Specialist', '9619441338', 4),
  ('Team Member 5', 'Customer Relations', '9137201473', 5)
on conflict do nothing;

insert into public.properties
  (title, type, category, location, area_buildup, area_carpet, floor, total_floors,
   construction_age, price, price_negotiable, description, features, status, is_featured)
values
  ('2 BHK Flat For Sale in Dhokali, Balkum Naka, Thane', 'Residential', 'Sale',
   'Nr Highland Park, Dhokali, Thane', '1000 sqft', '652 sqft', '22nd', '30',
   '3 years old', '₹1.45 Crore', true,
   'Spacious 2 BHK flat available for sale in the prime location of Dhokali near Highland Park. This well-maintained flat on the 22nd floor offers stunning views and premium amenities. Perfect for families looking for a comfortable home in Thane.',
   'Prime Location, Fully Furnished, 24hrs Water Supply, Complex with Security, Lift with Backup, Gym, Club House, Swimming Pool, Clear Title',
   'Active', true)
on conflict do nothing;
-- ---------- AGENCY TAGGING (Kushal Enterprises vs Bhoomi Realty) ----------
alter table public.properties add column if not exists agency text default 'kushal';
update public.properties set agency = 'kushal' where agency is null;

-- ---------- STORAGE QUOTA MONITORING ----------
create or replace function public.get_database_size_bytes()
returns bigint
language sql
security definer
set search_path = public
as $$
  select pg_database_size(current_database());
$$;

revoke all on function public.get_database_size_bytes() from public;
grant execute on function public.get_database_size_bytes() to service_role;