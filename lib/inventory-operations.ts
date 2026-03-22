import { createClient } from "@/lib/supabase-server"
import type { StockLevel, StockReservation, StockMovement, InventoryAudit } from "@/lib/types"

export interface InventoryOperationResult<T> {
  success: boolean
  data?: T
  error?: string
  code?: string
}

// ============================================================================
// STOCK LEVEL OPERATIONS
// ============================================================================

export async function getStockLevel(
  productId: string,
  warehouseId?: string
): Promise<InventoryOperationResult<StockLevel>> {
  try {
    const supabase = await createClient()
    const query = supabase
      .from("stock_levels")
      .select("*")
      .eq("product_id", productId)

    if (warehouseId) {
      query.eq("warehouse_id", warehouseId)
    }

    const { data, error } = await query.single()

    if (error) {
      return { success: false, error: error.message, code: "STOCK_NOT_FOUND" }
    }

    return { success: true, data: data as StockLevel }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      code: "OPERATION_FAILED",
    }
  }
}

export async function updateStockLevel(
  productId: string,
  quantityChange: number,
  movementType: "inbound" | "outbound" | "adjustment" | "return",
  notes?: string,
  warehouseId?: string
): Promise<InventoryOperationResult<StockLevel>> {
  try {
    const supabase = await createClient()

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // Start transaction by getting current stock
    const { data: currentStock, error: getError } = await supabase
      .from("stock_levels")
      .select("*")
      .eq("product_id", productId)
      .maybeSingle()

    if (getError) {
      return { success: false, error: getError.message, code: "FETCH_FAILED" }
    }

    if (!currentStock) {
      // Create new stock level if it doesn't exist
      const { data: newStock, error: createError } = await supabase
        .from("stock_levels")
        .insert([
          {
            product_id: productId,
            warehouse_id: warehouseId,
            quantity_on_hand: Math.max(0, quantityChange),
          },
        ])
        .select()
        .single()

      if (createError) {
        return { success: false, error: createError.message, code: "CREATE_FAILED" }
      }

      // Record movement
      await recordStockMovement(
        productId,
        movementType,
        quantityChange,
        undefined,
        undefined,
        notes,
        user?.id
      )

      return { success: true, data: newStock as StockLevel }
    }

    // Update existing stock
    const newQuantity = currentStock.quantity_on_hand + quantityChange

    if (newQuantity < 0 && movementType === "outbound") {
      return {
        success: false,
        error: "Insufficient stock available",
        code: "INSUFFICIENT_STOCK",
      }
    }

    const { data: updatedStock, error: updateError } = await supabase
      .from("stock_levels")
      .update({
        quantity_on_hand: Math.max(0, newQuantity),
        updated_at: new Date().toISOString(),
      })
      .eq("product_id", productId)
      .select()
      .single()

    if (updateError) {
      return { success: false, error: updateError.message, code: "UPDATE_FAILED" }
    }

    // Record movement
    await recordStockMovement(
      productId,
      movementType,
      quantityChange,
      undefined,
      undefined,
      notes,
      user?.id
    )

    return { success: true, data: updatedStock as StockLevel }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      code: "OPERATION_FAILED",
    }
  }
}

// ============================================================================
// STOCK RESERVATION OPERATIONS
// ============================================================================

export async function createStockReservation(
  productId: string,
  userId: string,
  quantity: number,
  expiresInMinutes: number = 15,
  orderId?: string,
  cartSessionId?: string
): Promise<InventoryOperationResult<StockReservation>> {
  try {
    const supabase = await createClient()

    // Check available stock
    const { data: stockLevel, error: stockError } = await supabase
      .from("stock_levels")
      .select("quantity_available")
      .eq("product_id", productId)
      .single()

    if (stockError || !stockLevel) {
      return { success: false, error: "Stock level not found", code: "STOCK_NOT_FOUND" }
    }

    if (stockLevel.quantity_available < quantity) {
      return {
        success: false,
        error: `Only ${stockLevel.quantity_available} items available`,
        code: "INSUFFICIENT_STOCK",
      }
    }

    const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000).toISOString()

    // Create reservation
    const { data: reservation, error: reservationError } = await supabase
      .from("stock_reservations")
      .insert([
        {
          product_id: productId,
          user_id: userId,
          quantity,
          expires_at: expiresAt,
          order_id: orderId,
          cart_session_id: cartSessionId,
        },
      ])
      .select()
      .single()

    if (reservationError) {
      return { success: false, error: reservationError.message, code: "RESERVATION_FAILED" }
    }

    // Update reserved quantity
    await updateReservedQuantity(productId, quantity)

    return { success: true, data: reservation as StockReservation }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      code: "OPERATION_FAILED",
    }
  }
}

