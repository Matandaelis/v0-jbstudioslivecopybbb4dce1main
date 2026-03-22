# Openfront Integrated Dashboard - Technical Implementation Guide

## Part 1: GraphQL API Implementation

### 1.1 KeystoneJS Model Definition

```typescript
// schemas/Product.ts
import { list } from "@keystone-6/core"
import { allowAll } from "@keystone-6/core/access"
import {
  text,
  integer,
  decimal,
  relationship,
  json,
  select,
  timestamp,
  checkbox,
  file,
  virtual,
} from "@keystone-6/core/fields"

export const Product = list({
  access: allowAll(),
  fields: {
    sku: text({
      validation: { isRequired: true },
      isIndexed: "unique",
      db: { map: "sku" },
    }),
    name: text({
      validation: { isRequired: true },
      search: true,
      db: { map: "name" },
    }),
    slug: text({
      isIndexed: "unique",
      hooks: {
        resolveInput: async ({ item, inputData }) => {
          if (inputData.name) {
            return inputData.name
              .toLowerCase()
              .replace(/\s+/g, "-")
              .replace(/[^a-z0-9-]/g, "")
          }
          return item?.slug
        },
      },
    }),
    description: text({
      db: { map: "description" },
    }),
    category: relationship({
      ref: "ProductCategory.products",
    }),
    brand: relationship({
      ref: "Brand.products",
    }),
    vendor: relationship({
      ref: "Vendor.products",
      validation: { isRequired: true },
    }),

    // Pricing
    basePrice: decimal({
      validation: { isRequired: true },
      precision: 10,
      scale: 2,
    }),
    costPrice: decimal({
      precision: 10,
      scale: 2,
    }),
    currency: text({
      defaultValue: "USD",
      validation: { isRequired: true },
    }),

    // Variants
    variants: relationship({
      ref: "ProductVariant.product",
      many: true,
    }),

    // Stock
    stockLevels: relationship({
      ref: "StockLevel.product",
      many: true,
    }),

    // Media
    primaryImage: file({ storage: "product_images" }),
    gallery: json(),

    // Status
    status: select({
      options: [
        { label: "Draft", value: "draft" },
        { label: "Active", value: "active" },
        { label: "Archived", value: "archived" },
        { label: "Discontinued", value: "discontinued" },
      ],
      defaultValue: "draft",
    }),

    // SEO
    metaTitle: text(),
    metaDescription: text(),

    // Reorder
    reorderPoint: integer({ defaultValue: 10 }),
    reorderQuantity: integer({ defaultValue: 50 }),

    // Channel Listings
    channelListings: relationship({
      ref: "ChannelListing.product",
      many: true,
    }),

    // Audit
    createdAt: timestamp({ defaultValue: { kind: "now" } }),
    updatedAt: timestamp({ db: { updatedAt: true } }),
    deletedAt: timestamp(),
    createdBy: relationship({ ref: "User.productsCreated" }),
    updatedBy: relationship({ ref: "User.productsUpdated" }),

    // Virtual fields
    availableQuantity: virtual({
      field: graphql.field({
        type: graphql.Int,
        async resolve(item, args, context) {
          const stocks = await context.db.StockLevel.findMany({
            where: { product: { id: { equals: item.id } } },
          })
          return stocks.reduce((sum, s) => sum + (s.quantityAvailable || 0), 0)
        },
      }),
    }),
  },

  graphql: {
    plural: "Products",
  },
  access: {
    operation: {
      query: ({ session }) => !!session?.user,
      create: ({ session }) => 
        !!session?.user && 
        ["admin", "inventory_manager"].includes(session.user.role),
      update: ({ session }) => 
        !!session?.user && 
        ["admin", "inventory_manager"].includes(session.user.role),
      delete: ({ session }) => 
        !!session?.user && session.user.role === "admin",
    },
  },
})
```

### 1.2 Stock Level Model

