-- Triggers and Functions for Live Shopping Platform
-- This script creates triggers for automatic updates, validation, and audit logging

-- ==================== AUDIT LOGGING FUNCTION ====================
CREATE OR REPLACE FUNCTION audit_log_trigger()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_logs (
    user_id,
    action,
    entity_type,
    entity_id,
    old_values,
    new_values,
    status
  ) VALUES (
    auth.uid(),
    TG_ARGV[0],
    TG_ARGV[1],
    CASE 
      WHEN TG_OP = 'DELETE' THEN OLD.id
      ELSE NEW.id
    END,
    CASE WHEN TG_OP = 'DELETE' OR TG_OP = 'UPDATE' THEN row_to_json(OLD) ELSE NULL END,
    CASE WHEN TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN row_to_json(NEW) ELSE NULL END,
    'success'
  );
  RETURN CASE WHEN TG_OP = 'DELETE' THEN OLD ELSE NEW END;
END;
$$ LANGUAGE plpgsql;

-- Attach audit logging to critical tables
CREATE TRIGGER audit_products_trigger AFTER INSERT OR UPDATE OR DELETE ON products
  FOR EACH ROW EXECUTE FUNCTION audit_log_trigger('product_change', 'products');

CREATE TRIGGER audit_orders_trigger AFTER INSERT OR UPDATE OR DELETE ON orders
  FOR EACH ROW EXECUTE FUNCTION audit_log_trigger('order_change', 'orders');

CREATE TRIGGER audit_payments_trigger AFTER INSERT OR UPDATE OR DELETE ON payments
  FOR EACH ROW EXECUTE FUNCTION audit_log_trigger('payment_change', 'payments');

