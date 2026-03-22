# Inventory System - Quick Reference Guide

## Files Structure

```
/lib
  ├── types.ts                    # Type definitions (StockLevel, Reservation, etc.)
  └── inventory-operations.ts     # Core business logic functions

/app/api/inventory
  ├── stock-levels/route.ts       # GET/POST stock levels
  ├── reservations/route.ts       # POST/PUT reservations
  └── events/route.ts             # GET/POST event inventory

/components/inventory
  ├── stock-monitor.tsx           # Real-time stock display component
  └── event-inventory-dashboard.tsx # Event inventory dashboard

/scripts
  └── 04_inventory_schema_migration.sql # Database migration
```

## Key Database Tables

| Table | Purpose | Key Fields |
|-------|---------|-----------|
| `stock_levels` | Current inventory state | product_id, quantity_on_hand, quantity_reserved, quantity_available |
| `stock_reservations` | Holds for carts/orders | product_id, user_id, quantity, expires_at |
| `stock_movements` | Audit trail | product_id, movement_type, quantity, created_at |
| `live_event_products` | Event showcase | event_id, product_id, quantity_sold |
| `inventory_audits` | Compliance logs | product_id, action, old/new_values |

## API Endpoints Quick Map

### Stock Levels
```
GET  /api/inventory/stock-levels?productId=UUID
POST /api/inventory/stock-levels
```

### Reservations  
```
POST /api/inventory/reservations           # Create reservation
PUT  /api/inventory/reservations           # Use/Cancel reservation
```

### Events
```
GET  /api/inventory/events?eventId=UUID
POST /api/inventory/events                 # Add/Sync/Remove products
```

## Common Operations

### 1. Check Stock Level
```typescript
const result = await getStockLevel(productId);
if (result.success) {
  console.log(`Available: ${result.data.quantity_available}`);
}
```

### 2. Reserve Items for Cart
```typescript
const result = await createStockReservation(
  productId,
  userId,
  quantity,
  15  // expires in 15 minutes
);
```

### 3. Convert Reservation to Order
```typescript
const result = await useReservation(reservationId);
// Stock is now deducted from inventory
```

### 4. Cancel Reservation
```typescript
const result = await cancelReservation(reservationId);
// Stock is returned to available inventory
```

### 5. Add Products to Event
```typescript
await fetch('/api/inventory/events', {
  method: 'POST',
  body: JSON.stringify({
    eventId,
    productIds: [id1, id2, id3],
    action: 'add'
  })
});
```

### 6. Sync Event Inventory During Live
```typescript
// Call every 3-5 seconds
await fetch('/api/inventory/events', {
  method: 'POST',
  body: JSON.stringify({
    eventId,
    productIds: currentProducts,
    action: 'sync'
  })
});
```

## React Component Usage

### Stock Monitor
```typescript
<StockMonitor 
  productId="uuid"
  productTitle="Product Name"
  showTrends={true}
  autoRefresh={true}
/>
```

### Event Dashboard
```typescript
<EventInventoryDashboard 
  eventId="uuid"
  eventTitle="Live Event Title"
/>
```

## Data Flow Diagrams

### Checkout Flow
```
User Adds to Cart
    ↓
createStockReservation()
    ↓
Item holds for 15 minutes
    ↓
Payment Successful
    ↓
useReservation()
    ↓
Stock deducted from inventory
```

### Live Event Flow
```
Event Starts
    ↓
Add products to event
    ↓
Sync inventory every 3-5 seconds
    ↓
Customer purchases
    ↓
Stock updated in real-time
    ↓
Event ends
    ↓
Final inventory reconciliation
```

## Response Formats

### Success Response
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "product_id": "uuid",
    "quantity_on_hand": 100,
    "quantity_reserved": 15,
    "quantity_available": 85
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": "Insufficient stock available",
  "code": "INSUFFICIENT_STOCK"
}
```

## Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created (reservation, event product) |
| 400 | Bad request or insufficient stock |
| 401 | Unauthorized |
| 403 | Forbidden (not host/seller) |
| 404 | Not found |
| 409 | Conflict (stock unavailable) |
| 500 | Server error |

## Real-Time Stock Indicators

| Status | Condition | Color |
|--------|-----------|-------|
| Out of Stock | quantity_available = 0 | Red |
| Low Stock | quantity_available ≤ reorder_point | Yellow |
| Good Stock | 20% - 80% available | Green |
| Well Stocked | >80% available | Blue |

## Performance Targets

- Stock lookup: < 200ms
- Reservation creation: < 500ms
- Event sync: < 1s for 100 products
- Real-time updates: < 3s latency
- Dashboard load: < 2s

## Deployment Checklist

- [ ] Run migration: `scripts/04_inventory_schema_migration.sql`
- [ ] Test: `getStockLevel()`, `createStockReservation()`
- [ ] Deploy API endpoints
- [ ] Test: All endpoints with Postman/curl
- [ ] Deploy React components
- [ ] Test: Stock monitor, event dashboard
- [ ] Integrate with order system
- [ ] Test: Full checkout flow
- [ ] Monitor for errors in first 24h
- [ ] Setup scheduled cleanup job (expired reservations)

## Monitoring Commands

```sql
-- Check current stock levels
SELECT product_id, quantity_available, quantity_reserved 
FROM stock_levels ORDER BY quantity_available ASC;

-- Find products with expired reservations
SELECT sr.* FROM stock_reservations sr
WHERE sr.expires_at < NOW() AND sr.used_at IS NULL;

-- Audit trail for a product
SELECT * FROM inventory_audits 
WHERE product_id = 'uuid' 
ORDER BY created_at DESC LIMIT 50;

-- Event inventory summary
SELECT lep.product_id, lep.quantity_sold, sl.quantity_available
FROM live_event_products lep
JOIN stock_levels sl ON sl.product_id = lep.product_id
WHERE lep.event_id = 'uuid';
```

## Troubleshooting

### Stock not updating?
1. Verify product has stock_levels record
2. Check API response for errors
3. Verify user has correct role
4. Check database RLS policies

### Reservations expiring unexpectedly?
1. Verify expires_at timestamp format
2. Check server timezone
3. Verify database clock is correct

### Event inventory not syncing?
1. Check event exists and is active
2. Verify all products exist
3. Check API response for errors
4. Increase sync frequency if needed

## Support Resources

- Full Documentation: `OPENFRONT_LIVE_SHOPPING_COMPREHENSIVE_PLAN.md`
- Implementation Guide: `INVENTORY_SYSTEM_IMPLEMENTATION_GUIDE.md`
- Database Schema: `scripts/04_inventory_schema_migration.sql`
- Type Definitions: `lib/types.ts`
