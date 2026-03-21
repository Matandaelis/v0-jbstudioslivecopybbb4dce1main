-- Row Level Security Policies for Live Shopping Platform
-- This script implements comprehensive RLS policies for all tables

-- ==================== PRODUCTS TABLE POLICIES ====================
-- Anyone can view active products
CREATE POLICY "products_select_public" ON products
  FOR SELECT USING (
    status = 'active' AND deleted_at IS NULL
  );

-- Sellers can view their own products
CREATE POLICY "products_select_seller_own" ON products
  FOR SELECT USING (
    auth.uid() = seller_id AND deleted_at IS NULL
  );

-- Admins can view all products
CREATE POLICY "products_select_admin" ON products
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Sellers can insert their own products
CREATE POLICY "products_insert_seller" ON products
  FOR INSERT WITH CHECK (
    auth.uid() = seller_id AND
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role IN ('seller', 'admin')
    )
  );

-- Sellers can update their own products
CREATE POLICY "products_update_seller" ON products
  FOR UPDATE USING (
    auth.uid() = seller_id
  ) WITH CHECK (
    auth.uid() = seller_id AND
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role IN ('seller', 'admin')
    )
  );

-- Sellers can soft delete their products
CREATE POLICY "products_delete_seller" ON products
  FOR UPDATE USING (
    auth.uid() = seller_id
  ) WITH CHECK (
    auth.uid() = seller_id
  );

-- ==================== PRODUCT INVENTORY TABLE POLICIES ====================
-- Sellers can view inventory for their products
CREATE POLICY "product_inventory_select_seller" ON product_inventory
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM products
      WHERE id = product_id AND seller_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Sellers can update inventory for their products
CREATE POLICY "product_inventory_update_seller" ON product_inventory
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM products
      WHERE id = product_id AND seller_id = auth.uid()
    )
  );

-- ==================== ORDERS TABLE POLICIES ====================
-- Buyers can view their own orders
CREATE POLICY "orders_select_buyer" ON orders
  FOR SELECT USING (
    auth.uid() = buyer_id
  );

-- Sellers can view orders containing their products
CREATE POLICY "orders_select_seller" ON orders
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM order_items
      WHERE order_id = id AND seller_id = auth.uid()
    )
  );

-- Admins can view all orders
CREATE POLICY "orders_select_admin" ON orders
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Buyers can insert orders
CREATE POLICY "orders_insert_buyer" ON orders
  FOR INSERT WITH CHECK (
    auth.uid() = buyer_id
  );

-- Buyers can update their pending orders
CREATE POLICY "orders_update_buyer" ON orders
  FOR UPDATE USING (
    auth.uid() = buyer_id AND status IN ('pending', 'confirmed')
  );

-- ==================== ORDER ITEMS TABLE POLICIES ====================
-- Buyers can view order items from their orders
CREATE POLICY "order_items_select_buyer" ON order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE id = order_id AND buyer_id = auth.uid()
    )
  );

-- Sellers can view order items they sold
CREATE POLICY "order_items_select_seller" ON order_items
  FOR SELECT USING (
    auth.uid() = seller_id
  );

-- Admins can view all order items
CREATE POLICY "order_items_select_admin" ON order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- ==================== PAYMENTS TABLE POLICIES ====================
-- Users can view their own payments
CREATE POLICY "payments_select_own" ON payments
  FOR SELECT USING (
    auth.uid() = buyer_id
  );

-- Admins can view all payments
CREATE POLICY "payments_select_admin" ON payments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- System can insert payments (via RPC or API)
CREATE POLICY "payments_insert_system" ON payments
  FOR INSERT WITH CHECK (true);

-- Only admins can update payments
CREATE POLICY "payments_update_admin" ON payments
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- ==================== PRODUCT REVIEWS TABLE POLICIES ====================
-- Anyone can view approved reviews
CREATE POLICY "reviews_select_approved" ON product_reviews
  FOR SELECT USING (
    status = 'approved' AND deleted_at IS NULL
  );

