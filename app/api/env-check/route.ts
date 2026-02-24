import { NextResponse } from "next/server"

/**
 * GET /api/env-check — Local dev only. Reports whether N8N_WEBHOOK_URL is set
 * (so portrait creation works). Does not expose the URL.
 * Use this to confirm .env.local is loaded after restarting the dev server.
 */
export async function GET() {
  const webhook = process.env.N8N_WEBHOOK_URL?.trim()
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()

  return NextResponse.json({
    n8nWebhookConfigured: !!webhook,
    supabaseConfigured: !!(supabaseUrl && supabaseKey),
    hint: !webhook
      ? "Add N8N_WEBHOOK_URL to .env.local in the project root, then restart the dev server (npm run dev)."
      : undefined,
  })
}
