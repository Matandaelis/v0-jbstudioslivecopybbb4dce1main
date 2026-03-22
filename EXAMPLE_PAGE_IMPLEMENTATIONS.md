# Example Page Implementations

This document provides complete, production-ready examples of different page patterns using the strategies outlined in PAGE_CUSTOMIZATION_STRATEGY.md.

---

## Example 1: List Page with Filtering and Pagination

### File: `app/products/page.tsx`

```typescript
import { Suspense } from 'react'
import { getPaginatedData } from '@/lib/page-patterns'
import ProductListClient from './client'
import type { Product } from '@/lib/types'

interface SearchParams {
  page?: string
  limit?: string
  sort?: string
  category?: string
  search?: string
}

async function ProductsContent({ searchParams }: { searchParams: SearchParams }) {
  const page = parseInt(searchParams.page || '1')
  const limit = parseInt(searchParams.limit || '20')

  const result = await getPaginatedData<Product>('products', {
    page,
    limit,
    sort: searchParams.sort || 'created_at',
    filter: searchParams.category ? { category: searchParams.category } : {},
    search: searchParams.search
  })

  return <ProductListClient initialData={result} />
}

export default function ProductsPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Products</h1>

      <Suspense fallback={<div>Loading products...</div>}>
        <ProductsContent searchParams={searchParams} />
      </Suspense>
    </div>
  )
}

export const metadata = {
  title: 'Products',
  description: 'Browse our product catalog'
}
```

### File: `app/products/client.tsx`

```typescript
'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import type { ListPageResult, Product } from '@/lib/types'

export default function ProductListClient({ initialData }: { initialData: ListPageResult<Product> }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [search, setSearch] = useState(searchParams.get('search') || '')

  const handleSearch = (value: string) => {
    setSearch(value)
    const params = new URLSearchParams(searchParams)
    if (value) {
      params.set('search', value)
    } else {
      params.delete('search')
    }
    router.push(`/products?${params.toString()}`)
  }

  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams)
    params.set('page', page.toString())
    router.push(`/products?${params.toString()}`)
  }

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="flex gap-2">
        <Input
          placeholder="Search products..."
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          className="flex-1"
        />
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {initialData.items.map((product) => (
          <div key={product.id} className="border rounded-lg p-4 hover:shadow-lg transition">
            <h3 className="font-semibold">{product.name}</h3>
            <p className="text-sm text-gray-600">${product.price}</p>
            <Button className="w-full mt-2">View Details</Button>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex justify-center gap-2">
        <Button
          onClick={() => goToPage(initialData.page - 1)}
          disabled={initialData.page === 1}
        >
          Previous
        </Button>
        <span className="px-4 py-2">Page {initialData.page}</span>
        <Button
          onClick={() => goToPage(initialData.page + 1)}
          disabled={!initialData.hasMore}
        >
          Next
        </Button>
      </div>
    </div>
  )
}
```

---

## Example 2: Detail Page with Related Data

### File: `app/products/[id]/page.tsx`

```typescript
import { notFound } from 'next/navigation'
import { getDetailPage } from '@/lib/page-patterns'
import ProductDetailClient from './client'
import { Metadata } from 'next'
import type { Product, Review, Category } from '@/lib/types'

interface ProductPageProps {
  params: { id: string }
}

interface ProductWithRelations extends Product {
  category: Category
  reviews: Review[]
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  try {
    const product = await getDetailPage<ProductWithRelations>({
      table: 'products',
      id: params.id,
      relations: {
        category: 'categories(*)'
      }
    })

    return {
      title: product.name,
      description: product.description,
      openGraph: {
        title: product.name,
        description: product.description,
        images: [product.image_url]
      }
    }
  } catch {
    return { title: 'Product Not Found' }
  }
}

async function ProductDetailContent({ productId }: { productId: string }) {
  try {
    const product = await getDetailPage<ProductWithRelations>({
      table: 'products',
      id: productId,
      select: '*, category:categories(*), reviews:product_reviews(*, user:users(name, avatar_url))',
      relations: {
        category: 'categories(*)',
        reviews: 'product_reviews(*, user:users(name, avatar_url))'
      }
    })

    return <ProductDetailClient product={product} />
  } catch (error) {
    notFound()
  }
}

export default function ProductPage({ params }: ProductPageProps) {
  return (
    <div className="container mx-auto py-8">
      <ProductDetailContent productId={params.id} />
    </div>
  )
}

export const revalidate = 300 // Cache for 5 minutes
```

