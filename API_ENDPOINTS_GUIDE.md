# Live Shopping Platform - API Endpoints Guide

## Overview

This document describes all required API endpoints for the enhanced live shopping platform with product management, orders, payments, and commerce features.

## Authentication & Authorization

All endpoints require authentication via Supabase JWT token. Include in header:
\`\`\`
Authorization: Bearer {jwt_token}
\`\`\`

Role-based access control is enforced at the database level via RLS policies.

## Products API

### GET /api/products
List all active products with pagination and filtering.

**Query Parameters:**
- `page`: number (default: 1)
- `limit`: number (default: 20)
- `category`: string (optional)
- `search`: string (optional)
- `sort`: 'newest' | 'price_asc' | 'price_desc' | 'popular' (default: newest)

**Response:**
\`\`\`json
{
  "data": [
    {
      "id": "uuid",
      "seller_id": "uuid",
      "title": "Product Name",
      "price": 99.99,
      "category": "beauty",
      "rating_avg": 4.5,
      "review_count": 120,
      "is_featured": false,
      "images": ["url1", "url2"],
      "status": "active"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 500
  }
}
\`\`\`

### POST /api/products
Create a new product (sellers/admins only).

**Request Body:**
\`\`\`json
{
  "title": "Product Name",
  "description": "Long description",
  "short_description": "Short desc",
  "price": 99.99,
  "category": "beauty",
  "subcategory": "skincare",
  "sku": "PROD-001",
  "images": ["url1", "url2"],
  "thumbnail_url": "url"
}
\`\`\`

**Response:** Product object with created metadata

### GET /api/products/:productId
Get detailed product information including reviews and inventory.

**Response:**
\`\`\`json
{
  "product": {...},
  "inventory": {
    "quantity_available": 50,
    "quantity_reserved": 5,
    "low_stock_threshold": 10
  },
  "reviews": [...]
}
\`\`\`

### PUT /api/products/:productId
Update product details (seller/admin only).

### DELETE /api/products/:productId
Soft delete a product (seller/admin only).

## Orders API

### POST /api/orders
Create a new order.

**Request Body:**
\`\`\`json
{
  "stream_id": "uuid (optional)",
  "items": [
    {
      "product_id": "uuid",
      "quantity": 1
    }
  ],
  "coupon_code": "CODE20 (optional)",
  "shipping_address": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "postal_code": "10001",
    "country": "US"
  },
  "billing_address": {...}
}
\`\`\`

**Response:**
\`\`\`json
{
  "id": "uuid",
  "order_number": "ORD-001234",
  "status": "pending",
  "subtotal": 299.97,
  "discount_amount": 60.00,
  "tax_amount": 24.00,
  "total_amount": 263.97,
  "items": [...]
}
\`\`\`

### GET /api/orders
List user's orders (buyers/admins).

**Query Parameters:**
- `status`: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
- `page`: number
- `limit`: number

### GET /api/orders/:orderId
Get order details including items and payment status.

### PUT /api/orders/:orderId
Update order (buyers can update pending orders, admins can update any).

### POST /api/orders/:orderId/cancel
Cancel an order.

## Payments API

### POST /api/payments/create-intent
Create Stripe payment intent for an order.

**Request Body:**
\`\`\`json
{
  "order_id": "uuid",
  "payment_method": "card"
}
\`\`\`

**Response:**
\`\`\`json
{
  "client_secret": "pi_xxxxx",
  "payment_intent_id": "pi_xxxxx",
  "amount": 26397,
  "currency": "usd"
}
\`\`\`

### POST /api/payments/confirm
Confirm payment after Stripe processing.

**Request Body:**
\`\`\`json
{
  "payment_intent_id": "pi_xxxxx",
  "order_id": "uuid"
}
\`\`\`

### GET /api/payments/:paymentId
Get payment details (user/admin only).

## Reviews API

### POST /api/reviews
Create a product review (verified buyers only).

**Request Body:**
\`\`\`json
{
  "product_id": "uuid",
  "order_item_id": "uuid (optional but recommended)",
  "rating": 5,
  "title": "Great product!",
  "content": "Detailed review...",
  "images": ["url1", "url2"]
}
\`\`\`

### GET /api/products/:productId/reviews
Get approved reviews for a product.

**Query Parameters:**
- `page`: number
- `limit`: number

### PUT /api/reviews/:reviewId
Update review (owner only).

### DELETE /api/reviews/:reviewId
Delete review (owner or admin only).

## Notifications API

### GET /api/notifications
Get user's notifications.

**Query Parameters:**
- `unread_only`: boolean

### PUT /api/notifications/:notificationId/read
Mark notification as read.

### DELETE /api/notifications/:notificationId
Delete notification.

## Seller Dashboard API

### GET /api/sellers/dashboard
Get seller dashboard metrics.

**Response:**
\`\`\`json
{
  "total_sales": 50000.00,
  "total_orders": 250,
  "pending_orders": 15,
  "total_products": 45,
  "average_rating": 4.7,
  "commission_rate": 15.00,
  "pending_commissions": 2500.00
}
\`\`\`

### GET /api/sellers/products
List seller's products.

### POST /api/sellers/products/:productId/inventory
Update product inventory.

**Request Body:**
\`\`\`json
{
  "quantity_available": 100,
  "low_stock_threshold": 10,
  "reorder_point": 5
}
\`\`\`

### GET /api/sellers/commissions
List seller's commissions.

**Query Parameters:**
- `status`: 'pending' | 'approved' | 'paid'
- `period_start`: date
- `period_end`: date

### POST /api/sellers/payouts
Request a payout.

**Request Body:**
\`\`\`json
{
  "amount": 5000.00,
  "payout_method": "stripe",
  "period_start": "2024-01-01",
  "period_end": "2024-01-31"
}
\`\`\`

## Admin API

### GET /api/admin/users
List all users with filters.

**Query Parameters:**
- `role`: 'admin' | 'seller' | 'buyer' | 'affiliate'
- `status`: 'active' | 'suspended' | 'banned'
- `page`: number
- `limit`: number

### PUT /api/admin/users/:userId/role
Update user role and permissions.

**Request Body:**
\`\`\`json
{
  "role": "seller",
  "status": "active",
  "commission_rate": 15.00
}
\`\`\`

### GET /api/admin/analytics
Get platform analytics and reports.

**Query Parameters:**
- `period`: 'day' | 'week' | 'month' | 'quarter' | 'year'
- `start_date`: date
- `end_date`: date

### GET /api/admin/audit-logs
View audit logs.

**Query Parameters:**
- `entity_type`: string
- `action`: string
- `user_id`: uuid
- `page`: number
- `limit`: number

## Error Handling

All endpoints return errors in this format:

\`\`\`json
{
  "error": {
    "code": "PRODUCT_NOT_FOUND",
    "message": "The requested product does not exist",
    "details": {...}
  }
}
\`\`\`

Common status codes:
- 200: Success
- 201: Created
- 400: Bad request
- 401: Unauthorized
- 403: Forbidden
- 404: Not found
- 409: Conflict
- 422: Validation error
- 500: Server error

## Rate Limiting

API endpoints are rate-limited per user:
- Standard endpoints: 100 requests per minute
- Payment endpoints: 30 requests per minute
- Admin endpoints: 60 requests per minute

Remaining rate limit info is returned in response headers:
\`\`\`
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 1234567890
\`\`\`

## Implementation Notes

1. All list endpoints support pagination with `page` and `limit` parameters
2. All endpoints validate input using Zod schemas
3. All database operations are logged for audit trails
4. Sensitive operations trigger notifications
5. Inventory operations use database-level locking to prevent race conditions
6. Payment operations are idempotent using Stripe idempotency keys
7. All timestamps are in ISO 8601 format