export async function useReservation(
  reservationId: string
): Promise<InventoryOperationResult<StockReservation>> {
  try {
    const supabase = await createClient()

    const { data: reservation, error: getError } = await supabase
      .from("stock_reservations")
      .select("*")
      .eq("id", reservationId)
      .single()

    if (getError || !reservation) {
      return { success: false, error: "Reservation not found", code: "NOT_FOUND" }
    }

    // Mark as used
    const { data: updated, error: updateError } = await supabase
      .from("stock_reservations")
      .update({ used_at: new Date().toISOString() })
      .eq("id", reservationId)
      .select()
      .single()

    if (updateError) {
      return { success: false, error: updateError.message, code: "UPDATE_FAILED" }
    }

    // Deduct from on-hand stock
    await updateStockLevel(
      reservation.product_id,
      -reservation.quantity,
      "outbound",
      `Order fulfillment from reservation ${reservationId}`
    )

    return { success: true, data: updated as StockReservation }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      code: "OPERATION_FAILED",
    }
  }
}

export async function cancelReservation(
  reservationId: string
): Promise<InventoryOperationResult<StockReservation>> {
  try {
    const supabase = await createClient()

    const { data: reservation, error: getError } = await supabase
      .from("stock_reservations")
      .select("*")
      .eq("id", reservationId)
      .single()

    if (getError || !reservation) {
      return { success: false, error: "Reservation not found", code: "NOT_FOUND" }
    }

    // Mark as cancelled
    const { data: updated, error: updateError } = await supabase
      .from("stock_reservations")
      .update({ cancelled_at: new Date().toISOString() })
      .eq("id", reservationId)
      .select()
      .single()

    if (updateError) {
      return { success: false, error: updateError.message, code: "UPDATE_FAILED" }
    }

    // Release reserved stock
    await updateReservedQuantity(reservation.product_id, -reservation.quantity)

    return { success: true, data: updated as StockReservation }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      code: "OPERATION_FAILED",
    }
  }
}

// ============================================================================
// STOCK MOVEMENT OPERATIONS
// ============================================================================

export async function recordStockMovement(
  productId: string,
  movementType: "inbound" | "outbound" | "adjustment" | "count" | "return",
  quantity: number,
  referenceId?: string,
  referenceType?: string,
  notes?: string,
  userId?: string
): Promise<InventoryOperationResult<StockMovement>> {
  try {
    const supabase = await createClient()

    const { data: movement, error } = await supabase
      .from("stock_movements")
      .insert([
        {
          product_id: productId,
          movement_type: movementType,
          quantity,
          reference_id: referenceId,
          reference_type: referenceType,
          notes,
          user_id: userId,
        },
      ])
      .select()
      .single()

    if (error) {
      return { success: false, error: error.message, code: "INSERT_FAILED" }
    }

    return { success: true, data: movement as StockMovement }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      code: "OPERATION_FAILED",
    }
  }
}

export async function getStockMovements(
  productId: string,
  limit: number = 50,
  offset: number = 0
): Promise<InventoryOperationResult<StockMovement[]>> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("stock_movements")
      .select("*")
      .eq("product_id", productId)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      return { success: false, error: error.message, code: "FETCH_FAILED" }
    }

    return { success: true, data: data as StockMovement[] }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      code: "OPERATION_FAILED",
    }
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

async function updateReservedQuantity(
  productId: string,
  quantityChange: number
): Promise<void> {
  const supabase = await createClient()

  await supabase.rpc("execute_raw_sql", {
    sql: `UPDATE public.stock_levels 
          SET quantity_reserved = quantity_reserved + $1 
          WHERE product_id = $2`,
    params: [quantityChange, productId],
  })
}

export async function syncEventInventory(
  eventId: string,
  productIds: string[]
): Promise<InventoryOperationResult<void>> {
  try {
    const supabase = await createClient()

    // Get current stock levels for all products
    const { data: stockLevels, error: fetchError } = await supabase
      .from("stock_levels")
      .select("*")
      .in("product_id", productIds)

    if (fetchError) {
      return { success: false, error: fetchError.message, code: "FETCH_FAILED" }
    }

    // Update event products with current stock
    for (const stock of stockLevels || []) {
      await supabase
        .from("live_event_products")
        .update({ quantity_available: stock.quantity_available })
        .eq("event_id", eventId)
        .eq("product_id", stock.product_id)
    }

    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      code: "OPERATION_FAILED",
    }
  }
}

export async function getEventInventoryStatus(
  eventId: string
): Promise<InventoryOperationResult<Record<string, any>[]>> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("live_event_products")
      .select(
        `
        *,
        products(id, title, price, thumbnail_url),
        stock_levels(quantity_available, quantity_reserved, quantity_on_hand)
      `
      )
      .eq("event_id", eventId)

    if (error) {
      return { success: false, error: error.message, code: "FETCH_FAILED" }
    }

    return { success: true, data: data as Record<string, any>[] }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      code: "OPERATION_FAILED",
    }
  }
}
