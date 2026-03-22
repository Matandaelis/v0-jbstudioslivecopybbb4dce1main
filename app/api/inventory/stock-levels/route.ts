import { NextResponse } from "next/server"
import { requireAuth, requireRole } from "@/lib/api-auth"
import { getStockLevel, updateStockLevel, recordStockMovement } from "@/lib/inventory-operations"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get("productId")

    if (!productId) {
      return NextResponse.json({ error: "productId is required" }, { status: 400 })
    }

    const result = await getStockLevel(productId)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json(result.data)
  } catch (error) {
    console.error("[INVENTORY] Error fetching stock level:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { authorized, user, response } = await requireAuth()

    if (!authorized) {
      return response
    }

    // Check if user has inventory management role
    const { authorized: roleAuthorized, response: roleResponse } = await requireRole(user.id, [
      "admin",
      "seller",
      "vendor",
    ])

    if (!roleAuthorized) {
      return roleResponse
    }

    const { productId, quantityChange, movementType, notes } = await request.json()

    if (!productId || quantityChange === undefined || !movementType) {
      return NextResponse.json(
        { error: "Missing required fields: productId, quantityChange, movementType" },
        { status: 400 }
      )
    }

    // Validate movement type
    const validMovementTypes = ["inbound", "outbound", "adjustment", "return"]
    if (!validMovementTypes.includes(movementType)) {
      return NextResponse.json(
        { error: `Invalid movementType. Must be one of: ${validMovementTypes.join(", ")}` },
        { status: 400 }
      )
    }

    // Update stock level
    const result = await updateStockLevel(productId, quantityChange, movementType, notes)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json(result.data, { status: 200 })
  } catch (error) {
    console.error("[INVENTORY] Error updating stock level:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
