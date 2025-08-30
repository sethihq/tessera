import { auth } from "@/lib/auth"
import { NextResponse, type NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  // Skip auth check for auth routes and static files
  if (
    request.nextUrl.pathname.startsWith("/auth") ||
    request.nextUrl.pathname.startsWith("/api/auth") ||
    request.nextUrl.pathname.startsWith("/_next") ||
    request.nextUrl.pathname.includes(".")
  ) {
    return NextResponse.next()
  }

  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    })

    // Redirect to sign-in if no session and not on homepage
    if (!session && request.nextUrl.pathname !== "/") {
      const url = request.nextUrl.clone()
      url.pathname = "/auth/sign-in"
      return NextResponse.redirect(url)
    }

    return NextResponse.next()
  } catch (error) {
    console.error("[v0] Middleware auth error:", error)
    // On error, redirect to sign-in for protected routes
    if (request.nextUrl.pathname !== "/" && !request.nextUrl.pathname.startsWith("/auth")) {
      const url = request.nextUrl.clone()
      url.pathname = "/auth/sign-in"
      return NextResponse.redirect(url)
    }
    return NextResponse.next()
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images - .svg, .png, .jpg, .jpeg, .gif, .webp
     * - api/auth (auth API routes)
     */
    "/((?!_next/static|_next/image|favicon.ico|api/auth|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
