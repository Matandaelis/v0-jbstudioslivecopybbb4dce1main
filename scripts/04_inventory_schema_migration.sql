-- ============================================================================
-- INVENTORY MANAGEMENT SYSTEM - DATABASE SCHEMA MIGRATION
-- Designed for Live Shopping Platform with Real-Time Stock Tracking
-- ============================================================================

-- Create stock_levels table for inventory tracking
CREATE TABLE public.stock_levels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  warehouse_id UUID,
  quantity_on_hand INTEGER NOT NULL DEFAULT 0,
  quantity_reserved INTEGER NOT NULL DEFAULT 0,
  quantity_available INTEGER NOT NULL GENERATED ALWAYS AS (quantity_on_hand - quantity_reserved) STORED,
  reorder_point INTEGER NOT NULL DEFAULT 10,
  reorder_quantity INTEGER NOT NULL DEFAULT 50,
  last_counted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(product_id, warehouse_id)
);

-- Create stock_reservations table for cart and order reservations
CREATE TABLE public.stock_reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  cart_session_id VARCHAR(255),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  used_at TIMESTAMP WITH TIME ZONE,
  cancelled_at TIMESTAMP WITH TIME ZONE
);

-- Create stock_movements table for audit trail
CREATE TABLE public.stock_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  warehouse_id UUID,
  movement_type VARCHAR(50) NOT NULL CHECK (movement_type IN ('inbound', 'outbound', 'adjustment', 'count', 'return')),
  quantity INTEGER NOT NULL,
  reference_id VARCHAR(255),
  reference_type VARCHAR(50),
  notes TEXT,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create live_event_products table for product showcase during events
CREATE TABLE public.live_event_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.live_streams(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  featured_position INTEGER,
  special_discount DECIMAL(5, 2),
  quantity_available INTEGER NOT NULL DEFAULT 0,
  quantity_sold INTEGER NOT NULL DEFAULT 0,
  spotlight_start TIMESTAMP WITH TIME ZONE,
  spotlight_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(event_id, product_id)
);

-- Create inventory_audits table for compliance and debugging
CREATE TABLE public.inventory_audits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  warehouse_id UUID,
  action VARCHAR(50) NOT NULL CHECK (action IN ('create', 'update', 'delete', 'reserve', 'release', 'sell', 'return', 'adjust')),
  old_values JSONB,
  new_values JSONB,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  ip_address INET,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE OPTIMIZATION
-- ============================================================================

CREATE INDEX idx_stock_levels_product_id ON public.stock_levels(product_id);
CREATE INDEX idx_stock_levels_warehouse_id ON public.stock_levels(warehouse_id);
CREATE INDEX idx_stock_reservations_product_id ON public.stock_reservations(product_id);
CREATE INDEX idx_stock_reservations_user_id ON public.stock_reservations(user_id);
CREATE INDEX idx_stock_reservations_order_id ON public.stock_reservations(order_id);
CREATE INDEX idx_stock_reservations_expires_at ON public.stock_reservations(expires_at);
CREATE INDEX idx_stock_movements_product_id ON public.stock_movements(product_id);
CREATE INDEX idx_stock_movements_created_at ON public.stock_movements(created_at);
CREATE INDEX idx_stock_movements_reference_id ON public.stock_movements(reference_id);
CREATE INDEX idx_live_event_products_event_id ON public.live_event_products(event_id);
CREATE INDEX idx_live_event_products_product_id ON public.live_event_products(product_id);
CREATE INDEX idx_inventory_audits_product_id ON public.inventory_audits(product_id);
CREATE INDEX idx_inventory_audits_created_at ON public.inventory_audits(created_at);
CREATE INDEX idx_inventory_audits_user_id ON public.inventory_audits(user_id);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on inventory tables
ALTER TABLE public.stock_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_event_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_audits ENABLE ROW LEVEL SECURITY;

