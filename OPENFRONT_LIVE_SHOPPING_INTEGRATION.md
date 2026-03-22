# OpenFront Live Shopping Integration Plan

## Executive Summary

This comprehensive plan integrates product and inventory management into the OpenFront dashboard, with a focus on enabling **Live Shopping** experiences. Live Shopping combines real-time inventory visibility, interactive product browsing, live streaming capabilities, and instant order processing to create engaging shopping events.

## 1. Architecture Overview

### 1.1 Live Shopping Core Components

```
┌─────────────────────────────────────────────────────────────────┐
│                      OpenFront Dashboard                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────┐      ┌──────────────────────┐        │
│  │ Product Management   │      │ Inventory Control    │        │
│  │ - Catalog            │      │ - Stock Levels       │        │
│  │ - Listings           │      │ - Real-time Updates  │        │
│  │ - Attributes         │      │ - Reservations       │        │
│  └──────────────────────┘      └──────────────────────┘        │
│           │                              │                       │
│           └──────────────┬───────────────┘                       │
│                          │                                        │
│  ┌──────────────────────────────────────────────────┐           │
│  │       Live Shopping Event Management             │           │
│  │  - Stream Management                             │           │
│  │  - Flash Sales                                   │           │
│  │  - Live Product Showcases                        │           │
│  │  - Interactive Features (Chat, Polls, etc)      │           │
│  └──────────────────────────────────────────────────┘           │
│           │                                                       │
│           └──────────────┬───────────────┐                       │
│                          │               │                       │
│  ┌────────────────────────────┐  ┌──────────────────────┐       │
│  │ Order Processing Module    │  │ Shipping & Fulfillment│      │
│  │ - Cart Management          │  │ - Warehouse Ops      │       │
│  │ - Checkout Flow            │  │ - Shipping Options   │       │
│  │ - Payment Processing       │  │ - Tracking           │       │
│  └────────────────────────────┘  └──────────────────────┘       │
│           │                              │                       │
│           └──────────────┬───────────────┘                       │
│                          │                                        │
│  ┌──────────────────────────────────────────────────┐           │
│  │    Real-Time Synchronization Layer               │           │
│  │  - WebSocket for Live Updates                    │           │
│  │  - Event Bus for System Events                   │           │
│  │  - Cache Layer (Redis)                           │           │
│  └──────────────────────────────────────────────────┘           │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                    ┌─────────┴─────────┐
                    │                   │
            ┌───────────────┐   ┌──────────────┐
            │ Customer      │   │ Admin/Vendor │
            │ E-Commerce    │   │ Dashboard    │
            │ Frontend      │   │              │
            └───────────────┘   └──────────────┘
```

### 1.2 Data Flow for Live Shopping

```
Live Shopping Event Started
          │
          ├─> Stream Created (Video/Chat)
          ├─> Featured Products Highlighted
          │   └─> Stock Reserved for Live Event
          │
          ├─> Real-time Inventory Display
          │   └─> Stock counts updated every 1-5 seconds
          │
          ├─> Customer Interactions
          │   ├─> Browse Products
          │   ├─> Add to Cart (Immediate Reserve)
          │   ├─> Checkout
          │   └─> Payment Processing
          │
          ├─> Order Created
          │   ├─> Stock Deducted
          │   ├─> Inventory Adjusted
          │   └─> Fulfillment Initiated
          │
          └─> Event Ends
              ├─> Release Unreserved Stock
              └─> Generate Analytics
```

## 2. Database Schema Enhancements

### 2.1 New Tables Required

