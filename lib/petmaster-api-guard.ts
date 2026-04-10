import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { getPetmasterPassword } from "@/lib/petmaster-env"

/** Returns a401 JSON response if the Petmaster cookie is missing or invalid; otherwise null. */
export async function petmasterUnauthorizedResponse(): Promise<NextResponse | null> {
  const secret = getPetmasterPassword()
  const auth = (await cookies()).get("petmaster_auth")
  if (!secret || !auth || auth.value !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  return null
}