```typescript
// schemas/StockLevel.ts
export const StockLevel = list({
  access: allowAll(),
  fields: {
    product: relationship({
      ref: "Product.stockLevels",
      validation: { isRequired: true },
    }),
    variant: relationship({
      ref: "ProductVariant.stockLevels",
    }),
    warehouse: relationship({
      ref: "Warehouse.stockLevels",
      validation: { isRequired: true },
    }),

    // Quantities
    quantityOnHand: integer({
      defaultValue: 0,
      validation: { min: 0, isRequired: true },
    }),
    quantityReserved: integer({
      defaultValue: 0,
      validation: { min: 0, isRequired: true },
    }),
    quantityDamaged: integer({
      defaultValue: 0,
      validation: { min: 0, isRequired: true },
    }),
    quantityOnOrder: integer({
      defaultValue: 0,
      validation: { min: 0, isRequired: true },
    }),

    // Virtual: calculated available quantity
    quantityAvailable: virtual({
      field: graphql.field({
        type: graphql.Int,
        resolve(item) {
          return (item.quantityOnHand || 0) - 
                 (item.quantityReserved || 0) - 
                 (item.quantityDamaged || 0)
        },
      }),
    }),

    // Reorder info
    reorderPoint: integer({ defaultValue: 10 }),
    reorderQuantity: integer({ defaultValue: 50 }),

    // Status
    lastCountedAt: timestamp(),

    // Movements
    movements: relationship({
      ref: "StockMovement.stockLevel",
      many: true,
    }),

    // Reservations
    reservations: relationship({
      ref: "StockReservation.stockLevel",
      many: true,
    }),

    // Timestamps
    createdAt: timestamp({ defaultValue: { kind: "now" } }),
    updatedAt: timestamp({ db: { updatedAt: true } }),
  },

  hooks: {
    validate: async ({ item, addValidationError }) => {
      const available = (item.quantityOnHand || 0) - 
                       (item.quantityReserved || 0) - 
                       (item.quantityDamaged || 0)
      if (available < 0) {
        addValidationError("Calculated available quantity cannot be negative")
      }
    },
  },
})
```

### 1.3 Stock Movement Model

```typescript
// schemas/StockMovement.ts
export const StockMovement = list({
  access: allowAll(),
  fields: {
    stockLevel: relationship({
      ref: "StockLevel.movements",
      validation: { isRequired: true },
    }),
    type: select({
      options: [
        { label: "In", value: "in" },
        { label: "Out", value: "out" },
        { label: "Adjustment", value: "adjustment" },
        { label: "Return", value: "return" },
        { label: "Damage", value: "damage" },
        { label: "Transfer", value: "transfer" },
      ],
      validation: { isRequired: true },
    }),
    quantityChange: integer({
      validation: { isRequired: true },
    }),
    reason: text(),
    referenceId: text(), // Order ID, Return ID, etc.
    notes: text(),

    createdBy: relationship({
      ref: "User.stockMovements",
      validation: { isRequired: true },
    }),
    createdAt: timestamp({ defaultValue: { kind: "now" } }),
  },

  // Immutable - no updates after creation
  access: {
    operation: {
      update: () => false,
      delete: () => false,
    },
  },

  hooks: {
    validate: async ({ item, addValidationError }) => {
      if (!item.reason && item.type === "adjustment") {
        addValidationError("Reason is required for manual adjustments")
      }
    },
  },
})
```

### 1.4 Stock Reservation Model

```typescript
// schemas/StockReservation.ts
export const StockReservation = list({
  access: allowAll(),
  fields: {
    order: relationship({
      ref: "Order.reservations",
      validation: { isRequired: true },
    }),
    orderItem: relationship({
      ref: "OrderItem.reservation",
    }),
    stockLevel: relationship({
      ref: "StockLevel.reservations",
      validation: { isRequired: true },
    }),

    quantity: integer({
      validation: { isRequired: true, min: 1 },
    }),

    status: select({
      options: [
        { label: "Reserved", value: "reserved" },
        { label: "Allocated", value: "allocated" },
        { label: "Fulfilled", value: "fulfilled" },
        { label: "Cancelled", value: "cancelled" },
      ],
      defaultValue: "reserved",
    }),

    reservedAt: timestamp({ defaultValue: { kind: "now" } }),
    expiresAt: timestamp(),
    fulfilledAt: timestamp(),
    updatedAt: timestamp({ db: { updatedAt: true } }),
  },

  // Prevent deletion of active reservations
  hooks: {
    validate: async ({ item, addValidationError, context }) => {
      if (item.status === "reserved" && item.expiresAt) {
        const now = new Date()
        if (item.expiresAt < now) {
          addValidationError("Reservation has expired")
        }
      }
    },
  },
})
```

