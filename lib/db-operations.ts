import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function getSupabaseServer() {
  const cookieStore = cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          cookieStore.set(name, value, options)
        },
        remove(name: string, options: any) {
          cookieStore.delete(name)
        },
      },
    }
  )
}

export async function getUserRole(userId: string) {
  const supabase = await getSupabaseServer()
  const { data, error } = await supabase
    .from("user_roles")
    .select("role, status")
    .eq("user_id", userId)
    .single()

  if (error) return null
  return data
}

export async function hasPermission(userId: string, requiredRole: string[]) {
  const userRole = await getUserRole(userId)
  if (!userRole) return false
  return requiredRole.includes(userRole.role) && userRole.status === "active"
}

export async function createProduct(productData: any) {
  const supabase = await getSupabaseServer()
  const { data, error } = await supabase
    .from("products")
    .insert([productData])
    .select()

  if (error) throw new Error(`Failed to create product: ${error.message}`)
  return data[0]
}

export async function updateProductInventory(productId: string, quantityChange: number) {
  const supabase = await getSupabaseServer()
  
  const { data, error } = await supabase.rpc("reserve_product_inventory", {
    p_product_id: productId,
    p_quantity: quantityChange,
  })

  if (error) throw new Error(`Inventory operation failed: ${error.message}`)
  return data
}

export async function createOrder(orderData: any) {
  const supabase = await getSupabaseServer()
  const { data, error } = await supabase
    .from("orders")
    .insert([orderData])
    .select()

  if (error) throw new Error(`Failed to create order: ${error.message}`)
  return data[0]
}

export async function getOrderWithItems(orderId: string) {
  const supabase = await getSupabaseServer()
  const { data, error } = await supabase
    .from("orders")
    .select(`
      *,
      order_items (
        *,
        products (id, title, price, images)
      )
    `)
    .eq("id", orderId)
    .single()

  if (error) throw new Error(`Failed to fetch order: ${error.message}`)
  return data
}

export async function createPayment(paymentData: any) {
  const supabase = await getSupabaseServer()
  const { data, error } = await supabase
    .from("payments")
    .insert([paymentData])
    .select()

  if (error) throw new Error(`Failed to create payment: ${error.message}`)
  return data[0]
}

export async function updatePaymentStatus(paymentId: string, status: string, metadata?: any) {
  const supabase = await getSupabaseServer()
  const { data, error } = await supabase
    .from("payments")
    .update({
      status,
      metadata: metadata || undefined,
      completed_at: status === "succeeded" ? new Date().toISOString() : undefined,
    })
    .eq("id", paymentId)
    .select()

  if (error) throw new Error(`Failed to update payment: ${error.message}`)
  return data[0]
}

export async function createReview(reviewData: any) {
  const supabase = await getSupabaseServer()
  const { data, error } = await supabase
    .from("product_reviews")
    .insert([reviewData])
    .select()

  if (error) throw new Error(`Failed to create review: ${error.message}`)
  return data[0]
}

export async function getProductReviews(productId: string, approved = true) {
  const supabase = await getSupabaseServer()
  const query = supabase
    .from("product_reviews")
    .select("*")
    .eq("product_id", productId)

  if (approved) {
    query.eq("status", "approved")
  }

  const { data, error } = await query

  if (error) throw new Error(`Failed to fetch reviews: ${error.message}`)
  return data
}

export async function createNotification(userId: string, notificationData: any) {
  const supabase = await getSupabaseServer()
  const { data, error } = await supabase
    .from("notifications")
    .insert([{ user_id: userId, ...notificationData }])
    .select()

  if (error) console.error(`Failed to create notification: ${error.message}`)
  return data?.[0] || null
}

export async function getUserNotifications(userId: string, unreadOnly = false) {
  const supabase = await getSupabaseServer()
  let query = supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (unreadOnly) {
    query.eq("is_read", false)
  }

  const { data, error } = await query

  if (error) throw new Error(`Failed to fetch notifications: ${error.message}`)
  return data
}

export async function markNotificationAsRead(notificationId: string) {
  const supabase = await getSupabaseServer()
  const { data, error } = await supabase
    .from("notifications")
    .update({ is_read: true, read_at: new Date().toISOString() })
    .eq("id", notificationId)
    .select()

  if (error) throw new Error(`Failed to mark notification as read: ${error.message}`)
  return data[0]
}

export async function getSellerCommissions(userId: string, status?: string) {
  const supabase = await getSupabaseServer()
  let query = supabase
    .from("commissions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (status) {
    query.eq("status", status)
  }

  const { data, error } = await query

  if (error) throw new Error(`Failed to fetch commissions: ${error.message}`)
  return data
}

export async function calculateSellerTotal(userId: string) {
  const supabase = await getSupabaseServer()
  const { data, error } = await supabase
    .from("commissions")
    .select("commission_amount")
    .eq("user_id", userId)
    .eq("status", "approved")

  if (error) throw new Error(`Failed to calculate total: ${error.message}`)

  return data.reduce((sum, item) => sum + (item.commission_amount || 0), 0)
}

export async function createPayout(payoutData: any) {
  const supabase = await getSupabaseServer()
  const { data, error } = await supabase
    .from("payouts")
    .insert([payoutData])
    .select()

  if (error) throw new Error(`Failed to create payout: ${error.message}`)
  return data[0]
}

export async function logAuditEvent(
  action: string,
  entityType: string,
  entityId: string,
  oldValues?: any,
  newValues?: any
) {
  const supabase = await getSupabaseServer()
  const { error } = await supabase.from("audit_logs").insert([
    {
      action,
      entity_type: entityType,
      entity_id: entityId,
      old_values: oldValues,
      new_values: newValues,
      user_id: (await supabase.auth.getUser()).data.user?.id,
      status: "success",
    },
  ])

  if (error) {
    console.error(`Failed to log audit event: ${error.message}`)
  }
}

export async function reserveInventory(productId: string, quantity: number) {
  const supabase = await getSupabaseServer()
  const { data, error } = await supabase.rpc("reserve_product_inventory", {
    p_product_id: productId,
    p_quantity: quantity,
  })

  if (error) throw new Error(`Failed to reserve inventory: ${error.message}`)
  return data[0]
}

export async function releaseInventory(productId: string, quantity: number) {
  const supabase = await getSupabaseServer()
  const { data, error } = await supabase.rpc("release_reserved_inventory", {
    p_product_id: productId,
    p_quantity: quantity,
  })

  if (error) throw new Error(`Failed to release inventory: ${error.message}`)
  return data[0]
}

export async function confirmOrderInventory(orderId: string) {
  const supabase = await getSupabaseServer()
  const { data, error } = await supabase.rpc("confirm_order_inventory", {
    p_order_id: orderId,
  })

  if (error) throw new Error(`Failed to confirm inventory: ${error.message}`)
  return data[0]
}
