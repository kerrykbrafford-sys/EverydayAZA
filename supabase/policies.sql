-- ============================================================
-- EverydayAZA — Row Level Security Policies
-- Run after schema.sql: npx supabase db push
-- ============================================================

-- Enable RLS on all tables
alter table profiles              enable row level security;
alter table categories            enable row level security;
alter table listings              enable row level security;
alter table listing_images        enable row level security;
alter table favorites             enable row level security;
alter table conversations         enable row level security;
alter table messages              enable row level security;
alter table notifications         enable row level security;
alter table import_requests       enable row level security;
alter table import_quotes         enable row level security;
alter table import_orders         enable row level security;
alter table import_tracking_events enable row level security;
alter table payments              enable row level security;
alter table reports               enable row level security;
alter table admin_actions         enable row level security;
alter table promotions            enable row level security;

-- Helper: is current user admin?
create or replace function is_admin()
returns boolean language sql security definer as $$
  select coalesce(
    (select role = 'admin' from profiles where id = auth.uid()),
    false
  );
$$;

-- ─── Profiles ──────────────────────────────────────────────
create policy "Profiles are publicly readable"
  on profiles for select using (true);

create policy "Users can update their own profile"
  on profiles for update using (auth.uid() = id);

create policy "Admins can update any profile"
  on profiles for update using (is_admin());

-- ─── Categories ────────────────────────────────────────────
create policy "Categories are public"
  on categories for select using (true);

create policy "Only admins can manage categories"
  on categories for all using (is_admin());

-- ─── Listings ──────────────────────────────────────────────
create policy "Active listings are public"
  on listings for select using (status = 'active' or auth.uid() = user_id or is_admin());

create policy "Authenticated users can create listings"
  on listings for insert with check (auth.uid() = user_id);

create policy "Owners can update their listings"
  on listings for update using (auth.uid() = user_id or is_admin());

create policy "Owners and admins can delete listings"
  on listings for delete using (auth.uid() = user_id or is_admin());

-- ─── Listing Images ────────────────────────────────────────
create policy "Listing images are public"
  on listing_images for select using (true);

create policy "Listing owners can manage images"
  on listing_images for all
  using (exists (select 1 from listings where id = listing_id and user_id = auth.uid()));

-- ─── Favorites ─────────────────────────────────────────────
create policy "Users manage their own favorites"
  on favorites for all using (auth.uid() = user_id);

-- ─── Conversations ─────────────────────────────────────────
create policy "Participants can view conversations"
  on conversations for select
  using (auth.uid() = buyer_id or auth.uid() = seller_id or is_admin());

create policy "Authenticated users can create conversations"
  on conversations for insert with check (auth.uid() = buyer_id);

-- ─── Messages ──────────────────────────────────────────────
create policy "Conversation participants can read messages"
  on messages for select
  using (exists (
    select 1 from conversations c
    where c.id = conversation_id
    and (c.buyer_id = auth.uid() or c.seller_id = auth.uid())
  ) or is_admin());

create policy "Participants can send messages"
  on messages for insert
  with check (
    auth.uid() = sender_id
    and exists (
      select 1 from conversations c
      where c.id = conversation_id
      and (c.buyer_id = auth.uid() or c.seller_id = auth.uid())
    )
  );

create policy "Recipients can mark messages read"
  on messages for update
  using (exists (
    select 1 from conversations c
    where c.id = conversation_id
    and (c.buyer_id = auth.uid() or c.seller_id = auth.uid())
  ));

-- ─── Notifications ─────────────────────────────────────────
create policy "Users read their own notifications"
  on notifications for select using (auth.uid() = user_id);

create policy "Users update (mark read) their notifications"
  on notifications for update using (auth.uid() = user_id);

create policy "Service role inserts notifications"
  on notifications for insert with check (true);

-- ─── Import Requests ───────────────────────────────────────
create policy "Users view their own import requests"
  on import_requests for select using (auth.uid() = user_id or is_admin());

create policy "Authenticated users can create import requests"
  on import_requests for insert with check (auth.uid() = user_id);

create policy "Users and admins can update import requests"
  on import_requests for update using (auth.uid() = user_id or is_admin());

-- ─── Import Quotes ─────────────────────────────────────────
create policy "Request owners and admins can view quotes"
  on import_quotes for select
  using (exists (
    select 1 from import_requests r
    where r.id = request_id and (r.user_id = auth.uid() or is_admin())
  ));

create policy "Only admins and agents can create quotes"
  on import_quotes for insert with check (is_admin());

-- ─── Import Orders ─────────────────────────────────────────
create policy "Users view their own orders"
  on import_orders for select using (auth.uid() = user_id or is_admin());

create policy "Admins and service role manage orders"
  on import_orders for all using (is_admin());

-- ─── Import Tracking Events ────────────────────────────────
create policy "Order owners view tracking events"
  on import_tracking_events for select
  using (exists (
    select 1 from import_orders o
    where o.id = order_id and (o.user_id = auth.uid() or is_admin())
  ));

create policy "Service role inserts tracking events"
  on import_tracking_events for insert with check (true);

-- ─── Payments ──────────────────────────────────────────────
create policy "Users view their own payments"
  on payments for select using (auth.uid() = user_id or is_admin());

create policy "Service role manages payments"
  on payments for all using (is_admin());

-- ─── Reports ───────────────────────────────────────────────
create policy "Users submit reports"
  on reports for insert with check (auth.uid() = reporter_id);

create policy "Only admins read reports"
  on reports for select using (is_admin());

create policy "Admins update report status"
  on reports for update using (is_admin());

-- ─── Admin Actions ─────────────────────────────────────────
create policy "Only admins can view and create admin actions"
  on admin_actions for all using (is_admin());

-- ─── Promotions ────────────────────────────────────────────
create policy "Promotions are public to read"
  on promotions for select using (true);

create policy "Admins manage promotions"
  on promotions for all using (is_admin());
