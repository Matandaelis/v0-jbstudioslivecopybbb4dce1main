export type UserRole = "admin" | "host" | "brand_partner" | "vendor" | "affiliate" | "viewer" | "moderator"

export interface User {
  id: string
  email: string
  display_name: string
  avatar_url?: string
  role: UserRole
  status: "active" | "inactive" | "suspended"
  created_at: string
  updated_at: string
}

export interface LiveStream {
  id: string
  host_id: string
  title: string
  description?: string
  room_name: string
  status: "scheduled" | "live" | "ended"
  scheduled_at?: string
  started_at?: string
  ended_at?: string
  thumbnail_url?: string
  viewer_count: number
  is_public: boolean
  created_at: string
  updated_at: string
}

export interface StreamParticipant {
  id: string
  stream_id: string
  user_id: string
  role: "host" | "guest" | "moderator" | "viewer"
  joined_at: string
  left_at?: string
}

export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  admin: ["manage_users", "manage_streams", "moderate_chat", "view_analytics", "manage_roles"],
  host: ["create_stream", "manage_own_stream", "view_own_analytics", "invite_guests"],
  brand_partner: ["create_stream", "view_analytics", "manage_campaigns"],
  vendor: ["manage_products", "view_sales"],
  affiliate: ["view_commissions", "manage_network"],
  viewer: ["watch_streams", "chat"],
  moderator: ["moderate_chat", "manage_viewers"],
}
