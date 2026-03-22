# Openfront Integrated Dashboard Plan
## Product & Inventory Management System Integration

### Executive Summary

This document outlines a comprehensive strategy for integrating product and inventory management directly into the Openfront dashboard, creating a unified e-commerce operations platform. The integration consolidates product listings, stock level management, order processing, payment handling, and shipping—all within a single, cohesive interface.

**Scope:** Transform Openfront from a fulfillment-focused platform into an end-to-end e-commerce operations center.

**Timeline:** 20-week phased implementation
**Team Size:** 8-10 engineers
**Infrastructure:** Kubernetes-ready microservices architecture

---

## 1. Architecture Overview

### 1.1 Current Openfront Architecture
```
┌─────────────────────────────────────────────────────┐
│           Openfront Dashboard (Admin)               │
│  - Order Management                                  │
│  - Fulfillment & Shipping                           │
│  - Vendor Management                                │
└─────────────────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────────────────┐
│      GraphQL API Layer (Apollo/KeystoneJS)          │
│  - Order Queries & Mutations                        │
│  - Fulfillment Operations                           │
│  - Vendor Data                                      │
└─────────────────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────────────────┐
│      PostgreSQL Database                             │
│  - Orders, Fulfillments, Vendors                    │
└─────────────────────────────────────────────────────┘
```

### 1.2 Integrated Architecture (Post-Implementation)
```
┌──────────────────────────────────────────────────────────────┐
│         Openfront Unified Dashboard                          │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ Products & Inventory │ Orders & Fulfillment │ Analytics│  │
│  │ - Catalog Management │ - Order Processing    │ - Reports│  │
│  │ - Stock Levels       │ - Payment Integration │ - Trends │  │
│  │ - Pricing            │ - Shipping & Returns  │ - Metrics│  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
                          ↓
┌──────────────────────────────────────────────────────────────┐
│      GraphQL API Gateway + REST APIs (Real-time)            │
│  ┌──────────────────┬──────────────────┬──────────────────┐ │
│  │ Product Service  │ Inventory Service│ Order Service    │ │
│  │ - Product CRUD   │ - Stock Tracking │ - Order Mgmt     │ │
│  │ - Pricing        │ - Reservations   │ - Payments       │ │
│  │ - Categories     │ - Adjustments    │ - Fulfillment    │ │
│  └──────────────────┴──────────────────┴──────────────────┘ │
└──────────────────────────────────────────────────────────────┘
                          ↓
┌──────────────────────────────────────────────────────────────┐
│  PostgreSQL + Redis Cache + Event Bus (Apache Kafka)        │
│  ┌────────────┬────────────┬────────────┬────────────┐     │
│  │ Products   │ Inventory  │ Orders     │ Events     │     │
│  └────────────┴────────────┴────────────┴────────────┘     │
└──────────────────────────────────────────────────────────────┘
                          ↓
┌──────────────────────────────────────────────────────────────┐
│    External Integrations & Channels                         │
│  ┌────────────┬────────────┬────────────┬────────────┐     │
│  │ Shopify    │ WooCommerce│ Amazon     │ Custom API │     │
│  │ Sync       │ Sync       │ Integration│ Endpoints  │     │
│  └────────────┴────────────┴────────────┴────────────┘     │
└──────────────────────────────────────────────────────────────┘
```

---

## 2. Database Schema Enhancements

### 2.1 Product Management Tables

```sql
-- Core Products Table (Extended)
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sku VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(500) NOT NULL,
  description TEXT,
  category_id UUID REFERENCES product_categories(id),
  brand_id UUID REFERENCES brands(id),
  
  -- Pricing
  base_price DECIMAL(10,2) NOT NULL,
  cost_price DECIMAL(10,2),
  currency VARCHAR(3) DEFAULT 'USD',
  
  -- Media
  primary_image_url VARCHAR(500),
  gallery_images JSONB,
  
  -- Status & Metadata
  status ENUM('active', 'draft', 'archived', 'discontinued') DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP,
  
  -- SEO
  meta_title VARCHAR(255),
  meta_description VARCHAR(500),
  slug VARCHAR(500) UNIQUE,
  
  -- Vendor
  vendor_id UUID REFERENCES vendors(id) NOT NULL,
  
  -- Audit
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

-- Product Variants (Size, Color, etc.)
CREATE TABLE product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  
  -- Variant Attributes
  sku_suffix VARCHAR(100),
  variant_name VARCHAR(255),
  attributes JSONB, -- {color: 'red', size: 'M', pattern: 'striped'}
  
  -- Pricing
  price_override DECIMAL(10,2),
  cost_override DECIMAL(10,2),
  
  -- Media
  image_url VARCHAR(500),
  
  -- Status
  status ENUM('active', 'inactive') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Product Categories
CREATE TABLE product_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL UNIQUE,
  slug VARCHAR(255) UNIQUE,
  description TEXT,
  parent_id UUID REFERENCES product_categories(id),
  icon_url VARCHAR(500),
  display_order INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Brands
CREATE TABLE brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL UNIQUE,
  slug VARCHAR(255) UNIQUE,
  logo_url VARCHAR(500),
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 2.2 Inventory Management Tables

```sql
-- Warehouses/Locations
CREATE TABLE warehouses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  location_code VARCHAR(50) UNIQUE,
  address JSONB, -- {street, city, state, zip, country}
  
  -- Capacity
  total_capacity INTEGER,
  current_items INTEGER DEFAULT 0,
  
  -- Operations
  is_active BOOLEAN DEFAULT TRUE,
  is_receiving_enabled BOOLEAN DEFAULT TRUE,
  is_shipping_enabled BOOLEAN DEFAULT TRUE,
  
  -- Contact
  manager_id UUID REFERENCES users(id),
  phone VARCHAR(20),
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Stock Levels (Real-time inventory)
CREATE TABLE stock_levels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  variant_id UUID REFERENCES product_variants(id) ON DELETE CASCADE,
  warehouse_id UUID NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
  
  -- Quantities
  quantity_on_hand INTEGER DEFAULT 0,
  quantity_reserved INTEGER DEFAULT 0,
  quantity_damaged INTEGER DEFAULT 0,
  quantity_on_order INTEGER DEFAULT 0,
  
  -- Calculated Fields
  quantity_available INTEGER GENERATED ALWAYS AS 
    (quantity_on_hand - quantity_reserved - quantity_damaged) STORED,
  
  -- Reorder Point
  reorder_point INTEGER DEFAULT 10,
  reorder_quantity INTEGER DEFAULT 50,
  
  -- Tracking
  last_counted_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(product_id, variant_id, warehouse_id)
);

