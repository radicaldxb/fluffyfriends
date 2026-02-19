/**
 * Quick Supabase connection test: insert then read from public.pet_portraits.
 * Run: node --env-file=.env.local scripts/test-supabase.mjs
 */

import { createClient } from "@supabase/supabase-js"

const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()

if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local")
  process.exit(1)
}

const supabase = createClient(url, key)

async function run() {
  console.log("Testing Supabase connection…\n")

  // 1. Insert a test row (will fail with RLS if not authenticated; we'll try and then read as anon)
  const testRow = {
    image_url: "https://example.com/test.png",
    pet_name: "Test Pet",
    status: "draft",
    user_email: "test@example.com",
  }

  const { data: insertData, error: insertError } = await supabase
    .from("pet_portraits")
    .insert(testRow)
    .select("id, created_at, image_url, pet_name, status, user_email")
    .single()

  if (insertError) {
    console.log("Insert (expected if not signed in):", insertError.message)
    console.log("RLS allows insert only for authenticated users.\n")
  } else {
    console.log("Insert OK:", insertData)
  }

  // 2. Read pet_portraits (allowed for everyone)
  const { data: rows, error: selectError } = await supabase
    .from("pet_portraits")
    .select("id, created_at, image_url, pet_name, status, user_email")
    .order("created_at", { ascending: false })
    .limit(5)

  if (selectError) {
    console.error("Select failed:", selectError.message)
    process.exit(1)
  }

  console.log("Select OK: found", rows.length, "row(s)")
  if (rows.length > 0) {
    console.log(JSON.stringify(rows, null, 2))
  }

  console.log("\nSupabase connection test passed.")
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
