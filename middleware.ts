import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set("x-pathname", pathname)

  if (pathname.startsWith("/petmaster")) {
    if (pathname === "/petmaster/login") {
      return NextResponse.next({ request: { headers: requestHeaders } })
    }
    const auth = request.cookies.get("petmaster_auth")
    const secret = process.env.PETMASTER_PASSWORD
    if (!secret || !auth || auth.value !== secret) {
      return NextResponse.redirect(new URL("/petmaster/login", request.url))
    }
  }

  return NextResponse.next({ request: { headers: requestHeaders } })
}

export const config = { matcher: ["/petmaster/:path*"] }
