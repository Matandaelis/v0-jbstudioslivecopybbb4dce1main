/**
 * Reusable Page Patterns for Database-Driven Pages
 * This file provides common patterns for different page types
 */

import { supabase } from '@/lib/supabase-client'
import type { User } from '@/lib/types'

// ============================================================================
// PATTERN 1: List/Collection Pages with Filtering, Sorting, and Pagination
// ============================================================================

export interface ListPageProps {
  page?: number
  limit?: number
  sort?: string
  filter?: Record<string, any>
  search?: string
}

export interface ListPageResult<T> {
  items: T[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}

/**
 * Generic function for building paginated list pages
 * Usage:
 * const products = await getPaginatedData<Product>('products', { page: 1, limit: 20 })
 */
export async function getPaginatedData<T>(
  table: string,
  options: ListPageProps
): Promise<ListPageResult<T>> {
  const { page = 1, limit = 20, sort = 'created_at', filter = {}, search = '' } = options

  const offset = (page - 1) * limit
  let query = supabase.from(table).select('*', { count: 'exact' })

  // Apply filters
  Object.entries(filter).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      query = query.eq(key, value)
    }
  })

  // Apply search
  if (search) {
    query = query.ilike('name', `%${search}%`)
  }

  // Apply sorting and pagination
  const { data, count, error } = await query.order(sort, { ascending: false }).range(offset, offset + limit - 1)

  if (error) throw error

  return {
    items: (data as T[]) || [],
    total: count || 0,
    page,
    limit,
    hasMore: ((count || 0) - offset - limit) > 0
  }
}

// ============================================================================
// PATTERN 2: Detail Pages with Related Data
// ============================================================================

export interface DetailPageOptions {
  table: string
  id: string
  select?: string
  relations?: Record<string, string>
}

/**
 * Fetch a single item with related data
 * Usage:
 * const product = await getDetailPage<Product>({
 *   table: 'products',
 *   id: 'product-123',
 *   select: '*',
 *   relations: {
 *     category: 'categories(*)',
 *     reviews: 'reviews(*, author:users(id,name))'
 *   }
 * })
 */
export async function getDetailPage<T>(options: DetailPageOptions): Promise<T> {
  const { table, id, select = '*', relations = {} } = options

  let selectQuery = select
  if (Object.keys(relations).length > 0) {
    const relationStrings = Object.entries(relations).map(([key, value]) => `${key}:${value}`)
    selectQuery = `${select},${relationStrings.join(',')}`
  }

  const { data, error } = await supabase
    .from(table)
    .select(selectQuery)
    .eq('id', id)
    .single()

  if (error) throw error
  return data as T
}

// ============================================================================
// PATTERN 3: Form Submission with Validation
// ============================================================================

export interface FormSubmitOptions<T> {
  table: string
  data: Partial<T>
  mode: 'create' | 'update'
  id?: string
  userId?: string // For RLS policies
  validateBeforeSave?: (data: Partial<T>) => string | null // Return error message if validation fails
}

/**
 * Handle form submissions with proper validation
 * Usage:
 * const result = await submitForm<Product>({
 *   table: 'products',
 *   data: { name: 'New Product', price: 99.99 },
 *   mode: 'create',
 *   validateBeforeSave: (data) => {
 *     if (!data.name) return 'Name is required'
 *     if (data.price && data.price < 0) return 'Price must be positive'
 *     return null
 *   }
 * })
 */
export async function submitForm<T>(options: FormSubmitOptions<T>): Promise<T> {
  const { table, data, mode, id, userId, validateBeforeSave } = options

  // Validation
  if (validateBeforeSave) {
    const error = validateBeforeSave(data)
    if (error) throw new Error(error)
  }

  let query = supabase.from(table)

  if (mode === 'create') {
    const submitData = userId ? { ...data, created_by: userId } : data

    const { data: result, error } = await query.insert([submitData]).select().single()

    if (error) throw new Error(error.message)
    return result as T
  } else {
    // Update mode
    if (!id) throw new Error('ID is required for update')

    const { data: result, error } = await query
      .update(data)
      .eq('id', id)
      .select()
      .single()

    if (error) throw new Error(error.message)
    return result as T
  }
}

// ============================================================================
// PATTERN 4: Permission-Based Data Access
// ============================================================================

export interface PermissionOptions {
  userId: string
  resource: string
  action: 'read' | 'create' | 'update' | 'delete'
}

/**
 * Check if user has permission to access resource
 * Usage:
 * const canEdit = await checkPermission({
 *   userId: 'user-123',
 *   resource: 'products:product-456',
 *   action: 'update'
 * })
 */
export async function checkPermission(options: PermissionOptions): Promise<boolean> {
  const { userId, resource, action } = options

  const { data: permission, error } = await supabase
    .from('user_permissions')
    .select('id')
    .eq('user_id', userId)
    .eq('resource', resource)
    .eq('action', action)
    .single()

  return !error && !!permission
}

/**
 * Get filtered data based on user permissions
 */
