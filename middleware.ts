import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { isAuthEnabled } from "@/lib/auth-config"

const publicRoutes = ["/", "/help-center", "/login", "/signup", "/live-showcase"]
const protectedRoutes = ["/host-dashboard", "/admin-dashboard", "/super-admin", "/live", "/affiliate-hub"]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // If authentication is disabled, allow all routes
  if (!isAuthEnabled()) {
    console.log(`[MIDDLEWARE] Auth disabled - allowing access to ${pathname}`)
    return NextResponse.next()
  }

  // Skip middleware for public routes
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next()
  }

  // Skip middleware for API routes
  if (pathname.startsWith("/api/")) {
    return NextResponse.next()
  }

  // Check if route requires authentication
  if (protectedRoutes.some((route) => pathname.startsWith(route))) {
    const response = NextResponse.next({
      request: {
        headers: request.headers,
      },
    })

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, options)
            })
          },
        },
      },
    )

    const {
      data: { user },
    } = await supabase.auth.getUser()

    // Redirect to login if not authenticated
    if (!user) {
      return NextResponse.redirect(new URL("/login", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
