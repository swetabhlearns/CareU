-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Users Table (Links to Privy User ID)
create table public.users (
  id text primary key, -- This will match the Privy User ID (e.g., 'did:privy:...')
  email text,
  name text,
  role text not null default 'customer' check (role in ('customer', 'provider', 'admin')),
  phone text,
  medical_notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Services Table
create table public.services (
  id uuid default uuid_generate_v4() primary key,
  provider_id text references public.users(id), -- Link to the User who offers this service
  type text not null check (type in ('Nurse', 'Driver', 'House Help')),
  name text not null,
  description text,
  hourly_rate numeric not null,
  availability jsonb, -- e.g., {"mon": ["09:00", "17:00"]}
  image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Bookings Table
create table public.bookings (
  id uuid default uuid_generate_v4() primary key,
  user_id text references public.users(id) not null,
  service_id uuid references public.services(id) not null,
  status text not null check (status in ('pending', 'confirmed', 'completed', 'cancelled')) default 'pending',
  scheduled_at timestamp with time zone not null,
  duration_hours int not null default 1,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS Policies (Row Level Security)
alter table public.users enable row level security;
alter table public.services enable row level security;
alter table public.bookings enable row level security;

-- Users can read/update their own profile
create policy "Users can view own profile" on public.users for select using (auth.uid()::text = id);
create policy "Users can update own profile" on public.users for update using (auth.uid()::text = id);

-- Everyone can view services
create policy "Services are public" on public.services for select using (true);

-- Users can view/create their own bookings
create policy "Users can view own bookings" on public.bookings for select using (auth.uid()::text = user_id);
create policy "Users can create bookings" on public.bookings for insert with check (auth.uid()::text = user_id);

-- Seed Data
insert into public.services (type, name, description, hourly_rate, image_url) values
('Nurse', 'Registered Nurse - Sarah', 'Experienced in elderly care and medication management.', 50.00, 'https://placehold.co/600x400?text=Nurse+Sarah'),
('Nurse', 'Licensed Practical Nurse - John', 'Specializes in post-operative care.', 40.00, 'https://placehold.co/600x400?text=Nurse+John'),
('Driver', 'Medical Transport - Van', 'Wheelchair accessible van for appointments.', 35.00, 'https://placehold.co/600x400?text=Medical+Van'),
('House Help', 'General Cleaning', 'Light housekeeping and meal preparation.', 25.00, 'https://placehold.co/600x400?text=House+Help');
