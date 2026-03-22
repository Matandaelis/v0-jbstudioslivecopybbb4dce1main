import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase-server"
import { requireAuth, requireRole } from "@/lib/api-auth"

export async function POST(request: Request) {
  try {
    const { authorized, user, response } = await requireAuth()

    if (!authorized) {
      return response
    }

    const streamData = await request.json()

    // Check if user has permission to create stream
    const { authorized: roleAuthorized, response: roleResponse } = await requireRole(
      user.id,
      ["admin", "host", "brand_partner"]
    )

    if (!roleAuthorized) {
      return roleResponse
    }

    const supabase = await createClient()
    const { data, error } = await supabase
      .from("live_streams")
      .insert([
        {
          host_id: user.id,
          ...streamData,
        },
      ])
      .select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(data[0])
  } catch (error) {
    console.error("Error creating stream:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")

    let query = supabase.from("live_streams").select("*").eq("is_public", true)

    if (status) {
      query = query.eq("status", status)
    }

    const { data, error } = await query.order("created_at", { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching streams:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
