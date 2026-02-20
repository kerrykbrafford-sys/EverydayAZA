-- ============================================================
-- EverydayAZA — Full Database Schema
-- Run: npx supabase db push
-- ============================================================

-- Enable extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm";     -- fuzzy search
create extension if not exists "unaccent";    -- accent-insensitive search

-- ─── Profiles ──────────────────────────────────────────────
create table if not exists profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  full_name    text,
  email        text,
  avatar_url   text,
  phone        text,
  location     text,
  role         text not null default 'user' check (role in ('user', 'admin', 'banned')),
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

-- Auto-fill profile on new user sign-up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, full_name, email, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.email,
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─── Categories ────────────────────────────────────────────
create table if not exists categories (
  id           uuid primary key default uuid_generate_v4(),
  name         text not null,
  slug         text not null unique,
  description  text,
  icon         text,
  parent_id    uuid references categories(id),
  created_at   timestamptz default now()
);

-- ─── Listings ──────────────────────────────────────────────
create table if not exists listings (
  id                uuid primary key default uuid_generate_v4(),
  user_id           uuid not null references profiles(id) on delete cascade,
  title             text not null,
  description       text,
  price             numeric(12, 2),
  negotiable        boolean default false,
  category          text,
  category_id       uuid references categories(id),
  location          text,
  condition         text check (condition in ('new','like_new','used','refurbished')),
  status            text not null default 'active' check (status in ('active','sold','removed','flagged','draft')),
  moderation_reason text,
  views             integer default 0,
  search_vector     tsvector,
  created_at        timestamptz default now(),
  updated_at        timestamptz default now()
);

-- Auto-update search_vector
create or replace function update_listing_search_vector()
returns trigger language plpgsql as $$
begin
  new.search_vector := to_tsvector('english',
    coalesce(new.title, '') || ' ' ||
    coalesce(new.description, '') || ' ' ||
    coalesce(new.category, '') || ' ' ||
    coalesce(new.location, '')
  );
  return new;
end;
$$;

drop trigger if exists listing_search_vector_update on listings;
create trigger listing_search_vector_update
  before insert or update on listings
  for each row execute function update_listing_search_vector();

-- RPC for edge function search indexer
create or replace function update_listing_search_vector(p_listing_id uuid, p_search_text text)
returns void language plpgsql security definer as $$
begin
  update listings
  set search_vector = to_tsvector('english', p_search_text)
  where id = p_listing_id;
end;
$$;

create index if not exists listings_search_idx on listings using gin(search_vector);
create index if not exists listings_category_idx on listings(category);
create index if not exists listings_status_idx on listings(status);
create index if not exists listings_user_idx on listings(user_id);

-- ─── Listing Images ────────────────────────────────────────
create table if not exists listing_images (
  id            uuid primary key default uuid_generate_v4(),
  listing_id    uuid not null references listings(id) on delete cascade,
  image_url     text not null,
  display_order integer default 0,
  created_at    timestamptz default now()
);

-- ─── Favorites ─────────────────────────────────────────────
create table if not exists favorites (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid not null references profiles(id) on delete cascade,
  listing_id uuid not null references listings(id) on delete cascade,
  created_at timestamptz default now(),
  unique(user_id, listing_id)
);

-- ─── Conversations ─────────────────────────────────────────
create table if not exists conversations (
  id              uuid primary key default uuid_generate_v4(),
  listing_id      uuid references listings(id) on delete set null,
  buyer_id        uuid not null references profiles(id) on delete cascade,
  seller_id       uuid not null references profiles(id) on delete cascade,
  last_message_at timestamptz,
  created_at      timestamptz default now(),
  unique(listing_id, buyer_id, seller_id)
);

-- ─── Messages ──────────────────────────────────────────────
create table if not exists messages (
  id              uuid primary key default uuid_generate_v4(),
  conversation_id uuid not null references conversations(id) on delete cascade,
  sender_id       uuid not null references profiles(id) on delete cascade,
  content         text not null,
  read            boolean default false,
  created_at      timestamptz default now()
);

create index if not exists messages_conv_idx on messages(conversation_id, created_at desc);