-- Stock levels: Sellers can view their products' stock, admins can view all
CREATE POLICY "Sellers can view their stock levels" ON public.stock_levels
  FOR SELECT USING (
    product_id IN (
      SELECT id FROM public.products WHERE seller_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all stock levels" ON public.stock_levels
  FOR SELECT USING (
    auth.uid() IN (SELECT id FROM public.users WHERE role = 'admin')
  );

CREATE POLICY "Sellers can update their stock" ON public.stock_levels
  FOR UPDATE USING (
    product_id IN (
      SELECT id FROM public.products WHERE seller_id = auth.uid()
    )
  );

-- Stock reservations: Users can view their own, staff can view all
CREATE POLICY "Users can view their reservations" ON public.stock_reservations
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Staff can view all reservations" ON public.stock_reservations
  FOR SELECT USING (
    auth.uid() IN (
      SELECT id FROM public.users WHERE role IN ('admin', 'moderator')
    )
  );

-- Stock movements: Audit trail visible to authorized staff only
CREATE POLICY "Staff can view stock movements" ON public.stock_movements
  FOR SELECT USING (
    auth.uid() IN (
      SELECT id FROM public.users WHERE role IN ('admin', 'seller')
    )
  );

-- Live event products: Public for events, editable by host/admin
CREATE POLICY "Users can view live event products" ON public.live_event_products
  FOR SELECT USING (
    event_id IN (
      SELECT id FROM public.live_streams WHERE is_public = true
    )
  );

CREATE POLICY "Event hosts can manage products" ON public.live_event_products
  FOR ALL USING (
    event_id IN (
      SELECT id FROM public.live_streams WHERE host_id = auth.uid()
    )
  );

-- Inventory audits: Visible to admins only
CREATE POLICY "Admins can view inventory audits" ON public.inventory_audits
  FOR SELECT USING (
    auth.uid() IN (SELECT id FROM public.users WHERE role = 'admin')
  );

-- ============================================================================
-- FUNCTIONS AND TRIGGERS FOR STOCK MANAGEMENT
-- ============================================================================

-- Function to record stock movements
CREATE OR REPLACE FUNCTION public.record_stock_movement(
  p_product_id UUID,
  p_movement_type VARCHAR,
  p_quantity INTEGER,
  p_reference_id VARCHAR DEFAULT NULL,
  p_reference_type VARCHAR DEFAULT NULL,
  p_notes TEXT DEFAULT NULL,
  p_user_id UUID DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_movement_id UUID;
BEGIN
  INSERT INTO public.stock_movements (
    product_id, movement_type, quantity, reference_id, reference_type, notes, user_id
  ) VALUES (
    p_product_id, p_movement_type, p_quantity, p_reference_id, p_reference_type, p_notes, p_user_id
  ) RETURNING id INTO v_movement_id;
  
  RETURN v_movement_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create stock reservation
CREATE OR REPLACE FUNCTION public.create_stock_reservation(
  p_product_id UUID,
  p_user_id UUID,
  p_quantity INTEGER,
  p_expires_in_minutes INTEGER DEFAULT 15
) RETURNS UUID AS $$
DECLARE
  v_reservation_id UUID;
  v_available_quantity INTEGER;
BEGIN
  -- Check available stock
  SELECT quantity_available INTO v_available_quantity
  FROM public.stock_levels
  WHERE product_id = p_product_id;

  IF v_available_quantity IS NULL OR v_available_quantity < p_quantity THEN
    RAISE EXCEPTION 'Insufficient stock available';
  END IF;

  -- Create reservation
  INSERT INTO public.stock_reservations (
    product_id, user_id, quantity, expires_at
  ) VALUES (
    p_product_id, p_user_id, p_quantity, 
    CURRENT_TIMESTAMP + (p_expires_in_minutes || ' minutes')::INTERVAL
  ) RETURNING id INTO v_reservation_id;

  -- Update reserved quantity
  UPDATE public.stock_levels
  SET quantity_reserved = quantity_reserved + p_quantity
  WHERE product_id = p_product_id;

  RETURN v_reservation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to cancel expired reservations
CREATE OR REPLACE FUNCTION public.cancel_expired_reservations() RETURNS INTEGER AS $$
DECLARE
  v_cancelled_count INTEGER;
BEGIN
  UPDATE public.stock_reservations
  SET cancelled_at = CURRENT_TIMESTAMP
  WHERE expires_at < CURRENT_TIMESTAMP AND cancelled_at IS NULL AND used_at IS NULL;
  
  GET DIAGNOSTICS v_cancelled_count = ROW_COUNT;
  
  -- Release reserved stock
  UPDATE public.stock_levels sl
  SET quantity_reserved = quantity_reserved - sr.quantity
  FROM public.stock_reservations sr
  WHERE sl.product_id = sr.product_id
    AND sr.cancelled_at = CURRENT_TIMESTAMP;

  RETURN v_cancelled_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to audit stock level changes
CREATE OR REPLACE FUNCTION public.audit_stock_level_change() RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.inventory_audits (
    product_id, action, old_values, new_values, user_id
  ) VALUES (
    NEW.product_id,
    'update',
    to_jsonb(OLD),
    to_jsonb(NEW),
    auth.uid()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER stock_level_audit_trigger
AFTER UPDATE ON public.stock_levels
FOR EACH ROW
EXECUTE FUNCTION public.audit_stock_level_change();

-- ============================================================================
-- SAMPLE DATA FOR TESTING
-- ============================================================================

-- Insert sample products if they don't exist
INSERT INTO public.products (
  seller_id, title, description, price, sku, category, status, is_featured, rating_avg
) VALUES
  (
    (SELECT id FROM public.users WHERE role = 'seller' LIMIT 1),
    'Premium Wireless Headphones',
    'High-quality wireless headphones with noise cancellation',
    199.99,
    'WH-NC-001',
    'Electronics',
    'active',
    true,
    4.5
  ),
  (
    (SELECT id FROM public.users WHERE role = 'seller' LIMIT 1),
    'USB-C Cable Pack',
    'Set of 5 premium USB-C cables',
    29.99,
    'USB-C-5PACK',
    'Accessories',
    'active',
    true,
    4.2
  )
ON CONFLICT DO NOTHING;

-- Insert stock levels for products
INSERT INTO public.stock_levels (
  product_id, quantity_on_hand, reorder_point, reorder_quantity
)
SELECT id, 100, 20, 50
FROM public.products
WHERE title IN ('Premium Wireless Headphones', 'USB-C Cable Pack')
ON CONFLICT (product_id) DO NOTHING;
