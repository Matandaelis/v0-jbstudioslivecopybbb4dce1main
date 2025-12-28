import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase-server"

export async function GET(request: Request, { params }: { params: { streamId: string } }) {
  try {
    const supabase = await createClient()
    const streamId = params.streamId

    const { data: participants, error } = await supabase
      .from("stream_participants")
      .select(`
        *,
        user:users(id, display_name, avatar_url, role)
      `)
      .eq("stream_id", streamId)
      .is("left_at", null) // Only active participants

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({
      participants: participants || [],
      total: participants?.length || 0,
    })
  } catch (error) {
    console.error("Error fetching viewers:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