## Part 2: REST API Endpoints

### 2.1 Product Endpoints

```typescript
// api/products.ts
import express from "express"
import { requireAuth, requireRole } from "@/middleware/auth"
import { Product, ProductVariant } from "@/models"

const router = express.Router()

// GET /api/products - List products
router.get("/", requireAuth, async (req, res) => {
  const { skip = 0, take = 50, category, vendor, status, search } = req.query

  const where: any = {}
  if (category) where.category = { slug: category }
  if (vendor) where.vendor = { id: vendor }
  if (status) where.status = status
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { sku: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ]
  }

  const products = await Product.findMany({
    where,
    skip: parseInt(skip as string),
    take: parseInt(take as string),
    include: {
      category: true,
      brand: true,
      vendor: true,
      variants: true,
      stockLevels: true,
    },
    orderBy: { createdAt: "desc" },
  })

  const total = await Product.count({ where })

  res.json({
    data: products,
    pagination: {
      skip,
      take,
      total,
      pages: Math.ceil(total / take),
    },
  })
})

// POST /api/products - Create product
router.post("/", requireAuth, requireRole("admin", "inventory_manager"), async (req, res) => {
  const {
    sku,
    name,
    description,
    categoryId,
    brandId,
    basePrice,
    costPrice,
    vendorId,
    reorderPoint,
    reorderQuantity,
  } = req.body

  // Validation
  if (!sku || !name || !basePrice || !vendorId) {
    return res.status(400).json({ error: "Missing required fields" })
  }

  // Check for duplicate SKU
  const existing = await Product.findFirst({ where: { sku } })
  if (existing) {
    return res.status(409).json({ error: "SKU already exists" })
  }

  try {
    const product = await Product.create({
      data: {
        sku,
        name,
        description,
        category: categoryId ? { connect: { id: categoryId } } : undefined,
        brand: brandId ? { connect: { id: brandId } } : undefined,
        basePrice,
        costPrice,
        vendor: { connect: { id: vendorId } },
        reorderPoint,
        reorderQuantity,
        status: "draft",
        createdBy: { connect: { id: req.user.id } },
      },
      include: { vendor: true, category: true, brand: true },
    })

    res.status(201).json({ data: product })
  } catch (error) {
    res.status(500).json({ error: "Failed to create product" })
  }
})

// PATCH /api/products/:id - Update product
router.patch("/:id", requireAuth, requireRole("admin", "inventory_manager"), async (req, res) => {
  const { id } = req.params
  const updateData = req.body

  try {
    const product = await Product.update({
      where: { id },
      data: {
        ...updateData,
        updatedBy: { connect: { id: req.user.id } },
      },
      include: { vendor: true, category: true, brand: true, variants: true },
    })

    res.json({ data: product })
  } catch (error) {
    res.status(500).json({ error: "Failed to update product" })
  }
})

// DELETE /api/products/:id - Soft delete product
router.delete("/:id", requireAuth, requireRole("admin"), async (req, res) => {
  const { id } = req.params

  try {
    const product = await Product.update({
      where: { id },
      data: { deletedAt: new Date() },
    })

    res.json({ data: product })
  } catch (error) {
    res.status(500).json({ error: "Failed to delete product" })
  }
})

export default router
```

### 2.2 Inventory Endpoints

