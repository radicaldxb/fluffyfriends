import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
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
    <main className="flex min-h-screen flex-col bg-background">
      <Navbar />

      <section className="flex flex-1 items-center justify-center px-4 py-14 sm:py-20">
        <div className="w-full max-w-xl">
          <div className="rounded-organic border border-border bg-card px-6 py-10 text-center shadow-lg shadow-foreground/5 sm:px-10 sm:py-12">

            {state === "success" && (
              <>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
                  All done
                </p>
                <h1 className="font-heading mt-3 text-balance text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">
                  You&apos;re off the list.
                </h1>
                <p className="mx-auto mt-5 max-w-md text-pretty text-base leading-relaxed text-muted-foreground">
                  No more reminders about{" "}
                  <span className="font-medium text-foreground">{petName}&apos;s</span> portrait.
                  We&apos;ll miss seeing them, but we get it — life&apos;s busy.
                </p>
                <p className="mx-auto mt-3 max-w-md text-pretty text-sm leading-relaxed text-muted-foreground">
                  If you change your mind later, your spot is always here.
                </p>
                <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                  <Button
                    asChild
                    className="rounded-organic-sm px-6 py-3 text-sm font-semibold"
                  >
                    <Link href="/create">Start a new portrait</Link>
                  </Button>
                  <Link
                    href="/"
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    Back to FluffyFriends
                  </Link>
                </div>
              </>
            )}

            {state === "already" && (
              <>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
                  Already done
                </p>
                <h1 className="font-heading mt-3 text-balance text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">
                  You&apos;re already off the list.
                </h1>
                <p className="mx-auto mt-5 max-w-md text-pretty text-base leading-relaxed text-muted-foreground">
                  No more reminders about{" "}
                  <span className="font-medium text-foreground">{petName}&apos;s</span> portrait
                  coming your way. Promise.
                </p>
                <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                  <Button
                    asChild
                    className="rounded-organic-sm px-6 py-3 text-sm font-semibold"
                  >
                    <Link href="/create">Start a new portrait</Link>
                  </Button>
                  <Link
                    href="/"
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    Back to FluffyFriends
                  </Link>
                </div>
              </>
            )}

            {state === "notfound" && (
              <>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
                  Hmm
                </p>
                <h1 className="font-heading mt-3 text-balance text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">
                  We can&apos;t find that link.
                </h1>
                <p className="mx-auto mt-5 max-w-md text-pretty text-base leading-relaxed text-muted-foreground">
                  This unsubscribe link doesn&apos;t match anything on our end. It may have been
                  trimmed when copied, or the original portrait is no longer in our records.
                </p>
                <p className="mx-auto mt-3 max-w-md text-pretty text-sm leading-relaxed text-muted-foreground">
                  If you&apos;re still receiving emails from us, just reply to one and we&apos;ll
                  sort it out personally.
                </p>
                <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                  <Link
                    href="/"
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    Back to FluffyFriends
                  </Link>
                </div>
              </>
            )}

          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
