# Live Shopping Inventory System - Implementation Guide

## Overview

This document provides step-by-step implementation instructions for the complete inventory management system integrated with the live shopping platform. The system uses PostgreSQL, Supabase, Next.js, and React to provide real-time inventory tracking, stock reservations, and event management.

## Architecture

### Technology Stack
- **Database**: PostgreSQL with Supabase
- **Backend**: Next.js API Routes
- **Frontend**: React with TypeScript and Tailwind CSS
- **Real-time**: WebSocket support (future enhancement)
- **State Management**: React hooks + SWR for data fetching

### Key Components

1. **Database Layer**: PostgreSQL tables with RLS policies
2. **Business Logic**: TypeScript functions in `lib/inventory-operations.ts`
3. **API Endpoints**: Next.js route handlers for REST API
4. **UI Components**: React components for dashboards and monitoring
5. **Real-time Sync**: Event-driven architecture (future)

## Phase 1: Database Setup (Week 1-2)

### Step 1: Execute Migration Scripts

Run the SQL migration scripts in order:

```bash
# 1. Start with existing schema (already completed)
# These were created in previous migrations:
# - scripts/01_core_schema_migration.sql
# - scripts/02_rls_policies_migration.sql
# - scripts/03_triggers_and_functions.sql

# 2. Run the inventory migration
# Execute in Supabase SQL Editor or via psql:
psql -h [host] -U [user] -d [database] -f scripts/04_inventory_schema_migration.sql
```

### Step 2: Create Required Tables

The migration creates:
- `stock_levels` - Current inventory state
- `stock_reservations` - Cart and order holds
- `stock_movements` - Audit trail
- `live_event_products` - Event product showcase
- `inventory_audits` - Compliance logs

### Step 3: Verify Schema

```sql
-- Check if tables were created
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name LIKE '%stock%';

-- Should return:
-- stock_levels
-- stock_reservations
-- stock_movements
-- live_event_products
-- inventory_audits
```

## Phase 2: Backend Implementation (Week 3-4)

### Step 1: Add Inventory Types

Update `/lib/types.ts` with inventory interfaces (already done):
- `StockLevel`
- `StockReservation`
- `StockMovement`
- `LiveEventProduct`
- `InventoryAudit`

### Step 2: Create Inventory Operations Library

Implement `/lib/inventory-operations.ts` with functions:
- `getStockLevel()` - Fetch current stock
- `updateStockLevel()` - Modify stock (with atomic updates)
- `createStockReservation()` - Reserve items
- `useReservation()` - Convert reservation to order
- `cancelReservation()` - Release reserved items
- `recordStockMovement()` - Audit trail
- `syncEventInventory()` - Update event products
- `getEventInventoryStatus()` - Get event inventory

### Step 3: Test Database Operations

```typescript
// Test stock level update
const result = await updateStockLevel(
  "product-uuid",
  -5, // quantity change
  "outbound",
  "Test order fulfillment"
);

console.log(result); // { success: true, data: { ...stock } }
```

## Phase 3: API Endpoints (Week 5)

### Endpoint 1: Stock Levels API

**Endpoint**: `/api/inventory/stock-levels`

```typescript
// GET - Fetch stock level
fetch('/api/inventory/stock-levels?productId=uuid');

// POST - Update stock level
fetch('/api/inventory/stock-levels', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    productId: 'uuid',
    quantityChange: -5,
    movementType: 'outbound',
    notes: 'Order fulfillment'
  })
});
```

### Endpoint 2: Stock Reservations API

**Endpoint**: `/api/inventory/reservations`

```typescript
// POST - Create reservation
fetch('/api/inventory/reservations', {
  method: 'POST',
  body: JSON.stringify({
    productId: 'uuid',
    quantity: 2,
    expiresInMinutes: 15,
    cartSessionId: 'session-123'
  })
});

// PUT - Use/Cancel reservation
fetch('/api/inventory/reservations', {
  method: 'PUT',
  body: JSON.stringify({
    reservationId: 'uuid',
    action: 'use' // or 'cancel'
  })
});
```

### Endpoint 3: Event Inventory API

**Endpoint**: `/api/inventory/events`

```typescript
// GET - Fetch event inventory
fetch('/api/inventory/events?eventId=uuid');

// POST - Manage event products
fetch('/api/inventory/events', {
  method: 'POST',
  body: JSON.stringify({
    eventId: 'uuid',
    productIds: ['prod-1', 'prod-2'],
    action: 'add' // or 'sync', 'remove'
  })
});
```

## Phase 4: Frontend Components (Week 6-8)

### Component 1: Stock Monitor

Display real-time stock levels with visual indicators:

```typescript
import { StockMonitor } from '@/components/inventory/stock-monitor';

export function ProductPage({ productId }) {
  return (
    <StockMonitor 
      productId={productId}
      productTitle="Premium Headphones"
      showTrends={true}
      autoRefresh={true}
    />
  );
}
```

Features:
- Real-time stock display
- Reservation ratio tracking
- Low stock alerts
- Auto-refresh every 5 seconds

### Component 2: Event Inventory Dashboard

Display all products in a live event:

```typescript
import { EventInventoryDashboard } from '@/components/inventory/event-inventory-dashboard';

export function LiveEventPage({ eventId }) {
  return (
    <EventInventoryDashboard 
      eventId={eventId}
      eventTitle="Summer Sale Live Stream"
    />
  );
}
```

Features:
- Product table with sales metrics
- Conversion tracking
- Low stock highlighting
- Real-time sync button

## Phase 5: Integration with Existing Systems (Week 9-10)