#### Products Table (Enhancement)
```sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES shops(id),
  
  -- Basic Information
  name VARCHAR(255) NOT NULL,
  description TEXT,
  sku VARCHAR(100) UNIQUE NOT NULL,
  barcode VARCHAR(100),
  
  -- Product Media
  images JSONB,  -- [{url, alt_text, position, type}]
  video_url VARCHAR(2048),
  live_shopping_featured BOOLEAN DEFAULT false,
  
  -- Pricing
  base_price DECIMAL(12, 2) NOT NULL,
  cost_price DECIMAL(12, 2),
  
  -- Live Shopping Specific
  is_live_shoppable BOOLEAN DEFAULT true,
  flash_sale_price DECIMAL(12, 2),
  flash_sale_start_at TIMESTAMP,
  flash_sale_end_at TIMESTAMP,
  flash_sale_quantity_limit INT,
  
  -- Organization
  category_id UUID REFERENCES categories(id),
  tags JSONB,  -- ["electronics", "bestseller"]
  attributes JSONB,  -- {color, size, brand, etc}
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP,
  
  INDEX idx_shop_id (shop_id),
  INDEX idx_sku (sku),
  INDEX idx_live_shoppable (is_live_shoppable),
  INDEX idx_created_at (created_at)
);
```

#### Stock Levels Table
```sql
CREATE TABLE stock_levels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  warehouse_id UUID NOT NULL REFERENCES warehouses(id),
  
  -- Stock Quantities
  total_quantity INT NOT NULL DEFAULT 0,
  available_quantity INT NOT NULL DEFAULT 0,
  reserved_quantity INT NOT NULL DEFAULT 0,
  damaged_quantity INT NOT NULL DEFAULT 0,
  in_transit_quantity INT NOT NULL DEFAULT 0,
  
  -- Live Shopping Specific
  live_event_reserved INT DEFAULT 0,  -- Stock reserved for active events
  
  -- Reorder Points
  reorder_point INT DEFAULT 10,
  reorder_quantity INT DEFAULT 100,
  max_stock_level INT,
  
  -- Timing
  last_counted_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(product_id, warehouse_id),
  INDEX idx_product_id (product_id),
  INDEX idx_warehouse_id (warehouse_id),
  INDEX idx_available_quantity (available_quantity)
);
```

#### Live Shopping Events Table
```sql
CREATE TABLE live_shopping_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES shops(id),
  
  -- Event Details
  title VARCHAR(255) NOT NULL,
  description TEXT,
  thumbnail_url VARCHAR(2048),
  
  -- Timing
  scheduled_at TIMESTAMP NOT NULL,
  started_at TIMESTAMP,
  ended_at TIMESTAMP,
  duration_minutes INT DEFAULT 60,
  
  -- Stream Information
  stream_id VARCHAR(255),  -- LiveKit or external provider
  stream_url VARCHAR(2048),
  is_live BOOLEAN DEFAULT false,
  viewer_count INT DEFAULT 0,
  
  -- Configuration
  auto_start BOOLEAN DEFAULT false,
  enable_chat BOOLEAN DEFAULT true,
  enable_polls BOOLEAN DEFAULT true,
  enable_qna BOOLEAN DEFAULT true,
  
  -- Status
  status VARCHAR(50) DEFAULT 'scheduled',  -- scheduled, live, ended, cancelled
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  INDEX idx_shop_id (shop_id),
  INDEX idx_scheduled_at (scheduled_at),
  INDEX idx_status (status),
  INDEX idx_is_live (is_live)
);
```

#### Live Event Products Table (Junction)
```sql
CREATE TABLE live_event_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES live_shopping_events(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  
  -- Event-Specific Settings
  display_order INT,
  featured BOOLEAN DEFAULT false,
  
  -- Stock Reserved for Event
  quantity_reserved INT DEFAULT 0,
  quantity_sold INT DEFAULT 0,
  
  -- Pricing Override
  event_price DECIMAL(12, 2),
  
  -- Analytics
  views INT DEFAULT 0,
  cart_adds INT DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(event_id, product_id),
  INDEX idx_event_id (event_id),
  INDEX idx_product_id (product_id),
  INDEX idx_featured (featured)
);
```