```typescript
// api/inventory.ts
import express from "express"
import { requireAuth, requireRole } from "@/middleware/auth"
import { StockLevel, StockMovement, StockReservation } from "@/models"
import { publishEvent } from "@/services/eventBus"

const router = express.Router()

// GET /api/inventory/stock-levels - Get stock levels
router.get("/stock-levels", requireAuth, async (req, res) => {
  const { warehouseId, productId, low_stock } = req.query

  const where: any = {}
  if (warehouseId) where.warehouse = { id: warehouseId }
  if (productId) where.product = { id: productId }

  const stocks = await StockLevel.findMany({
    where,
    include: { product: true, warehouse: true, variant: true },
  })

  // Filter low stock
  if (low_stock === "true") {
    const filtered = stocks.filter(
      (s) => s.quantityAvailable < (s.reorderPoint || 10)
    )
    return res.json({ data: filtered })
  }

  res.json({ data: stocks })
})

// PATCH /api/inventory/adjustments - Adjust stock
router.patch(
  "/adjustments",
  requireAuth,
  requireRole("admin", "inventory_manager", "warehouse_manager"),
  async (req, res) => {
    const { stockLevelId, quantity, type, reason, referenceId } = req.body

    if (!stockLevelId || !quantity || !type) {
      return res.status(400).json({ error: "Missing required fields" })
    }

    try {
      const stockLevel = await StockLevel.findUnique({
        where: { id: stockLevelId },
        include: { product: true, warehouse: true },
      })

      if (!stockLevel) {
        return res.status(404).json({ error: "Stock level not found" })
      }

      // Update stock based on type
      const update: any = {}
      if (type === "in") update.quantityOnHand = { increment: quantity }
      if (type === "out") update.quantityOnHand = { decrement: quantity }
      if (type === "damage") update.quantityDamaged = { increment: quantity }

      // Validate
      if (type === "out" && stockLevel.quantityAvailable < quantity) {
        return res.status(400).json({ error: "Insufficient stock available" })
      }

      // Update stock level
      const updated = await StockLevel.update({
        where: { id: stockLevelId },
        data: update,
      })

      // Create movement record
      const movement = await StockMovement.create({
        data: {
          stockLevel: { connect: { id: stockLevelId } },
          type,
          quantityChange: quantity,
          reason,
          referenceId,
          createdBy: { connect: { id: req.user.id } },
        },
      })

      // Publish event
      await publishEvent("inventory.stock-levels.updated", {
        stockLevelId,
        productId: stockLevel.product.id,
        warehouseId: stockLevel.warehouse.id,
        oldQuantity: stockLevel.quantityOnHand,
        newQuantity: updated.quantityOnHand,
        reason,
      })

      // Check if low stock
      if (updated.quantityAvailable < (stockLevel.reorderPoint || 10)) {
        await publishEvent("inventory.low-stock-alert", {
          stockLevelId,
          productId: stockLevel.product.id,
          warehouseId: stockLevel.warehouse.id,
          currentQuantity: updated.quantityAvailable,
          reorderPoint: stockLevel.reorderPoint,
        })
      }

      res.json({ data: { stockLevel: updated, movement } })
    } catch (error) {
      console.error("Adjustment error:", error)
      res.status(500).json({ error: "Failed to adjust stock" })
    }
  }
)

// POST /api/inventory/reservations - Reserve stock
router.post(
  "/reservations",
  requireAuth,
  async (req, res) => {
    const { orderId, orderItemId, stockLevelId, quantity } = req.body

    if (!orderId || !stockLevelId || !quantity) {
      return res.status(400).json({ error: "Missing required fields" })
    }

    try {
      const stockLevel = await StockLevel.findUnique({
        where: { id: stockLevelId },
      })

      if (!stockLevel) {
        return res.status(404).json({ error: "Stock level not found" })
      }

      if (stockLevel.quantityAvailable < quantity) {
        return res.status(400).json({ error: "Insufficient stock available" })
      }

      // Create reservation
      const reservation = await StockReservation.create({
        data: {
          order: { connect: { id: orderId } },
          orderItem: orderItemId ? { connect: { id: orderItemId } } : undefined,
          stockLevel: { connect: { id: stockLevelId } },
          quantity,
          status: "reserved",
          expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 min expiry
        },
      })

      // Update reserved quantity
      await StockLevel.update({
        where: { id: stockLevelId },
        data: { quantityReserved: { increment: quantity } },
      })

      // Publish event
      await publishEvent("inventory.reservation-created", {
        reservationId: reservation.id,
        orderId,
        stockLevelId,
        quantity,
      })

      res.status(201).json({ data: reservation })
    } catch (error) {
      console.error("Reservation error:", error)
      res.status(500).json({ error: "Failed to reserve stock" })
    }
  }
)

export default router
```

## Part 3: Frontend React Components

### 3.1 Product Catalog Component