-- Buyers can view their own pending/rejected reviews
CREATE POLICY "reviews_select_own" ON product_reviews
  FOR SELECT USING (
    auth.uid() = buyer_id AND deleted_at IS NULL
  );

-- Admins can view all reviews
CREATE POLICY "reviews_select_admin" ON product_reviews
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Buyers can insert reviews for products they purchased
CREATE POLICY "reviews_insert_buyer" ON product_reviews
  FOR INSERT WITH CHECK (
    auth.uid() = buyer_id AND
    EXISTS (
      SELECT 1 FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      WHERE oi.product_id = product_reviews.product_id
      AND o.buyer_id = auth.uid()
      AND oi.id = order_item_id
    )
  );

-- Buyers can update their own reviews
CREATE POLICY "reviews_update_buyer" ON product_reviews
  FOR UPDATE USING (
    auth.uid() = buyer_id
  ) WITH CHECK (
    auth.uid() = buyer_id
  );

-- ==================== NOTIFICATIONS TABLE POLICIES ====================
-- Users can only view their own notifications
CREATE POLICY "notifications_select_own" ON notifications
  FOR SELECT USING (
    auth.uid() = user_id
  );

-- System can insert notifications
CREATE POLICY "notifications_insert_system" ON notifications
  FOR INSERT WITH CHECK (true);

-- Users can update their own notifications (mark as read)
CREATE POLICY "notifications_update_own" ON notifications
  FOR UPDATE USING (
    auth.uid() = user_id
  ) WITH CHECK (
    auth.uid() = user_id
  );

-- ==================== USER PREFERENCES TABLE POLICIES ====================
-- Users can only view their own preferences
CREATE POLICY "preferences_select_own" ON user_preferences
  FOR SELECT USING (
    auth.uid() = user_id
  );

-- Users can insert their own preferences
CREATE POLICY "preferences_insert_own" ON user_preferences
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
  );

-- Users can update their own preferences
CREATE POLICY "preferences_update_own" ON user_preferences
  FOR UPDATE USING (
    auth.uid() = user_id
  ) WITH CHECK (
    auth.uid() = user_id
  );

-- ==================== STREAM PRODUCTS TABLE POLICIES ====================
-- Anyone can view stream products for active streams
CREATE POLICY "stream_products_select_public" ON stream_products
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM streams
      WHERE id = stream_id AND is_active = true
    )
  );

-- ==================== AUDIT LOGS TABLE POLICIES ====================
-- Only admins can view audit logs
CREATE POLICY "audit_logs_select_admin" ON audit_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- System can insert audit logs
CREATE POLICY "audit_logs_insert_system" ON audit_logs
  FOR INSERT WITH CHECK (true);

-- ==================== USER ROLES TABLE POLICIES ====================
-- Users can view their own role
CREATE POLICY "user_roles_select_own" ON user_roles
  FOR SELECT USING (
    auth.uid() = user_id
  );

-- Admins can view all roles
CREATE POLICY "user_roles_select_admin" ON user_roles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
    )
  );

-- Only admins can update roles
CREATE POLICY "user_roles_update_admin" ON user_roles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- ==================== COMMISSIONS TABLE POLICIES ====================
-- Sellers can view their own commissions
CREATE POLICY "commissions_select_seller" ON commissions
  FOR SELECT USING (
    auth.uid() = user_id
  );

-- Admins can view all commissions
CREATE POLICY "commissions_select_admin" ON commissions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- ==================== PAYOUTS TABLE POLICIES ====================
-- Sellers can view their own payouts
CREATE POLICY "payouts_select_seller" ON payouts
  FOR SELECT USING (
    auth.uid() = user_id
  );

-- Admins can view all payouts
CREATE POLICY "payouts_select_admin" ON payouts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Only admins can update payouts
CREATE POLICY "payouts_update_admin" ON payouts
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );
