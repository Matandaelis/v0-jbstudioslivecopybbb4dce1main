import { NextResponse } from "next/server"
import { AccessToken } from "livekit-server-sdk"
import { requireAuth } from "@/lib/api-auth"

export async function POST(request: Request) {
  try {
    const { authorized, user, response } = await requireAuth()

    if (!authorized) {
      return response
    }

    const { roomName, userName } = await request.json()

    if (!roomName || !userName) {
      return NextResponse.json(
        { error: "roomName and userName are required" },
        { status: 400 }
      )
    }

    const apiKey = process.env.LIVEKIT_API_KEY
    const apiSecret = process.env.LIVEKIT_API_SECRET

    if (!apiKey || !apiSecret) {
      console.error("LiveKit credentials not configured")
      return NextResponse.json(
        { error: "LiveKit is not configured" },
        { status: 500 }
      )
    }

    const at = new AccessToken(apiKey, apiSecret)
    at.identity = user.id
    at.name = userName
    
    // Grant appropriate permissions based on user role
    const canPublish = ["host", "brand_partner", "admin"].includes(user.role)
    
    at.addGrant({
      room: roomName,
      roomJoin: true,
      canPublish,
      canPublishData: true,
      canSubscribe: true,
    })

    const token = at.toJwt()

    return NextResponse.json({ token })
  } catch (error) {
    console.error("Error generating LiveKit token:", error)
    return NextResponse.json(
      { error: "Failed to generate token" },
      { status: 500 }
    )
  }
}