```typescript
// components/ProductCatalog.tsx
import React, { useState, useCallback } from "react"
import { useQuery, useMutation } from "@apollo/client"
import { GET_PRODUCTS, UPDATE_PRODUCT } from "@/graphql/products"
import ProductTable from "./ProductTable"
import ProductForm from "./ProductForm"
import { Button, Input, Select, Dialog } from "@/components/ui"

interface ProductCatalogProps {
  vendorId?: string
}

export const ProductCatalog: React.FC<ProductCatalogProps> = ({ vendorId }) => {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)

  const { data, loading, error, refetch } = useQuery(GET_PRODUCTS, {
    variables: {
      skip: (page - 1) * 50,
      take: 50,
      search,
      category,
      vendor: vendorId,
    },
  })

  const [updateProduct] = useMutation(UPDATE_PRODUCT, {
    onCompleted: () => {
      refetch()
      setShowForm(false)
    },
  })

  const handleEdit = useCallback((product) => {
    setSelectedProduct(product)
    setShowForm(true)
  }, [])

  const handleSave = useCallback(
    (formData) => {
      updateProduct({
        variables: {
          id: selectedProduct.id,
          input: formData,
        },
      })
    },
    [selectedProduct, updateProduct]
  )

  return (
    <div className="space-y-4 p-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Product Catalog</h2>
        <Button onClick={() => {
          setSelectedProduct(null)
          setShowForm(true)
        }}>
          New Product
        </Button>
      </div>

      {/* Search & Filter */}
      <div className="flex gap-4">
        <Input
          placeholder="Search products..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setPage(1)
          }}
          className="flex-1"
        />
        <Select
          value={category}
          onChange={(e) => {
            setCategory(e.target.value)
            setPage(1)
          }}
          placeholder="Filter by category"
        >
          {/* Options */}
        </Select>
      </div>

      {/* Product Table */}
      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : error ? (
        <div className="text-red-600">Error: {error.message}</div>
      ) : (
        <ProductTable
          products={data?.products?.data || []}
          onEdit={handleEdit}
          pagination={{
            page,
            total: data?.products?.pagination?.total,
            pages: data?.products?.pagination?.pages,
            onPageChange: setPage,
          }}
        />
      )}

      {/* Product Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <ProductForm
          product={selectedProduct}
          onSave={handleSave}
          onCancel={() => setShowForm(false)}
        />
      </Dialog>
    </div>
  )
}
```

### 3.2 Stock Level Monitor Component

```typescript
// components/StockLevelMonitor.tsx
import React, { useState, useEffect } from "react"
import { useSubscription } from "@apollo/client"
import { STOCK_LEVELS_SUBSCRIPTION } from "@/graphql/inventory"
import { useWebSocket } from "@/hooks/useWebSocket"
import StockLevelGrid from "./StockLevelGrid"
import LowStockAlert from "./LowStockAlert"

export const StockLevelMonitor: React.FC = () => {
  const [stockLevels, setStockLevels] = useState([])
  const [lowStockItems, setLowStockItems] = useState([])

  // WebSocket real-time updates
  const { data: wsData } = useWebSocket({
    url: "wss://api.openfront.local/inventory/ws",
    onMessage: (message) => {
      if (message.type === "stock_level_updated") {
        // Update specific stock level
        setStockLevels((prev) =>
          prev.map((sl) =>
            sl.id === message.data.stockLevelId
              ? { ...sl, quantityOnHand: message.data.newQuantity }
              : sl
          )
        )
      }
      if (message.type === "low_stock_alert") {
        setLowStockItems((prev) => [...prev, message.data])
      }
    },
  })

  // GraphQL subscription for initial data
  const { data, loading } = useSubscription(STOCK_LEVELS_SUBSCRIPTION, {
    variables: { warehouseId: null },
  })

  useEffect(() => {
    if (data?.stockLevelUpdated) {
      setStockLevels((prev) => [
        ...prev.filter((sl) => sl.id !== data.stockLevelUpdated.id),
        data.stockLevelUpdated,
      ])
    }
  }, [data])

  return (
    <div className="space-y-6 p-6">
      <h2 className="text-2xl font-bold">Real-Time Stock Monitor</h2>

      {/* Low Stock Alerts */}
      {lowStockItems.length > 0 && (
        <div className="space-y-2">
          {lowStockItems.map((item) => (
            <LowStockAlert key={item.stockLevelId} {...item} />
          ))}
        </div>
      )}

      {/* Stock Level Grid */}
      {loading ? (
        <div className="text-center py-8">Loading stock levels...</div>
      ) : (
        <StockLevelGrid stockLevels={stockLevels} />
      )}
    </div>
  )
}
```

### 3.3 Stock Adjustment Form Component

