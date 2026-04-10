import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const login = new URL("/petmaster/login", request.url)
  const res = NextResponse.redirect(login)
  res.cookies.set("petmaster_auth", "", {
    path: "/",
    maxAge: 0,
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
  })
  return res
}