#### Stock Reservations Table
```sql
CREATE TABLE stock_reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id),
  warehouse_id UUID NOT NULL REFERENCES warehouses(id),
  
  -- Reservation Context
  reservation_type VARCHAR(50),  -- 'cart', 'live_event', 'order', 'hold'
  reference_id UUID,  -- cart_id, order_id, event_id
  customer_id UUID REFERENCES customers(id),
  
  -- Quantities
  quantity_reserved INT NOT NULL,
  quantity_held_until TIMESTAMP NOT NULL,
  
  -- Status
  status VARCHAR(50) DEFAULT 'active',  -- active, released, converted
  
  created_at TIMESTAMP DEFAULT NOW(),
  released_at TIMESTAMP,
  
  INDEX idx_product_id (product_id),
  INDEX idx_customer_id (customer_id),
  INDEX idx_status (status),
  INDEX idx_quantity_held_until (quantity_held_until)
);
```

#### Stock Movements Table (Audit Log)
```sql
CREATE TABLE stock_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id),
  warehouse_id UUID NOT NULL REFERENCES warehouses(id),
  
  -- Movement Details
  movement_type VARCHAR(50) NOT NULL,  -- 'purchase', 'sale', 'adjustment', 'transfer', 'return', 'damage'
  quantity_change INT NOT NULL,
  reason VARCHAR(255),
  reference_id UUID,  -- order_id, return_id, etc
  
  -- User Action
  performed_by UUID REFERENCES users(id),
  
  -- Inventory Impact
  quantity_before INT NOT NULL,
  quantity_after INT NOT NULL,
  
  created_at TIMESTAMP DEFAULT NOW(),
  
  INDEX idx_product_id (product_id),
  INDEX idx_warehouse_id (warehouse_id),
  INDEX idx_movement_type (movement_type),
  INDEX idx_created_at (created_at)
);
```

#### Live Shopping Cart Table (Enhancement)
```sql
CREATE TABLE carts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id),
  session_id VARCHAR(255),
  
  -- Live Shopping Context
  live_event_id UUID REFERENCES live_shopping_events(id),
  event_session_started_at TIMESTAMP,
  
  -- Cart State
  status VARCHAR(50) DEFAULT 'active',  -- active, abandoned, converted
  total_amount DECIMAL(12, 2),
  
  -- Reservation Details
  reserved_items JSONB,  -- [{product_id, quantity, reserved_at, expires_at}]
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP,
  
  INDEX idx_customer_id (customer_id),
  INDEX idx_live_event_id (live_event_id),
  INDEX idx_status (status)
);
```

## 3. API Endpoints Architecture

### 3.1 Product Management Endpoints

```
Products
  POST   /api/products                    - Create product
  GET    /api/products                    - List products (with filters)
  GET    /api/products/:id                - Get product details
  PUT    /api/products/:id                - Update product
  DELETE /api/products/:id                - Soft delete product
  POST   /api/products/:id/images         - Upload product images
  PUT    /api/products/:id/pricing        - Update pricing
  PUT    /api/products/:id/attributes     - Update attributes

Stock Levels
  GET    /api/stock/levels                - Get all stock levels
  GET    /api/stock/levels/:productId     - Get product stock by warehouse
  PUT    /api/stock/levels/:productId     - Update stock quantity
  POST   /api/stock/adjustments           - Create stock adjustment
  GET    /api/stock/movements             - Get movement history
  GET    /api/stock/warnings              - Get low stock warnings
  GET    /api/stock/health                - Get inventory health status

Stock Reservations
  POST   /api/reservations                - Create reservation
  GET    /api/reservations/:customerId    - Get customer reservations
  PUT    /api/reservations/:id            - Update reservation
  DELETE /api/reservations/:id            - Release reservation
  POST   /api/reservations/:id/convert    - Convert to order

Live Shopping Events
  POST   /api/live-events                 - Create event
  GET    /api/live-events                 - List events
  GET    /api/live-events/:id             - Get event details
  PUT    /api/live-events/:id             - Update event
  POST   /api/live-events/:id/start       - Start stream
  POST   /api/live-events/:id/end         - End stream
  POST   /api/live-events/:id/products    - Add products to event
  DELETE /api/live-events/:id/products/:productId - Remove product
  PUT    /api/live-events/:id/products/:productId - Update product in event

Live Shopping Analytics
  GET    /api/live-events/:id/stats       - Get event statistics
  GET    /api/live-events/:id/products/:productId/performance - Product stats
  GET    /api/live-events/:id/viewers     - Get viewer count
  GET    /api/live-events/:id/orders      - Get orders from event

Real-Time Subscriptions (WebSocket/GraphQL)
  WS     /ws/stock-updates                - Subscribe to stock changes
  WS     /ws/live-event/:eventId          - Subscribe to event updates
  WS     /ws/live-event/:eventId/chat     - Subscribe to chat
  WS     /ws/inventory-alerts             - Subscribe to alerts
```

