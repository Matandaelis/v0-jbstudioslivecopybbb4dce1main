# Openfront Live Shopping + Inventory Management Integration Plan

## Executive Summary

This document outlines a comprehensive integration strategy for embedding a live shopping system with real-time inventory management into the Openfront dashboard, leveraging the existing LiveKit SDK integration and following TalkShopLive's proven UI/UX patterns. The system will enable hosts to conduct live shopping events with synchronized inventory, automatic stock reservations, and unified order processing.

---

## 1. Architecture Overview

### 1.1 System Components

```
┌─────────────────────────────────────────────────────────────────┐
│                        Openfront Platform                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────┐    ┌──────────────────────────────┐   │
│  │  LiveKit Streaming   │    │  Inventory Management        │   │
│  │  (Video/Audio)       │    │  (Stock Tracking)            │   │
│  └──────────────────────┘    └──────────────────────────────┘   │
│           │                             │                        │
│  ┌────────┴──────────────────┬─────────┴─────────────────┐     │
│  │   Live Shopping Event      │  Dashboard / Admin Panel   │     │
│  │  (Host View)              │                            │     │
│  └────────────────────────────┴────────────────────────────┘     │
│                      │                                            │
│  ┌──────────────────┴─────────────────────────────────────┐     │
│  │  GraphQL API + REST Endpoints                         │     │
│  │  (Real-time Data + WebSocket Subscriptions)           │     │
│  └──────────────────┬─────────────────────────────────────┘     │
│                      │                                            │
│  ┌──────────────────┴─────────────────────────────────────┐     │
│  │  PostgreSQL Database                                  │     │
│  │  (Enhanced Schema with Inventory Tables)              │     │
│  └───────────────────────────────────────────────────────┘     │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│           Customer-Facing Storefront (E-Commerce)               │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────────┐    ┌──────────────────────────────────┐   │
│  │ Live Show View   │    │ Product Catalog + Cart           │   │
│  │ (Video Stream)   │    │ (Real-time Stock Display)        │   │
│  └──────────────────┘    └──────────────────────────────────┘   │
│           │                             │                        │
│  ┌────────┴─────────────────┬──────────┴──────────────────┐    │
│  │  Live Chat + Engagement  │  Checkout & Payment         │    │
│  │  (Order Interactions)    │  (Stripe/PayPal)            │    │
│  └──────────────────────────┴─────────────────────────────┘    │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2 Technology Stack

- **Frontend**: Next.js 15 App Router with React 19
- **Backend**: KeystoneJS 6 with GraphQL API
- **Video Streaming**: LiveKit SDK (already integrated)
- **Real-Time Communication**: WebSocket subscriptions + Server-Sent Events
- **Database**: PostgreSQL with Prisma ORM
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: React Context + TanStack Query
- **Caching**: Redis for real-time stock levels
- **Authentication**: Session-based with role-based access control

---

## 2. Database Schema Modifications

### 2.1 New Tables Required

```sql
-- Live Shopping Event Management
CREATE TABLE live_shopping_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  host_id UUID NOT NULL REFERENCES users(id),
  status ENUM('draft', 'scheduled', 'live', 'ended') DEFAULT 'draft',
  scheduled_start TIMESTAMP,
  scheduled_end TIMESTAMP,
  actual_start TIMESTAMP,
  actual_end TIMESTAMP,
  livekit_room_name VARCHAR(255) UNIQUE,
  thumbnail_url VARCHAR(255),
  viewer_count INTEGER DEFAULT 0,
  total_sales DECIMAL(10, 2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_host_id (host_id),
  INDEX idx_status (status),
  INDEX idx_scheduled_start (scheduled_start)
);

-- Products featured in live events
CREATE TABLE live_event_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES live_shopping_events(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  featured_position INTEGER,
  spotlight_starts_at TIMESTAMP,
  spotlight_duration_seconds INTEGER,
  event_price DECIMAL(10, 2),
  event_discount_percent DECIMAL(5, 2),
  max_quantity_for_event INTEGER,
  quantity_sold_in_event INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_event_id (event_id),
  INDEX idx_product_id (product_id),
  UNIQUE(event_id, product_id)
);

-- Real-time inventory tracking
CREATE TABLE inventory_levels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id),
  warehouse_id UUID REFERENCES warehouses(id),
  available_quantity INTEGER NOT NULL DEFAULT 0,
  reserved_quantity INTEGER NOT NULL DEFAULT 0,
  damaged_quantity INTEGER DEFAULT 0,
  in_transit_quantity INTEGER DEFAULT 0,
  last_counted_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(product_id, warehouse_id),
  INDEX idx_product_id (product_id),
  INDEX idx_warehouse_id (warehouse_id)
);

