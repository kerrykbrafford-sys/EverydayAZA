-- =====================================================
-- IMPORT AGENT SYSTEM MIGRATION
-- Run in Supabase Dashboard → SQL Editor
-- =====================================================

-- 1. Add new columns to import_requests
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='import_requests' AND column_name='title') THEN
    ALTER TABLE import_requests ADD COLUMN title text;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='import_requests' AND column_name='description') THEN
    ALTER TABLE import_requests ADD COLUMN description text;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='import_requests' AND column_name='destination_country') THEN
    ALTER TABLE import_requests ADD COLUMN destination_country text DEFAULT 'Ghana';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='import_requests' AND column_name='preferred_shipping') THEN
    ALTER TABLE import_requests ADD COLUMN preferred_shipping text DEFAULT 'air';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='import_requests' AND column_name='ai_processed') THEN
    ALTER TABLE import_requests ADD COLUMN ai_processed boolean DEFAULT false;
  END IF;
END $$;

-- 2. Add new columns to import_quotes
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='import_quotes' AND column_name='supplier_name') THEN
    ALTER TABLE import_quotes ADD COLUMN supplier_name text;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='import_quotes' AND column_name='supplier_country') THEN
    ALTER TABLE import_quotes ADD COLUMN supplier_country text;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='import_quotes' AND column_name='shipping_method') THEN
    ALTER TABLE import_quotes ADD COLUMN shipping_method text DEFAULT 'air';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='import_quotes' AND column_name='delivery_days') THEN
    ALTER TABLE import_quotes ADD COLUMN delivery_days int;
  END IF;
END $$;

-- 3. Add new columns to import_orders
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='import_orders' AND column_name='request_id') THEN
    ALTER TABLE import_orders ADD COLUMN request_id uuid REFERENCES import_requests(id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='import_orders' AND column_name='payment_status') THEN
    ALTER TABLE import_orders ADD COLUMN payment_status text DEFAULT 'pending';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='import_orders' AND column_name='shipping_status') THEN
    ALTER TABLE import_orders ADD COLUMN shipping_status text DEFAULT 'awaiting_supplier';
  END IF;
END $$;

-- 4. Create import_tracking_events table
CREATE TABLE IF NOT EXISTS import_tracking_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES import_orders(id) ON DELETE CASCADE,
  status text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE import_tracking_events ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='import_tracking_events' AND policyname='Users view own tracking events') THEN
    CREATE POLICY "Users view own tracking events"
      ON import_tracking_events FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM import_orders
          WHERE import_orders.id = import_tracking_events.order_id
          AND import_orders.user_id = auth.uid()
        )
      );
  END IF;
END $$;

-- 5. RLS policies for quotes (users can see their own request's quotes)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='import_quotes' AND policyname='Users view quotes for own requests') THEN
    CREATE POLICY "Users view quotes for own requests"
      ON import_quotes FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM import_requests
          WHERE import_requests.id = import_quotes.request_id
          AND import_requests.user_id = auth.uid()
        )
      );
  END IF;
END $$;

-- 6. Indexes
CREATE INDEX IF NOT EXISTS idx_import_requests_user ON import_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_import_requests_ai ON import_requests(ai_processed);
CREATE INDEX IF NOT EXISTS idx_import_quotes_request ON import_quotes(request_id);
CREATE INDEX IF NOT EXISTS idx_import_tracking_order ON import_tracking_events(order_id);