### 3.2 Real-Time Inventory Update Flow

```
Stock Update Triggers:
  1. Order Created
     └─> /api/stock/movements (deduct inventory)
         └─> Event: InventoryUpdated
             └─> WebSocket broadcast
                 └─> Dashboard refresh
                 └─> Frontend stock display

  2. Return Processed
     └─> /api/stock/adjustments
         └─> Event: InventoryRestored
             └─> WebSocket broadcast

  3. Manual Adjustment
     └─> /api/stock/adjustments
         └─> Event: InventoryAdjusted
             └─> WebSocket broadcast

  4. Live Event Stock Reserved
     └─> /api/reservations
         └─> Event: StockReserved
             └─> WebSocket broadcast
             └─> Update cart state
```

## 4. Frontend UI/UX Components for Live Shopping

### 4.1 Dashboard Layout Architecture

```
┌─────────────────────────────────────────────────────────────┐
│           OpenFront Dashboard - Live Shopping                │
├─────────────────────────────────────────────────────────────┤
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Left Sidebar (Navigation)                              │ │
│  │ - Dashboard Home                                       │ │
│  │ - Products Management                                 │ │
│  │ - Inventory Control                                   │ │
│  │ - Live Shopping Events                                │ │
│  │ - Orders & Fulfillment                                │ │
│  │ - Analytics & Reports                                 │ │
│  │ - Settings                                            │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Main Content Area (Dynamic based on section)          │ │
│  │                                                         │ │
│  │  Dashboard Home:                                       │ │
│  │  ├─ Quick Stats Grid (Revenue, Orders, Stock Health) │ │
│  │  ├─ Live Event Status Panel                          │ │
│  │  ├─ Real-time Inventory Alerts                       │ │
│  │  ├─ Recent Orders Feed                               │ │
│  │  └─ Analytics Charts                                 │ │
│  │                                                         │ │
│  │  Products Management:                                 │ │
│  │  ├─ Product Catalog Table (Searchable, Filterable)   │ │
│  │  ├─ Product Editor Modal                             │ │
│  │  ├─ Bulk Actions Panel                               │ │
│  │  └─ Image Gallery Manager                            │ │
│  │                                                         │ │
│  │  Inventory Control:                                   │ │
│  │  ├─ Stock Level Grid (Real-time)                     │ │
│  │  ├─ Low Stock Warnings                               │ │
│  │  ├─ Stock Adjustment Form                            │ │
│  │  ├─ Movement History Timeline                        │ │
│  │  └─ Inventory Forecasting                            │ │
│  │                                                         │ │
│  │  Live Shopping Events:                                │ │
│  │  ├─ Event Calendar/List View                         │ │
│  │  ├─ Event Creator/Editor                             │ │
│  │  ├─ Event Control Panel (Start/End/Monitor)          │ │
│  │  ├─ Live Product Showcase                            │ │
│  │  ├─ Chat & Engagement Panel                          │ │
│  │  ├─ Real-time Viewer Analytics                       │ │
│  │  └─ Order Feed During Event                          │ │
│  │                                                         │ │
│  │  Orders & Fulfillment:                                │ │
│  │  ├─ Order List (with Live Event context)             │ │
│  │  ├─ Order Details & Management                       │ │
│  │  ├─ Shipping Integration                             │ │
│  │  └─ Return Processing                                │ │
│  │                                                         │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Right Sidebar (Context Panel)                          │ │
│  │ - Live Event Status (if active)                        │ │
│  │ - Real-time Stock Updates                             │ │
│  │ - Quick Actions                                        │ │
│  │ - Notifications                                        │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 Key Dashboard Components

#### Live Shopping Event Control Panel
- Event preview (thumbnail, title, description)
- Countdown timer to scheduled start
- Start/End/Pause controls
- Featured products carousel with real-time stock
- Live viewer count display
- Chat messages feed (moderated)
- Real-time order notifications
- Event performance metrics (views, engagement, conversions)

#### Real-Time Stock Monitor
- Grid view: Product name | Warehouse | Available | Reserved | Damaged | Actions
- Color-coded stock levels (Green: healthy, Yellow: low, Red: critical)
- Spark charts showing trends over time
- Live updates with animation (blink on change)
- Quick actions: Adjust, Transfer, Count
- Filters: By warehouse, category, status, alert level

#### Product Catalog Manager
- Search bar with advanced filters (name, SKU, category, status)
- Table view: Image | SKU | Name | Price | Stock | Status | Actions
- Bulk actions: Edit pricing, Update stock, Add to event, Export
- Product editor modal with tabs:
  - Basic Info (name, description, category)
  - Media (images, videos, live shopping flag)
  - Pricing (base, cost, flash sale)
  - Attributes (color, size, brand)
  - Live Shopping (featured flag, event assignment)
- Image uploader with drag-drop and preview

#### Stock Adjustment Interface
- Form: Product selector | Warehouse | Quantity change | Reason
- Movement type selector (Purchase, Sale, Damage, Return, etc.)
- Reason/Notes text area
- Confirmation with audit trail
- Batch adjustment import (CSV)
- Undo functionality for recent adjustments

#### Live Shopping Event Builder
- Event scheduler with date/time picker
- Event details editor (title, description, thumbnail)
- Product selector with drag-drop ordering
- Price override per product
- Event customization (chat enabled, polls, Q&A)
- Preview mode
- Publishing/Scheduling controls

### 4.3 Real-Time UI Patterns

#### WebSocket-Powered Stock Updates
```typescript
// Example: Real-time stock level updates in dashboard
const StockLevelGrid = () => {
  const [stocks, setStocks] = useState([]);

  useEffect(() => {
    const ws = new WebSocket('wss://api.example.com/ws/stock-updates');
    
    ws.onmessage = (event) => {
      const { productId, warehouseId, available, reserved, movement } = JSON.parse(event.data);
      
      setStocks(prev => 
        prev.map(stock => 
          stock.productId === productId && stock.warehouseId === warehouseId
            ? { ...stock, available, reserved, lastUpdated: new Date() }
            : stock
        )
      );
      
      // Trigger animation on change
      animateStockChange(productId);
    };
    
    return () => ws.close();
  }, []);

  return (
    <Grid>
      {stocks.map(stock => (
        <StockCard key={stock.id} stock={stock} animate={animatingId === stock.id} />
      ))}
    </Grid>
  );
};
```

#### Live Event Product Feed
```typescript
// Real-time order notifications during live event
const LiveEventOrderFeed = ({ eventId }) => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const ws = new WebSocket(`wss://api.example.com/ws/live-event/${eventId}/orders`);
    
    ws.onmessage = (event) => {
      const newOrder = JSON.parse(event.data);
      setOrders(prev => [newOrder, ...prev].slice(0, 10)); // Show last 10
      
      // Toast notification
      showNotification(`New order: ${newOrder.customerName} - ${newOrder.productName}`);
    };
    
    return () => ws.close();
  }, [eventId]);

  return (
    <OrderFeed orders={orders} />
  );
};
```

## 5. Data Consistency Strategies

### 5.1 Transaction Management

```sql
-- Example: Atomic order creation with inventory deduction
BEGIN;
  -- Reserve stock
  UPDATE stock_levels 
  SET reserved_quantity = reserved_quantity + $1,
      available_quantity = available_quantity - $1
  WHERE product_id = $2 AND warehouse_id = $3
  RETURNING *;
  
  -- Create order
  INSERT INTO orders (customer_id, status, total_amount)
  VALUES ($4, 'pending', $5)
  RETURNING id AS order_id;
  
  -- Create order items
  INSERT INTO order_items (order_id, product_id, quantity, price)
  VALUES ((SELECT order_id FROM order_context), $2, $1, $5);
  
  -- Record movement
  INSERT INTO stock_movements (product_id, warehouse_id, movement_type, quantity_change, reference_id)
  VALUES ($2, $3, 'sale', -$1, order_id);
