import { NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabase-admin"
import { petmasterUnauthorizedResponse } from "@/lib/petmaster-api-guard"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

type Body = {
  id?: unknown
  is_test?: unknown
}

export async function POST(request: Request) {
  const denied = await petmasterUnauthorizedResponse()
  if (denied) return denied

  let body: Body
  try {
    body = (await request.json()) as Body
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const id = typeof body.id === "string" ? body.id.trim() : ""
  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 })
  }

  if (typeof body.is_test !== "boolean") {
    return NextResponse.json({ error: "is_test must be a boolean" }, { status: 400 })
  }

  let admin
  try {
    admin = getSupabaseAdmin()
  } catch {
    return NextResponse.json({ error: "Server misconfigured" }, { status: 503 })
  }

  const { error } = await admin
    .from("pet_portraits")
    .update({ is_test: body.is_test })
    .eq("id", id)

  if (error) {
    console.error("[petmaster-toggle-test] update failed:", error)
    return NextResponse.json(
      { error: "Failed to update row" },
      { status: 500 }
    )
  }

  return NextResponse.json({ ok: true })
}
