# Comprehensive Page Customization Strategy for Next.js App Router with Database Integration

## Overview
This document outlines best practices for building scalable, performant, and secure pages in the Next.js App Router that integrate seamlessly with a Supabase backend. The strategy balances real-time capabilities, performance optimization, and developer experience.

---

## 1. Architecture Decision Framework

### 1.1 Server Components vs Client Components

**Server Components (Default)**
- Fetch data directly from the database
- No client-side JS overhead
- Ideal for read-heavy pages (blog posts, product details, dashboards)
- Better for SEO
- Use when: Displaying static/rarely-changing data

**Client Components (use "use client")**
- Handle user interactions, real-time updates, form submissions
- Access browser APIs
- Ideal for interactive features (filters, chat, live updates)
- Use when: Need interactivity, real-time updates, or client-side state

**Hybrid Approach (Recommended)**
```typescript
// Page uses Server Component for data fetching
export default async function DashboardPage() {
  const data = await fetchDashboardData() // Server-side fetch
  
  return (
    <div>
      <StaticHeader data={data} />
      <ClientInteractiveSection initialData={data} /> {/* Client component for interactivity */}
    </div>
  )
}
```

---

## 2. Data Fetching Patterns

### 2.1 Server-Side Data Fetching (App Router)

#### Pattern A: Direct Database Queries in Server Components
```typescript
// app/products/[id]/page.tsx
export default async function ProductPage({ params }: { params: { id: string } }) {
  const { data: product } = await supabase
    .from('products')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!product) notFound()

  return <ProductDetail product={product} />
}
```

**Pros:** Simple, no extra API route, direct database access
**Cons:** Couples server component to database schema
**Use for:** Simple CRUD pages, minimal transformation

#### Pattern B: Server Actions (Recommended)
```typescript
// lib/actions/product-actions.ts
'use server'

export async function getProductById(id: string) {
  const { data } = await supabase
    .from('products')
    .select(`
      *,
      category:categories(*),
      reviews:product_reviews(*)
    `)
    .eq('id', id)
    .single()
  
  return data
}

export async function updateProduct(id: string, updates: Partial<Product>) {
  const { data, error } = await supabase
    .from('products')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  revalidatePath(`/products/${id}`)
  return data
}

// app/products/[id]/page.tsx
export default async function ProductPage({ params }: { params: { id: string } }) {
  const product = await getProductById(params.id)
  return <ProductDetail product={product} onUpdate={updateProduct} />
}
```

**Pros:** Centralized logic, reusable, type-safe, easy to add validation
**Cons:** Additional file structure
**Use for:** Complex operations, form submissions, mutations

#### Pattern C: API Routes (When needed)
```typescript
// app/api/products/[id]/route.ts
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { data } = await supabase
      .from('products')
      .select('*')
      .eq('id', params.id)
      .single()

    return Response.json(data)
  } catch (error) {
    return Response.json({ error }, { status: 500 })
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const updates = await request.json()
  const { data, error } = await supabase
    .from('products')
    .update(updates)
    .eq('id', params.id)
    .select()
    .single()

  if (error) return Response.json({ error }, { status: 400 })
  return Response.json(data)
}
```

**Pros:** Familiar RESTful pattern, good for external integrations
**Cons:** Extra hop, harder to type-check
**Use for:** Public APIs, third-party integrations, webhook handlers

---

## 3. Dynamic Routing Patterns

### 3.1 Basic Dynamic Routes
```typescript
// app/[category]/[productId]/page.tsx
export async function generateStaticParams() {
  const { data: products } = await supabase
    .from('products')
    .select('id, category')
  
  return products.map((product) => ({
    category: product.category,
    productId: product.id
  }))
}

export default async function ProductPage({ params }: { params: { category: string; productId: string } }) {
  const product = await getProduct(params.productId)
  return <ProductDetail product={product} />
}
```

### 3.2 Catch-All Routes
```typescript
// app/docs/[[...slug]]/page.tsx
export default async function DocsPage({ params }: { params: { slug?: string[] } }) {
  const path = params.slug?.join('/') ?? 'index'
  const { data: doc } = await supabase
    .from('documentation')
    .select('*')
    .eq('path', path)
    .single()

  if (!doc) notFound()
  return <DocViewer doc={doc} />
}
```

---

## 4. Real-Time Updates Implementation

