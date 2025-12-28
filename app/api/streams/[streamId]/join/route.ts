import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase-server"

export async function POST(request: Request, { params }: { params: { streamId: string } }) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { role } = await request.json()
    const streamId = params.streamId

    // Check if stream exists
    const { data: stream, error: streamError } = await supabase
      .from("live_streams")
      .select("*")
      .eq("id", streamId)
      .single()

    if (streamError || !stream) {
      return NextResponse.json({ error: "Stream not found" }, { status: 404 })
    }

    // Add participant
    const { data, error } = await supabase
      .from("stream_participants")
      .upsert([
        {
          stream_id: streamId,
          user_id: user.id,
          role: role || "viewer",
          joined_at: new Date().toISOString(),
        },
      ])
      .select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Update viewer count
    await supabase.rpc("increment_stream_viewers", { stream_id: streamId })

    return NextResponse.json(data[0])
  } catch (error) {
    console.error("Error joining stream:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
