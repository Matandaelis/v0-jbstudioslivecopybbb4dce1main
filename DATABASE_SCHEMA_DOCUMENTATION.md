# Live Shopping Platform - Database Schema Documentation

## Overview

This document describes the complete database schema for the live shopping platform. The schema is designed for scalability, data integrity, and comprehensive commerce operations.

## Table of Contents

1. [Core Tables](#core-tables)
2. [Indexes](#indexes)
3. [Row Level Security](#row-level-security)
4. [Functions & Triggers](#functions--triggers)
5. [Performance Considerations](#performance-considerations)
6. [Data Integrity](#data-integrity)

## Core Tables

### products
Main product catalog table.

| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| id | UUID | PRIMARY KEY | Unique product identifier |
| seller_id | UUID | FK to auth.users | Product owner |
| title | VARCHAR(255) | NOT NULL | Product name |
| description | TEXT | | Long description |
| short_description | VARCHAR(500) | | Brief description for listing |
| price | DECIMAL(10,2) | NOT NULL, >= 0 | Current price |
| sku | VARCHAR(100) | UNIQUE | Stock keeping unit |
| category | VARCHAR(100) | NOT NULL | Main category |
| subcategory | VARCHAR(100) | | Sub-category |
| images | JSONB | DEFAULT [] | Array of image URLs |
| thumbnail_url | TEXT | | Primary image |
| status | VARCHAR(50) | DEFAULT 'active', IN ('active', 'inactive', 'archived') | Product status |
| is_featured | BOOLEAN | DEFAULT false | Featured flag |
| rating_avg | NUMERIC(3,2) | DEFAULT 0, 0-5 | Average rating |
| review_count | INTEGER | DEFAULT 0 | Number of reviews |
| created_at | TIMESTAMP | DEFAULT now() | Creation time |
| updated_at | TIMESTAMP | DEFAULT now() | Last update |
| deleted_at | TIMESTAMP | | Soft delete timestamp |

**Indexes:**
- seller_id, category, status, is_featured, created_at, deleted_at (single)
- Combined: category + status

### product_inventory
Inventory tracking for products.

| Column | Type | Purpose |
|--------|------|---------|
| id | UUID | Unique identifier |
| product_id | UUID FK | Reference to product |
| quantity_available | INTEGER | Stock on hand |
| quantity_reserved | INTEGER | Quantity in pending orders |
| quantity_sold | INTEGER | Cumulative sold count |
| low_stock_threshold | INTEGER | Alert level |
| reorder_point | INTEGER | Auto-reorder level |
| last_restocked_at | TIMESTAMP | Last restock date |
| created_at, updated_at | TIMESTAMP | Audit timestamps |

**Constraints:**
- quantity_available + quantity_reserved >= quantity_reserved (validity check)
- All quantities >= 0

### orders
Customer orders.

| Column | Type | Purpose |
|--------|------|---------|
| id | UUID | Order identifier |
| buyer_id | UUID FK | Customer |
| stream_id | UUID FK (optional) | Associated live stream |
| order_number | VARCHAR(50) UNIQUE | Human-readable number |
| status | VARCHAR(50) | pending → confirmed → processing → shipped → delivered |
| subtotal | DECIMAL(12,2) | Pre-discount total |
| discount_amount | DECIMAL(12,2) | Applied discount |
| tax_amount | DECIMAL(12,2) | Sales tax |
| total_amount | DECIMAL(12,2) | Final total |
| coupon_code | VARCHAR(50) | Applied coupon |
| shipping_address | JSONB | Address object |
| billing_address | JSONB | Address object |
| notes | TEXT | Order notes |
| created_at, updated_at, shipped_at, delivered_at, cancelled_at | TIMESTAMP | Status timestamps |
| deleted_at | TIMESTAMP | Soft delete |

**Indexes:**
- buyer_id, status, created_at, order_number
- Combined: buyer_id + status

### order_items
Individual items in an order.

| Column | Type | Purpose |
|--------|------|---------|
| id | UUID | Unique identifier |
| order_id | UUID FK | Parent order |
| product_id | UUID FK | Product reference |
| seller_id | UUID FK | Product seller |
| quantity | INTEGER | Quantity ordered |
| unit_price | DECIMAL(10,2) | Price at time of order |
| subtotal | DECIMAL(12,2) | quantity × unit_price |
| discount_amount | DECIMAL(12,2) | Item-level discount |
| final_price | DECIMAL(12,2) | subtotal - discount |
| created_at | TIMESTAMP | Creation time |

**Relationships:**
- Each order can have multiple items
- Seller tracks product source
- Supports inventory tracking per seller per order

### payments
Payment transactions.

| Column | Type | Purpose |
|--------|------|---------|
| id | UUID | Payment identifier |
| order_id | UUID FK | Associated order |
| buyer_id | UUID FK | Payer |
| stripe_payment_intent_id | VARCHAR(255) UNIQUE | Stripe integration |
| amount | DECIMAL(12,2) | Payment amount |
| currency | VARCHAR(3) | Currency code (default: USD) |
| status | VARCHAR(50) | pending → processing → succeeded → failed |
| payment_method | VARCHAR(50) | 'card', 'bank_transfer', etc. |
| transaction_id | VARCHAR(255) | External transaction reference |
| metadata | JSONB | Additional data |
| error_message | TEXT | Failure reason |
| created_at, updated_at, completed_at | TIMESTAMP | Status timestamps |

**Indexes:**
- order_id, buyer_id, status, stripe_payment_intent_id, created_at

### product_reviews
Customer reviews.

| Column | Type | Purpose |
|--------|------|---------|
| id | UUID | Review identifier |
| product_id | UUID FK | Reviewed product |
| buyer_id | UUID FK | Reviewer |
| order_item_id | UUID FK (optional) | Order reference |
| rating | INTEGER | 1-5 stars |
| title | VARCHAR(255) | Review headline |
| content | TEXT | Detailed review |
| images | JSONB | Review images |
| helpful_count | INTEGER | Helpful votes |
| unhelpful_count | INTEGER | Unhelpful votes |
| verified_purchase | BOOLEAN | Verified buyer flag |
| status | VARCHAR(50) | pending → approved → rejected |
| created_at, updated_at, deleted_at | TIMESTAMP | Audit timestamps |

**Indexes:**
- product_id, buyer_id, status, deleted_at

### notifications
User notifications.

| Column | Type | Purpose |
|--------|------|---------|
| id | UUID | Notification ID |
| user_id | UUID FK | Recipient |
| type | VARCHAR(50) | 'order_update', 'stream_started', etc. |
| title | VARCHAR(255) | Notification title |
| content | TEXT | Detailed content |
| action_url | TEXT | CTA link |
| data | JSONB | Structured data |
| is_read | BOOLEAN | Read status |
| created_at, read_at | TIMESTAMP | Timestamps |

**Indexes:**
- user_id, is_read, created_at

### user_preferences
User settings and preferences.

| Column | Type | Purpose |
|--------|------|---------|
| id | UUID | Preference ID |
| user_id | UUID FK UNIQUE | User (one-to-one) |
| email_notifications | BOOLEAN | Email opt-in |
| push_notifications | BOOLEAN | Push opt-in |
| stream_notifications | BOOLEAN | Stream alerts |
| new_product_notifications | BOOLEAN | New product alerts |
| order_notifications | BOOLEAN | Order updates |
| newsletter_subscribed | BOOLEAN | Newsletter |
| preferred_categories | JSONB | Array of categories |
| language | VARCHAR(5) | Language code |
| theme | VARCHAR(20) | 'light', 'dark', 'system' |
| created_at, updated_at | TIMESTAMP | Audit timestamps |

### stream_products
Links products to live streams (many-to-many).

| Column | Type | Purpose |
|--------|------|---------|
| id | UUID | Association ID |
| stream_id | UUID FK | Live stream |
| product_id | UUID FK | Product |
| featured_position | INTEGER | Display order |
| special_discount | NUMERIC(5,2) | Stream-specific discount % |
| quantity_available_in_stream | INTEGER | Limited quantity |
| created_at | TIMESTAMP | Created at |

**Constraints:**
- UNIQUE(stream_id, product_id) - prevents duplicates

### audit_logs
Audit trail for compliance.

| Column | Type | Purpose |
|--------|------|---------|
| id | UUID | Log entry ID |
| user_id | UUID FK (optional) | Acting user |
| action | VARCHAR(255) | Action performed |
| entity_type | VARCHAR(100) | 'product', 'order', 'payment' |
| entity_id | UUID | Entity affected |
| old_values | JSONB | Previous state |
| new_values | JSONB | New state |
| ip_address | INET | Source IP |
| user_agent | TEXT | Browser info |
| status | VARCHAR(50) | 'success', 'failure', 'warning' |
| error_message | TEXT | Error details |
| created_at | TIMESTAMP | Creation time |

**Indexes:**
- user_id, entity_type, entity_id, created_at

### user_roles
User role and permission management.

| Column | Type | Purpose |
|--------|------|---------|
| id | UUID | Role assignment ID |
| user_id | UUID FK UNIQUE | User (one-to-one) |
| role | VARCHAR(50) | 'admin', 'seller', 'buyer', 'affiliate', 'moderator' |
| status | VARCHAR(50) | 'active', 'inactive', 'suspended', 'banned' |
| verified | BOOLEAN | Role verification |
| verification_date | TIMESTAMP | When verified |
| commission_rate | NUMERIC(5,2) | For sellers (0-100%) |
| total_sales | DECIMAL(15,2) | Career sales |
| created_at, updated_at | TIMESTAMP | Audit timestamps |

**Indexes:**
- user_id, role, status

### commissions
Seller earnings tracking.

| Column | Type | Purpose |
|--------|------|---------|
| id | UUID | Commission ID |
| user_id | UUID FK | Seller |
| order_item_id | UUID FK | Source item |
| commission_amount | DECIMAL(12,2) | Calculated amount |
| commission_rate | NUMERIC(5,2) | Applied rate |
| status | VARCHAR(50) | pending → approved → paid |
| payout_id | UUID FK (optional) | Associated payout |
| created_at, paid_at | TIMESTAMP | Timestamps |

**Indexes:**
- user_id, status, created_at

### payouts
Seller payment distributions.

| Column | Type | Purpose |
|--------|------|---------|
| id | UUID | Payout ID |
| user_id | UUID FK | Seller |
| amount | DECIMAL(15,2) | Payout amount |
| status | VARCHAR(50) | pending → processing → completed |
| payout_method | VARCHAR(50) | 'stripe', 'bank_transfer' |
| external_reference_id | VARCHAR(255) | Stripe/external ID |
| period_start | DATE | Period start |
| period_end | DATE | Period end |
| created_at, processed_at | TIMESTAMP | Timestamps |

**Indexes:**
- user_id, status, created_at

## Indexes

### Index Strategy

**Single-Column Indexes:**
- Foreign keys (enable joins)
- Status columns (enable filtering)
- Timestamps (enable sorting)
- Boolean flags (enable filtering)

**Composite Indexes:**
- `(buyer_id, status)` - Common order queries
- `(user_id, is_read)` - Notification filtering
- `(category, status)` - Product filtering

**Partial Indexes:**
- Low stock products: `product_inventory(quantity_available) WHERE quantity_available <= low_stock_threshold`
- Active streams: Stream participation indexes filtered by is_active = true

## Row Level Security

### Policy Structure

All tables have RLS enabled. Policies enforce:

**Public Read:**
- Products: Anyone can view active products
- Reviews: Anyone can view approved reviews
- Stream products: Anyone can view products in active streams

**Owner Read:**
- Orders: Buyers view their own orders
- Payments: Users view their own payments
- Notifications: Users view their own notifications
- Reviews: Reviewers view their own reviews

**Role-Based Write:**
- Products: Only sellers/admins can create/update
- Orders: Only buyers can create, admins can override
- Payments: Only system/admins can create/update
- Reviews: Only verified buyers can create
- User Roles: Only admins can modify

**Admin Override:**
- Admins can view and modify nearly all data for support/auditing

### RLS Performance

- Policies are evaluated at query-time
- Index-friendly: Policies use indexed columns
- No N+1 queries: Use JOIN conditions in policies

## Functions & Triggers

### Automatic Timestamp Management
- `update_updated_at_column()` - Auto-updates `updated_at` on modifications
- Attached to: products, orders, payments, reviews, preferences, user_roles

### Audit Logging
- `audit_log_trigger()` - Logs all changes to critical tables
- Captures: old values, new values, actor, timestamp
- Attached to: products, orders, payments

### Order Status Management
- `on_order_status_change()` - Creates notification when status changes
- `on_payment_completed()` - Updates order status when payment succeeds

### Inventory Management
- `reserve_product_inventory()` - Atomic reservation for orders
- `release_reserved_inventory()` - Cancellation reversal
- `confirm_order_inventory()` - Convert reserved to sold
- Uses SELECT FOR UPDATE to prevent race conditions

### Product Rating Updates
- `update_product_rating()` - Automatically recalculates product rating/review_count when reviews are approved

### Commission Calculations
- `calculate_seller_commission()` - Computes commission based on seller's rate

## Performance Considerations

### Query Optimization

1. **Index Coverage** - All commonly filtered/sorted columns are indexed
2. **Composite Indexes** - Common filter combinations use multi-column indexes
3. **Partial Indexes** - Low stock queries use filtered indexes
4. **Statistics** - ANALYZE regularly updated for query planner

### Connection Pooling

- Use connection pooling for concurrent requests
- Recommended: 10-20 connections per API instance
- Monitor: Active connections, query queue time

### Pagination

- Use `LIMIT` and `OFFSET` for listing endpoints
- Alternative: Keyset pagination for better performance on large datasets

### Caching Strategies

1. **Product Catalog** - Cache active products (1 hour TTL)
2. **Reviews** - Cache approved reviews (30 minutes TTL)
3. **User Preferences** - Cache per-user (session TTL)
4. **Inventory** - No caching (always fresh)

## Data Integrity

### Constraints

**Primary Keys:** UUID for distributed systems
**Foreign Keys:** Cascade deletes where appropriate, restrict where necessary
**Check Constraints:**
- Prices must be >= 0
- Ratings must be 1-5
- Commission rates must be 0-100%
- Quantities must be >= 0

### Soft Deletes

Implemented for:
- products
- orders
- product_reviews

Benefits:
- Data recovery
- Historical audit trails
- Compliance requirements

**Note:** Queries should filter: `WHERE deleted_at IS NULL`

### Transaction Support

- All multi-step operations (order creation, payment processing) use transactions
- Inventory operations lock rows to prevent overselling
- Commission calculations are atomic

### Backup & Recovery

- Daily automated backups
- Point-in-time recovery capability
- Separate backup storage
- Documented recovery procedures

## Migration Guide

See `/scripts/` directory:
1. `01_core_schema_migration.sql` - Tables and indexes
2. `02_rls_policies_migration.sql` - Security policies
3. `03_triggers_and_functions.sql` - Automation

Execute in order:
```bash
psql -U postgres -d database < 01_core_schema_migration.sql
psql -U postgres -d database < 02_rls_policies_migration.sql
psql -U postgres -d database < 03_triggers_and_functions.sql
```

## Monitoring

### Key Metrics to Track

1. **Query Performance**
   - Slow queries (> 100ms)
   - Query patterns
   - Index usage

2. **Data Volume**
   - Row counts per table
   - Storage growth
   - Backup size

3. **Locks & Contention**
   - Row-level locks
   - Lock wait times
   - Deadlock incidents

4. **RLS Performance**
   - Policy evaluation time
   - Permission check overhead

### Maintenance Tasks

- Weekly: ANALYZE for statistics
- Monthly: REINDEX for fragmentation
- Quarterly: Partition strategy review
- Annual: Schema optimization review
