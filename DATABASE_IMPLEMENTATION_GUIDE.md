# Database Implementation Guide

## Getting Started

This guide walks through implementing the enhanced database schema and integrating it with the live shopping platform.

## Phase 1: Schema Setup

### Step 1: Execute Migration Scripts

1. **Core Schema Migration:**
   \`\`\`bash
   # Navigate to Supabase SQL Editor or use psql
   # Copy contents of scripts/01_core_schema_migration.sql
   # Execute in Supabase dashboard or CLI
   \`\`\`

   This creates:
   - 13 core tables (products, orders, payments, etc.)
   - 30+ performance indexes
   - Enables RLS on all tables

2. **RLS Policies Migration:**
   \`\`\`bash
   # Execute scripts/02_rls_policies_migration.sql
   \`\`\`

   This creates:
   - Role-based access policies
   - Public/private visibility rules
   - Admin override capabilities

3. **Functions & Triggers:**
   \`\`\`bash
   # Execute scripts/03_triggers_and_functions.sql
   \`\`\`

   This creates:
   - Automatic timestamp management
   - Audit logging functions
   - Inventory management functions
   - Commission calculation functions

### Step 2: Verify Schema Creation

\`\`\`sql
-- Check tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';

-- Check indexes
SELECT indexname FROM pg_indexes 
WHERE schemaname = 'public';

-- Check functions
SELECT routine_name FROM information_schema.routines 
WHERE routine_schema = 'public';
\`\`\`

## Phase 2: API Route Implementation

### Route Structure

\`\`\`
app/api/
├── products/
│   ├── route.ts (GET, POST)
│   ├── [productId]/
│   │   ├── route.ts (GET, PUT, DELETE)
│   │   └── reviews/
│   │       └── route.ts (GET - public, POST - auth)
│   └── [productId]/inventory/
│       └── route.ts (PUT - seller)
├── orders/
│   ├── route.ts (GET, POST)
│   ├── [orderId]/
│   │   ├── route.ts (GET, PUT)
│   │   └── cancel/
│   │       └── route.ts (POST)
│   └── [orderId]/items/
│       └── route.ts (GET)
├── payments/
│   ├── create-intent/
│   │   └── route.ts (POST)
│   └── confirm/
│       └── route.ts (POST)
├── notifications/
│   ├── route.ts (GET)
│   └── [notificationId]/
│       ├── read/
│       │   └── route.ts (PUT)
│       └── delete/
│           └── route.ts (DELETE)
├── sellers/
│   ├── dashboard/
│   │   └── route.ts (GET)
│   ├── products/
│   │   └── route.ts (GET)
│   ├── commissions/
│   │   └── route.ts (GET)
│   └── payouts/
│       └── route.ts (GET, POST)
└── admin/
    ├── users/
    │   ├── route.ts (GET)
    │   └── [userId]/
    │       └── role/
    │           └── route.ts (PUT)
    ├── analytics/
    │   └── route.ts (GET)
    └── audit-logs/
        └── route.ts (GET)
\`\`\`

### Example: Products Route

**`app/api/products/route.ts`**

\`\`\`typescript
import { NextRequest, NextResponse } from "next/server"
import { getSupabaseServer } from "@/lib/supabase-server"
import { hasPermission } from "@/lib/db-operations"
import { z } from "zod"

const createProductSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  short_description: z.string().max(500).optional(),
  price: z.number().positive(),
  category: z.string().min(1),
  sku: z.string().optional(),
  images: z.array(z.string().url()).default([]),
})

export async function GET(request: NextRequest) {
  try {
    const supabase = await getSupabaseServer()
    const { searchParams } = new URL(request.url)

    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const category = searchParams.get("category")
    const search = searchParams.get("search")

    let query = supabase
      .from("products")
      .select("*", { count: "exact" })
      .eq("status", "active")
      .is("deleted_at", null)
      .order("created_at", { ascending: false })

    if (category) {
      query = query.eq("category", category)
    }

    if (search) {
      query = query.ilike("title", `%${search}%`)
    }

    const { data, count, error } = await query
      .range((page - 1) * limit, page * limit - 1)

    if (error) throw error

    return NextResponse.json({
      data,
      pagination: { page, limit, total: count },
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await getSupabaseServer()
    const user = await supabase.auth.getUser()

    if (!user.data.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Check if user is a seller
    const isSeller = await hasPermission(user.data.user.id, ["seller", "admin"])
    if (!isSeller) {
      return NextResponse.json(
        { error: "Only sellers can create products" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validatedData = createProductSchema.parse(body)

    const { data, error } = await supabase
      .from("products")
      .insert([
        {
          ...validatedData,
          seller_id: user.data.user.id,
        },
      ])
      .select()

    if (error) throw error

    // Create inventory record
    const product = data[0]
    await supabase.from("product_inventory").insert([
      {
        product_id: product.id,
        quantity_available: 0,
      },
    ])

    return NextResponse.json(product, { status: 201 })
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 422 }
      )
    }
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
\`\`\`

## Phase 3: Frontend Integration

### Using Database Operations

\`\`\`typescript
import { getSupabaseServer } from "@/lib/supabase-server"
import {
  createOrder,
  getOrderWithItems,
  createPayment,
  getProductReviews,
} from "@/lib/db-operations"

// Create an order
async function placeOrder(orderData) {
  const order = await createOrder(orderData)
  return order
}

// Get order details
async function viewOrder(orderId: string) {
  const order = await getOrderWithItems(orderId)
  return order
}

// Submit a review
async function submitReview(reviewData) {
  const review = await createReview(reviewData)
  return review
}
\`\`\`

## Phase 4: Testing

### Unit Tests

\`\`\`typescript
// __tests__/api/products.test.ts
import { POST } from "@/app/api/products/route"
import { NextRequest } from "next/server"

describe("Products API", () => {
  it("should create a product for sellers", async () => {
    const request = new NextRequest(
      new URL("http://localhost/api/products"),
      {
        method: "POST",
        body: JSON.stringify({
          title: "Test Product",
          price: 99.99,
          category: "test",
        }),
      }
    )

    const response = await POST(request)
    expect(response.status).toBe(201)
  })

  it("should reject non-sellers", async () => {
    // Mock non-seller user
    const response = await POST(request)
    expect(response.status).toBe(403)
  })
})
\`\`\`

### Integration Tests

\`\`\`typescript
// __tests__/integration/order-flow.test.ts
describe("Order Flow", () => {
  it("should complete full order lifecycle", async () => {
    // 1. Create order
    const order = await createOrder(orderData)
    expect(order.status).toBe("pending")

    // 2. Create payment
    const payment = await createPayment({
      order_id: order.id,
      amount: order.total_amount,
    })
    expect(payment.status).toBe("pending")

    // 3. Confirm payment
    const updatedPayment = await updatePaymentStatus(
      payment.id,
      "succeeded"
    )
    expect(updatedPayment.status).toBe("succeeded")

    // 4. Verify order updated
    const updatedOrder = await getOrderWithItems(order.id)
    expect(updatedOrder.status).toBe("confirmed")
  })
})
\`\`\`

## Phase 5: Monitoring & Optimization

### Enable Query Logging

\`\`\`sql
-- In Supabase dashboard -> SQL Editor
-- Enable slow query log
ALTER SYSTEM SET log_min_duration_statement = 100;
SELECT pg_reload_conf();
\`\`\`

### Performance Monitoring

\`\`\`typescript
// Add to API routes
async function measureQuery(label: string, fn: () => Promise<any>) {
  const start = performance.now()
  const result = await fn()
  const duration = performance.now() - start
  
  if (duration > 100) {
    console.warn(`Slow query: ${label} took ${duration}ms`)
  }
  return result
}
\`\`\`

### Connection Pool Monitoring

\`\`\`typescript
// Monitor Supabase connection usage
import { getSupabaseServer } from "@/lib/supabase-server"

async function checkConnectionHealth() {
  const supabase = await getSupabaseServer()
  
  // Test simple query
  const { error } = await supabase.from("products").select("id").limit(1)
  
  if (error) {
    console.error("Connection health check failed:", error)
  }
}
\`\`\`

## Phase 6: Security Hardening

### Validate All Inputs

\`\`\`typescript
import { z } from "zod"

const OrderItemSchema = z.object({
  product_id: z.string().uuid(),
  quantity: z.number().int().positive().min(1).max(1000),
})

// Use in API routes
const items = OrderItemSchema.array().parse(request.body.items)
\`\`\`

### Rate Limiting

\`\`\`typescript
import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(100, "1 m"),
})

export async function POST(request: NextRequest) {
  const { success } = await ratelimit.limit(userId)
  if (!success) return new Response("Rate limited", { status: 429 })
  // Continue with request
}
\`\`\`

### Audit Logging

All critical operations should log:

\`\`\`typescript
await logAuditEvent(
  "order_created",
  "orders",
  order.id,
  null,
  { order_number: order.order_number, total: order.total_amount }
)
\`\`\`

## Common Issues & Solutions

### Issue: RLS Policies Blocking Legitimate Queries

**Solution:** Check RLS policies match user's role and permissions
\`\`\`sql
-- Test query
SELECT * FROM products
WHERE seller_id = current_user_id()
AND status = 'active';
\`\`\`

### Issue: Slow Product Listing

**Solution:** Ensure indexes exist
\`\`\`sql
-- Add missing indexes
CREATE INDEX idx_products_status_created ON products(status, created_at DESC);
\`\`\`

### Issue: Inventory Race Conditions

**Solution:** Use database-level locking
\`\`\`sql
-- Already handled by reserve_product_inventory() function
-- Uses SELECT FOR UPDATE
\`\`\`

## Migration Checklist

- [ ] Execute schema migration scripts
- [ ] Verify all tables and indexes created
- [ ] Configure RLS policies
- [ ] Create API route structure
- [ ] Implement authentication/authorization
- [ ] Set up error handling and validation
- [ ] Add audit logging
- [ ] Configure monitoring
- [ ] Load test critical paths
- [ ] Set up alerts for slow queries
- [ ] Document API endpoints
- [ ] Create admin dashboard
- [ ] Set up backup procedures
- [ ] Test disaster recovery

## Troubleshooting

### Check Schema Health

\`\`\`sql
-- List all tables
\dt

-- Check table sizes
SELECT tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) 
FROM pg_tables WHERE schemaname='public';

-- Check index usage
SELECT schemaname, tablename, indexname, idx_scan 
FROM pg_stat_user_indexes 
WHERE schemaname='public';
\`\`\`

### Validate RLS Policies

\`\`\`sql
-- Check active RLS policies
SELECT tablename, policyname, permissive, roles, qual 
FROM pg_policies 
WHERE schemaname='public';
\`\`\`

## Support

For issues or questions:
1. Check DATABASE_SCHEMA_DOCUMENTATION.md
2. Review migration scripts for examples
3. Check Supabase docs: https://supabase.com/docs
