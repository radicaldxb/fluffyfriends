import Image from "next/image"
import { getSupabaseAdmin } from "@/lib/supabase-admin"

export const dynamic = "force-dynamic"
export const revalidate = 0

type Props = {
  params: Promise<{ token: string }>
}

export default async function UnsubscribePage({ params }: Props) {
  const { token: rawToken } = await params
  const token = decodeURIComponent(rawToken ?? "").trim()

  let state: "success" | "already" | "notfound" = "notfound"
  let petName = "your pet"

  if (token) {
    const supabase = getSupabaseAdmin()

    const { data: row, error: fetchError } = await supabase
      .from("pet_portraits")
      .select("id, pet_name, recovery_emails_paused")
      .eq("preview_token", token)
      .maybeSingle()

    if (!fetchError && row) {
      const name =
        typeof row.pet_name === "string" && row.pet_name.trim() ? row.pet_name.trim() : "your pet"
      petName = name

      if (row.recovery_emails_paused) {
        state = "already"
      } else {
        const { error: updateError } = await supabase
          .from("pet_portraits")
          .update({ recovery_emails_paused: true })
          .eq("id", row.id)

        if (!updateError) {
          state = "success"
        }
      }
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-14 sm:py-16">
      <div className="w-full max-w-md rounded-organic bg-card px-6 py-8 text-center shadow-lg sm:px-8">
        <div className="mb-6 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-organic-sm bg-secondary/80">
            <Image
              src="/logos/FluffyFriends-logo.webp"
              alt="FluffyFriends"
              width={56}
              height={56}
              className="h-14 w-14 object-contain"
              priority
            />
          </div>
        </div>

        {state === "success" && (
          <>
            <h1 className="font-heading mb-3 text-2xl font-extrabold tracking-tight text-foreground">
              You&apos;re unsubscribed.
            </h1>
            <p className="text-pretty text-sm leading-relaxed text-muted-foreground">
              We won&apos;t send you any more reminders about {petName}&apos;s portrait. The portrait is still
              saved if you change your mind — just visit the site to find it.
            </p>
          </>
        )}

        {state === "already" && (
          <>
            <h1 className="font-heading mb-3 text-2xl font-extrabold tracking-tight text-foreground">
              Already unsubscribed.
            </h1>
            <p className="text-pretty text-sm leading-relaxed text-muted-foreground">
              You&apos;re already off the list for {petName}&apos;s reminders. No more emails coming your way.
            </p>
          </>
        )}

        {state === "notfound" && (
          <>
            <h1 className="font-heading mb-3 text-2xl font-extrabold tracking-tight text-foreground">
              Link expired.
            </h1>
            <p className="text-pretty text-sm leading-relaxed text-muted-foreground">
              This unsubscribe link is no longer valid. If you&apos;re still receiving emails, please reply to one
              and we&apos;ll sort it out.
            </p>
          </>
        )}

        <a
          href="/"
          className="mt-8 inline-block text-sm text-muted-foreground underline-offset-2 transition-colors hover:text-foreground hover:underline"
        >
          Back to FluffyFriends
        </a>
      </div>
    </main>
  )
}