COMMIT;
```

### 5.2 Inventory State Validation

```typescript
// Check inventory consistency
const validateInventoryState = async (productId, warehouseId) => {
  const levels = await db.query(`
    SELECT total_quantity, available_quantity, reserved_quantity, damaged_quantity
    FROM stock_levels
    WHERE product_id = $1 AND warehouse_id = $2
  `, [productId, warehouseId]);

  const { total, available, reserved, damaged } = levels[0];
  
  // Validate: total should equal sum of all states
  const calculated = available + reserved + damaged;
  
  if (total !== calculated) {
    logger.error('Inventory mismatch detected', { 
      productId, warehouseId, 
      storedTotal: total, 
      calculated 
    });
    // Trigger reconciliation
    await reconcileInventory(productId, warehouseId);
  }
};
```

### 5.3 Event Sourcing for Audit Trail

All inventory changes are immutable records:
- Each change captured as a StockMovement event
- Complete audit trail of who, what, when, why
- Ability to replay history for reconciliation
- Retention: 7 years for compliance

## 6. Scalability Considerations

### 6.1 Horizontal Scaling Architecture

```
Load Balancer
      │
      ├─> Dashboard API Service (3 instances)
      ├─> Inventory Service (2 instances)
      ├─> Order Service (2 instances)
      └─> Real-Time Service (2 instances)
      