-- Stock reservations for live events
CREATE TABLE stock_reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES live_shopping_events(id),
  product_id UUID NOT NULL REFERENCES products(id),
  warehouse_id UUID REFERENCES warehouses(id),
  reserved_quantity INTEGER NOT NULL,
  reserved_by_user_id UUID REFERENCES users(id),
  expires_at TIMESTAMP NOT NULL,
  order_id UUID REFERENCES orders(id),
  status ENUM('active', 'converted_to_order', 'expired', 'cancelled') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_event_id (event_id),
  INDEX idx_expires_at (expires_at),
  INDEX idx_status (status)
);

-- Inventory movements audit trail
CREATE TABLE inventory_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id),
  warehouse_id UUID REFERENCES warehouses(id),
  movement_type ENUM('purchase', 'sale', 'adjustment', 'return', 'damage', 'transfer') NOT NULL,
  quantity_change INTEGER NOT NULL,
  reason VARCHAR(255),
  reference_id UUID,
  reference_type VARCHAR(50),
  event_id UUID REFERENCES live_shopping_events(id),
  created_by_user_id UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_product_id (product_id),
  INDEX idx_warehouse_id (warehouse_id),
  INDEX idx_created_at (created_at),
  INDEX idx_event_id (event_id)
);

-- Live event chat and engagement
CREATE TABLE live_event_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES live_shopping_events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id),
  message_type ENUM('chat', 'question', 'poll_response', 'system') DEFAULT 'chat',
  content TEXT NOT NULL,
  mentioned_product_id UUID REFERENCES products(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_event_id (event_id),
  INDEX idx_user_id (user_id),
  INDEX idx_created_at (created_at)
);

-- Viewer metrics and analytics
CREATE TABLE live_event_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES live_shopping_events(id) ON DELETE CASCADE,
  timestamp TIMESTAMP NOT NULL,
  viewer_count INTEGER,
  unique_viewers_total INTEGER,
  average_watch_time_seconds INTEGER,
  engagement_score DECIMAL(5, 2),
  chat_messages_count INTEGER,
  products_viewed INTEGER,
  add_to_cart_count INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_event_id (event_id),
  INDEX idx_timestamp (timestamp)
);

