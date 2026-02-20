// ─────────────────────────────────────────────────────────────────────────────
// EverydayAZA — Comprehensive Type Definitions
// Covers all 15 database tables + helper utilities
// ─────────────────────────────────────────────────────────────────────────────

// ─── Shared ──────────────────────────────────────────────────────────────────

/** ISO 8601 timestamp string from Supabase */
export type Timestamp = string

/** UUID string */
export type UUID = string

/** Nullable database column */
export type Nullable<T> = T | null

// ─── Profiles ────────────────────────────────────────────────────────────────

export type UserRole = 'user' | 'admin' | 'banned'

export interface Profile {
  id: UUID
  full_name: Nullable<string>
  email?: Nullable<string>
  avatar_url: Nullable<string>
  phone: Nullable<string>
  location: Nullable<string>
  role: UserRole
  created_at: Timestamp
  updated_at?: Timestamp
}

// ─── Categories ──────────────────────────────────────────────────────────────

export interface Category {
  id: UUID
  name: string
  slug: string
  description?: Nullable<string>
  icon?: Nullable<string>
  parent_id?: Nullable<UUID>
  listing_count?: number
  created_at: Timestamp
}

// ─── Listings ────────────────────────────────────────────────────────────────

export type ListingStatus = 'active' | 'sold' | 'removed' | 'flagged' | 'draft'
export type ListingCondition = 'new' | 'like_new' | 'used' | 'refurbished'

export interface Listing {
  id: UUID
  user_id: UUID
  title: string
  description: Nullable<string>
  price: Nullable<number>
  negotiable?: boolean
  category_id: Nullable<UUID>
  category?: Nullable<string>
  location: Nullable<string>
  condition: Nullable<ListingCondition>
  status: ListingStatus
  moderation_reason?: Nullable<string>
  views?: number
  created_at: Timestamp
  updated_at?: Timestamp
  // Joined fields
  images?: string[]
  listing_images?: ListingImage[]
  profiles?: Profile
  categories?: Category
}

export interface ListingImage {
  id: UUID
  listing_id: UUID
  image_url: string
  display_order?: number
  created_at?: Timestamp
}

// ─── Favorites ───────────────────────────────────────────────────────────────

export interface Favorite {
  id: UUID
  user_id: UUID
  listing_id: UUID
  created_at: Timestamp
  // Joined fields
  listings?: Listing
}

// ─── Conversations & Messages ─────────────────────────────────────────────────

export interface Conversation {
  id: UUID
  listing_id: UUID
  buyer_id: UUID
  seller_id: UUID
  last_message_at: Nullable<Timestamp>
  created_at: Timestamp
  // Joined fields
  listings?: Pick<Listing, 'id' | 'title' | 'price' | 'images'>
  buyer?: Profile
  seller?: Profile
  messages?: Message[]
  last_message?: string
  unread_count?: number
}

export interface Message {
  id: UUID
  conversation_id: UUID
  sender_id: UUID
  content: string
  read: boolean
  created_at: Timestamp
  // Joined fields
  sender?: Profile
}

// ─── Notifications ────────────────────────────────────────────────────────────

export interface Notification {
  id: UUID
  user_id: UUID
  type: 'new_message' | 'order_update' | 'quote_ready' | 'listing_flagged' | string
  title: string
  body: Nullable<string>
  metadata?: Record<string, unknown>
  read: boolean
  created_at: Timestamp
}

// ─── Import System ────────────────────────────────────────────────────────────

export type ImportRequestStatus =
  | 'pending'
  | 'ai_sourcing'
  | 'finding_supplier'
  | 'quoted'
  | 'approved'
  | 'rejected'
  | 'paid'
  | 'processing'
  | 'shipped'
  | 'delivered'

export type ShippingMethod = 'air_freight' | 'sea_freight' | 'express'

export interface ImportRequest {
  id: UUID
  user_id: UUID
  title: Nullable<string>
  product_name?: Nullable<string>
  description: Nullable<string>
  reference_image_url: Nullable<string>
  product_url: Nullable<string>
  quantity: Nullable<number>
  destination_country?: Nullable<string>
  preferred_shipping: Nullable<ShippingMethod>
  status: ImportRequestStatus
  ai_processed?: boolean
  created_at: Timestamp
  // Joined fields
  profiles?: Profile
  import_quotes?: ImportQuote[]
}

export interface Supplier {
  name: string
  country: string
  flag: string
  rating?: number
}

