// ─── Profiles ────────────────────────────────────
export interface Profile {
  id: string
  full_name: string | null
  avatar_url: string | null
  phone: string | null
  role: 'user' | 'admin' | 'banned'
  created_at: string
}

// ─── Categories ──────────────────────────────────
export interface Category {
  id: string
  name: string
  slug: string
  created_at: string
}

// ─── Listings ────────────────────────────────────
export interface Listing {
  id: string
  user_id: string
  title: string
  description: string | null
  price: number | null
  category_id: string | null
  location: string | null
  status: 'active' | 'sold' | 'removed'
  created_at: string
  // joined fields (optional)
  images?: string[]
  category?: string
  condition?: string
  listing_images?: ListingImage[]
  profiles?: Profile
}

// ─── Listing Images ──────────────────────────────
export interface ListingImage {
  id: string
  listing_id: string
  image_url: string
}

// ─── Favorites ───────────────────────────────────
export interface Favorite {
  id: string
  user_id: string
  listing_id: string
}

// ─── Conversations ───────────────────────────────
export interface Conversation {
  id: string
  created_at: string
}

export interface ConversationParticipant {
  id: string
  conversation_id: string
  user_id: string
}

// ─── Messages ────────────────────────────────────
export interface Message {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  created_at: string
}

// ─── Import Requests ─────────────────────────────
export interface ImportRequest {
  id: string
  user_id: string
  product_name: string | null
  description: string | null
  reference_image_url: string | null
  product_url: string | null
  quantity: number | null
  shipping_method: string | null
  status: 'pending' | 'quoted' | 'approved' | 'rejected' | 'paid' | 'shipped' | 'delivered'
  created_at: string
  profiles?: Profile
}

// ─── Import Quotes ───────────────────────────────
export interface ImportQuote {
  id: string
  request_id: string
  product_cost: number | null
  shipping_cost: number | null
  service_fee: number | null
  total_cost: number | null
  estimated_days: number | null
  created_at: string
}

// ─── Import Orders ───────────────────────────────
export interface ImportOrder {
  id: string
  user_id: string
  quote_id: string
  tracking_number: string | null
  status: 'pending' | 'processing' | 'in_transit' | 'delivered'
  created_at: string
  import_quotes?: ImportQuote
  profiles?: Profile
}

// ─── Payments ────────────────────────────────────
export interface Payment {
  id: string
  user_id: string
  amount: number | null
  status: string | null
  created_at: string
}

// ─── Promotions ──────────────────────────────────
export interface Promotion {
  id: string
  listing_id: string
  type: string | null
  expires_at: string | null
}

// ─── Legacy compat aliases ───────────────────────
export type User = Profile