-- Catalog management
CREATE TABLE product_catalogs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_by UUID NOT NULL REFERENCES users(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products in catalogs
CREATE TABLE catalog_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  catalog_id UUID NOT NULL REFERENCES product_catalogs(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  position INTEGER,
  UNIQUE(catalog_id, product_id)
);
```

### 2.2 Enhanced Product Table Fields

Add to existing `products` table:

```sql
ALTER TABLE products ADD COLUMN (
  live_event_eligible BOOLEAN DEFAULT true,
  suggested_live_price DECIMAL(10, 2),
  description_for_live_events TEXT,
  media_for_live_events JSON,
  sku VARCHAR(255) UNIQUE,
  barcode VARCHAR(255),
  weight DECIMAL(10, 2),
  dimensions JSON,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_sku ON products(sku);
CREATE INDEX idx_live_eligible ON products(live_event_eligible);
```

### 2.3 Updated Orders Table

```sql
ALTER TABLE orders ADD COLUMN (
  live_event_id UUID REFERENCES live_shopping_events(id),
  order_source ENUM('website', 'live_event', 'app', 'admin') DEFAULT 'website',
  placed_during_live_event BOOLEAN,
  conversion_source VARCHAR(255),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_live_event_id ON orders(live_event_id);
```

---

## 3. GraphQL API Schema

### 3.1 New Types

```graphql
type LiveShoppingEvent {
  id: ID!
  title: String!
  description: String
  host: User!
  status: LiveEventStatus!
  scheduledStart: DateTime
  scheduledEnd: DateTime
  actualStart: DateTime
  actualEnd: DateTime
  livekitRoomName: String!
  thumbnailUrl: String
  viewerCount: Int!
  totalSales: Decimal!
  featuredProducts: [LiveEventProduct!]!
  messages: [LiveEventMessage!]!
  metrics: LiveEventMetrics
  createdAt: DateTime!
  updatedAt: DateTime!
}

enum LiveEventStatus {
  DRAFT
  SCHEDULED
  LIVE
  ENDED
  CANCELLED
}

type LiveEventProduct {
  id: ID!
  event: LiveShoppingEvent!
  product: Product!
  featuredPosition: Int
  spotlightStartsAt: DateTime
  spotlightDurationSeconds: Int
  eventPrice: Decimal
  eventDiscountPercent: Decimal
  maxQuantityForEvent: Int
  quantitySoldInEvent: Int!
}

type InventoryLevel {
  id: ID!
  product: Product!
  warehouse: Warehouse
  availableQuantity: Int!
  reservedQuantity: Int!
  damagedQuantity: Int
  inTransitQuantity: Int
  lastCountedAt: DateTime
  updatedAt: DateTime!
  totalOnHand: Int!
  lowStockAlert: Boolean!
}

type StockReservation {
  id: ID!
  event: LiveShoppingEvent!
  product: Product!
  warehouse: Warehouse
  reservedQuantity: Int!
  reservedByUser: User!
  expiresAt: DateTime!
  order: Order
  status: ReservationStatus!
  createdAt: DateTime!
  timeUntilExpiry: Int!
}

enum ReservationStatus {
  ACTIVE
  CONVERTED_TO_ORDER
  EXPIRED
  CANCELLED
}

type LiveEventMessage {
  id: ID!
  event: LiveShoppingEvent!
  user: User!
  messageType: MessageType!
  content: String!
  mentionedProduct: Product
  createdAt: DateTime!
}

enum MessageType {
  CHAT
  QUESTION
  POLL_RESPONSE
  SYSTEM
}

type LiveEventMetrics {
  id: ID!
  event: LiveShoppingEvent!
  timestamp: DateTime!
  viewerCount: Int!
  uniqueViewersTotal: Int!
  averageWatchTimeSeconds: Int!
  engagementScore: Decimal!
  chatMessagesCount: Int!
  productsViewed: Int!
  addToCartCount: Int!
}

type ProductCatalog {
  id: ID!
  name: String!
  description: String
  createdBy: User!
  isActive: Boolean!
  products: [Product!]!
  createdAt: DateTime!
  updatedAt: DateTime!
}
```

### 3.2 Queries

```graphql
type Query {
  # Live events
  liveEvent(id: ID!): LiveShoppingEvent
  liveEvents(
    status: LiveEventStatus
    hostId: ID
    limit: Int
    offset: Int
  ): [LiveShoppingEvent!]!
  
  upcomingLiveEvents(limit: Int): [LiveShoppingEvent!]!
  currentlyLiveEvent: LiveShoppingEvent
  
  # Inventory
  inventoryLevels(productId: ID, warehouseId: ID): [InventoryLevel!]!
  inventoryLevel(productId: ID!, warehouseId: ID): InventoryLevel
  lowStockProducts(warehouseId: ID, threshold: Int): [Product!]!
  
  # Reservations
  stockReservations(eventId: ID, status: ReservationStatus): [StockReservation!]!
  activeReservations(productId: ID!): [StockReservation!]!
  
  # Catalogs
  productCatalogs(isActive: Boolean): [ProductCatalog!]!
  productCatalog(id: ID!): ProductCatalog
  
  # Metrics
  liveEventMetrics(eventId: ID!): LiveEventMetrics
  eventPerformanceData(eventId: ID!, granularity: MetricsGranularity): [LiveEventMetrics!]!
  
  # Messages
  liveEventMessages(eventId: ID!, limit: Int): [LiveEventMessage!]!
}

enum MetricsGranularity {
  MINUTE
  FIVE_MINUTES
  FIFTEEN_MINUTES
  HOUR
}
```

### 3.3 Mutations

```graphql
type Mutation {
  # Event management
  createLiveShoppingEvent(input: CreateLiveEventInput!): LiveShoppingEvent!
  updateLiveShoppingEvent(id: ID!, input: UpdateLiveEventInput!): LiveShoppingEvent!
  startLiveEvent(id: ID!, livekitRoomName: String!): LiveShoppingEvent!
  endLiveEvent(id: ID!): LiveShoppingEvent!
  
  # Event products
  addProductToLiveEvent(input: AddProductInput!): LiveEventProduct!
  updateLiveEventProduct(id: ID!, input: UpdateLiveEventProductInput!): LiveEventProduct!
  removeProductFromLiveEvent(id: ID!): Boolean!
  spotlightProduct(eventId: ID!, productId: ID!, durationSeconds: Int!): LiveEventProduct!
  
  # Inventory management
  createInventoryLevel(input: CreateInventoryLevelInput!): InventoryLevel!
  updateInventoryLevel(id: ID!, input: UpdateInventoryLevelInput!): InventoryLevel!
  adjustInventory(input: InventoryAdjustmentInput!): InventoryMovement!
  
  # Stock reservations
  reserveStock(input: ReserveStockInput!): StockReservation!
  convertReservationToOrder(reservationId: ID!, orderId: ID!): StockReservation!
  cancelReservation(id: ID!): StockReservation!
  expireReservations: [StockReservation!]!
  
  # Messages
  sendLiveEventMessage(input: SendMessageInput!): LiveEventMessage!
  
  # Catalogs
  createProductCatalog(input: CreateCatalogInput!): ProductCatalog!
  updateProductCatalog(id: ID!, input: UpdateCatalogInput!): ProductCatalog!
  addProductToCatalog(catalogId: ID!, productId: ID!): ProductCatalog!
}

input CreateLiveEventInput {
  title: String!
  description: String
  scheduledStart: DateTime
  scheduledEnd: DateTime
  thumbnailUrl: String
}

input ReserveStockInput {
  eventId: ID!
  productId: ID!
  quantity: Int!
  warehouseId: ID
}

input InventoryAdjustmentInput {
  productId: ID!
  warehouseId: ID
  quantityChange: Int!
  movementType: InventoryMovementType!
  reason: String
  referenceId: String
}

enum InventoryMovementType {
  PURCHASE
  SALE
  ADJUSTMENT
  RETURN
  DAMAGE
  TRANSFER
}
```

### 3.4 Subscriptions

```graphql
type Subscription {
  # Real-time live event updates
  liveEventUpdated(eventId: ID!): LiveShoppingEvent!
  liveEventEnded(eventId: ID!): LiveShoppingEvent!
  
  # Stock level changes
  inventoryLevelChanged(productId: ID!): InventoryLevel!
  lowStockAlert(warehouseId: ID): Product!
  
  # Messages
  liveEventMessageReceived(eventId: ID!): LiveEventMessage!
  
  # Reservations
  reservationExpiring(eventId: ID!): StockReservation!
  
  # Metrics
  liveEventMetricsUpdated(eventId: ID!): LiveEventMetrics!
  viewerCountUpdated(eventId: ID!): Int!
}
```

---

## 4. REST API Endpoints

### 4.1 Live Events

```
POST   /api/events                          - Create event
GET    /api/events                          - List events
GET    /api/events/:eventId                 - Get event details
PUT    /api/events/:eventId                 - Update event
DELETE /api/events/:eventId                 - Cancel event
POST   /api/events/:eventId/start           - Start live streaming
POST   /api/events/:eventId/end             - End live stream
GET    /api/events/:eventId/metrics         - Get event metrics
GET    /api/events/upcoming                 - Get upcoming events
GET    /api/events/current                  - Get currently live event
```

### 4.2 Products in Events

```
POST   /api/events/:eventId/products        - Add product to event
PUT    /api/events/:eventId/products/:id    - Update product details
DELETE /api/events/:eventId/products/:id    - Remove product from event
POST   /api/events/:eventId/spotlight       - Spotlight a product
GET    /api/products/event-eligible         - Get event-eligible products
```

### 4.3 Inventory

```
GET    /api/inventory/levels                - Get inventory levels
GET    /api/inventory/levels/:productId     - Get product inventory
POST   /api/inventory/adjust                - Adjust inventory
GET    /api/inventory/movements             - Get inventory audit trail
GET    /api/inventory/low-stock             - Get low stock alerts
POST   /api/inventory/count                 - Initiate stock count
GET    /api/inventory/transfers             - Get pending transfers
```

### 4.4 Reservations

```
POST   /api/reservations                    - Create reservation
GET    /api/reservations                    - List reservations
GET    /api/reservations/:id                - Get reservation details
PUT    /api/reservations/:id/convert        - Convert to order
DELETE /api/reservations/:id                - Cancel reservation
POST   /api/reservations/expire             - Process expired reservations
```

### 4.5 Catalogs

```
POST   /api/catalogs                        - Create catalog
GET    /api/catalogs                        - List catalogs
GET    /api/catalogs/:id                    - Get catalog
PUT    /api/catalogs/:id                    - Update catalog
POST   /api/catalogs/:id/products           - Add products to catalog
```

### 4.6 Analytics

```
GET    /api/analytics/events/:eventId       - Event performance
GET    /api/analytics/inventory             - Inventory analytics
GET    /api/analytics/sales                 - Sales by product/event
GET    /api/analytics/engagement            - Viewer engagement metrics
```

---

## 5. Frontend UI Components (TalkShopLive-Inspired)

### 5.1 Host Dashboard

```
/dashboard/live-shopping/
├── overview/                    # Main dashboard
├── events/
│   ├── create/                  # Create new event
│   ├── [eventId]/
│   │   ├── edit/                # Edit event details
│   │   ├── products/            # Manage featured products
│   │   ├── live/                # Live streaming interface
│   │   └── analytics/           # Post-event analytics
├── products/
│   ├── catalog/                 # Manage product catalogs
│   ├── inventory/               # Inventory management
│   └── [productId]/             # Individual product details
└── settings/                    # Live shopping settings
```

### 5.2 Key Components

**LiveEventDashboard.tsx**
- Overview of upcoming and past events
- Quick start "Go Live" button
- Event statistics and revenue
- Viewer count and engagement metrics

**LiveEventEditor.tsx**
- Event title, description, scheduling
- Thumbnail upload
- Product selection and arrangement
- Event settings (duration, pricing rules)

**ProductShowcase.tsx** (During Live)
- Featured product display (TalkShopLive style)
- Real-time stock indicator (green/yellow/red)
- Product details (price, description, specs)
- "Add to Cart" button with stock check
- Product reviews and Q&A

**InventoryDashboard.tsx**
- Real-time stock levels by warehouse
- Low stock alerts
- Stock movement audit trail
- Bulk adjustment interface
- Transfer management

**ReservationMonitor.tsx**
- Active reservations during live event
- Expiring reservation alerts
- Conversion to order workflow
- Auto-expiry countdown

**LiveEventControl.tsx**
- Spotlight/pin products
- Adjust event pricing
- Manage featured products
- Viewer chat moderation
- Event metrics live display

**StockLevelIndicator.tsx**
- Visual stock status (In Stock / Low Stock / Out of Stock)
- Color-coded: Green (>20), Yellow (5-20), Red (<5)
- Real-time updates via WebSocket
- Reservation count display

### 5.3 Storefront Components

**LiveShowCard.tsx**
- Similar to TalkShopLive's show cards
- Host profile with avatar
- Live status badge
- Product count
- Viewer count
- "Watch Live" button
- Upcoming indicator with countdown

**LiveShoppingViewer.tsx**
- Full-screen LiveKit video player
- Chat panel with engagement features
- Product showcase carousel
- Add to cart interface
- Viewer count and engagement metrics
- Product Q&A section

**ProductShowcasePanel.tsx**
- Current spotlight product
- Stock availability indicator
- "Add to Cart" CTA
- Product details expandable section
- Price display with any live discounts

---

## 6. Real-Time Data Synchronization

### 6.1 WebSocket Architecture

```typescript
// Server-side WebSocket setup
import { createServer } from 'http';
import { WebSocketServer } from 'ws';

interface WebSocketMessage {
  type: 'stock_update' | 'reservation' | 'order_placed' | 'metrics';
  eventId: string;
  payload: Record<string, unknown>;
  timestamp: Date;
}

class LiveEventBroadcaster {
  private wss: WebSocketServer;
  private eventSubscribers = new Map<string, Set<WebSocket>>();

  constructor(server: http.Server) {
    this.wss = new WebSocketServer({ server });
    this.setupHandlers();
  }

  private setupHandlers() {
    this.wss.on('connection', (ws, req) => {
      const eventId = new URL(req.url, 'ws://localhost').searchParams.get('eventId');
      
      if (eventId) {
        if (!this.eventSubscribers.has(eventId)) {
          this.eventSubscribers.set(eventId, new Set());
        }
        this.eventSubscribers.get(eventId)!.add(ws);

        ws.on('close', () => {
          this.eventSubscribers.get(eventId)?.delete(ws);
        });
      }
    });
  }

  async broadcastStockUpdate(eventId: string, productId: string) {
    const subscribers = this.eventSubscribers.get(eventId);
    if (!subscribers) return;

    const inventory = await getInventoryLevel(productId);
    const message: WebSocketMessage = {
      type: 'stock_update',
      eventId,
      payload: { productId, ...inventory },
      timestamp: new Date()
    };

    subscribers.forEach(ws => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(message));
      }
    });
  }

  async broadcastMetrics(eventId: string) {
    const subscribers = this.eventSubscribers.get(eventId);
    if (!subscribers) return;

    const metrics = await getLiveEventMetrics(eventId);
    const message: WebSocketMessage = {
      type: 'metrics',
      eventId,
      payload: metrics,
      timestamp: new Date()
    };

    subscribers.forEach(ws => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(message));
      }
    });
  }
}
```

### 6.2 Client-Side WebSocket Hook

```typescript
import { useEffect, useState, useCallback } from 'react';