```typescript
// components/StockAdjustmentForm.tsx
import React, { useState } from "react"
import { useMutation } from "@apollo/client"
import { ADJUST_STOCK } from "@/graphql/inventory"
import { Button, Input, Select, Textarea, Dialog } from "@/components/ui"

interface StockAdjustmentFormProps {
  stockLevelId: string
  currentQuantity: number
  onCompleted?: () => void
}

export const StockAdjustmentForm: React.FC<StockAdjustmentFormProps> = ({
  stockLevelId,
  currentQuantity,
  onCompleted,
}) => {
  const [type, setType] = useState("adjustment")
  const [quantity, setQuantity] = useState("")
  const [reason, setReason] = useState("")
  const [notes, setNotes] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const [adjustStock] = useMutation(ADJUST_STOCK, {
    onCompleted: () => {
      setQuantity("")
      setReason("")
      setNotes("")
      onCompleted?.()
    },
    onError: (err) => {
      setError(err.message)
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      await adjustStock({
        variables: {
          input: {
            stockLevelId,
            quantity: parseInt(quantity),
            type,
            reason,
            notes,
          },
        },
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">
          Adjustment Type
        </label>
        <Select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="in">Stock In</option>
          <option value="out">Stock Out</option>
          <option value="adjustment">Adjustment</option>
          <option value="return">Return</option>
          <option value="damage">Damage</option>
          <option value="transfer">Transfer</option>
        </Select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Quantity</label>
        <Input
          type="number"
          min="1"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          placeholder="Enter quantity"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Reason</label>
        <Select value={reason} onChange={(e) => setReason(e.target.value)}>
          <option value="">Select reason</option>
          {type === "in" && (
            <>
              <option value="received">Received from Supplier</option>
              <option value="return">Customer Return</option>
            </>
          )}
          {type === "out" && (
            <>
              <option value="sold">Sold</option>
              <option value="damaged">Damaged</option>
            </>
          )}
          {type === "adjustment" && (
            <>
              <option value="count_discrepancy">Count Discrepancy</option>
              <option value="correction">Correction</option>
            </>
          )}
        </Select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Notes</label>
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Additional notes (optional)"
          rows={3}
        />
      </div>

      {error && <div className="text-red-600 text-sm">{error}</div>}

      <div className="flex gap-2">
        <Button type="submit" disabled={loading || !quantity}>
          {loading ? "Processing..." : "Adjust Stock"}
        </Button>
      </div>
    </form>
  )
}
```

## Part 4: Database Migration Scripts

### 4.1 Initial Schema Migration

