-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- PROFILES TABLE (Public profile data for each user)
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text not null,
  full_name text,
  role text check (role in ('student', 'faculty', 'technician', 'admin', 'superadmin')) default 'student',
  hostel text, -- e.g., 'Boys Hostel 1'
  room_no text, -- e.g., '204'
  specialization text, -- for technicians (e.g., 'Electrician')
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.profiles enable row level security;

-- Policies for Profiles
create policy "Public profiles are viewable by everyone." on public.profiles
  for select using (true);

create policy "Users can insert their own profile." on public.profiles
  for insert with check (auth.uid() = id);

create policy "Users can update own profile." on public.profiles
  for update using (auth.uid() = id);

-- TRIGGER to auto-create profile on signup
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', coalesce(new.raw_user_meta_data->>'role', 'student'));
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- TICKETS TABLE (Complaints)
create table public.tickets (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) not null,
  title text not null,
  description text not null,
  category text not null, -- e.g., 'WiFi', 'Electricity', 'Plumbing'
  status text check (status in ('open', 'in_progress', 'resolved', 'closed')) default 'open',
  priority text check (priority in ('low', 'medium', 'high', 'urgent')) default 'medium',
  assigned_to uuid references public.profiles(id), -- Technician ID
  image_url text, -- Evidence photo
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.tickets enable row level security;

-- Policies for Tickets
create policy "Students can view their own tickets." on public.tickets
  for select using (auth.uid() = user_id);

create policy "Students can create tickets." on public.tickets
  for insert with check (auth.uid() = user_id);

create policy "Technicians can view assigned tickets." on public.tickets
  for select using (auth.uid() = assigned_to or exists (
    select 1 from public.profiles 
    where id = auth.uid() and role in ('technician', 'admin', 'superadmin')
  ));

create policy "Admins can view all tickets." on public.tickets
  for select using (exists (
    select 1 from public.profiles where id = auth.uid() and role in ('admin', 'superadmin')
  ));

create policy "Technicians/Admins can update tickets." on public.tickets
  for update using (exists (
    select 1 from public.profiles where id = auth.uid() and role in ('technician', 'admin', 'superadmin')
  ));


-- COMMENTS TABLE (Chat history)
create table public.comments (
  id uuid default uuid_generate_v4() primary key,
  ticket_id uuid references public.tickets(id) on delete cascade not null,
  user_id uuid references public.profiles(id) not null,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.comments enable row level security;

create policy "Comments viewable by ticket participants." on public.comments
  for select using (
    exists (select 1 from public.tickets where id = ticket_id and (user_id = auth.uid() or assigned_to = auth.uid()))
    or exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'superadmin'))
  );

create policy "Participants can add comments." on public.comments
  for insert with check (
    exists (select 1 from public.tickets where id = ticket_id and (user_id = auth.uid() or assigned_to = auth.uid()))
    or exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );


-- STORAGE BUCKETS (You must create these in Supabase Dashboard -> Storage)
-- bucket: 'complaint-images'
-- policy: authenticated users can upload, public can read


-- INVITE CODES TABLE (for technician/superadmin onboarding)
create table public.invite_codes (
  id uuid default uuid_generate_v4() primary key,
  code text unique not null,
  role text check (role in ('technician', 'superadmin')) not null,
  used boolean default false,
  used_by uuid references public.profiles(id),
  created_by uuid references public.profiles(id),
  created_at timestamptz default now()
);

alter table public.invite_codes enable row level security;

create policy "Superadmins can manage invite codes." on public.invite_codes
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'superadmin')
  );

-- Allow anyone to validate a code during signup (select only on unused codes)
create policy "Anyone can check unused invite codes." on public.invite_codes
  for select using (used = false);