export function useLiveEventWebSocket(eventId: string) {
  const [connected, setConnected] = useState(false);
  const [inventory, setInventory] = useState<Map<string, InventoryLevel>>(new Map());
  const [metrics, setMetrics] = useState<LiveEventMetrics | null>(null);

  useEffect(() => {
    const ws = new WebSocket(`ws://localhost:3000/api/events/${eventId}?eventId=${eventId}`);

    ws.onopen = () => setConnected(true);
    ws.onclose = () => setConnected(false);

    ws.onmessage = (event) => {
      const message: WebSocketMessage = JSON.parse(event.data);

      switch (message.type) {
        case 'stock_update':
          setInventory(prev => new Map(prev).set(
            message.payload.productId as string,
            message.payload as InventoryLevel
          ));
          break;
        case 'metrics':
          setMetrics(message.payload as LiveEventMetrics);
          break;
      }
    };

    return () => ws.close();
  }, [eventId]);

  return { connected, inventory, metrics };
}
```

### 6.3 GraphQL Subscription Pattern

```typescript
// Subscribe to inventory changes
subscription OnInventoryChanged($productId: ID!) {
  inventoryLevelChanged(productId: $productId) {
    id
    availableQuantity
    reservedQuantity
    updatedAt
  }
}

// Subscribe to live event metrics
subscription OnMetricsUpdate($eventId: ID!) {
  liveEventMetricsUpdated(eventId: $eventId) {
    viewerCount
    engagementScore
    chatMessagesCount
    addToCartCount
  }
}
```

---

## 7. Data Consistency & Transactions

### 7.1 Stock Reservation Flow

```sql
-- Atomic stock reservation with transaction
BEGIN TRANSACTION;

