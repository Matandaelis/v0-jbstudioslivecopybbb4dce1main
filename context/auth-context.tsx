"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import type { User, UserRole } from "@/lib/types"
import { supabase } from "@/lib/supabase-client"
import { ROLE_PERMISSIONS } from "@/lib/types"
import { isAuthEnabled, logAuthDebug, getDevUser } from "@/lib/auth-config"

interface AuthContextType {
  user: User | null
  loading: boolean
  isAuthenticated: boolean
  hasPermission: (permission: string) => boolean
  hasRole: (role: UserRole | UserRole[]) => boolean
  logout: () => Promise<void>
  authDisabled: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const authDisabled = !isAuthEnabled()

  useEffect(() => {
    const getUser = async () => {
      try {
        // If auth is disabled, use dev user
        if (authDisabled) {
          logAuthDebug("Auth disabled, using development user")
          setUser(getDevUser() as User)
          setLoading(false)
          return
        }

        // Normal auth flow
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser()

        if (!authUser) {
          setUser(null)
          setLoading(false)
          return
        }

        const { data: userData } = await supabase
          .from("users")
          .select("*")
          .eq("id", authUser.id)
          .single()

        if (userData) {
          setUser(userData as User)
        }
      } catch (error) {
        console.error("Error fetching user:", error)
        // If auth disabled, use dev user as fallback
        if (authDisabled) {
          setUser(getDevUser() as User)
        }
      } finally {
        setLoading(false)
      }
    }

    getUser()

    // Skip subscription if auth is disabled
    if (authDisabled) {
      logAuthDebug("Skipping auth state subscription - auth disabled")
      return
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const { data: userData } = await supabase
          .from("users")
          .select("*")
          .eq("id", session.user.id)
          .single()

        if (userData) {
          setUser(userData as User)
        }
      } else {
        setUser(null)
      }
    })

    return () => subscription?.unsubscribe()
  }, [authDisabled])

  const hasPermission = (permission: string): boolean => {
    if (!user) return false
    // If auth disabled, dev user has all permissions
    if (authDisabled) return true
    return ROLE_PERMISSIONS[user.role]?.includes(permission) ?? false
  }

  const hasRole = (roles: UserRole | UserRole[]): boolean => {
    if (!user) return false
    // If auth disabled, dev user matches any role
    if (authDisabled) return true
    const roleArray = Array.isArray(roles) ? roles : [roles]
    return roleArray.includes(user.role)
  }

  const logout = async () => {
    if (authDisabled) {
      logAuthDebug("Logout attempted with auth disabled - no-op")
      return
    }
    await supabase.auth.signOut()
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        hasPermission,
        hasRole,
        logout,
        authDisabled,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