Database:
  ├─> Primary PostgreSQL (writes)
  ├─> Read Replicas (3x, for analytics/reporting)
  └─> Hot Standby (DR)

Cache Layer:
  ├─> Redis Cluster (stock levels, cart cache)
  └─> CDN (product images, static assets)

Message Queue:
  ├─> Kafka/RabbitMQ (event bus)
  └─> Dead Letter Queue (failed events)
```

### 6.2 Database Indexing Strategy

```sql
-- Stock Levels - Critical for performance
CREATE INDEX idx_stock_available ON stock_levels(available_quantity) WHERE deleted_at IS NULL;
CREATE INDEX idx_stock_warehouse ON stock_levels(warehouse_id) WHERE available_quantity > 0;
CREATE INDEX idx_stock_live_reserved ON stock_levels(live_event_reserved);

-- Stock Movements - For audit/reporting
CREATE INDEX idx_movement_product_date ON stock_movements(product_id, created_at DESC);
CREATE INDEX idx_movement_type ON stock_movements(movement_type, created_at DESC);

-- Reservations - For live shopping
CREATE INDEX idx_reservation_active ON stock_reservations(status, quantity_held_until) 
  WHERE status = 'active';

-- Live Events - For dashboard queries
CREATE INDEX idx_event_status_date ON live_shopping_events(status, scheduled_at DESC);
CREATE INDEX idx_event_products_featured ON live_event_products(event_id, featured);
```

### 6.3 Caching Strategy with Redis

```typescript
// Cache inventory levels with TTL
const getStockLevel = async (productId, warehouseId) => {
  const cacheKey = `stock:${productId}:${warehouseId}`;
  
  // Try cache first
  let stock = await redis.get(cacheKey);
  if (stock) return JSON.parse(stock);
  
  // Query database
  stock = await db.query(`
    SELECT * FROM stock_levels 
    WHERE product_id = $1 AND warehouse_id = $2
  `, [productId, warehouseId]);
  
  // Cache for 5 minutes (invalidated on updates)
  await redis.setex(cacheKey, 300, JSON.stringify(stock[0]));
  
  return stock[0];
};