-- 1. Check available stock
SELECT available_quantity FROM inventory_levels 
WHERE product_id = $1 AND warehouse_id = $2
FOR UPDATE;

-- 2. Reserve stock
INSERT INTO stock_reservations (
  event_id, product_id, warehouse_id, reserved_quantity,
  reserved_by_user_id, expires_at, status
) VALUES ($1, $2, $3, $4, $5, NOW() + INTERVAL '15 minutes', 'active');

-- 3. Update inventory
UPDATE inventory_levels
SET reserved_quantity = reserved_quantity + $4
WHERE product_id = $2 AND warehouse_id = $3;

-- 4. Log movement
INSERT INTO inventory_movements (
  product_id, warehouse_id, movement_type, quantity_change,
  reason, reference_id, reference_type, created_by_user_id
) VALUES ($2, $3, 'adjustment', -$4, 'Stock reserved for live event', $1, 'event', $5);

COMMIT;
```

### 7.2 Reservation Expiry Job

```typescript
// Scheduled job to handle expired reservations
export async function processExpiredReservations() {
  const db = getDatabase();
  
  const expiredReservations = await db.query(
    `SELECT * FROM stock_reservations 
     WHERE status = 'active' AND expires_at < NOW()`
  );

  for (const reservation of expiredReservations) {
    await db.transaction(async () => {
      // 1. Cancel reservation
      await db.query(
        `UPDATE stock_reservations SET status = 'cancelled' WHERE id = $1`,
        [reservation.id]
      );

      // 2. Release reserved stock
      await db.query(
        `UPDATE inventory_levels 
         SET reserved_quantity = reserved_quantity - $1
         WHERE product_id = $2 AND warehouse_id = $3`,
        [reservation.reserved_quantity, reservation.product_id, reservation.warehouse_id]
      );

      // 3. Log movement
      await db.query(
        `INSERT INTO inventory_movements (...) VALUES (...)`,
        [reservation.product_id, reservation.warehouse_id, 'adjustment', 
         reservation.reserved_quantity, 'Expired reservation released', 
         reservation.id, 'reservation']
      );

      // 4. Notify user
      await notifyReservationExpired(reservation);
    });
  }
}

