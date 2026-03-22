export type UserRole = "admin" | "seller" | "buyer" | "affiliate" | "moderator" | "host" | "brand_partner" | "vendor" | "viewer"

export interface User {
  id: string
  email: string
  display_name: string
  avatar_url?: string
  role: UserRole
  status: "active" | "inactive" | "suspended"
  created_at: string
  updated_at: string
}

export interface LiveStream {
  id: string
  host_id: string
  title: string
  description?: string
  room_name: string
  status: "scheduled" | "live" | "ended"
  scheduled_at?: string
  started_at?: string
  ended_at?: string
  thumbnail_url?: string
  viewer_count: number
  is_public: boolean
  created_at: string
  updated_at: string
}

export interface StreamParticipant {
  id: string
  stream_id: string
  user_id: string
  role: "host" | "guest" | "moderator" | "viewer"
  joined_at: string
  left_at?: string
}

export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  admin: ["manage_users", "manage_streams", "moderate_chat", "view_analytics", "manage_roles", "manage_products", "manage_orders", "view_reports"],
  host: ["create_stream", "manage_own_stream", "view_own_analytics", "invite_guests", "manage_own_products"],
  seller: ["manage_products", "manage_own_orders", "view_sales", "manage_inventory"],
  brand_partner: ["create_stream", "view_analytics", "manage_campaigns", "manage_products"],
  vendor: ["manage_products", "view_sales"],
  affiliate: ["view_commissions", "manage_network"],
  moderator: ["moderate_chat", "manage_viewers"],
  buyer: ["watch_streams", "chat", "purchase_products", "leave_reviews"],
  viewer: ["watch_streams", "chat"],
}

// ==================== PRODUCT TYPES ====================
export interface Product {
  id: string
  seller_id: string
  title: string
  description?: string
  short_description?: string
  price: number
  sku?: string
  category: string
  subcategory?: string
  images: string[]
  thumbnail_url?: string
  status: "active" | "inactive" | "archived"
  is_featured: boolean
  rating_avg: number
  review_count: number
  created_at: string
  updated_at: string
  deleted_at?: string
}

export interface ProductInventory {
  id: string
  product_id: string
  quantity_available: number
  quantity_reserved: number
  quantity_sold: number
  low_stock_threshold: number
  reorder_point: number
  last_restocked_at?: string
  created_at: string
  updated_at: string
}

// ==================== ORDER TYPES ====================
export interface Address {
  street: string
  city: string
  state: string
  postal_code: string
  country: string
  full_name?: string
  phone?: string
}

export interface Order {
  id: string
  buyer_id: string
  stream_id?: string
  order_number: string
  status: "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled" | "refunded"
  subtotal: number
  discount_amount: number
  tax_amount: number
  total_amount: number
  coupon_code?: string
  shipping_address?: Address
  billing_address?: Address
  notes?: string
  created_at: string
  updated_at: string
  shipped_at?: string
  delivered_at?: string
  cancelled_at?: string
  deleted_at?: string
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  seller_id: string
  quantity: number
  unit_price: number
  subtotal: number
  discount_amount: number
  final_price: number
  created_at: string
}

// ==================== PAYMENT TYPES ====================
export interface Payment {
  id: string
  order_id: string
  buyer_id: string
  stripe_payment_intent_id?: string
  amount: number
  currency: string
  status: "pending" | "processing" | "succeeded" | "failed" | "cancelled" | "refunded"
  payment_method?: string
  transaction_id?: string
  metadata?: Record<string, any>
  error_message?: string
  created_at: string
  updated_at: string
  completed_at?: string
}

// ==================== REVIEW TYPES ====================
export interface ProductReview {
  id: string
  product_id: string
  buyer_id: string
  order_item_id?: string
  rating: number
  title?: string
  content?: string
  images?: string[]
  helpful_count: number
  unhelpful_count: number
  verified_purchase: boolean
  status: "pending" | "approved" | "rejected"
  created_at: string
  updated_at: string
  deleted_at?: string
}

