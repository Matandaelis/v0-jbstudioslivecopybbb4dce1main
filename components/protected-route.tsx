"use client"

import type React from "react"

import { useAuth } from "@/context/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"

interface ProtectedRouteProps {
  requiredPermission?: string
  requiredRole?: string[]
  children: React.ReactNode
}

export default function ProtectedRoute({
  requiredPermission,
  requiredRole,
  children,
}: ProtectedRouteProps) {
  const { isAuthenticated, user, loading, authDisabled } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !isAuthenticated && !authDisabled) {
      router.push("/")
    }
  }, [loading, isAuthenticated, router, authDisabled])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    )
  }

  // If auth disabled, show all content with dev warning
  if (authDisabled) {
    return (
      <div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-4">
          <p className="text-sm text-yellow-800 font-semibold">
            Development Mode: Authentication is currently disabled. All role and permission checks are bypassed.
          </p>
        </div>
        {children}
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  // Check role-based access
  if (requiredRole && !requiredRole.includes(user?.role || "")) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-5 h-5" />
              Access Denied
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              You don't have permission to access this page. Required role:{" "}
              {requiredRole.join(" or ")}
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => router.back()}>
                Go Back
              </Button>
              <Button onClick={() => router.push("/")}>Home</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Check permission-based access
  if (requiredPermission && !user?.role) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-5 h-5" />
              Permission Required
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>You don't have the required permission: {requiredPermission}</p>
            <Button onClick={() => router.push("/")}>Go Home</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return <>{children}</>
}