// Run every 5 minutes
cron.schedule('*/5 * * * *', processExpiredReservations);
```

### 7.3 Order Creation with Stock Deduction

```typescript
export async function createOrderFromReservation(
  reservationId: string,
  orderInput: CreateOrderInput
): Promise<Order> {
  const db = getDatabase();
  
  return db.transaction(async () => {
    // 1. Verify reservation exists and is active
    const reservation = await db.queryOne(
      `SELECT * FROM stock_reservations WHERE id = $1 FOR UPDATE`,
      [reservationId]
    );

    if (!reservation || reservation.status !== 'active') {
      throw new Error('Reservation not found or expired');
    }

    // 2. Create order
    const order = await db.query(
      `INSERT INTO orders (...) VALUES (...) RETURNING *`,
      [orderInput.customerId, orderInput.total, orderInput.shippingAddress, 
       reservation.event_id, 'live_event', true]
    );

    // 3. Create order items from reservation
    await db.query(
      `INSERT INTO order_items (order_id, product_id, quantity, price)
       VALUES ($1, $2, $3, $4)`,
      [order.id, reservation.product_id, reservation.reserved_quantity, 
       orderInput.items[0].price]
    );

    // 4. Convert reservation
    await db.query(
      `UPDATE stock_reservations 
       SET status = 'converted_to_order', order_id = $1
       WHERE id = $2`,
      [order.id, reservationId]
    );

    // 5. Deduct from available (already reserved, so just remove from reserved)
    await db.query(
      `UPDATE inventory_levels
       SET available_quantity = available_quantity - $1,
           reserved_quantity = reserved_quantity - $1
       WHERE product_id = $2 AND warehouse_id = $3`,
      [reservation.reserved_quantity, reservation.product_id, reservation.warehouse_id]
    );

    // 6. Log movement
    await db.query(
      `INSERT INTO inventory_movements (...) VALUES (...)`,
      [reservation.product_id, reservation.warehouse_id, 'sale', 
       -reservation.reserved_quantity, 'Order created from live event', 
       order.id, 'order', getCurrentUserId()]
    );

    return order;
  });
}
```

---

## 8. Security Implementation

### 8.1 Access Control Matrix

```typescript
// Role-based permissions
const PERMISSIONS = {
  'admin': [
    'manage_all_events',
    'manage_inventory',
    'view_analytics',
    'manage_users'
  ],
  'host': [
    'create_events',
    'manage_own_events',
    'manage_product_catalog',
    'view_own_analytics'
  ],
  'moderator': [
    'moderate_chat',
    'manage_own_events'
  ],
  'customer': [
    'view_events',
    'participate_in_events',
    'create_orders'
  ],
  'guest': [
    'view_events',
    'browse_products'
  ]
};