### Integration 1: Order Processing

When creating an order:

```typescript
// 1. Create reservation during checkout
const reservation = await fetch('/api/inventory/reservations', {
  method: 'POST',
  body: JSON.stringify({
    productId,
    quantity: cartItem.quantity,
    cartSessionId: sessionId
  })
});

// 2. On payment success, use reservation
const order = await createOrder(items); // existing function

// 3. Convert reservation to fulfilled order
for (const reservation of cartReservations) {
  await fetch('/api/inventory/reservations', {
    method: 'PUT',
    body: JSON.stringify({
      reservationId: reservation.id,
      action: 'use'
    })
  });
}
```

### Integration 2: Return Processing

When processing returns:

```typescript
// 1. Restore stock on return approval
const result = await updateStockLevel(
  productId,
  returnedQuantity,
  'return',
  `Return from order ${orderId}`
);

// 2. Record in audit log
// Automatically recorded by trigger
```

### Integration 3: Live Event Integration

Link events to product inventory:

```typescript
// 1. Add products to event
await fetch('/api/inventory/events', {
  method: 'POST',
  body: JSON.stringify({
    eventId,
    productIds: [id1, id2, id3],
    action: 'add'
  })
});

// 2. Display event products with stock on storefront
const eventProducts = await fetch(`/api/inventory/events?eventId=${eventId}`);

// 3. Sync during broadcast
// Call every 3-5 seconds during live event
await fetch('/api/inventory/events', {
  method: 'POST',
  body: JSON.stringify({
    eventId,
    productIds: currentProducts,
    action: 'sync'
  })
});
```

## Phase 6: Real-Time Features (Week 11-12)

### WebSocket Implementation (Future)

```typescript
// Subscribe to stock level changes
const ws = new WebSocket('wss://your-domain/ws/inventory');

ws.onmessage = (event) => {
  const { type, data } = JSON.parse(event.data);
  
  if (type === 'STOCK_UPDATED') {
    // Update UI with new stock level
    updateStockDisplay(data);
  }
};

// Broadcast stock update
ws.send(JSON.stringify({
  type: 'STOCK_CHANGE',
  productId: id,
  newQuantity: 50
}));
```

## Testing Checklist

### Unit Tests
- [ ] Stock level calculations (available = on_hand - reserved)
- [ ] Reservation expiry logic
- [ ] Insufficient stock error handling
- [ ] Atomic transaction safety

### Integration Tests
- [ ] Order → Reservation → Fulfillment flow
- [ ] Return → Stock restoration flow
- [ ] Event sync accuracy
- [ ] Concurrent reservation handling

### Load Tests
- [ ] 100 concurrent users
- [ ] 1000 SKUs
- [ ] 10,000+ stock movements/day
- [ ] Real-time updates < 1s latency

## Security Considerations

### Row-Level Security (RLS)
All tables have RLS policies enabled:
- Sellers see only their products' stock
- Admins see all inventory
- Users see only public event products

### API Authentication
All endpoints require authentication via `requireAuth()`:
- JWT validation via Supabase
- Role-based authorization

### Audit Trail
All changes logged in `inventory_audits`:
- User ID, timestamp, action
- Old and new values
- IP address recording

## Performance Optimization

### Database Indexes
Indexes created on frequently queried columns:
- `stock_levels.product_id`
- `stock_reservations.expires_at`
- `stock_movements.created_at`
- `live_event_products.event_id`

### Caching Strategy
- Cache stock levels for 5 seconds
- Invalidate on updates
- Use Redis for high-traffic products

### Query Optimization
- Use generated columns for `quantity_available`
- Batch updates for event sync
- Connection pooling

## Monitoring & Maintenance

### Health Checks
```sql
-- Check for orphaned reservations
SELECT * FROM stock_reservations 
WHERE expires_at < NOW() AND used_at IS NULL;

-- Check stock level discrepancies
SELECT product_id, 
  quantity_on_hand - 
  (SELECT COALESCE(SUM(quantity), 0) FROM stock_movements) 
FROM stock_levels;
```

### Regular Tasks
1. **Daily**: Run expired reservation cleanup
2. **Weekly**: Stock level reconciliation
3. **Monthly**: Inventory audit review
4. **Quarterly**: Performance optimization review

## Deployment Steps

1. Create database backup
2. Run migration scripts
3. Deploy API endpoints
4. Deploy React components
5. Enable monitoring
6. Run smoke tests
7. Monitor for 24 hours

## Rollback Plan

If issues occur:

1. Stop all API requests
2. Restore database backup
3. Redeploy previous version
4. Verify data consistency
5. Document issue for analysis

## Support & Troubleshooting

### Common Issues

**Problem**: "Insufficient stock" error even with available items
- **Solution**: Check for expired uncancelled reservations
- Run: `UPDATE stock_reservations SET cancelled_at = NOW() WHERE expires_at < NOW()`

**Problem**: Real-time updates are slow
- **Solution**: Reduce refresh interval or enable WebSocket
- Check database connection pool

**Problem**: Reservation not converting to order
- **Solution**: Verify user has permission
- Check order creation logs

## Next Steps

1. Execute Phase 1 (Database setup)
2. Review and test Phase 2 (Backend)
3. Deploy Phase 3 (API endpoints)
4. Integrate Phase 4 (Frontend components)
5. Complete Phase 5 (System integration)
6. Plan Phase 6 (Real-time features)

For questions or issues, refer to the comprehensive plan in `OPENFRONT_LIVE_SHOPPING_COMPREHENSIVE_PLAN.md`.
