import { NextResponse } from "next/server"
import { AccessToken } from "livekit-server-sdk"
import { requireAuth } from "@/lib/api-auth"

const LIVEKIT_API_KEY = process.env.LIVEKIT_API_KEY
const LIVEKIT_API_SECRET = process.env.LIVEKIT_API_SECRET

export async function POST(request: Request) {
  try {
    const { roomName, userName } = await request.json()

    if (!roomName || !userName) {
      return NextResponse.json({ error: "Missing roomName or userName" }, { status: 400 })
    }

    if (!LIVEKIT_API_KEY || !LIVEKIT_API_SECRET) {
      return NextResponse.json({ error: "LiveKit configuration missing" }, { status: 500 })
    }

    const { authorized, response } = await requireAuth()

    if (!authorized) {
      return response
    }

    const at = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, {
      identity: userName,
      ttl: 24 * 60 * 60, // 24 hours
    })

    at.addGrant({
      room: roomName,
      roomJoin: true,
      canPublish: true,
      canPublishData: true,
      canSubscribe: true,
    })

    const token = at.toJwt()

    return NextResponse.json({ token })
  } catch (error) {
    console.error("Error generating token:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