export async function getPermissionFilteredData<T>(
  table: string,
  userId: string,
  permissions: string[] // Required permissions
): Promise<T[]> {
  // First check if user has required permissions
  const allPermitted = await Promise.all(
    permissions.map((perm) =>
      checkPermission({
        userId,
        resource: table,
        action: perm as 'read' | 'create' | 'update' | 'delete'
      })
    )
  )

  if (!allPermitted.every((p) => p)) {
    throw new Error('Insufficient permissions')
  }

  const { data, error } = await supabase.from(table).select('*').eq('owner_id', userId)

  if (error) throw error
  return (data as T[]) || []
}

// ============================================================================
// PATTERN 5: Real-Time Data Subscription
// ============================================================================

export interface SubscriptionOptions {
  table: string
  event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*'
  filter?: Record<string, any>
  onData: (data: any) => void
  onError?: (error: Error) => void
}

/**
 * Subscribe to real-time database changes
 * Usage:
 * const unsubscribe = subscribeToData({
 *   table: 'orders',
 *   event: 'INSERT',
 *   filter: { user_id: 'user-123' },
 *   onData: (newOrder) => setOrders(prev => [...prev, newOrder])
 * })
 */
export function subscribeToData(options: SubscriptionOptions) {
  const { table, event = '*', filter = {}, onData, onError } = options

  const filterStr = Object.entries(filter)
    .map(([key, value]) => `${key}=eq.${value}`)
    .join(',')

  const channel = supabase
    .channel(`${table}_changes`)
    .on(
      'postgres_changes',
      {
        event,
        schema: 'public',
        table,
        filter: filterStr
      },
      (payload) => {
        onData(payload.new || payload.old)
      }
    )
    .subscribe((status) => {
      if (status === 'SUBSCRIPTION_ERROR' && onError) {
        onError(new Error(`Failed to subscribe to ${table}`))
      }
    })

  // Return unsubscribe function
  return () => supabase.removeChannel(channel)
}

// ============================================================================
// PATTERN 6: Batch Operations
// ============================================================================

export interface BatchOperation<T> {
  table: string
  items: Partial<T>[]
  mode: 'insert' | 'update' | 'upsert'
}

/**
 * Perform batch database operations
 * Usage:
 * await batchOperation({
 *   table: 'products',
 *   items: [{ id: '1', price: 100 }, { id: '2', price: 200 }],
 *   mode: 'update'
 * })
 */
export async function batchOperation<T>(options: BatchOperation<T>): Promise<T[]> {
  const { table, items, mode } = options

  if (items.length === 0) {
    return []
  }

  let query = supabase.from(table)

  let result: any
  let error: any

  if (mode === 'insert') {
    ;({ data: result, error } = await query.insert(items).select())
  } else if (mode === 'update') {
    // Note: Supabase doesn't support batch updates directly
    // This is a workaround - in production, use a database function
    const results = await Promise.all(
      items.map((item: any) =>
        query
          .update(item)
          .eq('id', item.id)
          .select()
          .single()
      )
    )
    result = results.map((r) => r.data)
    error = results.find((r) => r.error)?.error
  } else if (mode === 'upsert') {
    ;({ data: result, error } = await query.upsert(items).select())
  }

  if (error) throw error
  return result as T[]
}

// ============================================================================
// PATTERN 7: Search with Full-Text Search (if database supports it)
// ============================================================================

export interface SearchOptions {
  table: string
  query: string
  columns?: string[]
  limit?: number
}

/**
 * Full-text search across table
 * Usage:
 * const results = await searchTable({
 *   table: 'products',
 *   query: 'running shoes',
 *   columns: ['name', 'description'],
 *   limit: 20
 * })
 */
export async function searchTable<T>(options: SearchOptions): Promise<T[]> {
  const { table, query, columns = ['name'], limit = 20 } = options

  // For Supabase, use ilike for basic search
  let baseQuery = supabase.from(table).select('*').limit(limit)

  // Apply search to first column
  if (columns.length > 0) {
    baseQuery = baseQuery.ilike(columns[0], `%${query}%`)
  }

  const { data, error } = await baseQuery

  if (error) throw error
  return (data as T[]) || []
}

// ============================================================================
// PATTERN 8: Aggregation and Analytics
// ============================================================================

export interface AggregationOptions {
  table: string
  aggregation: 'count' | 'sum' | 'avg' | 'min' | 'max'
  column: string
  filter?: Record<string, any>
  groupBy?: string
}

/**
 * Perform database aggregations
 * Usage:
 * const totalRevenue = await aggregateData({
 *   table: 'orders',
 *   aggregation: 'sum',
 *   column: 'amount',
 *   filter: { status: 'completed' }
 * })
 */
export async function aggregateData(options: AggregationOptions): Promise<number> {
  const { table, aggregation, column, filter = {}, groupBy } = options

  let query = supabase.from(table).select(`${aggregation}(${column})`)

  Object.entries(filter).forEach(([key, value]) => {
    query = query.eq(key, value)
  })

  const { data, error } = await query

  if (error) throw error
  if (!data || data.length === 0) return 0

  return data[0][`${aggregation}`] || 0
}
