import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/api-auth"
import {
  createStockReservation,
  useReservation,
  cancelReservation,
} from "@/lib/inventory-operations"

export async function POST(request: Request) {
  try {
    const { authorized, user, response } = await requireAuth()

    if (!authorized) {
      return response
    }

    const {
      productId,
      quantity,
      expiresInMinutes = 15,
      orderId,
      cartSessionId,
    } = await request.json()

    if (!productId || !quantity || quantity <= 0) {
      return NextResponse.json(
        { error: "productId and quantity (>0) are required" },
        { status: 400 }
      )
    }

    const result = await createStockReservation(
      productId,
      user.id,
      quantity,
      expiresInMinutes,
      orderId,
      cartSessionId
    )

    if (!result.success) {
      const statusCode = result.code === "INSUFFICIENT_STOCK" ? 409 : 400
      return NextResponse.json({ error: result.error }, { status: statusCode })
    }

    return NextResponse.json(result.data, { status: 201 })
  } catch (error) {
    console.error("[INVENTORY] Error creating reservation:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const { authorized, user, response } = await requireAuth()

    if (!authorized) {
      return response
    }

    const { reservationId, action } = await request.json()

    if (!reservationId || !action) {
      return NextResponse.json(
        { error: "reservationId and action are required" },
        { status: 400 }
      )
    }

    if (action === "use") {
      const result = await useReservation(reservationId)

      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 400 })
      }

      return NextResponse.json(result.data)
    } else if (action === "cancel") {
      const result = await cancelReservation(reservationId)

      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 400 })
      }

      return NextResponse.json(result.data)
    } else {
      return NextResponse.json(
        { error: "action must be either 'use' or 'cancel'" },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error("[INVENTORY] Error updating reservation:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