### 4.1 Realtime Subscriptions
```typescript
'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase-client'

export function LiveDataComponent({ streamId }: { streamId: string }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Initial fetch
    const fetchData = async () => {
      const { data } = await supabase
        .from('live_streams')
        .select('*')
        .eq('id', streamId)
        .single()
      
      setData(data)
      setLoading(false)
    }

    fetchData()

    // Subscribe to changes
    const channel = supabase
      .channel(`stream_${streamId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'live_streams',
          filter: `id=eq.${streamId}`
        },
        (payload) => {
          setData(payload.new)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [streamId])

  if (loading) return <div>Loading...</div>
  return <div>{/* Render real-time data */}</div>
}
```

### 4.2 Server-Sent Events (SSE)
```typescript
// app/api/streams/[id]/events/route.ts
export async function GET(request: Request, { params }: { params: { id: string } }) {
  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      const channel = supabase
        .channel(`stream_events_${params.id}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'stream_events' }, (payload) => {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(payload)}\n\n`))
        })
        .subscribe()
    }
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    }
  })
}
```

---

## 5. Security Best Practices

### 5.1 Authentication & Authorization
```typescript
'use server'

import { getServerClient } from '@/lib/supabase-server'

export async function getPrivateUserData(userId: string) {
  const supabase = await getServerClient()
  
  // Get the authenticated user
  const { data: { user } } = await supabase.auth.getUser()
  
  // Ensure user is accessing their own data
  if (user?.id !== userId) {
    throw new Error('Unauthorized')
  }

  const { data } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single()

  return data
}
```

### 5.2 Row-Level Security (RLS)
```sql
-- Enable RLS on sensitive tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Users can only view their own profile
CREATE POLICY "Users can view own profile"
ON user_profiles FOR SELECT
USING (auth.uid() = id);

-- Users can only update their own profile
CREATE POLICY "Users can update own profile"
ON user_profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);
```

### 5.3 Input Validation
```typescript
'use server'

import { z } from 'zod'

const updateProfileSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(100),
  age: z.number().min(18).max(150)
})

export async function updateProfile(userId: string, formData: unknown) {
  // Validate input
  const validated = updateProfileSchema.parse(formData)
  
  // Authorize user
  const supabase = await getServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (user?.id !== userId) throw new Error('Unauthorized')

  // Update database
  const { data, error } = await supabase
    .from('user_profiles')
    .update(validated)
    .eq('id', userId)
    .select()
    .single()

  if (error) throw error
  return data
}
```

---

## 6. Performance Optimization

### 6.1 Incremental Static Regeneration (ISR)
```typescript
// app/blog/[slug]/page.tsx
export const revalidate = 3600 // Revalidate every hour

export async function generateStaticParams() {
  const { data: posts } = await supabase
    .from('posts')
    .select('slug')
  
  return posts.map((post) => ({ slug: post.slug }))
}

export default async function BlogPost({ params }: { params: { slug: string } }) {
  const post = await getPost(params.slug)
  return <PostContent post={post} />
}
```

### 6.2 Caching Strategy
```typescript
// lib/cache.ts
import { unstable_cache } from 'next/cache'

export const getCachedProduct = unstable_cache(
  async (id: string) => {
    return supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single()
  },
  ['product'], // cache key
  { revalidate: 300, tags: ['products'] } // 5 min cache
)

// Revalidate cache when product updates
export async function updateProduct(id: string, updates: Partial<Product>) {
  const result = await supabase
    .from('products')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  revalidateTag('products') // Invalidate cache
  return result
}
```

### 6.3 Database Query Optimization
```typescript
// ✅ Good: Select only needed fields
const { data } = await supabase
  .from('users')
  .select('id, name, email')
  .eq('status', 'active')
  .limit(10)

// ❌ Bad: Select everything
const { data } = await supabase
  .from('users')
  .select('*')

// ✅ Good: Use joins efficiently
const { data } = await supabase
  .from('orders')
  .select(`
    id,
    created_at,
    user:users(id, name),
    items:order_items(product_id, quantity)
  `)
```

---

## 7. Page Customization Patterns

### 7.1 Dynamic Page Configuration
```typescript
// app/dashboard/[workspaceId]/page.tsx
interface PageConfig {
  title: string
  description: string
  layout: 'grid' | 'list'
  sections: Array<{ type: string; config: Record<string, any> }>
}

async function getPageConfig(workspaceId: string): Promise<PageConfig> {
  const { data } = await supabase
    .from('page_configs')
    .select('*')
    .eq('workspace_id', workspaceId)
    .single()

  return data as PageConfig
}

