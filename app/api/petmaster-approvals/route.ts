import { NextResponse } from "next/server"
import { petmasterUnauthorizedResponse } from "@/lib/petmaster-api-guard"
import { getSupabaseAdmin } from "@/lib/supabase-admin"

export const dynamic = "force-dynamic"

export async function GET() {
  const denied = await petmasterUnauthorizedResponse()
  if (denied) return denied

  let supabase
  try {
    supabase = getSupabaseAdmin()
  } catch {
    return NextResponse.json({ error: "Server misconfigured" }, { status: 503 })
  }

  const [postsRes, proposalsRes] = await Promise.all([
    supabase
      .from("pb_content_queue")
      .select("*")
      .eq("status", "scheduled")
      .order("scheduled_for", { ascending: true, nullsFirst: false }),
    supabase
      .from("pb_playbook_proposals")
      .select("*")
      .eq("status", "pending_approval")
      .order("created_at", { ascending: false }),
  ])

  if (postsRes.error) {
    console.error("petmaster-approvals posts:", postsRes.error)
    return NextResponse.json({ error: postsRes.error.message }, { status: 500 })
  }
  if (proposalsRes.error) {
    console.error("petmaster-approvals proposals:", proposalsRes.error)
    return NextResponse.json({ error: proposalsRes.error.message }, { status: 500 })
  }

  const posts = postsRes.data ?? []
  const ids = posts.map((p) => p.id as string)
  const assetMap = new Map<string, string | null>()

  if (ids.length > 0) {
    const { data: assets, error: aErr } = await supabase
      .from("pb_asset_store")
      .select("brief_id, social_post_url, created_at")
      .in("brief_id", ids)
    if (aErr) {
      console.error("petmaster-approvals assets:", aErr)
      return NextResponse.json({ error: aErr.message }, { status: 500 })
    }
    const byBrief = new Map<string, { url: string | null; t: string }>()
    for (const row of assets ?? []) {
      const r = row as { brief_id?: string; social_post_url?: string | null; created_at?: string }
      const bid = r.brief_id
      if (!bid) continue
      const t = r.created_at ?? ""
      const url = r.social_post_url ?? null
      const cur = byBrief.get(bid)
      if (!cur || t > cur.t) {
        byBrief.set(bid, { url, t })
      }
    }
    for (const [bid, { url }] of byBrief) {
      assetMap.set(bid, url)
    }
  }

  const enriched = posts.map((p) => {
    const id = p.id as string
    return {
      ...p,
      image_url: assetMap.get(id) ?? null,
    }
  })

  return NextResponse.json({
    posts: enriched,
    proposals: proposalsRes.data ?? [],
  })
}