// Row-level security policies
export const RLS_POLICIES = {
  live_shopping_events: `
    ENABLE ROW LEVEL SECURITY;
    
    CREATE POLICY "Users can view all live events"
    ON live_shopping_events FOR SELECT
    USING (status = 'live' OR current_user_id = host_id);
    
    CREATE POLICY "Hosts can manage own events"
    ON live_shopping_events FOR ALL
    USING (host_id = current_user_id);
    
    CREATE POLICY "Admins can manage all events"
    ON live_shopping_events FOR ALL
    USING (current_user_role = 'admin');
  `,
  
  inventory_levels: `
    ENABLE ROW LEVEL SECURITY;
    
    CREATE POLICY "Users can view inventory if they have permission"
    ON inventory_levels FOR SELECT
    USING (
      current_user_role IN ('admin', 'host') OR
      current_user_warehouse_ids && ARRAY[warehouse_id]
    );
    
    CREATE POLICY "Only admins can modify inventory"
    ON inventory_levels FOR UPDATE
    USING (current_user_role = 'admin');
  `
};
```

### 8.2 API Authentication

```typescript
// Middleware for API route protection
import { Request, Response, NextFunction } from 'express';
import { verifySession } from '@/lib/auth';

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const session = await verifySession(token);
    req.user = session.user;
    req.permissions = getUserPermissions(session.user.role);
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
}