### File: `app/products/[id]/client.tsx`

```typescript
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import type { Product, Review, Category, User } from '@/lib/types'

interface ProductWithRelations extends Product {
  category: Category
  reviews: (Review & { user: User })[]
}

export default function ProductDetailClient({ product }: { product: ProductWithRelations }) {
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(false)

  const handleAddToCart = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id, quantity })
      })

      if (!response.ok) throw new Error('Failed to add to cart')
      
      // Show success message
      alert('Added to cart!')
    } finally {
      setLoading(false)
    }
  }

  const avgRating = product.reviews.length > 0
    ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length
    : 0

  return (
    <div className="grid grid-cols-2 gap-8">
      {/* Images */}
      <div>
        <img
          src={product.image_url}
          alt={product.name}
          className="w-full rounded-lg object-cover"
        />
      </div>

      {/* Details */}
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">{product.name}</h1>
          <p className="text-gray-600">{product.category?.name}</p>
        </div>

        <div className="text-2xl font-bold">${product.price}</div>

        <p className="text-gray-700">{product.description}</p>

        <div className="flex items-center gap-4">
          <input
            type="number"
            min="1"
            max={product.stock}
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value))}
            className="border rounded px-3 py-2 w-20"
          />
          <Button
            onClick={handleAddToCart}
            disabled={loading || product.stock === 0}
            className="flex-1"
          >
            {loading ? 'Adding...' : 'Add to Cart'}
          </Button>
        </div>

        {/* Reviews Section */}
        <Card className="p-4">
          <h2 className="text-xl font-semibold mb-4">Reviews ({product.reviews.length})</h2>
          <div className="mb-4">
            <p className="text-yellow-500">⭐ {avgRating.toFixed(1)} / 5</p>
          </div>
          <div className="space-y-4">
            {product.reviews.map((review) => (
              <div key={review.id} className="border-t pt-4">
                <div className="flex justify-between">
                  <strong>{review.user?.name}</strong>
                  <span className="text-sm text-gray-600">
                    {'⭐'.repeat(review.rating)}
                  </span>
                </div>
                <p className="text-sm text-gray-700">{review.comment}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
```

---

## Example 3: Form Page with Submission

### File: `app/products/create/page.tsx`

```typescript
import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import ProtectedRoute from '@/components/protected-route'
import ProductFormClient from './client'

async function ProductFormContent() {
  return <ProductFormClient />
}

export default function CreateProductPage() {
  return (
    <ProtectedRoute requiredRole={['admin', 'brand_partner']}>
      <div className="container mx-auto py-8 max-w-2xl">
        <h1 className="text-3xl font-bold mb-6">Create New Product</h1>

        <Suspense fallback={<div>Loading form...</div>}>
          <ProductFormContent />
        </Suspense>
      </div>
    </ProtectedRoute>
  )
}
```

### File: `app/products/create/client.tsx`

```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import type { Product } from '@/lib/types'

export default function ProductFormClient() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    description: '',
    price: 0,
    category: '',
    stock: 0
  })

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: '' }))
  }

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name?.trim()) {
      newErrors.name = 'Name is required'
    }
    if (!formData.price || formData.price < 0) {
      newErrors.price = 'Valid price is required'
    }
    if (!formData.stock || formData.stock < 0) {
      newErrors.stock = 'Valid stock quantity is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) return

    setLoading(true)
    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to create product')
      }

      const { id } = await response.json()
      router.push(`/products/${id}`)
    } catch (error) {
      setErrors({ submit: error instanceof Error ? error.message : 'An error occurred' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium mb-2">Product Name</label>
          <Input
            value={formData.name || ''}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="Enter product name"
            className={errors.name ? 'border-red-500' : ''}
          />
          {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium mb-2">Description</label>
          <textarea
            value={formData.description || ''}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Enter product description"
            rows={4}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        {/* Price */}
        <div>
          <label className="block text-sm font-medium mb-2">Price</label>
          <Input
            type="number"
            step="0.01"
            value={formData.price || ''}
            onChange={(e) => handleChange('price', parseFloat(e.target.value))}
            placeholder="0.00"
            className={errors.price ? 'border-red-500' : ''}
          />
          {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
        </div>

        {/* Stock */}
        <div>
          <label className="block text-sm font-medium mb-2">Stock Quantity</label>
          <Input
            type="number"
            value={formData.stock || ''}
            onChange={(e) => handleChange('stock', parseInt(e.target.value))}
            placeholder="0"
            className={errors.stock ? 'border-red-500' : ''}
          />
          {errors.stock && <p className="text-red-500 text-sm mt-1">{errors.stock}</p>}
        </div>

        {/* Submit Error */}
        {errors.submit && <p className="text-red-500 text-sm">{errors.submit}</p>}

        {/* Buttons */}
        <div className="flex gap-4 pt-4">
          <Button type="submit" disabled={loading} className="flex-1">
            {loading ? 'Creating...' : 'Create Product'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            className="flex-1"
          >
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  )
}
```

