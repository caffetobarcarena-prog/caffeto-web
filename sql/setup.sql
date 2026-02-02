-- ===== CAFFETO DATABASE SETUP =====

create table products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  price numeric not null,
  image text,
  active boolean default true,
  created_at timestamp default now()
);

create table loyalty (
  id uuid primary key default gen_random_uuid(),
  name text,
  email text,
  phone text,
  points integer default 0,
  created_at timestamp default now()
);

create table reservations (
  id uuid primary key default gen_random_uuid(),
  name text,
  phone text,
  date timestamp,
  people integer,
  created_at timestamp default now()
);

create table orders (
  id uuid primary key default gen_random_uuid(),
  items jsonb,
  total numeric,
  created_at timestamp default now()
);

-- Admin via auth.users

