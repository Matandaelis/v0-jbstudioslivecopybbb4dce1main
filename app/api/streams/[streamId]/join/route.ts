import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase-server"
import { requireAuth } from "@/lib/api-auth"

export async function POST(
  request: Request,
  { params }: { params: { streamId: string } }
) {
  try {
    const { authorized, user, response } = await requireAuth()

    if (!authorized) {
      return response
    }

    const { role } = await request.json()

    if (!role || !["host", "guest", "viewer"].includes(role)) {
      return NextResponse.json(
        { error: "Invalid role. Must be host, guest, or viewer" },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Fetch the stream
    const { data: stream, error: streamError } = await supabase
      .from("live_streams")
      .select("*")
      .eq("id", params.streamId)
      .single()

    if (streamError || !stream) {
      return NextResponse.json(
        { error: "Stream not found" },
        { status: 404 }
      )
    }

    // Check if stream is public or user is host
    if (!stream.is_public && stream.host_id !== user.id && user.role !== "admin") {
      return NextResponse.json(
        { error: "Access denied" },
        { status: 403 }
      )
    }

    // Create participant record
    const { data: participant, error: participantError } = await supabase
      .from("stream_participants")
      .insert([
        {
          stream_id: params.streamId,
          user_id: user.id,
          role,
          joined_at: new Date().toISOString(),
        },
      ])
      .select()
      .single()

    if (participantError) {
      return NextResponse.json(
        { error: "Failed to join stream" },
        { status: 500 }
      )
    }

    // Increment viewer count
    await supabase.rpc("increment_stream_viewers", {
      p_stream_id: params.streamId,
    })

    return NextResponse.json({
      success: true,
      participant,
      stream: {
        id: stream.id,
        title: stream.title,
        room_name: stream.room_name,
        status: stream.status,
      },
    })
  } catch (error) {
    console.error("Error joining stream:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
