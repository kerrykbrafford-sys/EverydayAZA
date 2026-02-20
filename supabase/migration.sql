-- ====================================================
-- RecWorld Payment System + Admin Moderation Migration
-- Run this in Supabase Dashboard → SQL Editor
-- ====================================================

-- 1. Ensure payments table has all required columns
-- (Drop + recreate if it's a stub, or alter if it exists)
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  amount numeric NOT NULL,
  currency text DEFAULT 'GHS',
  provider text,              -- 'paystack' or 'stripe'
  provider_reference text,    -- gateway transaction reference
  status text DEFAULT 'pending',  -- pending | completed | failed | refunded
  type text,                  -- 'import_order' | 'promotion'
  related_id uuid,            -- links to import_orders.id or promotions.id
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- 2. Add payment_id FK to import_orders (if column doesn't exist)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'import_orders' AND column_name = 'payment_id'
  ) THEN
    ALTER TABLE import_orders ADD COLUMN payment_id uuid REFERENCES payments(id);
  END IF;
END $$;

-- 3. Add payment_id FK to promotions (if column doesn't exist)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'promotions' AND column_name = 'payment_id'
  ) THEN
    ALTER TABLE promotions ADD COLUMN payment_id uuid REFERENCES payments(id);
  END IF;
END $$;

-- 4. Add promotion type + active flag if missing
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'promotions' AND column_name = 'is_active'
  ) THEN
    ALTER TABLE promotions ADD COLUMN is_active boolean DEFAULT false;
  END IF;
END $$;

-- 5. Ensure profiles has is_banned field (optional convenience)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'is_banned'
  ) THEN
    ALTER TABLE profiles ADD COLUMN is_banned boolean DEFAULT false;
  END IF;
END $$;

-- 6. Ensure listings has category + condition text columns
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'listings' AND column_name = 'category'
  ) THEN
    ALTER TABLE listings ADD COLUMN category text;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'listings' AND column_name = 'condition'
  ) THEN
    ALTER TABLE listings ADD COLUMN condition text;
  END IF;
END $$;

-- 7. Indexes for payment lookups
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_provider_ref ON payments(provider_reference);
CREATE INDEX IF NOT EXISTS idx_payments_type ON payments(type);

-- 8. Row-Level Security (RLS) for payments
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Users can see their own payments
CREATE POLICY IF NOT EXISTS "Users view own payments"
  ON payments FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own payments
CREATE POLICY IF NOT EXISTS "Users insert own payments"
  ON payments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Service role (webhooks) can update any payment
-- This is handled via supabaseAdmin (service role key)

-- Done!