-- Stock Movement History (Audit Trail)
CREATE TABLE stock_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stock_level_id UUID NOT NULL REFERENCES stock_levels(id),
  
  -- Movement Type
  type ENUM('in', 'out', 'adjustment', 'return', 'damage', 'transfer') NOT NULL,
  
  -- Details
  quantity_change INTEGER NOT NULL,
  reason VARCHAR(255),
  reference_id UUID, -- Order ID, Return ID, Transfer ID, etc.
  notes TEXT,
  
  -- Tracking
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Stock Reservations (For orders)
CREATE TABLE stock_reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  order_item_id UUID REFERENCES order_items(id) ON DELETE CASCADE,
  stock_level_id UUID NOT NULL REFERENCES stock_levels(id) ON DELETE CASCADE,
  
  quantity INTEGER NOT NULL,
  
  -- Status
  status ENUM('reserved', 'allocated', 'fulfilled', 'cancelled') DEFAULT 'reserved',
  
  -- Dates
  reserved_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP, -- Auto-release if order not fulfilled
  fulfilled_at TIMESTAMP,
  
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Stock Transfers Between Warehouses
CREATE TABLE stock_transfers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Locations
  from_warehouse_id UUID NOT NULL REFERENCES warehouses(id),
  to_warehouse_id UUID NOT NULL REFERENCES warehouses(id),
  
  -- Product
  product_id UUID NOT NULL REFERENCES products(id),
  variant_id UUID REFERENCES product_variants(id),
  
  quantity INTEGER NOT NULL,
  
  -- Status
  status ENUM('pending', 'in_transit', 'received', 'cancelled') DEFAULT 'pending',
  
  -- Dates
  created_at TIMESTAMP DEFAULT NOW(),
  shipped_at TIMESTAMP,
  received_at TIMESTAMP,
  
  -- Tracking
  tracking_number VARCHAR(255),
  created_by UUID REFERENCES auth.users(id)
);

-- Stock Count/Cycle Count
CREATE TABLE stock_counts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  warehouse_id UUID NOT NULL REFERENCES warehouses(id),
  
  -- Count Details
  count_type ENUM('full', 'cycle', 'spot_check') DEFAULT 'cycle',
  status ENUM('scheduled', 'in_progress', 'completed', 'cancelled') DEFAULT 'scheduled',
  
  -- Dates
  scheduled_date DATE,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  
  -- Results
  variance_items INTEGER, -- Items with discrepancies
  adjustment_count INTEGER,
  
  created_by UUID REFERENCES auth.users(id)
);