// Invalidate cache on updates
const updateStockLevel = async (productId, warehouseId, data) => {
  const result = await db.query(`
    UPDATE stock_levels 
    SET available_quantity = $1, updated_at = NOW()
    WHERE product_id = $2 AND warehouse_id = $3
    RETURNING *
  `, [data.available, productId, warehouseId]);
  
  // Invalidate cache
  await redis.del(`stock:${productId}:${warehouseId}`);
  
  // Broadcast real-time update
  await publishEvent('InventoryUpdated', result[0]);
  
  return result[0];
};
```

## 7. Security Implementation

### 7.1 Role-Based Access Control (RBAC)

```typescript
// Permission matrix for live shopping operations
const PERMISSIONS = {
  'admin': ['manage_products', 'manage_inventory', 'manage_events', 'manage_orders', 'view_analytics'],
  'vendor': ['manage_products', 'manage_inventory', 'create_events', 'view_own_orders', 'view_analytics'],
  'inventory_manager': ['view_products', 'manage_inventory', 'view_analytics'],
  'live_host': ['view_products', 'create_events', 'manage_events'],
  'customer_support': ['view_products', 'view_orders', 'manage_returns'],
};

// Middleware to enforce permissions
const requirePermission = (permission) => {
  return async (req, res, next) => {
    const user = req.user;
    const userPermissions = PERMISSIONS[user.role];
    
    if (!userPermissions.includes(permission)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    next();
  };
};

// Usage
app.put('/api/products/:id', requirePermission('manage_products'), updateProduct);
```

### 7.2 Row-Level Security (RLS) in Database

```sql
-- Enable RLS on sensitive tables
ALTER TABLE stock_levels ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see stock for their shop
CREATE POLICY shop_isolation ON stock_levels
  USING (
    product_id IN (
      SELECT id FROM products WHERE shop_id = auth.user_shop_id()
    )
  );

-- Policy: Only admins can modify stock
CREATE POLICY admin_stock_modify ON stock_levels
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.user_id() 
      AND role = 'admin'
    )
  );