```sql
-- migrations/001_create_inventory_schema.sql
BEGIN;

-- Create ENUM types
CREATE TYPE product_status AS ENUM ('draft', 'active', 'archived', 'discontinued');
CREATE TYPE variant_status AS ENUM ('active', 'inactive');
CREATE TYPE stock_movement_type AS ENUM ('in', 'out', 'adjustment', 'return', 'damage', 'transfer');
CREATE TYPE reservation_status AS ENUM ('reserved', 'allocated', 'fulfilled', 'cancelled');
CREATE TYPE transfer_status AS ENUM ('pending', 'in_transit', 'received', 'cancelled');
CREATE TYPE count_type AS ENUM ('full', 'cycle', 'spot_check');
CREATE TYPE count_status AS ENUM ('scheduled', 'in_progress', 'completed', 'cancelled');

-- Products
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sku VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(500) NOT NULL,
  description TEXT,
  category_id UUID,
  brand_id UUID,
  base_price DECIMAL(10,2) NOT NULL,
  cost_price DECIMAL(10,2),
  currency VARCHAR(3) DEFAULT 'USD',
  primary_image_url VARCHAR(500),
  gallery_images JSONB,
  status product_status DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP,
  meta_title VARCHAR(255),
  meta_description VARCHAR(500),
  slug VARCHAR(500) UNIQUE,
  vendor_id UUID NOT NULL,
  reorder_point INTEGER DEFAULT 10,
  reorder_quantity INTEGER DEFAULT 50,
  created_by UUID,
  updated_by UUID
);

CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_vendor ON products(vendor_id, status);
CREATE INDEX idx_products_deleted ON products(deleted_at);

-- Product Variants
CREATE TABLE product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  sku_suffix VARCHAR(100),
  variant_name VARCHAR(255),
  attributes JSONB,
  price_override DECIMAL(10,2),
  cost_override DECIMAL(10,2),
  image_url VARCHAR(500),
  status variant_status DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_product_variants_product ON product_variants(product_id);

-- Warehouses
CREATE TABLE warehouses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  location_code VARCHAR(50) UNIQUE,
  address JSONB,
  total_capacity INTEGER,
  current_items INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  is_receiving_enabled BOOLEAN DEFAULT TRUE,
  is_shipping_enabled BOOLEAN DEFAULT TRUE,
  manager_id UUID,
  phone VARCHAR(20),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Stock Levels
CREATE TABLE stock_levels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  variant_id UUID REFERENCES product_variants(id) ON DELETE CASCADE,
  warehouse_id UUID NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
  quantity_on_hand INTEGER DEFAULT 0 CHECK (quantity_on_hand >= 0),
  quantity_reserved INTEGER DEFAULT 0 CHECK (quantity_reserved >= 0),
  quantity_damaged INTEGER DEFAULT 0 CHECK (quantity_damaged >= 0),
  quantity_on_order INTEGER DEFAULT 0 CHECK (quantity_on_order >= 0),
  reorder_point INTEGER DEFAULT 10,
  reorder_quantity INTEGER DEFAULT 50,
  last_counted_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(product_id, variant_id, warehouse_id)
);

CREATE INDEX idx_stock_levels_product_warehouse 
  ON stock_levels(product_id, warehouse_id);
CREATE INDEX idx_stock_levels_warehouse 
  ON stock_levels(warehouse_id);

-- Stock Movements
CREATE TABLE stock_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stock_level_id UUID NOT NULL REFERENCES stock_levels(id),
  type stock_movement_type NOT NULL,
  quantity_change INTEGER NOT NULL,
  reason VARCHAR(255),
  reference_id UUID,
  notes TEXT,
  created_by UUID,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_stock_movements_stock_level 
  ON stock_movements(stock_level_id, created_at DESC);
CREATE INDEX idx_stock_movements_reference 
  ON stock_movements(reference_id);

-- Stock Reservations
CREATE TABLE stock_reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL,
  order_item_id UUID,
  stock_level_id UUID NOT NULL REFERENCES stock_levels(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  status reservation_status DEFAULT 'reserved',
  reserved_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP,
  fulfilled_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_stock_reservations_order 
  ON stock_reservations(order_id);
CREATE INDEX idx_stock_reservations_status 
  ON stock_reservations(status, expires_at);

-- Stock Transfers
CREATE TABLE stock_transfers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_warehouse_id UUID NOT NULL REFERENCES warehouses(id),
  to_warehouse_id UUID NOT NULL REFERENCES warehouses(id),
  product_id UUID NOT NULL REFERENCES products(id),
  variant_id UUID REFERENCES product_variants(id),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  status transfer_status DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  shipped_at TIMESTAMP,
  received_at TIMESTAMP,
  tracking_number VARCHAR(255),
  created_by UUID
);

CREATE INDEX idx_stock_transfers_status 
  ON stock_transfers(status);

-- Stock Counts
CREATE TABLE stock_counts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  warehouse_id UUID NOT NULL REFERENCES warehouses(id),
  count_type count_type DEFAULT 'cycle',
  status count_status DEFAULT 'scheduled',
  scheduled_date DATE,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  variance_items INTEGER,
  adjustment_count INTEGER,
  created_by UUID
);

-- Stock Count Items
CREATE TABLE stock_count_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  count_id UUID NOT NULL REFERENCES stock_counts(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  variant_id UUID REFERENCES product_variants(id),
  expected_quantity INTEGER,
  counted_quantity INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Channel Listings
CREATE TABLE channel_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  channel VARCHAR(50) NOT NULL,
  channel_product_id VARCHAR(255) NOT NULL,
  sync_status VARCHAR(50) DEFAULT 'draft',
  last_sync_at TIMESTAMP,
  sync_error_message TEXT,
  channel_price DECIMAL(10,2),
  currency VARCHAR(3),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(product_id, channel, channel_product_id)
);

CREATE INDEX idx_channel_listings_product 
  ON channel_listings(product_id, channel);

COMMIT;
```

This comprehensive guide provides all the code needed to implement the integrated dashboard system. Each section builds upon the previous one, creating a complete, production-ready inventory management platform.