-- ==================== UPDATED_AT TIMESTAMP FUNCTION ====================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach updated_at triggers
CREATE TRIGGER products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER product_inventory_updated_at BEFORE UPDATE ON product_inventory
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER payments_updated_at BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER product_reviews_updated_at BEFORE UPDATE ON product_reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER user_preferences_updated_at BEFORE UPDATE ON user_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER user_roles_updated_at BEFORE UPDATE ON user_roles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==================== ORDER STATUS CHANGE FUNCTION ====================
CREATE OR REPLACE FUNCTION on_order_status_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Create notification when order status changes
  IF NEW.status != OLD.status THEN
    INSERT INTO notifications (user_id, type, title, content, data)
    VALUES (
      NEW.buyer_id,
      'order_status_updated',
      'Order Status Changed',
      'Your order #' || NEW.order_number || ' is now ' || NEW.status,
      jsonb_build_object(
        'order_id', NEW.id,
        'order_number', NEW.order_number,
        'status', NEW.status
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER order_status_notification AFTER UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION on_order_status_change();

-- ==================== PAYMENT CONFIRMATION FUNCTION ====================
CREATE OR REPLACE FUNCTION on_payment_completed()
RETURNS TRIGGER AS $$
BEGIN
  -- When payment succeeds, update order status
  IF NEW.status = 'succeeded' AND OLD.status != 'succeeded' THEN
    UPDATE orders SET status = 'confirmed' WHERE id = NEW.order_id;
    
    -- Notify buyer
    INSERT INTO notifications (user_id, type, title, content, data)
    VALUES (
      NEW.buyer_id,
      'payment_succeeded',
      'Payment Confirmed',
      'Your payment has been processed successfully',
      jsonb_build_object(
        'order_id', NEW.order_id,
        'amount', NEW.amount
      )
    );
  END IF;
  
  -- When payment fails, notify buyer
  IF NEW.status = 'failed' AND OLD.status != 'failed' THEN
    INSERT INTO notifications (user_id, type, title, content, data)
    VALUES (
      NEW.buyer_id,
      'payment_failed',
      'Payment Failed',
      'Your payment could not be processed. Please try again.',
      jsonb_build_object(
        'order_id', NEW.order_id,
        'error', NEW.error_message
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER payment_status_notification AFTER UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION on_payment_completed();

-- ==================== UPDATE PRODUCT RATING FUNCTION ====================
CREATE OR REPLACE FUNCTION update_product_rating()
RETURNS TRIGGER AS $$
BEGIN
  -- Update product rating when a review is approved
  IF NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status != 'approved') THEN
    UPDATE products SET
      rating_avg = (
        SELECT COALESCE(AVG(rating)::numeric(3,2), 0)
        FROM product_reviews
        WHERE product_id = NEW.product_id AND status = 'approved'
      ),
      review_count = (
        SELECT COUNT(*)
        FROM product_reviews
        WHERE product_id = NEW.product_id AND status = 'approved'
      )
    WHERE id = NEW.product_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_product_rating_trigger AFTER INSERT OR UPDATE ON product_reviews
  FOR EACH ROW EXECUTE FUNCTION update_product_rating();

-- ==================== RESERVE/RELEASE INVENTORY FUNCTION ====================
CREATE OR REPLACE FUNCTION reserve_product_inventory(
  p_product_id uuid,
  p_quantity integer
)
RETURNS TABLE (success boolean, message text) AS $$
DECLARE
  v_available integer;
BEGIN
  -- Lock the inventory row to prevent race conditions
  SELECT quantity_available INTO v_available
  FROM product_inventory
  WHERE product_id = p_product_id
  FOR UPDATE;
  
  IF v_available IS NULL THEN
    RETURN QUERY SELECT false, 'Product not found';
    RETURN;
  END IF;
  
  IF v_available < p_quantity THEN
    RETURN QUERY SELECT false, 'Insufficient inventory';
    RETURN;
  END IF;
  
  -- Reserve inventory
  UPDATE product_inventory SET
    quantity_available = quantity_available - p_quantity,
    quantity_reserved = quantity_reserved + p_quantity
  WHERE product_id = p_product_id;
  
  RETURN QUERY SELECT true, 'Inventory reserved successfully';
END;
$$ LANGUAGE plpgsql;

-- ==================== RELEASE RESERVED INVENTORY FUNCTION ====================
CREATE OR REPLACE FUNCTION release_reserved_inventory(
  p_product_id uuid,
  p_quantity integer
)
RETURNS TABLE (success boolean, message text) AS $$
BEGIN
  UPDATE product_inventory SET
    quantity_available = quantity_available + p_quantity,
    quantity_reserved = quantity_reserved - p_quantity
  WHERE product_id = p_product_id
  AND quantity_reserved >= p_quantity;
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 'Cannot release more than reserved';
    RETURN;
  END IF;
  
  RETURN QUERY SELECT true, 'Inventory released successfully';
END;
$$ LANGUAGE plpgsql;

-- ==================== CONFIRM ORDER INVENTORY FUNCTION ====================
CREATE OR REPLACE FUNCTION confirm_order_inventory(
  p_order_id uuid
)
RETURNS TABLE (success boolean, message text) AS $$
DECLARE
  v_item RECORD;
BEGIN
  -- For each item in the order, convert reserved to sold
  FOR v_item IN 
    SELECT product_id, quantity FROM order_items WHERE order_id = p_order_id
  LOOP
    UPDATE product_inventory SET
      quantity_reserved = quantity_reserved - v_item.quantity,
      quantity_sold = quantity_sold + v_item.quantity
    WHERE product_id = v_item.product_id;
  END LOOP;
  
  RETURN QUERY SELECT true, 'Order inventory confirmed';
END;
$$ LANGUAGE plpgsql;

-- ==================== CALCULATE ORDER TOTAL FUNCTION ====================
CREATE OR REPLACE FUNCTION calculate_order_total(p_order_id uuid)
RETURNS TABLE (subtotal numeric, tax_amount numeric, total_amount numeric) AS $$
DECLARE
  v_subtotal numeric := 0;
  v_tax numeric := 0;
  v_discount numeric := 0;
BEGIN
  -- Calculate subtotal
  SELECT COALESCE(SUM(final_price), 0)
  INTO v_subtotal
  FROM order_items
  WHERE order_id = p_order_id;
  
  -- Get discount if coupon exists
  SELECT COALESCE(discount_amount, 0)
  INTO v_discount
  FROM orders
  WHERE id = p_order_id;
  
  -- Calculate tax (10% example - adjust as needed)
  v_tax := (v_subtotal - v_discount) * 0.10;
  
  RETURN QUERY SELECT v_subtotal - v_discount as subtotal, v_tax as tax_amount, 
                      (v_subtotal - v_discount + v_tax) as total_amount;
END;
$$ LANGUAGE plpgsql;

-- ==================== CALCULATE COMMISSIONS FUNCTION ====================
CREATE OR REPLACE FUNCTION calculate_seller_commission(
  p_order_item_id uuid
)
RETURNS TABLE (commission_amount numeric, commission_rate numeric) AS $$
DECLARE
  v_seller_id uuid;
  v_seller_rate numeric;
  v_final_price numeric;
BEGIN
  -- Get seller info and item price
  SELECT oi.seller_id, oi.final_price, ur.commission_rate
  INTO v_seller_id, v_final_price, v_seller_rate
  FROM order_items oi
  JOIN user_roles ur ON oi.seller_id = ur.user_id
  WHERE oi.id = p_order_item_id;
  
  -- Calculate commission
  RETURN QUERY SELECT 
    (v_final_price * v_seller_rate / 100)::numeric as commission_amount,
    v_seller_rate as commission_rate;
END;
$$ LANGUAGE plpgsql;

-- ==================== AUTO-CREATE USER ROLE FUNCTION ====================
CREATE OR REPLACE FUNCTION create_user_role_on_signup()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_roles (user_id, role, status)
  VALUES (NEW.id, 'buyer', 'active')
  ON CONFLICT (user_id) DO NOTHING;
  
  INSERT INTO user_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach to users table (requires setup in auth schema)
-- Note: This trigger assumes users table exists in public schema
-- CREATE TRIGGER create_user_role_on_signup_trigger AFTER INSERT ON auth.users
--   FOR EACH ROW EXECUTE FUNCTION create_user_role_on_signup();
