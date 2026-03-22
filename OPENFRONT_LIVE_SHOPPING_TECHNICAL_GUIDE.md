# OpenFront Live Shopping - Technical Implementation Guide

## Part 1: Backend Implementation

### 1.1 Database Migrations

#### Migration 1: Create Core Tables

```sql
-- File: migrations/001_create_core_tables.sql

-- Enhance Products Table
ALTER TABLE products ADD COLUMN IF NOT EXISTS (
  is_live_shoppable BOOLEAN DEFAULT true,
  flash_sale_price DECIMAL(12, 2),
  flash_sale_start_at TIMESTAMP,
  flash_sale_end_at TIMESTAMP,
  video_url VARCHAR(2048),
  live_shopping_featured BOOLEAN DEFAULT false
);

-- Stock Levels Table
CREATE TABLE IF NOT EXISTS stock_levels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  warehouse_id UUID NOT NULL REFERENCES warehouses(id),
  total_quantity INT NOT NULL DEFAULT 0,
  available_quantity INT NOT NULL DEFAULT 0,
  reserved_quantity INT NOT NULL DEFAULT 0,
  damaged_quantity INT NOT NULL DEFAULT 0,
  in_transit_quantity INT NOT NULL DEFAULT 0,
  live_event_reserved INT DEFAULT 0,
  reorder_point INT DEFAULT 10,
  reorder_quantity INT DEFAULT 100,
  max_stock_level INT,
  last_counted_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(product_id, warehouse_id),
  INDEX idx_product_id (product_id),
  INDEX idx_warehouse_id (warehouse_id),
  INDEX idx_available (available_quantity)
);

-- Stock Movements Table (Audit Log)
CREATE TABLE IF NOT EXISTS stock_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id),
  warehouse_id UUID NOT NULL REFERENCES warehouses(id),
  movement_type VARCHAR(50) NOT NULL,
  quantity_change INT NOT NULL,
  reason VARCHAR(255),
  reference_id UUID,
  performed_by UUID REFERENCES users(id),
  quantity_before INT NOT NULL,
  quantity_after INT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  INDEX idx_product_id (product_id),
  INDEX idx_warehouse_id (warehouse_id),
  INDEX idx_movement_type (movement_type),
  INDEX idx_created_at (created_at)
);

-- Stock Reservations Table
CREATE TABLE IF NOT EXISTS stock_reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id),
  warehouse_id UUID NOT NULL REFERENCES warehouses(id),
  reservation_type VARCHAR(50),
  reference_id UUID,
  customer_id UUID REFERENCES customers(id),
  quantity_reserved INT NOT NULL,
  quantity_held_until TIMESTAMP NOT NULL,
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  released_at TIMESTAMP,
  INDEX idx_product_id (product_id),
  INDEX idx_customer_id (customer_id),
  INDEX idx_status (status),
  INDEX idx_held_until (quantity_held_until)
);
```

#### Migration 2: Create Live Shopping Tables

