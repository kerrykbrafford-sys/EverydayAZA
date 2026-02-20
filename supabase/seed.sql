-- ============================================================
-- EverydayAZA — Seed Data
-- Run: npx supabase db push && psql < seed.sql
-- ============================================================

-- ─── Categories ────────────────────────────────────────────
insert into categories (name, slug, description, icon) values
  ('Electronics',      'electronics',  'Phones, laptops, TVs & gadgets',        '📱'),
  ('Fashion',          'fashion',      'Clothing, shoes & accessories',          '👗'),
  ('Vehicles',         'vehicles',     'Cars, bikes, trucks & spare parts',      '🚗'),
  ('Property',         'property',     'Houses, apartments & land',              '🏠'),
  ('Furniture & Home', 'furniture',    'Home décor, furniture & appliances',     '🛋️'),
  ('Agriculture',      'agriculture',  'Farm produce, tools & equipment',        '🌾'),
  ('Health & Beauty',  'health',       'Wellness, skincare & personal care',     '💊'),
  ('Sports & Outdoors','sports',       'Fitness gear, bikes & outdoor items',    '⚽'),
  ('Books & Education','books',        'Textbooks, courses & stationery',        '📚'),
  ('Food & Drinks',    'food',         'Groceries, drinks & fresh produce',      '🍎'),
  ('Babies & Kids',    'babies',       'Toys, baby clothes & children''s gear',  '👶'),
  ('Services',         'services',     'Freelance, professional & home services','🔧')
on conflict (slug) do nothing;