-- Stock Count Items (Line items in a count)
CREATE TABLE stock_count_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  count_id UUID NOT NULL REFERENCES stock_counts(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  variant_id UUID REFERENCES product_variants(id),
  
  expected_quantity INTEGER,
  counted_quantity INTEGER,
  variance INTEGER GENERATED ALWAYS AS 
    (counted_quantity - expected_quantity) STORED,
  
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 2.3 Integration Tables

```sql
-- External Channel Listings
CREATE TABLE channel_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  
  -- Channel Info
  channel VARCHAR(50) NOT NULL, -- 'shopify', 'woocommerce', 'amazon'
  channel_product_id VARCHAR(255) NOT NULL,
  
  -- Sync Status
  sync_status ENUM('synced', 'pending', 'error', 'draft') DEFAULT 'draft',
  last_sync_at TIMESTAMP,
  sync_error_message TEXT,
  
  -- Pricing
  channel_price DECIMAL(10,2),
  currency VARCHAR(3),
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(product_id, channel, channel_product_id)
);

-- Order Item Stock Reservation (Links Orders to Inventory)
ALTER TABLE order_items ADD COLUMN (
  stock_reservation_id UUID REFERENCES stock_reservations(id)
);
```

### 2.4 Indexes for Performance

```sql
CREATE INDEX idx_stock_levels_product_warehouse 
  ON stock_levels(product_id, warehouse_id);

CREATE INDEX idx_stock_movements_stock_level 
  ON stock_movements(stock_level_id, created_at DESC);

CREATE INDEX idx_stock_reservations_order 
  ON stock_reservations(order_id);

CREATE INDEX idx_stock_reservations_status 
  ON stock_reservations(status, expires_at);

CREATE INDEX idx_products_sku 
  ON products(sku);

CREATE INDEX idx_products_vendor 
  ON products(vendor_id, status);

CREATE INDEX idx_channel_listings_product 
  ON channel_listings(product_id, channel);

CREATE INDEX idx_stock_count_items_variance 
  ON stock_count_items(variance DESC) 
  WHERE variance != 0;
```

---

## 3. API Architecture & Endpoints

### 3.1 GraphQL Schema Extensions

```graphql
# Product Management
type Product {
  id: ID!
  sku: String!
  name: String!
  description: String
  category: ProductCategory
  brand: Brand
  basePrice: Float!
  costPrice: Float
  currency: String!
  variants: [ProductVariant!]!
  
  # Inventory
  inventory: ProductInventory!
  reorderPoint: Int!
  reorderQuantity: Int!
  
  # Media
  primaryImage: String
  gallery: [String!]!
  
  # Status
  status: ProductStatus!
  
  # Vendor
  vendor: Vendor!
  
  # Channels
  channelListings: [ChannelListing!]!
  
  # Timestamps
  createdAt: DateTime!
  updatedAt: DateTime!
  deletedAt: DateTime
}

type ProductVariant {
  id: ID!
  product: Product!
  sku: String!
  name: String!
  attributes: JSON!
  priceOverride: Float
  costOverride: Float
  image: String
  status: VariantStatus!
}

# Inventory Types
type StockLevel {
  id: ID!
  product: Product!
  variant: ProductVariant
  warehouse: Warehouse!
  
  quantityOnHand: Int!
  quantityReserved: Int!
  quantityDamaged: Int!
  quantityOnOrder: Int!
  quantityAvailable: Int!
  
  reorderPoint: Int!
  reorderQuantity: Int!
  
  lastCountedAt: DateTime
  updatedAt: DateTime!
}

type StockMovement {
  id: ID!
  type: StockMovementType!
  quantity: Int!
  reason: String
  reference: StockMovementReference # Polymorphic
  notes: String
  createdBy: User!
  createdAt: DateTime!
}

type StockReservation {
  id: ID!
  order: Order!
  orderItem: OrderItem!
  stockLevel: StockLevel!
  quantity: Int!
  status: ReservationStatus!
  reservedAt: DateTime!
  expiresAt: DateTime
  fulfilledAt: DateTime
}

type Warehouse {
  id: ID!
  name: String!
  locationCode: String!
  address: Address!
  totalCapacity: Int!
  currentItems: Int!
  isActive: Boolean!
  isReceivingEnabled: Boolean!
  isShippingEnabled: Boolean!
  manager: User
  phone: String
  
  stockLevels: [StockLevel!]!
  stockTransfers: [StockTransfer!]!
  
  createdAt: DateTime!
  updatedAt: DateTime!
}

type StockTransfer {
  id: ID!
  fromWarehouse: Warehouse!
  toWarehouse: Warehouse!
  product: Product!
  variant: ProductVariant
  quantity: Int!
  status: TransferStatus!
  trackingNumber: String
  
  createdAt: DateTime!
  shippedAt: DateTime
  receivedAt: DateTime
}

# Queries
type Query {
  # Products
  products(filter: ProductFilter, pagination: Pagination): ProductConnection!
  product(id: ID!): Product
  productBySkU(sku: String!): Product
  
  # Inventory
  stockLevels(filter: StockLevelFilter): [StockLevel!]!
  stockLevel(id: ID!): StockLevel
  stockLevelsByProduct(productId: ID!, includeVariants: Boolean): [StockLevel!]!
  stockLevelsByWarehouse(warehouseId: ID!): [StockLevel!]!
  
  # Low Stock
  lowStockItems(warehouseId: ID): [StockLevel!]!
  outOfStockItems: [Product!]!
  
  # Stock Movements
  stockMovements(filter: StockMovementFilter): [StockMovement!]!
  
  # Reservations
  stockReservations(filter: ReservationFilter): [StockReservation!]!
  
  # Warehouses
  warehouses: [Warehouse!]!
  warehouse(id: ID!): Warehouse
  
  # Transfers
  stockTransfers(status: TransferStatus): [StockTransfer!]!
  
  # Analytics
  inventoryAnalytics(dateRange: DateRange!): InventoryAnalytics!
  productAnalytics(productId: ID!): ProductAnalytics!
}

# Mutations
type Mutation {
  # Product Management
  createProduct(input: CreateProductInput!): Product!
  updateProduct(id: ID!, input: UpdateProductInput!): Product!
  deleteProduct(id: ID!): Boolean!
  
  # Variants
  createVariant(input: CreateVariantInput!): ProductVariant!
  updateVariant(id: ID!, input: UpdateVariantInput!): ProductVariant!
  deleteVariant(id: ID!): Boolean!
  
  # Stock Adjustments
  adjustStock(input: AdjustStockInput!): StockMovement!
  adjustMultipleStocks(input: [AdjustStockInput!]!): [StockMovement!]!
  
  # Stock Transfers
  createTransfer(input: CreateTransferInput!): StockTransfer!
  shipTransfer(id: ID!, trackingNumber: String): StockTransfer!
  receiveTransfer(id: ID!): StockTransfer!
  
  # Stock Counts
  createStockCount(input: CreateStockCountInput!): StockCount!
  updateCountItem(id: ID!, countedQuantity: Int!): StockCountItem!
  completeStockCount(id: ID!): StockCount!
  
  # Reservations
  reserveStock(input: ReserveStockInput!): StockReservation!
  releaseReservation(id: ID!): Boolean!
  allocateReservation(id: ID!): StockReservation!
  
  # Channels
  syncProductToChannel(id: ID!, channel: String!): ChannelListing!
  updateChannelListing(id: ID!, input: UpdateChannelListingInput!): ChannelListing!
}

# Subscriptions
type Subscription {
  stockLevelUpdated(productId: ID): StockLevel!
  stockMovementCreated(warehouseId: ID): StockMovement!
  lowStockAlert(threshold: Int): StockLevel!
  orderInventoryStatus(orderId: ID!): InventoryStatus!
}
```

### 3.2 REST API Endpoints

```
Products
├── GET    /api/products
├── POST   /api/products
├── GET    /api/products/:id
├── PATCH  /api/products/:id
├── DELETE /api/products/:id
├── GET    /api/products/:id/variants
└── POST   /api/products/:id/variants

Inventory
├── GET    /api/inventory/stock-levels
├── GET    /api/inventory/stock-levels/:id
├── PATCH  /api/inventory/stock-levels/:id
├── POST   /api/inventory/adjustments
├── GET    /api/inventory/movements
├── GET    /api/inventory/low-stock
├── GET    /api/inventory/out-of-stock
└── GET    /api/inventory/analytics

Reservations
├── POST   /api/inventory/reservations
├── GET    /api/inventory/reservations/:reservationId
├── PATCH  /api/inventory/reservations/:reservationId
└── DELETE /api/inventory/reservations/:reservationId

Transfers
├── POST   /api/inventory/transfers
├── GET    /api/inventory/transfers/:id
├── PATCH  /api/inventory/transfers/:id/ship
├── PATCH  /api/inventory/transfers/:id/receive
└── GET    /api/inventory/transfers

Stock Counts
├── POST   /api/inventory/counts
├── GET    /api/inventory/counts/:id
├── PATCH  /api/inventory/counts/:id/items
└── PATCH  /api/inventory/counts/:id/complete

Warehouses
├── GET    /api/warehouses
├── POST   /api/warehouses
├── GET    /api/warehouses/:id
└── PATCH  /api/warehouses/:id

Channels
├── GET    /api/channels/listings
├── POST   /api/channels/sync
├── GET    /api/channels/sync-status
└── PATCH  /api/channels/listings/:id
```

---

## 4. Frontend Dashboard Components

### 4.1 Dashboard Layout

```
┌─────────────────────────────────────────────────────────┐
│ Openfront Unified Dashboard                             │
├─────────────────────────────────────────────────────────┤
│  [Products] [Inventory] [Orders] [Fulfillment] [Reports]│
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Product & Inventory Dashboard                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │ Quick Stats                                        │ │
│  │ ┌──────────┬──────────┬──────────┬──────────────┐ │ │
│  │ │ Products │  SKUs    │ Variants │  Warehouses  │ │ │
│  │ │   1,234  │  3,456   │  5,678   │      4       │ │ │
│  │ └──────────┴──────────┴──────────┴──────────────┘ │ │
│  │                                                    │ │
│  │ ┌──────────┬──────────┬──────────┬──────────────┐ │ │
│  │ │ In Stock │Low Stock │Out Stock │  Reserved    │ │ │
│  │ │  2,340   │   234    │   56     │    890       │ │ │
│  │ └──────────┴──────────┴──────────┴──────────────┘ │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│  ┌────────────────────┬────────────────────────────────┐ │
│  │ Product Catalog    │ Real-time Stock Monitor        │ │
│  │ - Search/Filter    │ - Stock Levels by Warehouse   │ │
│  │ - Bulk Edit        │ - Low Stock Alerts            │ │
│  │ - Category Tree    │ - Stock Movements             │ │
│  │ - Pricing View     │ - Reservation Status          │ │
│  └────────────────────┴────────────────────────────────┘ │
│                                                          │
│  ┌────────────────────┬────────────────────────────────┐ │
│  │ Inventory Operations│ Analytics & Reporting         │ │
│  │ - Stock Adjustments│ - Inventory Turnover          │ │
│  │ - Transfers        │ - Stock Health Score          │ │
│  │ - Stock Counts     │ - Forecast vs Actual          │ │
│  │ - Cycle Counts     │ - SKU Performance             │ │
│  └────────────────────┴────────────────────────────────┘ │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### 4.2 Key UI Components

```typescript
// 1. Product Catalog Manager
<ProductCatalogManager>
  ├── ProductSearchBar (fuzzy search, filters)
  ├── ProductTable
  │   ├── ProductRow
  │   │   ├── ProductName
  │   │   ├── SKU
  │   │   ├── Category
  │   │   ├── Price
  │   │   ├── Status
  │   │   └── ActionMenu
  │   └── BulkActions (edit, delete, export)
  └── ProductDetailPanel
      ├── BasicInfo
      ├── Pricing
      ├── Media
      ├── Variants
      └── ChannelListings

// 2. Stock Level Monitor
<StockLevelMonitor>
  ├── WarehouseSelector
  ├── StockLevelGrid
  │   ├── ProductInfo
  │   ├── OnHand / Reserved / Damaged / OnOrder
  │   ├── Available Quantity (Highlighted)
  │   ├── Reorder Indicator
  │   └── QuickActionMenu
  ├── FilterPanel (by category, status, etc.)
  ├── SortOptions (by quantity, reorder point, etc.)
  └── ExportOptions

// 3. Stock Adjustment Interface
<StockAdjustmentForm>
  ├── ProductSelector
  ├── VariantSelector (if applicable)
  ├── WarehouseSelector
  ├── AdjustmentType (in, out, adjustment, return, damage)
  ├── QuantityInput
  ├── ReasonDropdown
  ├── ReferenceSelector (order, return, transfer)
  ├── NotesTextarea
  └── SubmitButton

// 4. Stock Transfer Manager
<StockTransferManager>
  ├── TransferForm
  │   ├── FromWarehouseSelector
  │   ├── ToWarehouseSelector
  │   ├── ProductSearch
  │   ├── VariantSelector
  │   ├── QuantityInput
  │   ├── TrackingNumberInput
  │   └── SubmitButton
  └── TransfersList
      ├── FilterByStatus
      ├── TransferRow
      │   ├── ProductInfo
      │   ├── FromWarehouse
      │   ├── ToWarehouse
      │   ├── Status
      │   ├── ShipButton
      │   └── ReceiveButton
      └── Timeline

// 5. Stock Count Interface
<StockCountModule>
  ├── CountScheduler
  │   ├── CountType (full, cycle, spot-check)
  │   ├── WarehouseSelector
  │   ├── ScheduleDate
  │   └── AssigneeSelector
  ├── CountProgress
  │   ├── ItemsToCount
  │   ├── ItemsCompleted
  │   ├── ProgressBar
  │   └── TimeRemaining
  └── CountDataEntry
      ├── ProductInfo
      ├── ExpectedQuantity
      ├── CountedQuantity
      ├── VarianceIndicator
      ├── NotesInput
      └── NextButton

// 6. Inventory Analytics Dashboard
<InventoryAnalytics>
  ├── DateRangePicker
  ├── MetricsCards
  │   ├── TotalInventoryValue
  │   ├── StockTurnover
  │   ├── InventoryAccuracy
  │   └── DaysOfInventory
  ├── Charts
  │   ├── StockLevelTrends
  │   ├── InventoryByCategory
  │   ├── StockMovementVolume
  │   ├── WarehouseUtilization
  │   └── ForecastVsActual
  ├── ReportGenerator
  └── ExportOptions
```

---

## 5. Integration Workflows

### 5.1 Order to Inventory Flow

```
Order Created Event
  ↓
[Inventory Service] Validate Stock Availability
  ├─ Check all requested items in preferred warehouse(s)
  └─ Check if partial fulfillment from multiple warehouses
  ↓
IF Stock Available
  → Reserve Stock
    → Create StockReservation records
    → Decrement quantity_reserved in StockLevel
    → Create StockMovement (type: 'reservation')
    ↓
  → Send Confirmation to Order Service
    ↓
  → Order Moves to "Awaiting Fulfillment" Status
    ↓
  → Allocate Stock When Order Enters Fulfillment
    → Update reservation status to 'allocated'
    ↓
  → Pick & Pack Operations
    ↓
  → Fulfill Order
    → Update reservation status to 'fulfilled'
    → Decrement quantity_on_hand
    → Create StockMovement (type: 'out')
    → Update order status to "Shipped"

IF Stock NOT Available
  → Check if backorder is enabled
  ├─ Yes: Order moves to "Backorder" status
  │        Stock reserved for future fulfillment
  └─ No: Send notification to customer
         Order moves to "Pending Stock" status
         Create Stock Alert for warehouse manager
```

### 5.2 Return to Inventory Flow

```
Return Initiated by Customer
  ↓
[Return Service] Creates Return Request
  ↓
[Inventory Service] Creates Return Inspection Record
  ↓
Customer Ships Item Back
  ↓
[Warehouse] Receives Return
  → Create inbound stock count
  → Inspect item condition
  ↓
IF Item Acceptable (minor/no damage)
  → Create StockMovement (type: 'return')
  → Increment quantity_on_hand
  → Release inventory for sale
  ↓
IF Item Damaged
  → Create StockMovement (type: 'damage')
  → Increment quantity_damaged
  → Move to damaged goods warehouse
  → Create disposal request
  ↓
[Return Service] Updates Return Status
  ↓
Send Refund to Customer
```

### 5.3 Multi-Channel Inventory Sync Flow

```
Product Updated in Openfront
  ↓
[Product Service] Publishes ProductUpdated Event
  ↓
[Channel Sync Service] Subscribes to Event
  ↓
For Each Connected Channel (Shopify, WooCommerce, Amazon)
  ├─ Get channel listing mapping
  ├─ Get current stock level
  ├─ Prepare payload for channel API
  ├─ Call channel update endpoint
  ├─ Handle response (success/error)
  │  ├─ Success: Update last_sync_at
  │  └─ Error: Set sync_status = 'error', log error_message
  └─ Update sync_status based on result
  ↓
[Analytics] Track sync success rate
```

---

## 6. Real-Time Synchronization Strategy

### 6.1 Event-Driven Architecture

```
Event Bus (Apache Kafka / RabbitMQ)

Topics:
├── inventory.stock-levels.updated
│   └── Triggered by: Stock adjustments, reservations, fulfillment
│   └── Subscribers: Dashboard, Analytics, Channel Sync, Notifications
│
├── inventory.low-stock-alert
│   └── Triggered by: Stock level drops below reorder point
│   └── Subscribers: Notifications, Alerts, Procurement
│
├── inventory.out-of-stock-alert
│   └── Triggered by: Stock level reaches zero
│   └── Subscribers: Notifications, Orders, Channels
│
├── orders.order-created
│   └── Triggered by: Order Service
│   └── Subscribers: Inventory Service (reserve stock)
│
├── orders.order-fulfilled
│   └── Triggered by: Fulfillment Service
│   └── Subscribers: Inventory Service (deduct stock)
│
├── returns.return-received
│   └── Triggered by: Return Service
│   └── Subscribers: Inventory Service (restore stock)
│
└── channels.sync-requested
    └── Triggered by: Product/Inventory Service
    └── Subscribers: Channel Sync Service
```

### 6.2 WebSocket Real-Time Updates

```typescript
// Client Connection
ws://openfront-api.local/inventory/ws?userId={userId}&warehouseId={warehouseId}

// Update Types
interface StockLevelUpdate {
  type: 'stock_level_updated';
  data: {
    stockLevelId: string;
    productId: string;
    warehouseId: string;
    oldQuantity: number;
    newQuantity: number;
    reason: string;
  };
}

interface LowStockAlert {
  type: 'low_stock_alert';
  data: {
    productId: string;
    warehouseId: string;
    currentQuantity: number;
    reorderPoint: number;
  };
}

interface ReservationUpdate {
  type: 'reservation_status_changed';
  data: {
    reservationId: string;
    orderId: string;
    status: 'reserved' | 'allocated' | 'fulfilled' | 'cancelled';
  };
}
```

### 6.3 Redis Caching Layer

```
Cache Keys:
├── product:{productId} → Product details
├── product:sku:{sku} → Product by SKU
├── stock-level:{stockLevelId} → Current stock levels
├── warehouse:{warehouseId}:stock → All stock in warehouse
├── product:{productId}:warehouses → Stock across all warehouses
├── low-stock:items → List of low stock items (updated hourly)
├── out-of-stock:items → List of out of stock items (real-time)
├── order:{orderId}:reservations → Reservations for order
└── channel-sync:{channel}:pending → Pending channel syncs

TTLs:
- Product details: 1 hour
- Stock levels: 5 minutes (aggressive refresh)
- Low stock alerts: 1 hour
- Channel sync status: 30 minutes
```

---

## 7. Security & Data Consistency

### 7.1 Role-Based Access Control (RBAC)

```
Roles:
├── Super Admin
│   └── All permissions
│
├── Inventory Manager
│   ├── View all products & stock
│   ├── Create/edit products
│   ├── Adjust stock levels
│   ├── Create transfers
│   └── No pricing changes
│
├── Warehouse Manager
│   ├── View warehouse inventory only
│   ├── Perform stock counts
│   ├── Confirm transfers
│   ├── Create adjustments
│   └── No product creation
│
├── Procurement Manager
│   ├── View low stock items
│   ├── Create purchase orders
│   ├── Receive goods
│   └── No stock adjustments
│
├── Channel Manager
│   ├── Sync products to channels
│   ├── Update channel listings
│   ├── View channel inventory
│   └── No warehouse operations
│
└── Vendor (Limited)
    ├── View own products only
    ├── Update product info
    ├── Request stock transfers
    └── No adjustment authority

Permissions:
├── products:read, :create, :update, :delete
├── products:variants:read, :create, :update, :delete
├── inventory:read, :adjust, :transfer, :count
├── stock-reservations:read, :create, :release
├── warehouses:read, :manage
├── channels:sync, :manage
└── reports:read, :export
```

### 7.2 Data Consistency Measures

```
1. Database Constraints
   ├── Foreign key constraints on all relationships
   ├── Check constraints on quantities (>= 0)
   ├── Unique constraints on SKU, variant combinations
   └── NOT NULL on critical fields

2. Transaction Management
   ├── Stock adjustments wrapped in transactions
   ├── Reservation and order creation atomic
   ├── Transfer updates transactional
   └── Stock count completion atomic

3. Idempotency
   ├── All stock movements have idempotency keys
   ├── Duplicate detection on webhook processing
   ├── Stock movement deduplication
   └── Transfer confirmation deduplication

4. Audit Trail
   ├── All stock changes logged with timestamp
   ├── User attribution for every change
   ├── Reason codes mandatory
   ├── Reversibility with audit trail
   └── Compliance reports for stock discrepancies

5. Real-time Validation
   ├── Stock availability check before reservation
   ├── Warehouse capacity validation on transfers
   ├── Product status validation before order fulfillment
   └── Channel availability check before listing
```

### 7.3 Encryption & Data Protection

```
├── Data at Rest
│   ├── PostgreSQL Transparent Data Encryption (TDE)
│   ├── Encrypted columns for sensitive data (cost, supplier info)
│   └── Encrypted backup files
│
├── Data in Transit
│   ├── TLS 1.3 for all API communications
│   ├── API key encryption in channel integrations
│   ├── Webhook signature verification (HMAC-SHA256)
│   └── JWT token encryption for session management
│
└── PII & Sensitive Data
    ├── Warehouse manager contact info encrypted
    ├── Supplier information encrypted
    ├── Cost information access restricted
    └── Audit logs stored securely
```

---

## 8. Scalability & Performance

### 8.1 Database Optimization

```
1. Partitioning Strategy
   ├── stock_movements partitioned by created_at (monthly)
   ├── stock_count_items partitioned by created_at (quarterly)
   └── channel_listings partitioned by channel

2. Caching Strategy
   ├── Redis for frequently accessed stock levels
   ├── CDN for product images
   ├── Query result caching for analytics
   └── Invalidation on every stock change

3. Query Optimization
   ├── Indexed pagination for large result sets
   ├── Pre-computed aggregations for low-stock items
   ├── Materialized views for analytics
   └── Batch operations for bulk updates

4. Connection Pooling
   ├── PgBouncer for database connection management
   ├── Adaptive pool sizing based on load
   └── Separate read replicas for reporting
```

### 8.2 API Performance

```
1. Request Handling
   ├── GraphQL query complexity analysis
   ├── Request timeout: 30 seconds
   ├── Batch operations limit: 1000 items
   ├── Rate limiting: 1000 requests/minute per user
   └── Pagination default: 50 items, max: 500

2. Response Optimization
   ├── GZIP compression for all responses
   ├── JSON field-level selection in GraphQL
   ├── Lazy loading for related data
   └── Cursor-based pagination for large datasets

3. Caching Headers
   ├── Product data: Cache-Control: max-age=3600
   ├── Stock levels: Cache-Control: max-age=300
   ├── Analytics: Cache-Control: max-age=3600
   └── Real-time data: Cache-Control: no-cache
```

### 8.3 Horizontal Scalability

```
Microservices Architecture:
├── Product Service (3+ replicas)
│   ├── Handles product CRUD
│   ├── Manages variants
│   └── Channel sync initiation
│
├── Inventory Service (5+ replicas)
│   ├── Stock level management
│   ├── Reservation handling
│   ├── Stock movement tracking
│   └── Real-time updates
│
├── Warehouse Service (2+ replicas)
│   ├── Warehouse management
│   ├── Stock transfer operations
│   ├── Stock count coordination
│   └── Capacity management
│
├── Channel Sync Service (3+ replicas)
│   ├── Multi-channel synchronization
│   ├── API integration with external channels
│   ├── Error handling & retry logic
│   └── Sync status tracking
│
└── Analytics Service (2+ replicas)
    ├── Inventory metrics computation
    ├── Report generation
    ├── Forecasting
    └── Health scoring
```

---

## 9. Integration with E-Commerce Frontend

### 9.1 Unified Order Flow

```
Customer Browsing (Frontend)
├── Product Listing Page
│   ├── Display products from Openfront catalog
│   ├── Show real-time stock availability
│   ├── Display reviews & ratings
│   └── Show shipping options by warehouse
│
└── Product Detail Page
    ├── Display all variants with stock status
    ├── Show warehouse availability
    ├── Suggest alternate variants if out of stock
    ├── Pre-order option if backorder enabled
    └── Estimated delivery based on warehouse

Add to Cart
├── Check stock availability in real-time
├── Add reservation hold (15-minute grace period)
├── Display estimated shipping dates
└── Show warehouse shipping from

Checkout
├── Select shipping address
├── System selects optimal warehouse
│   └── Closest warehouse with stock
├── Calculate shipping cost & delivery date
├── Display final inventory commitment
└── Lock reservation for 1 hour post-checkout

Payment Processing
├── Process payment via Stripe/PayPal integration
├── On successful payment:
│   ├── Create Order record in Openfront
│   ├── Confirm stock reservation
│   ├── Create fulfillment record
│   └── Send confirmation email
│
└── On failed payment:
    ├── Release reservation hold
    └── Notify customer

Order Confirmation
├── Display order details
├── Show warehouse fulfilling order
├── Provide tracking information
├── Link to customer account order history
└── Email confirmation with inventory status
```

### 9.2 Inventory Visibility on Frontend

```
Components:
├── StockAvailabilityBadge
│   ├── "In Stock" (green)
│   ├── "Low Stock" (yellow) - < 5 units
│   ├── "Backordered" (red)
│   └── "Out of Stock" (grey)
│
├── WarehouseAvailabilityCard
│   ├── Show stock by warehouse
│   ├── Estimated delivery time per warehouse
│   └── Shipping cost per warehouse
│
├── VariantAvailabilityGrid
│   ├── Show availability for each variant
│   ├── Highlight available variants
│   ├── Show pre-order availability
│   └── Suggest alternatives if variant unavailable
│
├── DeliveryEstimateDisplay
│   ├── Based on warehouse + shipping method
│   ├── Show handling time + transit time
│   ├── Display delivery date range
│   └── Express/Standard options
│
└── NotifyMeButton
    ├── For out-of-stock items
    ├── Email notification when back in stock
    ├── Related product suggestions
    └── Pre-order option if available
```

### 9.3 Customer Account Integration

```
Customer Dashboard:
├── Order History
│   ├── Order status
│   ├── Inventory fulfillment status
│   ├── Warehouse fulfilling order
│   └── Tracking information
│
├── Wishlist/Saved Items
│   ├── Stock availability tracking
│   ├── Price change notifications
│   ├── Back-in-stock notifications
│   └── Reorder suggestions
│
├── Returns Management
│   ├── Return request submission
│   ├── Real-time return status
│   ├── Refund tracking
│   └── Restocking inventory
│
└── Notification Preferences
    ├── Low stock notifications
    ├── Back-in-stock alerts
    ├── Personalized recommendations
    └── Inventory-based promotions
```

---

## 10. Implementation Roadmap

### Phase 1: Foundation (Weeks 1-3)
- Database schema design & creation
- Core product & variant models
- Stock level tables & indexing
- Initial API scaffolding

### Phase 2: Product Management (Weeks 4-6)
- Product CRUD APIs
- Variant management system
- Product image handling
- Basic inventory views

### Phase 3: Inventory Core (Weeks 7-10)
- Stock level management
- Stock movement tracking
- Real-time stock updates
- Basic adjustments interface

### Phase 4: Reservations & Orders (Weeks 11-13)
- Stock reservation system
- Order-inventory integration
- Reservation expiry handling
- Fulfillment workflow

### Phase 5: Advanced Features (Weeks 14-17)
- Stock transfers
- Stock counting
- Return processing
- Channel synchronization

### Phase 6: Analytics & Optimization (Weeks 18-20)
- Analytics dashboard
- Forecasting engine
- Performance optimization
- Multi-warehouse operations

---

## 11. Success Metrics

### Business Metrics
- Inventory accuracy: > 99%
- Stock-out reduction: < 2%
- Order fulfillment time: < 24 hours
- Return processing: < 3 days
- Channel sync success rate: > 99.5%

### Technical Metrics
- API response time: < 200ms (p95)
- Real-time update latency: < 1 second
- Database query time: < 100ms
- System uptime: > 99.9%
- Data consistency score: 100%

---

## 12. Risk Mitigation

### Data Migration Risks
- Mitigation: Parallel running with existing system for 2 weeks
- Validation: Daily reconciliation reports
- Rollback: Automated backup & recovery procedure

### Performance Risks
- Mitigation: Load testing before production
- Optimization: Database query profiling
- Scaling: Microservices architecture

### Integration Risks
- Mitigation: Comprehensive API testing
- Sandbox: Test channels before production sync
- Monitoring: Real-time alerting on sync failures

---

## Conclusion

This integrated inventory management system transforms Openfront from a fulfillment-focused platform into a comprehensive e-commerce operations center. By tightly coupling inventory with orders, products, and shipping, Openfront gains the capability to optimize operations, improve customer experience, and reduce costs.

The phased 20-week implementation approach allows for iterative development, testing, and refinement while maintaining system stability. The architecture supports future growth, multi-channel operations, and advanced analytics capabilities.
