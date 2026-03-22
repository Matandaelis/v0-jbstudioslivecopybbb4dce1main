import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase-server"
import { requireAuth } from "@/lib/api-auth"
import { syncEventInventory, getEventInventoryStatus } from "@/lib/inventory-operations"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const eventId = searchParams.get("eventId")

    if (!eventId) {
      return NextResponse.json({ error: "eventId is required" }, { status: 400 })
    }

    const result = await getEventInventoryStatus(eventId)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json(result.data)
  } catch (error) {
    console.error("[INVENTORY] Error fetching event inventory:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { authorized, user, response } = await requireAuth()

    if (!authorized) {
      return response
    }

    const { eventId, productIds, action } = await request.json()

    if (!eventId || !productIds || !Array.isArray(productIds)) {
      return NextResponse.json(
        { error: "eventId and productIds (array) are required" },
        { status: 400 }
      )
    }

    // Verify user is the event host
    const supabase = await createClient()
    const { data: event, error: eventError } = await supabase
      .from("live_streams")
      .select("host_id")
      .eq("id", eventId)
      .single()

    if (eventError || !event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    if (event.host_id !== user.id) {
      return NextResponse.json({ error: "Unauthorized - not event host" }, { status: 403 })
    }

    if (action === "add") {
      // Add products to event
      const { data, error } = await supabase
        .from("live_event_products")
        .insert(
          productIds.map((productId) => ({
            event_id: eventId,
            product_id: productId,
            quantity_available: 0,
          }))
        )
        .select()

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }

      // Sync inventory for added products
      await syncEventInventory(eventId, productIds)

      return NextResponse.json(data, { status: 201 })
    } else if (action === "sync") {
      // Sync current inventory levels
      const result = await syncEventInventory(eventId, productIds)

      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 400 })
      }

      // Get updated status
      const { data, error } = await supabase
        .from("live_event_products")
        .select("*")
        .eq("event_id", eventId)
        .in("product_id", productIds)

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }

      return NextResponse.json(data)
    } else if (action === "remove") {
      // Remove products from event
      const { error } = await supabase
        .from("live_event_products")
        .delete()
        .eq("event_id", eventId)
        .in("product_id", productIds)

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }

      return NextResponse.json({ success: true, removedCount: productIds.length })
    } else {
      return NextResponse.json(
        { error: "action must be one of: add, sync, remove" },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error("[INVENTORY] Error managing event inventory:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