```

### 7.3 API Security Measures

- **Authentication**: JWT tokens with 15-minute expiry
- **Rate Limiting**: 100 requests/minute per user
- **Data Validation**: Input sanitization and schema validation
- **Encryption**: TLS 1.3 for all communications, AES-256 for sensitive data at rest
- **Audit Logging**: All modifications logged with user, timestamp, changes
- **Webhook Verification**: HMAC signatures for external integrations

## 8. Integration with E-Commerce Frontend

### 8.1 Unified Product Browsing

```typescript
// Customer browsing products (real-time stock visibility)
const ProductDetails = ({ productId }) => {
  const [product, setProduct] = useState(null);
  const [stock, setStock] = useState(null);
  const [isLiveEvent, setIsLiveEvent] = useState(false);

  useEffect(() => {
    // Fetch product from unified API
    const fetchProduct = async () => {
      const product = await fetch(`/api/storefront/products/${productId}`);
      setProduct(product);
      
      // Get real-time stock
      const stock = await fetch(`/api/storefront/stock/${productId}`);
      setStock(stock);
      
      // Check if in active live event
      const event = await fetch(`/api/storefront/live-event/product/${productId}`);
      if (event.isLive) {
        setIsLiveEvent(true);
      }
    };
    
    fetchProduct();
    
    // Subscribe to real-time updates
    const ws = new WebSocket(`/ws/product/${productId}`);
    ws.onmessage = (e) => {
      const { stock, event } = JSON.parse(e.data);
      setStock(stock);
      setIsLiveEvent(event?.isLive || false);
    };
    
    return () => ws.close();
  }, [productId]);

  return (
    <div>
      <ProductImage src={product.image} />
      <h1>{product.name}</h1>
      {isLiveEvent && <LiveBadge event={product.liveEvent} />}
      <StockIndicator 
        available={stock.available}
        reserved={stock.reserved}
        status={stock.status}
      />
      <AddToCartButton 
        productId={productId}
        disabled={stock.available === 0}
      />
    </div>
  );
};
```

### 8.2 Checkout with Live Event Context

```typescript
// Order creation with live event association
const CheckoutFlow = ({ cartItems, liveEventId }) => {
  const handleCheckout = async () => {
    const order = await fetch('/api/checkout', {
      method: 'POST',
      body: JSON.stringify({
        items: cartItems,
        live_event_id: liveEventId,  // Associate order with live event
        payment_method: paymentDetails,
      }),
    });
    
    // Order automatically:
    // - Reserves stock (if not already)
    // - Deducts from live event reserved quantities
    // - Processes payment
    // - Creates fulfillment task
  };
};
```

### 8.3 Real-Time Availability Display

```typescript
// Show real-time stock status on product listings
const ProductListing = ({ products }) => {
  const [stockMap, setStockMap] = useState({});

  useEffect(() => {
    const ws = new WebSocket('/ws/stock-updates');
    ws.onmessage = (event) => {
      const { productId, available, status } = JSON.parse(event.data);
      setStockMap(prev => ({
        ...prev,
        [productId]: { available, status }
      }));
    };
    return () => ws.close();
  }, []);

  return (
    <div className="grid">
      {products.map(product => (
        <ProductCard 
          key={product.id}
          product={product}
          stock={stockMap[product.id]}
        />
      ))}
    </div>
  );
};
```

## 9. Implementation Roadmap

### Phase 1: Foundation (Weeks 1-4)
- Database schema creation and migrations
- Core API endpoints (CRUD for products and stock)
- Basic dashboard layout with navigation
- Authentication and RBAC setup

### Phase 2: Inventory Core (Weeks 5-8)
- Stock level management UI
- Stock adjustment and movement tracking
- Inventory health monitoring
- Low stock alerts

### Phase 3: Live Shopping Basics (Weeks 9-12)
- Live event creation and management
- Product-to-event assignment
- Event scheduling and control
- Basic viewer count tracking

### Phase 4: Real-Time Integration (Weeks 13-16)
- WebSocket setup for real-time updates
- Live event streaming integration
- Real-time stock synchronization
- Chat and engagement features

### Phase 5: E-Commerce Integration (Weeks 17-20)
- Customer-facing product browsing
- Live event customer experience
- Order placement with inventory validation
- Payment processing integration

### Phase 6: Optimization (Weeks 21-24)
- Performance optimization
- Caching strategy implementation
- Analytics and reporting
- Mobile responsive design

## 10. Success Metrics

### Operational KPIs
- Inventory accuracy: >99%
- Order fulfillment time: <24 hours
- Stock-out incidents: <2% of SKUs
- Dashboard response time: <500ms
- API response time: <200ms

### Business KPIs
- Live event conversion rate: >5%
- Average order value during live events: 30% higher
- Customer engagement time: >10 minutes per event
- Repeat purchase rate from live events: >15%
- Inventory turnover: Increase by 25%

### Technical KPIs
- System uptime: >99.9%
- Data consistency score: 99.99%
- Concurrent users supported: 10,000+
- Real-time update latency: <1 second
- Database query performance: p95 <100ms

---

This comprehensive plan provides the foundation for integrating product and inventory management into OpenFront's dashboard with a strong focus on live shopping experiences.