// ==================== NOTIFICATION TYPES ====================
export interface Notification {
  id: string
  user_id: string
  type: string
  title: string
  content?: string
  action_url?: string
  data?: Record<string, any>
  is_read: boolean
  created_at: string
  read_at?: string
}

export interface UserPreferences {
  id: string
  user_id: string
  email_notifications: boolean
  push_notifications: boolean
  stream_notifications: boolean
  new_product_notifications: boolean
  order_notifications: boolean
  newsletter_subscribed: boolean
  preferred_categories: string[]
  language: string
  theme: "light" | "dark" | "system"
  created_at: string
  updated_at: string
}

// ==================== ROLE & COMMISSION TYPES ====================
export interface UserRoleRecord {
  id: string
  user_id: string
  role: UserRole
  status: "active" | "inactive" | "suspended" | "banned"
  verified: boolean
  verification_date?: string
  commission_rate: number
  total_sales: number
  created_at: string
  updated_at: string
}

export interface Commission {
  id: string
  user_id: string
  order_item_id: string
  commission_amount: number
  commission_rate: number
  status: "pending" | "approved" | "paid" | "disputed"
  payout_id?: string
  created_at: string
  paid_at?: string
}

export interface Payout {
  id: string
  user_id: string
  amount: number
  status: "pending" | "processing" | "completed" | "failed"
  payout_method?: string
  external_reference_id?: string
  period_start: string
  period_end: string
  created_at: string
  processed_at?: string
}

// ==================== STREAM PRODUCT TYPES ====================
export interface StreamProduct {
  id: string
  stream_id: string
  product_id: string
  featured_position?: number
  special_discount?: number
  quantity_available_in_stream?: number
  created_at: string
}

// ==================== AUDIT LOG TYPES ====================
export interface AuditLog {
  id: string
  user_id?: string
  action: string
  entity_type?: string
  entity_id?: string
  old_values?: Record<string, any>
  new_values?: Record<string, any>
  ip_address?: string
  user_agent?: string
  status: "success" | "failure" | "warning"
  error_message?: string
  created_at: string
}

// ==================== INVENTORY TYPES ====================
export interface StockLevel {
  id: string
  product_id: string
  warehouse_id?: string
  quantity_on_hand: number
  quantity_reserved: number
  quantity_available: number
  reorder_point: number
  reorder_quantity: number
  last_counted_at?: string
  created_at: string
  updated_at: string
}

export interface StockReservation {
  id: string
  product_id: string
  order_id?: string
  cart_session_id?: string
  user_id: string
  quantity: number
  expires_at: string
  created_at: string
  used_at?: string
  cancelled_at?: string
}

export interface StockMovement {
  id: string
  product_id: string
  warehouse_id?: string
  movement_type: "inbound" | "outbound" | "adjustment" | "count" | "return"
  quantity: number
  reference_id?: string
  reference_type?: string
  notes?: string
  user_id?: string
  created_at: string
}

export interface LiveEventProduct {
  id: string
  event_id: string
  product_id: string
  featured_position?: number
  special_discount?: number
  quantity_available: number
  quantity_sold: number
  spotlight_start?: string
  spotlight_end?: string
  created_at: string
  updated_at: string
}

export interface LiveEvent {
  id: string
  host_id: string
  room_name: string
  title: string
  description?: string
  status: "scheduled" | "live" | "ended"
  scheduled_at?: string
  started_at?: string
  ended_at?: string
  thumbnail_url?: string
  viewer_count: number
  is_public: boolean
  created_at: string
  updated_at: string
}

export interface InventoryAudit {
  id: string
  product_id: string
  warehouse_id?: string
  action: "create" | "update" | "delete" | "reserve" | "release" | "sell" | "return" | "adjust"
  old_values: Record<string, any>
  new_values: Record<string, any>
  user_id?: string
  ip_address?: string
  created_at: string
}
