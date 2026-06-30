import { createClient } from "@/lib/supabase-server"
import { AUTH_CONFIG, isAuthEnabled, logAuthDebug, getDevUser } from "@/lib/auth-config"
import { ROLE_PERMISSIONS } from "@/lib/types"
import { NextResponse } from "next/server"

export async function getAuthenticatedUser() {
  // If auth is disabled, return dev user
  if (!isAuthEnabled()) {
    logAuthDebug("API: Auth disabled, returning dev user")
    return {
      user: getDevUser(),
      error: null,
    }
  }

  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  return { user, error }
}

export async function requireAuth() {
  // If auth is disabled, allow access
  if (!isAuthEnabled()) {
    logAuthDebug("API: Auth disabled, allowing access")
    return { 
      authorized: true, 
      user: getDevUser(),
      response: null,
    }
  }

  const { user, error } = await getAuthenticatedUser()

  if (error || !user) {
    logAuthDebug("API: Auth required but user not found", { error })
    return {
      authorized: false,
      user: null,
      response: NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      ),
    }
  }

  return { 
    authorized: true, 
    user,
    response: null,
  }
}

export async function requireRole(userId: string, allowedRoles: string[]) {
  // If auth is disabled, always allow
  if (!isAuthEnabled()) {
    logAuthDebug("API: Auth disabled, role check bypassed")
    return { 
      authorized: true,
      response: null,
    }
  }

  const supabase = await createClient()
  const { data: userData } = await supabase
    .from("users")
    .select("role")
    .eq("id", userId)
    .single()

  const isAuthorized = userData && allowedRoles.includes(userData.role)

  logAuthDebug("API: Role check", { userId, userRole: userData?.role, allowed: allowedRoles, authorized: isAuthorized })

  return {
    authorized: !!isAuthorized,
    response: !isAuthorized
      ? NextResponse.json(
          { error: "Insufficient permissions" },
          { status: 403 }
        )
      : null,
  }
}

export async function requirePermission(userId: string, permission: string) {
  // If auth is disabled, always allow
  if (!isAuthEnabled()) {
    logAuthDebug("API: Auth disabled, permission check bypassed")
    return { 
      authorized: true,
      response: null,
    }
  }

  const supabase = await createClient()
  const { data: userData } = await supabase
    .from("users")
    .select("role")
    .eq("id", userId)
    .single()

  // Use single source of truth from ROLE_PERMISSIONS in lib/types
  const isAuthorized = userData && ROLE_PERMISSIONS[userData.role as keyof typeof ROLE_PERMISSIONS]?.includes(permission)

  logAuthDebug("API: Permission check", { userId, permission, authorized: isAuthorized })

  return {
    authorized: !!isAuthorized,
    response: !isAuthorized
      ? NextResponse.json(
          { error: `Permission denied: ${permission}` },
          { status: 403 }
        )
      : null,
  }
}