```sql
-- File: migrations/002_create_live_shopping_tables.sql

CREATE TABLE IF NOT EXISTS live_shopping_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES shops(id),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  thumbnail_url VARCHAR(2048),
  scheduled_at TIMESTAMP NOT NULL,
  started_at TIMESTAMP,
  ended_at TIMESTAMP,
  duration_minutes INT DEFAULT 60,
  stream_id VARCHAR(255),
  stream_url VARCHAR(2048),
  is_live BOOLEAN DEFAULT false,
  viewer_count INT DEFAULT 0,
  auto_start BOOLEAN DEFAULT false,
  enable_chat BOOLEAN DEFAULT true,
  enable_polls BOOLEAN DEFAULT true,
  enable_qna BOOLEAN DEFAULT true,
  status VARCHAR(50) DEFAULT 'scheduled',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  INDEX idx_shop_id (shop_id),
  INDEX idx_scheduled_at (scheduled_at),
  INDEX idx_status (status)
);

CREATE TABLE IF NOT EXISTS live_event_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES live_shopping_events(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  display_order INT,
  featured BOOLEAN DEFAULT false,
  quantity_reserved INT DEFAULT 0,
  quantity_sold INT DEFAULT 0,
  event_price DECIMAL(12, 2),
  views INT DEFAULT 0,
  cart_adds INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(event_id, product_id),
  INDEX idx_event_id (event_id),
  INDEX idx_featured (featured)
);

CREATE TABLE IF NOT EXISTS live_event_chat (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES live_shopping_events(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id),
  message TEXT NOT NULL,
  is_moderated BOOLEAN DEFAULT false,
  is_pinned BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  INDEX idx_event_id (event_id),
  INDEX idx_created_at (created_at)
);

-- Enhanced Carts for Live Shopping
ALTER TABLE carts ADD COLUMN IF NOT EXISTS (
  live_event_id UUID REFERENCES live_shopping_events(id),
  event_session_started_at TIMESTAMP,
  reserved_items JSONB
);
```

### 1.2 KeystoneJS Models (if using Keystone)

```typescript
// File: schema/products.ts

import { list } from '@keystone-6/core';
import { text, decimal, integer, checkbox, timestamp, relationship, json } from '@keystone-6/core/fields';

export const Product = list({
  access: {
    operation: {
      query: ({ session }) => !!session,
      create: ({ session }) => session?.role === 'admin' || session?.role === 'vendor',
      update: ({ session }) => session?.role === 'admin' || session?.role === 'vendor',
      delete: ({ session }) => session?.role === 'admin',
    },
  },
  fields: {
    name: text({ validation: { isRequired: true } }),
    sku: text({ isIndexed: 'unique', validation: { isRequired: true } }),
    description: text({ db: { map: 'description_text' } }),
    basePrice: decimal({
      precision: 12,
      scale: 2,
      validation: { isRequired: true },
    }),
    costPrice: decimal({ precision: 12, scale: 2 }),
    images: json({
      defaultValue: [],
    }),
    videoUrl: text(),
    isLiveShoppable: checkbox({ defaultValue: true }),
    flashSalePrice: decimal({ precision: 12, scale: 2 }),
    flashSaleStartAt: timestamp(),
    flashSaleEndAt: timestamp(),
    liveShoppingFeatured: checkbox({ defaultValue: false }),
    shop: relationship({ ref: 'Shop.products' }),
    category: relationship({ ref: 'Category.products' }),
    stockLevels: relationship({ ref: 'StockLevel.product' }),
  },
});

export const StockLevel = list({
  access: {
    operation: {
      query: ({ session }) => !!session,
      create: ({ session }) => session?.role === 'admin' || session?.role === 'inventory_manager',
      update: ({ session }) => session?.role === 'admin' || session?.role === 'inventory_manager',
      delete: ({ session }) => false,
    },
  },
  fields: {
    product: relationship({ ref: 'Product.stockLevels' }),
    warehouse: relationship({ ref: 'Warehouse.stocks' }),
    totalQuantity: integer({ defaultValue: 0 }),
    availableQuantity: integer({ defaultValue: 0 }),
    reservedQuantity: integer({ defaultValue: 0 }),
    damagedQuantity: integer({ defaultValue: 0 }),
    inTransitQuantity: integer({ defaultValue: 0 }),
    liveEventReserved: integer({ defaultValue: 0 }),
    reorderPoint: integer({ defaultValue: 10 }),
    reorderQuantity: integer({ defaultValue: 100 }),
    maxStockLevel: integer(),
    lastCountedAt: timestamp(),
  },
});

export const StockMovement = list({
  access: {
    operation: {
      query: ({ session }) => !!session,
      create: ({ session }) => !!session,
      update: ({ session }) => false,
      delete: ({ session }) => false,
    },
  },
  fields: {
    product: relationship({ ref: 'Product.movements' }),
    warehouse: relationship({ ref: 'Warehouse.movements' }),
    movementType: text({
      validation: {
        isRequired: true,
        matches: {
          regex: /^(purchase|sale|adjustment|transfer|return|damage)$/,
        },
      },
    }),
    quantityChange: integer({ validation: { isRequired: true } }),
    reason: text(),
    referenceId: text(),
    performedBy: relationship({ ref: 'User.stockMovements' }),
    quantityBefore: integer({ validation: { isRequired: true } }),
    quantityAfter: integer({ validation: { isRequired: true } }),
  },
  db: {
    orderBy: { createdAt: 'desc' },
  },
});

export const LiveShoppingEvent = list({
  access: {
    operation: {
      query: ({ session }) => !!session,
      create: ({ session }) => session?.role === 'admin' || session?.role === 'live_host',
      update: ({ session }) => session?.role === 'admin' || session?.role === 'live_host',
      delete: ({ session }) => session?.role === 'admin',
    },
  },
  fields: {
    title: text({ validation: { isRequired: true } }),
    description: text(),
    thumbnailUrl: text(),
    scheduledAt: timestamp({ validation: { isRequired: true } }),
    startedAt: timestamp(),
    endedAt: timestamp(),
    durationMinutes: integer({ defaultValue: 60 }),
    streamId: text(),
    streamUrl: text(),
    isLive: checkbox({ defaultValue: false }),
    viewerCount: integer({ defaultValue: 0 }),
    autoStart: checkbox({ defaultValue: false }),
    enableChat: checkbox({ defaultValue: true }),
    enablePolls: checkbox({ defaultValue: true }),
    enableQna: checkbox({ defaultValue: true }),
    status: text({
      defaultValue: 'scheduled',
      isIndexed: true,
    }),
    shop: relationship({ ref: 'Shop.liveShoppingEvents' }),
    products: relationship({ ref: 'LiveEventProduct.event' }),
  },
});
```

