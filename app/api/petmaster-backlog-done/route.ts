import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getPetmasterPassword } from "@/lib/petmaster-env"
import { getSupabaseAdmin } from "@/lib/supabase-admin"

export async function POST(request: Request) {
  const secret = getPetmasterPassword()
  const cookieStore = await cookies()
  const auth = cookieStore.get("petmaster_auth")
  if (!secret || !auth || auth.value !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const id =
    typeof body === "object" &&
    body !== null &&
    "id" in body &&
    (typeof (body as { id: unknown }).id === "string" ||
      typeof (body as { id: unknown }).id === "number")
      ? String((body as { id: string | number }).id)
      : null

  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 })
  }

  let admin
  try {
    admin = getSupabaseAdmin()
  } catch {
    return NextResponse.json({ error: "Server misconfigured" }, { status: 503 })
  }

  const now = new Date().toISOString()
  const { error } = await admin
    .from("ff_backlog")
    .update({
      status: "done",
      completed_at: now,
      updated_at: now,
    })
    .eq("id", id)

  if (error) {
    console.error("petmaster-backlog-done:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