---

## Example 4: Real-Time Updates Page

### File: `app/orders/page.tsx`

```typescript
'use client'

import { useEffect, useState } from 'react'
import { subscribeToData } from '@/lib/page-patterns'
import { useAuth } from '@/context/auth-context'
import { Card } from '@/components/ui/card'
import type { Order } from '@/lib/types'

export default function OrdersPage() {
  const { user } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.id) return

    // Fetch initial data
    const fetchOrders = async () => {
      const response = await fetch(`/api/orders?userId=${user.id}`)
      const data = await response.json()
      setOrders(data)
      setLoading(false)
    }

    fetchOrders()

    // Subscribe to real-time updates
    const unsubscribe = subscribeToData({
      table: 'orders',
      event: 'INSERT',
      filter: { user_id: user.id },
      onData: (newOrder) => {
        setOrders((prev) => [newOrder, ...prev])
      },
      onError: (error) => {
        console.error('Subscription error:', error)
      }
    })

    return unsubscribe
  }, [user?.id])

  if (loading) return <div>Loading orders...</div>

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">My Orders</h1>

      <div className="space-y-4">
        {orders.length === 0 ? (
          <p>No orders yet</p>
        ) : (
          orders.map((order) => (
            <Card key={order.id} className="p-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold">Order #{order.id.slice(0, 8)}</h3>
                  <p className="text-sm text-gray-600">
                    {new Date(order.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">${order.total}</p>
                  <p className="text-sm text-gray-600">{order.status}</p>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
```

---

## Example 5: Analytics/Dashboard Page

### File: `app/dashboard/analytics/page.tsx`

```typescript
import { aggregateData } from '@/lib/page-patterns'
import { Card } from '@/components/ui/card'

async function AnalyticsContent() {
  const totalOrders = await aggregateData({
    table: 'orders',
    aggregation: 'count',
    column: 'id',
    filter: { status: 'completed' }
  })

  const totalRevenue = await aggregateData({
    table: 'orders',
    aggregation: 'sum',
    column: 'amount',
    filter: { status: 'completed' }
  })

  const avgOrderValue = await aggregateData({
    table: 'orders',
    aggregation: 'avg',
    column: 'amount',
    filter: { status: 'completed' }
  })

  return (
    <div className="grid grid-cols-3 gap-4">
      <Card className="p-6">
        <h3 className="text-sm text-gray-600 mb-2">Total Orders</h3>
        <p className="text-3xl font-bold">{totalOrders}</p>
      </Card>

      <Card className="p-6">
        <h3 className="text-sm text-gray-600 mb-2">Total Revenue</h3>
        <p className="text-3xl font-bold">${totalRevenue}</p>
      </Card>

      <Card className="p-6">
        <h3 className="text-sm text-gray-600 mb-2">Avg Order Value</h3>
        <p className="text-3xl font-bold">${avgOrderValue?.toFixed(2)}</p>
      </Card>
    </div>
  )
}

export default function AnalyticsDashboard() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Analytics</h1>
      <AnalyticsContent />
    </div>
  )
}

export const revalidate = 60 // Cache for 1 minute
```

---

## Integration with Page Strategy

These examples demonstrate:

1. **Server vs Client Components**: Pages use Server Components for data fetching, Client Components for interactivity
2. **Error Handling**: Proper use of notFound(), error boundaries, and error states
3. **Loading States**: Suspense boundaries and loading UI
4. **Real-time Updates**: Subscription patterns for live data
5. **Form Validation**: Client-side and server-side validation
6. **Pagination**: Efficient data fetching with cursor/offset
7. **SEO**: Metadata generation for detail pages
8. **Authentication**: ProtectedRoute wrapper for access control

Use these patterns as templates for your custom pages!