// Permission checking middleware
export function requirePermission(permission: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.permissions?.includes(permission)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };
}
```

### 8.3 Audit Logging

```typescript
// Log all sensitive operations
export async function auditLog(
  userId: string,
  action: string,
  resourceType: string,
  resourceId: string,
  changes: Record<string, unknown>,
  ipAddress: string
) {
  await db.query(
    `INSERT INTO audit_logs (
      user_id, action, resource_type, resource_id, 
      changes, ip_address, created_at
    ) VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
    [userId, action, resourceType, resourceId, JSON.stringify(changes), ipAddress]
  );
}

// Usage in inventory adjustment
export async function adjustInventory(
  productId: string,
  adjustment: InventoryAdjustmentInput,
  userId: string,
  ipAddress: string
) {
  const before = await getInventoryLevel(productId);
  
  // ... perform adjustment ...
  
  const after = await getInventoryLevel(productId);
  
  await auditLog(
    userId,
    'INVENTORY_ADJUSTMENT',
    'inventory_levels',
    productId,
    { before, after, ...adjustment },
    ipAddress
  );
}
```

---

## 9. Performance & Scalability

### 9.1 Caching Strategy

```typescript
// Redis cache layer for frequently accessed data
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

export async function getInventoryLevel(productId: string, warehouseId?: string) {
  const cacheKey = `inventory:${productId}${warehouseId ? `:${warehouseId}` : ''}`;
  
  // Try cache first
  const cached = await redis.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }

  // Fetch from database
  const inventory = await db.query(
    `SELECT * FROM inventory_levels 
     WHERE product_id = $1 ${warehouseId ? 'AND warehouse_id = $2' : ''}`,
    [productId, warehouseId].filter(Boolean)
  );

  // Cache for 30 seconds
  await redis.setex(cacheKey, 30, JSON.stringify(inventory));
  
  return inventory;
}

// Invalidate cache on changes
export async function invalidateInventoryCache(productId: string) {
  const keys = await redis.keys(`inventory:${productId}:*`);
  if (keys.length > 0) {
    await redis.del(...keys);
  }
}
```

### 9.2 Database Optimization

```sql
-- Indexes for common queries
CREATE INDEX CONCURRENTLY idx_live_events_status_start 
ON live_shopping_events(status, scheduled_start DESC);

CREATE INDEX CONCURRENTLY idx_inventory_product_warehouse 
ON inventory_levels(product_id, warehouse_id);

CREATE INDEX CONCURRENTLY idx_stock_reservations_event_status 
ON stock_reservations(event_id, status, expires_at);

CREATE INDEX CONCURRENTLY idx_inventory_movements_product_date 
ON inventory_movements(product_id, created_at DESC);

-- Partition by date for large tables
CREATE TABLE inventory_movements_2024_q1 PARTITION OF inventory_movements
    FOR VALUES FROM ('2024-01-01') TO ('2024-04-01');

-- Connection pooling
ALTER SYSTEM SET max_connections = 500;
ALTER SYSTEM SET shared_buffers = '256MB';
```

### 9.3 Load Testing Targets

```
- Concurrent users: 10,000+
- Live events: 100+ simultaneous
- Products per catalog: 50,000+
- API response time (p95): <200ms
- WebSocket latency: <100ms
- Database query time (p95): <50ms
- Cache hit rate: >85%
```

---

## 10. Implementation Timeline

### Phase 1: Foundation (Weeks 1-4)
- Database schema setup
- GraphQL API core types and queries
- REST API endpoints skeleton
- Authentication enhancement

### Phase 2: Inventory Management (Weeks 5-8)
- Inventory tracking system
- Stock level management UI
- Audit trail implementation
- Cache layer setup

### Phase 3: Live Shopping Events (Weeks 9-12)
- Event management API
- Product showcase components
- Live event dashboard
- Real-time metrics

### Phase 4: Real-Time Synchronization (Weeks 13-16)
- WebSocket implementation
- GraphQL subscriptions
- Live updates across all components
- Reservation system

### Phase 5: E-Commerce Integration (Weeks 17-20)
- Storefront integration
- Live event product display
- Order processing from live events
- Payment integration

### Phase 6: Optimization & Launch (Weeks 21-24)
- Performance testing and optimization
- Security hardening
- Documentation completion
- Production deployment

---

## 11. Success Metrics

- Event creation to live: <2 minutes
- Stock update latency: <1 second
- Viewer count accuracy: 99.9%
- Order conversion rate from live: >10%
- System uptime: >99.9%
- Cache hit rate: >85%
- API response time p95: <200ms

---

## Conclusion

This comprehensive integration plan provides a production-ready framework for embedding live shopping with inventory management into Openfront. By leveraging the existing LiveKit integration, following TalkShopLive's proven UI/UX patterns, and implementing enterprise-grade security and scalability measures, you can create a unified platform that delivers exceptional value to both hosts and customers.

The phased implementation approach allows for iterative development and validation, while the detailed technical specifications enable immediate action by your engineering team.
