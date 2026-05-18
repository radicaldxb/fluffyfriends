# n8n + DB — recovery email cadence (handoff brief)

Execute in **n8n** and **Postgres** (not in the Next.js repo). The app now assumes this **product** behaviour for preview-stage abandoners.

## Target behaviour

| Wave | When | Purpose |
|------|------|---------|
| **Email 1** | Immediately when preview is ready (existing “preview ready” send) | Deep link + emotional hook while they still have the tab open |
| **Email 2** | **2 hours** after preview ready | Same-session / short-memory nudge (“Your portrait is still here”) |
| **Email 3** | **24 hours** after preview ready | Final reminder |
| **Removed** | ~~48h~~ (or any third-day wave) | Drop entirely — impulse gift buyers don’t wait |

Copy and subject lines are owned by marketing; timings above are the contract.

## Checklist — n8n (workflow referenced in `docs/ARCHITECTURE.md` as `59jKJ6Ot1kkaw5Zf` or successor)

1. **Inventory current schedule triggers**
   - List every **Wait**, **Schedule**, **Cron**, or time-based branch that sends “recovery”, “reminder”, “still interested”, or preview links for **`status = preview`** (or equivalent) portraits **without** a purchase.
   - Map each to: offset from which anchor (`preview_revealed_at`, `created_at`, `preview_expires_at`, first email sent time, etc.).

2. **Align anchors with DB**
   - Confirm which timestamp drives “preview ready” for your sends (WF2 write to `pet_portraits` vs first email log). Email 2 must be **+2h from that anchor**; Email 3 **+24h**.

3. **Change delays**
   - **Insert or adjust** a **2-hour** delayed branch after preview-ready (if the old sequence was “24h then 48h”, replace the middle step with **2h** and keep **24h** as the final).
   - **Delete or disable** the **48-hour** (or ~47h) email node path so it **never** fires.
   - Ensure **no duplicate sends**: if the workflow retriggers on edit, guard with idempotency flags on `pet_portraits` (`recovery_email_*_sent_at` fields).

4. **Wire `recovery_email_*_sent_at` (or your equivalents)**
   - After each successful send, update the correct column so Postgres/RPC candidates exclude already-mailed rows.
   - Order should be: wave 1 → `*_sent_at` / wave 2 → `*_sent_at` / wave 3 → `*_sent_at` (names must match what `get_recovery_email_candidates()` expects).

5. **Respect unsubscribe**
   - Every path must filter `recovery_emails_paused = false` (same as today). Do not send the new 2h mail if the user hit `/unsubscribe/[token]`.

6. **QA in staging**
   - Seed a test `pet_portraits` row in preview with your own email; run workflow manually or shorten timers in a **duplicate** workflow; confirm order: **immediate (or as soon as WF allows) → +2h → +24h**, and **no** third mail.

## Checklist — Postgres `get_recovery_email_candidates()`

1. Open the function definition in Supabase SQL editor (or migration tool).

2. **Eligibility windows**
   - Row qualifies for **2h mail** only if preview-ready time is **between 2h and ~3h ago** (or your batch window), first mail already sent, second not yet, not purchased, not unsubscribed.
   - Row qualifies for **24h final** only in the **24h+** band; **remove** any branch that selected candidates for a **48h** third send.

3. **Indexes** (if batch is slow): ensure filters on `status`, `recovery_emails_paused`, and timestamp columns are indexed as you already do for the cron.

4. **Deploy** function after n8n is ready so scheduled jobs don’t error on missing columns.

## References in repo (read-only for you)

- Unsubscribe: `app/unsubscribe/[token]/page.tsx` → sets `recovery_emails_paused`.
- Preview link pattern: `app/preview/[id]/page.tsx` with `preview_token`.
- `pet_portraits` fields: `preview_token`, `preview_expires_at`, `recovery_email_*_sent_at`, `recovery_emails_paused` — see `docs/ARCHITECTURE.md` → Database surfaces.
