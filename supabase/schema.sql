-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- PROFILES TABLE (Public profile data for each user)
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text not null,
  full_name text,
  role text check (role in ('student', 'faculty', 'technician', 'admin', 'superadmin')) default 'student',
  hostel text,
  room_no text,
  specialization text, -- for technicians (e.g., 'electrician', 'plumber')
  phone text,
  is_online boolean default false, -- technician availability
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone." on public.profiles
  for select using (true);

create policy "Users can insert their own profile." on public.profiles
  for insert with check (auth.uid() = id);

create policy "Users can update own profile." on public.profiles
  for update using (auth.uid() = id);

-- Allow admins to update any profile (for creating technicians, changing roles)
create policy "Admins can update any profile." on public.profiles
  for update using (exists (
    select 1 from public.profiles where id = auth.uid() and role in ('admin', 'superadmin')
  ));

-- Allow admins to insert profiles (for creating technician accounts)
create policy "Admins can insert profiles." on public.profiles
  for insert with check (exists (
    select 1 from public.profiles where id = auth.uid() and role in ('admin', 'superadmin')
  ));

-- TRIGGER to auto-create profile on signup
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role, specialization)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    coalesce(new.raw_user_meta_data->>'role', 'student'),
    new.raw_user_meta_data->>'specialization'
  );
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
  token text unique not null, -- unique token for QR code
  title text not null,
  description text not null,
  category text not null,
  status text check (status in ('open', 'in_progress', 'resolved', 'rejected', 'closed')) default 'open',
  priority text check (priority in ('low', 'medium', 'high', 'urgent')) default 'medium',
  assigned_to uuid references public.profiles(id),
  room_no text,
  hostel_type text,
  image_url text,
  tech_note text, -- technician's resolution note
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.tickets enable row level security;

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

-- Allow anyone to look up a ticket by token (for QR scanning)
create policy "Anyone can lookup ticket by token." on public.tickets
  for select using (true);


-- COMPLAINT HISTORY TABLE (Timeline)
create table public.complaint_history (
  id uuid default uuid_generate_v4() primary key,
  ticket_id uuid references public.tickets(id) on delete cascade not null,
  status text not null,
  note text,
  changed_by uuid references public.profiles(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.complaint_history enable row level security;

create policy "History viewable by ticket participants and admins." on public.complaint_history
  for select using (
    exists (select 1 from public.tickets where id = ticket_id and (user_id = auth.uid() or assigned_to = auth.uid()))
    or exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'superadmin'))
  );

create policy "Technicians and admins can insert history." on public.complaint_history
  for insert with check (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('technician', 'admin', 'superadmin'))
  );


-- HOSTEL ISSUES TABLE (Community-wide issues)
create table public.hostel_issues (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) not null,
  hostel_type text not null, -- 'boys_hostel', 'girls_hostel', 'faculty_hostel'
  issue_type text not null, -- 'water_supply', 'electricity', 'wifi', etc.
  description text not null,
  status text check (status in ('reported', 'acknowledged', 'in_progress', 'resolved')) default 'reported',
  vote_count int default 1,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.hostel_issues enable row level security;

create policy "Anyone can view hostel issues." on public.hostel_issues
  for select using (true);

create policy "Authenticated users can create hostel issues." on public.hostel_issues
  for insert with check (auth.uid() = user_id);

create policy "Admins can update hostel issues." on public.hostel_issues
  for update using (exists (
    select 1 from public.profiles where id = auth.uid() and role in ('admin', 'superadmin')
  ));


-- HOSTEL ISSUE VOTES
create table public.hostel_issue_votes (
  id uuid default uuid_generate_v4() primary key,
  issue_id uuid references public.hostel_issues(id) on delete cascade not null,
  user_id uuid references public.profiles(id) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(issue_id, user_id)
);

alter table public.hostel_issue_votes enable row level security;

create policy "Anyone can view votes." on public.hostel_issue_votes
  for select using (true);

create policy "Authenticated users can vote." on public.hostel_issue_votes
  for insert with check (auth.uid() = user_id);

create policy "Users can remove their vote." on public.hostel_issue_votes
  for delete using (auth.uid() = user_id);


-- SUGGESTIONS TABLE
create table public.suggestions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) not null,
  title text not null,
  description text not null,
  category text not null, -- 'academics', 'infrastructure', 'hostel', 'mess', 'sports', 'other'
  status text check (status in ('active', 'approved', 'rejected', 'implemented')) default 'active',
  upvotes int default 0,
  downvotes int default 0,
  admin_remark text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.suggestions enable row level security;

create policy "Anyone can view suggestions." on public.suggestions
  for select using (true);

create policy "Authenticated users can create suggestions." on public.suggestions
  for insert with check (auth.uid() = user_id);

create policy "Users can delete own suggestions." on public.suggestions
  for delete using (auth.uid() = user_id);

create policy "Admins can update suggestions." on public.suggestions
  for update using (exists (
    select 1 from public.profiles where id = auth.uid() and role in ('admin', 'superadmin')
  ));


-- SUGGESTION VOTES
create table public.suggestion_votes (
  id uuid default uuid_generate_v4() primary key,
  suggestion_id uuid references public.suggestions(id) on delete cascade not null,
  user_id uuid references public.profiles(id) not null,
  vote_type text check (vote_type in ('up', 'down')) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(suggestion_id, user_id)
);

alter table public.suggestion_votes enable row level security;

create policy "Anyone can view suggestion votes." on public.suggestion_votes
  for select using (true);

create policy "Authenticated users can vote on suggestions." on public.suggestion_votes
  for insert with check (auth.uid() = user_id);

create policy "Users can change their vote." on public.suggestion_votes
  for update using (auth.uid() = user_id);

create policy "Users can remove their vote." on public.suggestion_votes
  for delete using (auth.uid() = user_id);


-- STORAGE BUCKETS (Create in Supabase Dashboard -> Storage)
-- bucket: 'complaint-images'
-- policy: authenticated users can upload, public can read