-- ─── Notifications ─────────────────────────────────────────
create table if not exists notifications (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid not null references profiles(id) on delete cascade,
  type       text not null,
  title      text not null,
  body       text,
  metadata   jsonb default '{}',
  read       boolean default false,
  created_at timestamptz default now()
);

-- ─── Import Requests ───────────────────────────────────────
create table if not exists import_requests (
  id                   uuid primary key default uuid_generate_v4(),
  user_id              uuid not null references profiles(id) on delete cascade,
  title                text,
  product_name         text,
  description          text,
  reference_image_url  text,
  product_url          text,
  quantity             integer,
  destination_country  text default 'Ghana',
  preferred_shipping   text check (preferred_shipping in ('air_freight','sea_freight','express')),
  budget_min           numeric(12,2),
  budget_max           numeric(12,2),
  status               text not null default 'pending'
    check (status in ('pending','ai_sourcing','finding_supplier','quoted','approved','rejected','paid','processing','shipped','delivered')),
  ai_processed         boolean default false,
  created_at           timestamptz default now()
);

-- ─── Import Quotes ─────────────────────────────────────────
create table if not exists import_quotes (
  id               uuid primary key default uuid_generate_v4(),
  request_id       uuid not null references import_requests(id) on delete cascade,
  supplier_name    text,
  supplier_country text,
  product_cost     numeric(12,2),
  shipping_cost    numeric(12,2),
  service_fee      numeric(12,2),
  total_cost       numeric(12,2),
  delivery_days    integer,
  currency         text default 'GHS',
  notes            text,
  expires_at       timestamptz,
  created_at       timestamptz default now()
);

-- ─── Import Orders ─────────────────────────────────────────
create table if not exists import_orders (
  id                uuid primary key default uuid_generate_v4(),
  user_id           uuid not null references profiles(id) on delete cascade,
  quote_id          uuid not null references import_quotes(id),
  tracking_number   text,
  shipping_status   text check (shipping_status in (
    'payment_confirmed','order_placed','processing','dispatched','in_transit',
    'customs_clearance','arrived_country','out_for_delivery','delivered'
  )),
  payment_status    text default 'pending' check (payment_status in ('pending','paid','failed')),
  estimated_delivery timestamptz,
  delivered_at      timestamptz,
  created_at        timestamptz default now()
);

-- ─── Import Tracking Events ────────────────────────────────
create table if not exists import_tracking_events (
  id          uuid primary key default uuid_generate_v4(),
  order_id    uuid not null references import_orders(id) on delete cascade,
  status      text not null,
  description text,
  created_at  timestamptz default now()
);

-- ─── Payments ──────────────────────────────────────────────
create table if not exists payments (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references profiles(id) on delete cascade,
  order_id    uuid references import_orders(id),
  reference   text unique,
  amount      numeric(12,2),
  currency    text default 'GHS',
  provider    text default 'paystack' check (provider in ('paystack','flutterwave','manual')),
  status      text default 'pending' check (status in ('pending','completed','failed','refunded')),
  paid_at     timestamptz,
  metadata    jsonb default '{}',
  created_at  timestamptz default now()
);

-- ─── Reports ───────────────────────────────────────────────
create table if not exists reports (
  id          uuid primary key default uuid_generate_v4(),
  reporter_id uuid not null references profiles(id) on delete cascade,
  target_id   uuid not null,
  target_type text not null check (target_type in ('listing','user','message')),
  reason      text not null,
  description text,
  status      text not null default 'open' check (status in ('open','reviewed','dismissed')),
  created_at  timestamptz default now()
);

-- ─── Admin Actions ─────────────────────────────────────────
create table if not exists admin_actions (
  id          uuid primary key default uuid_generate_v4(),
  admin_id    uuid references profiles(id),
  action_type text not null,
  target_id   uuid not null,
  target_type text not null,
  reason      text,
  created_at  timestamptz default now()
);

-- ─── Promotions ────────────────────────────────────────────
create table if not exists promotions (
  id         uuid primary key default uuid_generate_v4(),
  listing_id uuid not null references listings(id) on delete cascade,
  type       text,
  starts_at  timestamptz,
  expires_at timestamptz,
  created_at timestamptz default now()
);