### 1.3 GraphQL API Implementation

```typescript
// File: api/graphql/schema.ts

import { gql } from 'apollo-server-express';

export const typeDefs = gql`
  type Query {
    # Products
    products(
      shopId: ID!
      limit: Int
      offset: Int
      search: String
      category: String
      inStock: Boolean
    ): ProductConnection!
    
    product(id: ID!): Product!

    # Stock Management
    stockLevels(
      productId: ID
      warehouseId: ID
      status: StockStatus
    ): [StockLevel!]!
    
    stockMovements(
      productId: ID
      startDate: DateTime
      endDate: DateTime
      movementType: MovementType
      limit: Int
    ): [StockMovement!]!
    
    stockReservations(
      customerId: ID
      status: ReservationStatus
    ): [StockReservation!]!

    # Live Shopping
    liveShoppingEvents(
      shopId: ID!
      status: LiveEventStatus
      limit: Int
    ): [LiveShoppingEvent!]!
    
    liveShoppingEvent(id: ID!): LiveShoppingEvent!
    
    activeLiveEvents(shopId: ID!): [LiveShoppingEvent!]!

    # Analytics
    inventoryHealth(shopId: ID!): InventoryHealthReport!
    liveEventStats(eventId: ID!): LiveEventStatistics!
    stockForecast(productId: ID!, days: Int): [ForecastPoint!]!
  }

  type Mutation {
    # Product Management
    createProduct(input: CreateProductInput!): Product!
    updateProduct(id: ID!, input: UpdateProductInput!): Product!
    deleteProduct(id: ID!): Boolean!

    # Stock Operations
    adjustStock(input: AdjustStockInput!): StockMovement!
    createReservation(input: CreateReservationInput!): StockReservation!
    releaseReservation(id: ID!): Boolean!
    convertReservation(id: ID!, orderId: ID!): Boolean!

    # Live Shopping Events
    createLiveEvent(input: CreateLiveEventInput!): LiveShoppingEvent!
    updateLiveEvent(id: ID!, input: UpdateLiveEventInput!): LiveShoppingEvent!
    startLiveEvent(id: ID!): LiveShoppingEvent!
    endLiveEvent(id: ID!): LiveShoppingEvent!
    addProductToEvent(eventId: ID!, productId: ID!): LiveEventProduct!
    removeProductFromEvent(eventId: ID!, productId: ID!): Boolean!
    updateEventProduct(
      eventId: ID!
      productId: ID!
      input: UpdateEventProductInput!
    ): LiveEventProduct!
  }

  type Subscription {
    # Real-time Updates
    stockUpdated(productId: ID, warehouseId: ID): StockLevel!
    inventoryAlert(shopId: ID!): InventoryAlert!
    liveEventUpdate(eventId: ID!): LiveShoppingEvent!
    liveEventChat(eventId: ID!): ChatMessage!
    liveEventOrder(eventId: ID!): Order!
  }

  type Product {
    id: ID!
    shopId: ID!
    name: String!
    sku: String!
    description: String
    basePrice: Float!
    costPrice: Float
    images: [ProductImage!]!
    videoUrl: String
    isLiveShoppable: Boolean!
    liveShoppingFeatured: Boolean!
    flashSalePrice: Float
    flashSaleStartAt: DateTime
    flashSaleEndAt: DateTime
    currentStock(warehouseId: ID): StockLevel
    allStockLevels: [StockLevel!]!
    category: Category
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type StockLevel {
    id: ID!
    productId: ID!
    warehouseId: ID!
    totalQuantity: Int!
    availableQuantity: Int!
    reservedQuantity: Int!
    damagedQuantity: Int!
    inTransitQuantity: Int!
    liveEventReserved: Int!
    reorderPoint: Int!
    reorderQuantity: Int!
    maxStockLevel: Int
    status: StockStatus!
    lastCountedAt: DateTime
    product: Product!
    warehouse: Warehouse!
    updatedAt: DateTime!
  }

  type StockMovement {
    id: ID!
    productId: ID!
    warehouseId: ID!
    movementType: MovementType!
    quantityChange: Int!
    reason: String
    referenceId: ID
    performedBy: User
    quantityBefore: Int!
    quantityAfter: Int!
    createdAt: DateTime!
  }

  type LiveShoppingEvent {
    id: ID!
    shopId: ID!
    title: String!
    description: String
    thumbnailUrl: String
    scheduledAt: DateTime!
    startedAt: DateTime
    endedAt: DateTime
    durationMinutes: Int!
    streamId: String
    streamUrl: String
    isLive: Boolean!
    viewerCount: Int!
    status: LiveEventStatus!
    products: [LiveEventProduct!]!
    chat: [ChatMessage!]!
    orders: [Order!]!
    stats: LiveEventStatistics!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type LiveEventProduct {
    id: ID!
    eventId: ID!
    productId: ID!
    product: Product!
    displayOrder: Int
    featured: Boolean!
    quantityReserved: Int!
    quantitySold: Int!
    eventPrice: Float
    views: Int!
    cartAdds: Int!
  }

  enum StockStatus {
    HEALTHY
    LOW
    CRITICAL
    OUT_OF_STOCK
  }

  enum MovementType {
    PURCHASE
    SALE
    ADJUSTMENT
    TRANSFER
    RETURN
    DAMAGE
  }

  enum LiveEventStatus {
    SCHEDULED
    LIVE
    ENDED
    CANCELLED
  }

  input CreateProductInput {
    shopId: ID!
    name: String!
    sku: String!
    description: String
    basePrice: Float!
    costPrice: Float
    images: [ProductImageInput!]
    videoUrl: String
    isLiveShoppable: Boolean
    liveShoppingFeatured: Boolean
    categoryId: ID
  }

  input CreateLiveEventInput {
    shopId: ID!
    title: String!
    description: String
    scheduledAt: DateTime!
    durationMinutes: Int
    thumbnailUrl: String
    productIds: [ID!]
  }
`;
```

### 1.4 REST API Endpoints

```typescript
// File: api/routes/inventory.ts

import express, { Request, Response } from 'express';
import { requireAuth, requireRole } from '../middleware/auth';
import { db } from '../db';
import { publishEvent } from '../events';
import { redis } from '../cache';

const router = express.Router();

// Get stock levels
router.get(
  '/api/stock/levels',
  requireAuth,
  async (req: Request, res: Response) => {
    const { productId, warehouseId, status } = req.query;
    
    try {
      let query = db('stock_levels');
      
      if (productId) query = query.where('product_id', productId);
      if (warehouseId) query = query.where('warehouse_id', warehouseId);
      
      const levels = await query.select('*');
      
      // Add status based on quantity
      const withStatus = levels.map(level => ({
        ...level,
        status: getStockStatus(level.available_quantity, level.reorder_point),
      }));
      
      res.json(withStatus);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Update stock level
router.put(
  '/api/stock/levels/:productId',
  requireAuth,
  requireRole(['admin', 'inventory_manager']),
  async (req: Request, res: Response) => {
    const { productId } = req.params;
    const { warehouseId, quantity, reason } = req.body;
    
    try {
      // Get current level
      const [current] = await db('stock_levels')
        .where({ product_id: productId, warehouse_id: warehouseId })
        .select('available_quantity');
      
      const quantityChange = quantity - current.available_quantity;
      
      // Update stock
      const [updated] = await db('stock_levels')
        .where({ product_id: productId, warehouse_id: warehouseId })
        .update({
          available_quantity: quantity,
          updated_at: new Date(),
        })
        .returning('*');
      
      // Record movement
      await db('stock_movements').insert({
        product_id: productId,
        warehouse_id: warehouseId,
        movement_type: 'adjustment',
        quantity_change: quantityChange,
        reason,
        performed_by: req.user.id,
        quantity_before: current.available_quantity,
        quantity_after: quantity,
      });
      
      // Invalidate cache
      await redis.del(`stock:${productId}:${warehouseId}`);
      
      // Publish event for real-time updates
      await publishEvent('InventoryUpdated', {
        productId,
        warehouseId,
        available: quantity,
        reserved: updated.reserved_quantity,
      });
      
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Create stock reservation
router.post(
  '/api/reservations',
  requireAuth,
  async (req: Request, res: Response) => {
    const { productId, warehouseId, quantity, type, referenceId } = req.body;
    
    try {
      const holdUntil = new Date();
      holdUntil.setMinutes(holdUntil.getMinutes() + 15); // 15-minute hold
      
      const reservation = await db('stock_reservations').insert({
        product_id: productId,
        warehouse_id: warehouseId,
        quantity_reserved: quantity,
        quantity_held_until: holdUntil,
        reservation_type: type,
        reference_id: referenceId,
        customer_id: req.user.id,
        status: 'active',
      });
      
      // Update stock levels
      await db('stock_levels')
        .where({ product_id: productId, warehouse_id: warehouseId })
        .increment('reserved_quantity', quantity)
        .decrement('available_quantity', quantity);
      
      // Publish event
      await publishEvent('StockReserved', {
        productId,
        quantity,
        customerId: req.user.id,
      });
      
      res.json(reservation);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Get function to determine stock status
const getStockStatus = (available: number, reorderPoint: number): string => {
  if (available === 0) return 'OUT_OF_STOCK';
  if (available < reorderPoint) return 'CRITICAL';
  if (available < reorderPoint * 2) return 'LOW';
  return 'HEALTHY';
};

export default router;
```

## Part 2: Frontend Implementation

### 2.1 Dashboard Components

```typescript
// File: components/dashboard/StockMonitor.tsx

import React, { useState, useEffect } from 'react';
import { useQuery, useSubscription } from '@apollo/client';
import { GET_STOCK_LEVELS, STOCK_UPDATED_SUBSCRIPTION } from '../../queries';

interface Stock {
  id: string;
  productId: string;
  warehouseId: string;
  availableQuantity: number;
  reservedQuantity: number;
  status: 'HEALTHY' | 'LOW' | 'CRITICAL' | 'OUT_OF_STOCK';
}

export const StockMonitor: React.FC = () => {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [animatingIds, setAnimatingIds] = useState<Set<string>>(new Set());

  // Initial data fetch
  const { data: initialData } = useQuery(GET_STOCK_LEVELS);

  // Real-time subscription
  useSubscription(STOCK_UPDATED_SUBSCRIPTION, {
    onData: ({ data }) => {
      const updatedStock = data.data.stockUpdated;
      setStocks(prev =>
        prev.map(stock =>
          stock.id === updatedStock.id
            ? { ...stock, ...updatedStock }
            : stock
        )
      );

      // Trigger animation
      setAnimatingIds(prev => new Set(prev).add(updatedStock.id));
      setTimeout(
        () => setAnimatingIds(prev => {
          const next = new Set(prev);
          next.delete(updatedStock.id);
          return next;
        }),
        500
      );
    },
  });

  useEffect(() => {
    if (initialData?.stockLevels) {
      setStocks(initialData.stockLevels);
    }
  }, [initialData]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'HEALTHY': return 'bg-green-100 text-green-800';
      case 'LOW': return 'bg-yellow-100 text-yellow-800';
      case 'CRITICAL': return 'bg-orange-100 text-orange-800';
      case 'OUT_OF_STOCK': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Real-Time Stock Monitor</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {stocks.map(stock => (
          <div
            key={stock.id}
            className={`p-4 border rounded-lg transition-all ${
              animatingIds.has(stock.id) ? 'ring-2 ring-blue-500' : ''
            }`}
          >
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-semibold">Product {stock.productId}</h3>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(stock.status)}`}>
                {stock.status}
              </span>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Available:</span>
                <span className="font-semibold">{stock.availableQuantity}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Reserved:</span>
                <span className="font-semibold">{stock.reservedQuantity}</span>
              </div>

              <div className="mt-3 flex gap-2">
                <button
                  className="flex-1 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                  onClick={() => openAdjustmentModal(stock.id)}
                >
                  Adjust
                </button>
                <button className="flex-1 px-3 py-1 bg-gray-200 text-gray-800 rounded hover:bg-gray-300">
                  History
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const openAdjustmentModal = (stockId: string) => {
  // Modal logic
};
```

```typescript
// File: components/dashboard/LiveEventControl.tsx

import React, { useState, useEffect } from 'react';
import { useMutation, useQuery, useSubscription } from '@apollo/client';
import {
  CREATE_LIVE_EVENT,
  START_LIVE_EVENT,
  END_LIVE_EVENT,
  GET_LIVE_EVENT,
  LIVE_EVENT_UPDATE_SUBSCRIPTION,
} from '../../queries';

interface LiveEvent {
  id: string;
  title: string;
  scheduledAt: Date;
  isLive: boolean;
  viewerCount: number;
  products: any[];
  status: string;
}

export const LiveEventControl: React.FC<{ eventId: string }> = ({ eventId }) => {
  const [event, setEvent] = useState<LiveEvent | null>(null);
  const [orderFeed, setOrderFeed] = useState<any[]>([]);

  const { data: eventData } = useQuery(GET_LIVE_EVENT, { variables: { id: eventId } });
  const [startEvent] = useMutation(START_LIVE_EVENT);
  const [endEvent] = useMutation(END_LIVE_EVENT);

  // Subscribe to real-time updates
  useSubscription(LIVE_EVENT_UPDATE_SUBSCRIPTION, {
    variables: { eventId },
    onData: ({ data }) => {
      setEvent(data.data.liveEventUpdate);
    },
  });

  // Subscribe to orders during event
  useSubscription(LIVE_EVENT_ORDER_SUBSCRIPTION, {
    variables: { eventId },
    skip: !event?.isLive,
    onData: ({ data }) => {
      const newOrder = data.data.liveEventOrder;
      setOrderFeed(prev => [newOrder, ...prev].slice(0, 10));
    },
  });

  useEffect(() => {
    if (eventData?.liveShoppingEvent) {
      setEvent(eventData.liveShoppingEvent);
    }
  }, [eventData]);

  const handleStart = async () => {
    try {
      await startEvent({ variables: { id: eventId } });
    } catch (error) {
      console.error('Error starting event:', error);
    }
  };

  const handleEnd = async () => {
    try {
      await endEvent({ variables: { id: eventId } });
    } catch (error) {
      console.error('Error ending event:', error);
    }
  };

  if (!event) return <div>Loading...</div>;

  return (
    <div className="grid grid-cols-3 gap-6">
      {/* Event Info */}
      <div className="col-span-2 space-y-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-start mb-4">
            <h1 className="text-2xl font-bold">{event.title}</h1>
            <span className={`px-4 py-2 rounded-full font-semibold text-white ${
              event.isLive ? 'bg-red-500' : 'bg-gray-500'
            }`}>
              {event.isLive ? 'LIVE' : 'SCHEDULED'}
            </span>
          </div>

          <div className="mb-4">
            <div className="text-lg font-semibold text-blue-600">
              Viewers: {event.viewerCount}
            </div>
          </div>

          <div className="flex gap-3">
            {!event.isLive ? (
              <button
                onClick={handleStart}
                className="px-6 py-3 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600"
              >
                Start Event
              </button>
            ) : (
              <button
                onClick={handleEnd}
                className="px-6 py-3 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600"
              >
                End Event
              </button>
            )}
          </div>
        </div>

        {/* Featured Products */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-bold mb-4">Featured Products</h3>
          <div className="grid grid-cols-2 gap-3">
            {event.products.map(product => (
              <ProductCard key={product.id} product={product} isLive={event.isLive} />
            ))}
          </div>
        </div>
      </div>

      {/* Order Feed */}
      <div className="bg-white p-6 rounded-lg shadow h-fit">
        <h3 className="text-lg font-bold mb-4">Order Feed</h3>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {orderFeed.map(order => (
            <div key={order.id} className="p-3 border-l-4 border-green-500 bg-gray-50">
              <div className="text-sm font-semibold">{order.customerName}</div>
              <div className="text-xs text-gray-600">{order.productName}</div>
              <div className="text-xs font-semibold text-green-600 mt-1">
                {order.totalAmount}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

interface ProductCardProps {
  product: any;
  isLive: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, isLive }) => {
  return (
    <div className="border rounded-lg p-3 hover:shadow-md transition">
      <img
        src={product.images[0]?.url}
        alt={product.name}
        className="w-full h-32 object-cover rounded mb-2"
      />
      <h4 className="font-semibold text-sm">{product.name}</h4>
      <div className="flex justify-between items-center mt-2">
        <span className="font-bold text-sm">${product.eventPrice || product.basePrice}</span>
        {isLive && (
          <span className="text-xs bg-red-500 text-white px-2 py-1 rounded">
            {product.quantityReserved} sold
          </span>
        )}
      </div>
    </div>
  );
};
```

### 2.2 E-Commerce Frontend Integration

```typescript
// File: pages/storefront/product/[productId].tsx

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useQuery, useMutation } from '@apollo/client';
import { GET_PRODUCT, GET_PRODUCT_STOCK } from '../../../queries';
import { ADD_TO_CART } from '../../../mutations';

export default function ProductPage() {
  const router = useRouter();
  const { productId } = router.query;
  const [quantity, setQuantity] = useState(1);
  const [isLiveEvent, setIsLiveEvent] = useState(false);

  const { data: productData } = useQuery(GET_PRODUCT, {
    variables: { id: productId },
    skip: !productId,
  });

  const { data: stockData } = useQuery(GET_PRODUCT_STOCK, {
    variables: { id: productId },
    skip: !productId,
    pollInterval: 5000, // Poll every 5 seconds
  });

  const [addToCart] = useMutation(ADD_TO_CART, {
    onCompleted: () => {
      router.push('/checkout');
    },
  });

  const handleAddToCart = async () => {
    try {
      await addToCart({
        variables: {
          productId,
          quantity,
          liveEventId: isLiveEvent ? productData?.product?.liveEventId : null,
        },
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  if (!productData) return <div>Loading...</div>;

  const product = productData.product;
  const stock = stockData?.productStock;
  const inStock = stock?.availableQuantity > 0;

  return (
    <div className="grid grid-cols-2 gap-8 max-w-6xl mx-auto py-8">
      {/* Product Images */}
      <div>
        <img
          src={product.images[0]?.url}
          alt={product.name}
          className="w-full rounded-lg"
        />
        <div className="grid grid-cols-4 gap-2 mt-4">
          {product.images.map((img, idx) => (
            <img
              key={idx}
              src={img.url}
              alt={`${product.name} ${idx}`}
              className="w-full h-20 object-cover rounded cursor-pointer hover:opacity-75"
            />
          ))}
        </div>
      </div>

      {/* Product Details */}
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
          <p className="text-gray-600">{product.description}</p>
        </div>

        {/* Live Event Badge */}
        {product.currentLiveEvent && (
          <div className="bg-red-50 border-2 border-red-500 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
              <span className="font-bold text-red-600">LIVE NOW</span>
            </div>
            <p className="text-sm text-red-700">
              Featured in: {product.currentLiveEvent.title}
            </p>
            <button className="mt-2 text-sm text-red-600 hover:text-red-700 font-semibold">
              Watch Live Event →
            </button>
          </div>
        )}

        {/* Pricing */}
        <div className="space-y-2">
          {product.flashSaleEndAt && new Date(product.flashSaleEndAt) > new Date() ? (
            <div>
              <span className="text-sm text-gray-600 line-through">${product.basePrice}</span>
              <span className="text-3xl font-bold text-red-600 ml-3">
                ${product.flashSalePrice}
              </span>
            </div>
          ) : (
            <span className="text-3xl font-bold">${product.basePrice}</span>
          )}
        </div>

        {/* Stock Status */}
        <div className="space-y-2">
          {inStock ? (
            <div className="text-green-600 font-semibold">
              In Stock ({stock.availableQuantity} available)
            </div>
          ) : (
            <div className="text-red-600 font-semibold">Out of Stock</div>
          )}

          {/* Live Event Stock Indicator */}
          {product.currentLiveEvent && stock && (
            <div className="text-sm text-gray-600">
              {stock.liveEventReserved} sold during live event
            </div>
          )}
        </div>

        {/* Add to Cart */}
        <div className="space-y-3">
          <div className="flex gap-4">
            <input
              type="number"
              min="1"
              max={inStock ? stock.availableQuantity : 0}
              value={quantity}
              onChange={e => setQuantity(Math.max(1, parseInt(e.target.value)))}
              className="w-20 px-3 py-2 border rounded-lg"
            />
            <button
              onClick={handleAddToCart}
              disabled={!inStock}
              className={`flex-1 py-3 rounded-lg font-bold text-white transition ${
                inStock
                  ? 'bg-blue-600 hover:bg-blue-700 cursor-pointer'
                  : 'bg-gray-400 cursor-not-allowed'
              }`}
            >
              {inStock ? 'Add to Cart' : 'Out of Stock'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

This technical guide provides production-ready code examples for implementing the live shopping integration. Follow these implementations as templates for your actual development.
