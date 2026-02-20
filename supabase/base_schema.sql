-- BASE SCHEMA MIGRATION for EverydayAZA
-- Run this BEFORE running the payments migration

-- 1. Create Base Tables
CREATE TABLE IF NOT EXISTS listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  price numeric NOT NULL,
  image text,
  category text,
  condition text,
  status text DEFAULT 'active',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS import_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  url text,
  product_name text NOT NULL,
  quantity numeric DEFAULT 1,
  notes text,
  shipping_method text,
  status text DEFAULT 'pending', -- pending, quoted, approved, rejected
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS import_quotes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid REFERENCES import_requests(id) ON DELETE CASCADE,
  admin_id uuid REFERENCES profiles(id),
  product_cost numeric DEFAULT 0,
  shipping_cost numeric DEFAULT 0,
  service_fee numeric DEFAULT 0,
  total_cost numeric NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS import_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  quote_id uuid REFERENCES import_quotes(id),
  status text DEFAULT 'processing', -- processing, shipped, delivered
  tracking_number text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS promotions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid REFERENCES listings(id) ON DELETE CASCADE,
  type text NOT NULL, -- featured, top
  expires_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS favorites (
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  listing_id uuid REFERENCES listings(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, listing_id)
);

-- 2. Add Policies (Basic Security)
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public listings are viewable by everyone" ON listings FOR SELECT USING (true);
CREATE POLICY "Users can insert their own listings" ON listings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own listings" ON listings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own listings" ON listings FOR DELETE USING (auth.uid() = user_id);

ALTER TABLE import_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own requests" ON import_requests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own requests" ON import_requests FOR INSERT WITH CHECK (auth.uid() = user_id);

ALTER TABLE import_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own orders" ON import_orders FOR SELECT USING (auth.uid() = user_id);

ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Listings promotions are viewable by everyone" ON promotions FOR SELECT USING (true);

ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own favorites" ON favorites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users manage own favorites" ON favorites FOR ALL USING (auth.uid() = user_id);

-- 3. Storage Buckets (Optional but recommended)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('listings', 'listings', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Give users access to own folder 1oj01k_0" ON storage.objects FOR SELECT TO public USING (bucket_id = 'listings');
CREATE POLICY "Give users access to own folder 1oj01k_1" ON storage.objects FOR INSERT TO public WITH CHECK (bucket_id = 'listings');