export default async function DashboardPage({ params }: { params: { workspaceId: string } }) {
  const config = await getPageConfig(params.workspaceId)
  
  return (
    <div>
      <h1>{config.title}</h1>
      <DynamicSectionRenderer sections={config.sections} />
    </div>
  )
}
```

### 7.2 Feature Flags
```typescript
// lib/features.ts
'use server'

export async function isFeatureEnabled(userId: string, feature: string) {
  const { data } = await supabase
    .from('feature_flags')
    .select('*')
    .eq('user_id', userId)
    .eq('name', feature)
    .single()

  return data?.enabled ?? false
}

// app/beta-feature/page.tsx
export default async function BetaPage() {
  const user = await getCurrentUser()
  const enabled = await isFeatureEnabled(user.id, 'beta_features')

  if (!enabled) {
    return <div>This feature is not available for your account</div>
  }

  return <BetaFeatureComponent />
}
```

---

## 8. Recommended Page Structure

```
app/
├── (auth)/                    # Auth-related pages
│   ├── login/
│   ├── signup/
│   └── layout.tsx
├── (dashboard)/               # Authenticated pages
│   ├── layout.tsx            # Auth check, sidebar
│   ├── page.tsx              # Dashboard home
│   ├── [workspaceId]/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── settings/
│   │   └── analytics/
│   └── profile/
├── api/                       # API routes
│   ├── auth/
│   ├── products/
│   └── webhooks/
├── layout.tsx                 # Root layout
└── page.tsx                   # Home page
```

---

## 9. Testing & Monitoring

### 9.1 Example Page Test
```typescript
// __tests__/app/products/[id]/page.test.tsx
import { render } from '@testing-library/react'
import ProductPage from '@/app/products/[id]/page'

jest.mock('@/lib/supabase-server', () => ({
  getProductById: jest.fn(() => ({
    id: '1',
    name: 'Test Product'
  }))
}))

describe('ProductPage', () => {
  it('renders product details', async () => {
    const { getByText } = render(await ProductPage({ params: { id: '1' } }))
    expect(getByText('Test Product')).toBeInTheDocument()
  })
})
```

### 9.2 Performance Monitoring
```typescript
// lib/monitoring.ts
export function logPageMetrics(page: string, metrics: { duration: number; queries: number }) {
  console.log(`[${page}] Load time: ${metrics.duration}ms, DB queries: ${metrics.queries}`)
  
  // Send to monitoring service
  fetch('/api/metrics', {
    method: 'POST',
    body: JSON.stringify({ page, metrics })
  })
}
```

---

## 10. Checklist for Custom Pages

- [ ] Choose appropriate component type (Server/Client/Hybrid)
- [ ] Implement proper error handling (error.tsx, not-found.tsx)
- [ ] Add loading states (loading.tsx or Suspense)
- [ ] Implement data caching strategy
- [ ] Add RLS policies for data access
- [ ] Validate all user inputs
- [ ] Implement role-based access control
- [ ] Add proper TypeScript types
- [ ] Optimize database queries
- [ ] Set up revalidation strategy
- [ ] Add analytics/monitoring
- [ ] Test with various user roles
- [ ] Document page purpose and data requirements

---

## 11. Migration Guide (Pages Router → App Router)

```typescript
// OLD: pages/api/products/[id].ts
export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { data } = await supabase.from('products').select('*').eq('id', req.query.id)
    res.status(200).json(data)
  }
}

// NEW: app/api/products/[id]/route.ts
export async function GET(request: Request, { params }: { params: { id: string } }) {
  const { data } = await supabase.from('products').select('*').eq('id', params.id)
  return Response.json(data)
}

// OLD: pages/products/[id].tsx
export async function getStaticProps({ params }) {
  const { data: product } = await supabase.from('products').select('*').eq('id', params.id)
  return { props: { product }, revalidate: 3600 }
}

export default function ProductPage({ product }) {
  return <ProductDetail product={product} />
}

// NEW: app/products/[id]/page.tsx
export const revalidate = 3600

export default async function ProductPage({ params }: { params: { id: string } }) {
  const { data: product } = await supabase.from('products').select('*').eq('id', params.id)
  return <ProductDetail product={product} />
}
```

---

## Summary

This strategy provides:
- **Scalability**: Server Components reduce client JS, Server Actions enable code reuse
- **Security**: RLS policies, input validation, proper authentication
- **Performance**: ISR, caching, query optimization
- **Developer Experience**: TypeScript support, clear patterns, easy to test
- **Real-time Capabilities**: Built-in subscription support
- **Flexibility**: Multiple data fetching patterns for different use cases
