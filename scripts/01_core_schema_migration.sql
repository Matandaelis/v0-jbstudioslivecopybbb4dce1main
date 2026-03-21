-- Core Schema Migration for Live Shopping Platform
-- This migration adds all core tables for product management, orders, payments, and transactions

-- Products Table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title varchar(255) NOT NULL,
  description text,
  short_description varchar(500),
  price decimal(10, 2) NOT NULL CHECK (price >= 0),
  sku varchar(100) UNIQUE,
  category varchar(100) NOT NULL,
  subcategory varchar(100),
  images jsonb DEFAULT '[]', -- Array of image URLs
  thumbnail_url text,
  status varchar(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived')),
  is_featured boolean DEFAULT false,
  rating_avg numeric(3,2) DEFAULT 0 CHECK (rating_avg >= 0 AND rating_avg <= 5),
  review_count integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  deleted_at timestamp with time zone
);

-- Product Inventory Table
CREATE TABLE IF NOT EXISTS product_inventory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity_available integer NOT NULL DEFAULT 0 CHECK (quantity_available >= 0),
  quantity_reserved integer NOT NULL DEFAULT 0 CHECK (quantity_reserved >= 0),
  quantity_sold integer NOT NULL DEFAULT 0 CHECK (quantity_sold >= 0),
  low_stock_threshold integer DEFAULT 10,
  reorder_point integer DEFAULT 5,
  last_restocked_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT valid_inventory CHECK ((quantity_available + quantity_reserved) >= quantity_reserved)
);

-- Orders Table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stream_id uuid REFERENCES streams(id) ON DELETE SET NULL,
  order_number varchar(50) UNIQUE NOT NULL,
  status varchar(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')),
  subtotal decimal(12, 2) NOT NULL DEFAULT 0 CHECK (subtotal >= 0),
  discount_amount decimal(12, 2) NOT NULL DEFAULT 0 CHECK (discount_amount >= 0),
  tax_amount decimal(12, 2) NOT NULL DEFAULT 0 CHECK (tax_amount >= 0),
  total_amount decimal(12, 2) NOT NULL DEFAULT 0 CHECK (total_amount >= 0),
  coupon_code varchar(50),
  shipping_address jsonb,
  billing_address jsonb,
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  shipped_at timestamp with time zone,
  delivered_at timestamp with time zone,
  cancelled_at timestamp with time zone,
  deleted_at timestamp with time zone
);

-- Order Items Table
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  seller_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  quantity integer NOT NULL DEFAULT 1 CHECK (quantity > 0),
  unit_price decimal(10, 2) NOT NULL CHECK (unit_price >= 0),
  subtotal decimal(12, 2) NOT NULL CHECK (subtotal >= 0),
  discount_amount decimal(12, 2) NOT NULL DEFAULT 0,
  final_price decimal(12, 2) NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Payments Table
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  buyer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_payment_intent_id varchar(255) UNIQUE,
  amount decimal(12, 2) NOT NULL CHECK (amount >= 0),
  currency varchar(3) DEFAULT 'USD',
  status varchar(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'succeeded', 'failed', 'cancelled', 'refunded')),
  payment_method varchar(50), -- 'card', 'bank_transfer', etc.
  transaction_id varchar(255),
  metadata jsonb,
  error_message text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  completed_at timestamp with time zone
);

-- Product Reviews Table
CREATE TABLE IF NOT EXISTS product_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  buyer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_item_id uuid REFERENCES order_items(id) ON DELETE SET NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title varchar(255),
  content text,
  images jsonb DEFAULT '[]',
  helpful_count integer DEFAULT 0,
  unhelpful_count integer DEFAULT 0,
  verified_purchase boolean DEFAULT false,
  status varchar(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  deleted_at timestamp with time zone
);

-- Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type varchar(50) NOT NULL, -- 'order_update', 'stream_started', 'new_product', etc.
  title varchar(255) NOT NULL,
  content text,
  action_url text,
  data jsonb,
  is_read boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  read_at timestamp with time zone
);

-- User Preferences Table
CREATE TABLE IF NOT EXISTS user_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email_notifications boolean DEFAULT true,
  push_notifications boolean DEFAULT true,
  stream_notifications boolean DEFAULT true,
  new_product_notifications boolean DEFAULT true,
  order_notifications boolean DEFAULT true,
  newsletter_subscribed boolean DEFAULT true,
  preferred_categories jsonb DEFAULT '[]',
  language varchar(5) DEFAULT 'en',
  theme varchar(20) DEFAULT 'system',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Stream Products Junction Table (many-to-many)