export interface ImportQuote {
  id: UUID
  request_id: UUID
  supplier_name?: Nullable<string>
  supplier_country?: Nullable<string>
  product_cost: Nullable<number>
  shipping_cost: Nullable<number>
  service_fee: Nullable<number>
  total_cost: Nullable<number>
  delivery_days: Nullable<number>
  /** @deprecated Use delivery_days */
  estimated_days?: Nullable<number>
  currency?: string
  notes?: Nullable<string>
  expires_at?: Nullable<Timestamp>
  created_at: Timestamp
  // Joined fields
  import_requests?: ImportRequest
}

export type OrderShippingStatus =
  | 'payment_confirmed'
  | 'order_placed'
  | 'processing'
  | 'dispatched'
  | 'in_transit'
  | 'customs_clearance'
  | 'arrived_country'
  | 'out_for_delivery'
  | 'delivered'

export interface ImportOrder {
  id: UUID
  user_id: UUID
  quote_id: UUID
  tracking_number: Nullable<string>
  shipping_status: Nullable<OrderShippingStatus>
  payment_status?: 'pending' | 'paid' | 'failed'
  estimated_delivery?: Nullable<Timestamp>
  delivered_at?: Nullable<Timestamp>
  created_at: Timestamp
  // Joined fields
  import_quotes?: ImportQuote
  profiles?: Profile
  import_tracking_events?: ImportTrackingEvent[]
}

export interface ImportTrackingEvent {
  id: UUID
  order_id: UUID
  status: OrderShippingStatus
  description: Nullable<string>
  created_at: Timestamp
}

// ─── Payments ────────────────────────────────────────────────────────────────

export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded'
export type PaymentProvider = 'paystack' | 'flutterwave' | 'manual'

export interface Payment {
  id: UUID
  user_id: UUID
  order_id?: Nullable<UUID>
  reference: Nullable<string>
  amount: Nullable<number>
  currency?: string
  provider?: PaymentProvider
  status: PaymentStatus
  paid_at?: Nullable<Timestamp>
  metadata?: Record<string, unknown>
  created_at: Timestamp
}

// ─── Moderation ──────────────────────────────────────────────────────────────

export type ReportReason =
  | 'scam'
  | 'spam'
  | 'prohibited_item'
  | 'counterfeit'
  | 'inappropriate'
  | 'other'

export interface Report {
  id: UUID
  reporter_id: UUID
  target_id: UUID
  target_type: 'listing' | 'user' | 'message'
  reason: ReportReason
  description: Nullable<string>
  status: 'open' | 'reviewed' | 'dismissed'
  created_at: Timestamp
}

export interface AdminAction {
  id: UUID
  admin_id?: Nullable<UUID>
  action_type: 'ban_user' | 'remove_listing' | 'approve_import' | 'auto_flag' | string
  target_id: UUID
  target_type: 'user' | 'listing' | 'import' | string
  reason: Nullable<string>
  created_at: Timestamp
}

// ─── Promotions ──────────────────────────────────────────────────────────────

export interface Promotion {
  id: UUID
  listing_id: UUID
  type: 'featured' | 'spotlight' | 'top' | string | null
  starts_at?: Nullable<Timestamp>
  expires_at: Nullable<Timestamp>
  created_at?: Timestamp
}

// ─── Legacy compat aliases ────────────────────────────────────────────────────

/** @deprecated Use Profile instead */
export type User = Profile

/** @deprecated Use ConversationParticipant from conversations table */
export interface ConversationParticipant {
  id: UUID
  conversation_id: UUID
  user_id: UUID
}

// ─── Supabase Database type map (for typed queries) ───────────────────────────

export interface Database {
  public: {
    Tables: {
      profiles:               { Row: Profile }
      categories:             { Row: Category }
      listings:               { Row: Listing }
      listing_images:         { Row: ListingImage }
      favorites:              { Row: Favorite }
      conversations:          { Row: Conversation }
      messages:               { Row: Message }
      notifications:          { Row: Notification }
      import_requests:        { Row: ImportRequest }
      import_quotes:          { Row: ImportQuote }
      import_orders:          { Row: ImportOrder }
      import_tracking_events: { Row: ImportTrackingEvent }
      payments:               { Row: Payment }
      reports:                { Row: Report }
      admin_actions:          { Row: AdminAction }
      promotions:             { Row: Promotion }
    }
  }
}
