import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { getPetmasterPassword } from "@/lib/petmaster-env"

type PetmasterCookieStore = Awaited<ReturnType<typeof cookies>>

/** Returns a 401 JSON response if the Petmaster cookie is missing or invalid; otherwise null. */
export async function petmasterUnauthorizedResponse(
  cookieStore?: PetmasterCookieStore,
): Promise<NextResponse | null> {
  const secret = getPetmasterPassword()
  const store = cookieStore ?? (await cookies())
  const auth = store.get("petmaster_auth")
  if (!secret || !auth || auth.value !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  return null
}