CREATE TABLE IF NOT EXISTS stream_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stream_id uuid NOT NULL REFERENCES streams(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  featured_position integer,
  special_discount numeric(5,2), -- Discount percentage for this stream
  quantity_available_in_stream integer, -- Limited quantity for this stream
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(stream_id, product_id)
);

-- Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action varchar(255) NOT NULL,
  entity_type varchar(100), -- 'product', 'order', 'payment', etc.
  entity_id uuid,
  old_values jsonb,
  new_values jsonb,
  ip_address inet,
  user_agent text,
  status varchar(50) DEFAULT 'success', -- 'success', 'failure', 'warning'
  error_message text,
  created_at timestamp with time zone DEFAULT now()
);

-- User Roles Table (enhanced from original)
CREATE TABLE IF NOT EXISTS user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  role varchar(50) NOT NULL DEFAULT 'buyer' CHECK (role IN ('admin', 'seller', 'buyer', 'affiliate', 'moderator')),
  status varchar(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended', 'banned')),
  verified boolean DEFAULT false,
  verification_date timestamp with time zone,
  commission_rate numeric(5,2) DEFAULT 0 CHECK (commission_rate >= 0 AND commission_rate <= 100), -- For sellers
  total_sales decimal(15, 2) DEFAULT 0, -- For sellers
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Commission Tracking Table (for sellers and affiliates)
CREATE TABLE IF NOT EXISTS commissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_item_id uuid NOT NULL REFERENCES order_items(id) ON DELETE CASCADE,
  commission_amount decimal(12, 2) NOT NULL CHECK (commission_amount >= 0),
  commission_rate numeric(5,2) NOT NULL,
  status varchar(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid', 'disputed')),
  payout_id uuid REFERENCES payouts(id),
  created_at timestamp with time zone DEFAULT now(),
  paid_at timestamp with time zone
);

-- Payouts Table (for seller/affiliate earnings)
CREATE TABLE IF NOT EXISTS payouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount decimal(15, 2) NOT NULL CHECK (amount >= 0),
  status varchar(50) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  payout_method varchar(50), -- 'stripe', 'bank_transfer', etc.
  external_reference_id varchar(255),
  period_start date NOT NULL,
  period_end date NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  processed_at timestamp with time zone
);

-- Create indices for better query performance
CREATE INDEX idx_products_seller_id ON products(seller_id);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_is_featured ON products(is_featured);
CREATE INDEX idx_products_created_at ON products(created_at DESC);
CREATE INDEX idx_products_deleted_at ON products(deleted_at);

CREATE INDEX idx_product_inventory_product_id ON product_inventory(product_id);
CREATE INDEX idx_product_inventory_low_stock ON product_inventory(quantity_available) WHERE quantity_available <= low_stock_threshold;

CREATE INDEX idx_orders_buyer_id ON orders(buyer_id);
CREATE INDEX idx_orders_stream_id ON orders(stream_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX idx_orders_order_number ON orders(order_number);
CREATE INDEX idx_orders_deleted_at ON orders(deleted_at);
CREATE INDEX idx_orders_buyer_status ON orders(buyer_id, status);

CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);
CREATE INDEX idx_order_items_seller_id ON order_items(seller_id);

CREATE INDEX idx_payments_order_id ON payments(order_id);
CREATE INDEX idx_payments_buyer_id ON payments(buyer_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_stripe_payment_intent ON payments(stripe_payment_intent_id);
CREATE INDEX idx_payments_created_at ON payments(created_at DESC);

CREATE INDEX idx_reviews_product_id ON product_reviews(product_id);
CREATE INDEX idx_reviews_buyer_id ON product_reviews(buyer_id);
CREATE INDEX idx_reviews_status ON product_reviews(status);
CREATE INDEX idx_reviews_deleted_at ON product_reviews(deleted_at);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(user_id, is_read);
CREATE INDEX idx_notifications_created_at ON notifications(user_id, created_at DESC);

CREATE INDEX idx_stream_products_stream_id ON stream_products(stream_id);
CREATE INDEX idx_stream_products_product_id ON stream_products(product_id);

CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);

CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX idx_user_roles_role ON user_roles(role);
CREATE INDEX idx_user_roles_status ON user_roles(status);

CREATE INDEX idx_commissions_user_id ON commissions(user_id);
CREATE INDEX idx_commissions_status ON commissions(status);
CREATE INDEX idx_commissions_created_at ON commissions(created_at DESC);

CREATE INDEX idx_payouts_user_id ON payouts(user_id);
CREATE INDEX idx_payouts_status ON payouts(status);
CREATE INDEX idx_payouts_created_at ON payouts(created_at DESC);

-- Enable Row Level Security on all tables
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE stream_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payouts ENABLE ROW LEVEL SECURITY;
