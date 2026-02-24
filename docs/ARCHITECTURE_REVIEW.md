# Architecture Review: Fluffyfriends Portrait Pipeline

**Role:** Solutions Architect review of current choices, trade-offs, and recommended improvements.

**Current build snapshot:** See **CURRENT_BUILD.md** for the stabilized state (create-portrait, name tag via Gemini, theme validation from DB, deployment).

---

## 1. Theme management: prompts in Supabase

**Your choice:** Store theme prompts in `theme_prompts`; API fetches at request time; fallback to hardcoded defaults in code.

**Verdict: ✅ Sound, with one big caveat**

**What works:**
- Single source of truth for prompt *content* in the DB.
- No redeploy needed to change copy; good for non-devs (e.g. marketing).
- Fallback in code keeps the app working if Supabase is down.
- RLS and `active` give you safe, soft-disable without deleting data.

**What doesn’t:**
- “Add a new theme without code changes” is only half true. You still have:
  - **API:** hardcoded `["fireman", "spaceman"]` in `create-portrait/route.ts` (line 51).
  - **UI:** hardcoded theme list and buttons in `app/create/page.tsx`.
  - **Config:** `VALID_THEMES` in `lib/themes.ts`.
- So “new theme” = DB + Storage + **three code touchpoints**. The DB alone is not enough.

**Better option:** Make the app theme list fully data-driven.

1. **Validate theme in API from DB**  
   Replace the hardcoded list with a check against active themes from Supabase:

   ```ts
   const validThemes = await getActiveThemes()
   if (!validThemes.includes(theme.toLowerCase())) {
     return NextResponse.json({ error: "Invalid theme." }, { status: 400 })
   }
   ```

2. **Drive UI from API or DB**  
   - Either: `GET /api/themes` that returns `{ themes: [{ id, name, previewUrl }] }` (from `theme_prompts` + convention or metadata for preview/master image path).  
   - Or: fetch active themes at build time or in a layout and pass into the create page.

3. **Single source of truth**  
   - `theme_prompts` (and optionally a small `themes` table with display name + preview path) define what exists.  
   - Code only enforces “theme must exist and be active,” not a fixed list.

Then “add a new theme” = insert in DB + upload master (and optionally preview) to Storage. No code change.

---

## 2. Dual source of truth for “valid themes”

**Current state:**  
Valid themes are defined in:
- `create-portrait/route.ts`: `["fireman", "spaceman"]`
- `lib/themes.ts`: `VALID_THEMES`
- `app/create/page.tsx`: `Theme` type and two buttons
- DB: `theme_prompts.theme_name` + `active`

**Verdict: ❌ Inconsistent and brittle**

**Risk:**  
You add “pirate” in the DB and Storage but forget to add it in one of the three code places. Result: 400 from API, or a theme that exists in DB but is never offered in the UI.

**Better option:**  
As above: one source of truth (DB). API and UI both derive “what’s valid” from Supabase (or from an API that reads Supabase). Remove hardcoded theme arrays from the API and, where possible, from the create page (e.g. render theme buttons from a list fetched once).

---

## 3. Fire-and-forget webhook to n8n

**Your choice:**  
Upload to Supabase → build payload → `fetch(webhookUrl)` → return `{ queued: true, ... }` regardless of n8n response. Optionally include `webhook_ok` / `webhook_status` / `webhook_error` in the response.

**Verdict: ⚠️ Acceptable for MVP, weak for production**

**What works:**
- Simple; no job queue or worker to run.
- User gets immediate “we’re on it” feedback.

**What’s missing:**
- If n8n returns 4xx/5xx or times out, the client still sees “queued” and will poll until timeout. User experience is “it never arrived” with no clear failure.
- No **job id** for status or idempotency: you can’t say “status of job X” or “retry job X.”
- No retries: one shot; if n8n is briefly down, the request is lost.

**Better options (by ambition):**

1. **Minimum (quick win):**  
   - If `!res.ok`, return **4xx/5xx** and a clear message (“Portrait creation is temporarily unavailable. Please try again.”).  
   - Don’t return “queued” when the webhook clearly failed. Optionally still return `webhook_ok: false` and use it in the UI to show a warning even when you do return 200.

2. **Medium:**  
   - Create a **job row** in Supabase (e.g. `portrait_jobs`: id, created_at, status, original_image_url, theme, etc.) before calling n8n.  
   - Return `job_id` to the client.  
   - Client polls by `job_id` (or by `original_image_url` as today, but with a clear job to attach to).  
   - n8n callback receives and stores `job_id`; updates that row when done.  
   - You get: traceability, possibility of “pending / processing / completed / failed,” and a place to add retries or dead-letter handling later.

3. **Larger:**  
   - Put “create portrait” messages on a queue (e.g. Inngest, Trigger.dev, or SQS).  
   - Worker or n8n triggered by queue consumes and calls Gemini; on success calls your receive-n8n-image API.  
   - Decouples “accept request” from “run workflow” and gives retries and backpressure.

Recommendation: do (1) immediately; plan (2) when you want clearer status and debugging.

---

## 4. Polling and matching strategy

**Your choice:**  
Client polls `pet_portraits` (last 15, ordered by `created_at`). Match by `original_image_url === uploadUrl` (exact) or “newest row after request start” (fallback).

**Verdict: ⚠️ Works but is fragile**

**Risks:**
- **Race:** Two users submit at once. “Newest after start” can point to the *other* user’s portrait if that job finishes first. You already prefer `exactMatch` over `newestAfterStart`, which is good, but if the callback is slow, the client might hit the timeout and then later see the correct row only after refresh.
- **Inefficiency:** Polling “last 15” every 3s is more than you need for a single job.
- **No explicit “failed” state:** If n8n never calls back, the user just waits until the 300s timeout and then sees a generic message.

**Better option (aligns with job id above):**  
- Persist a **job** with `id`, `status`, `original_image_url`, etc.  
- Client polls `GET /api/jobs/:id` or a single row in `portrait_jobs` by `job_id`.  
- When n8n calls back, update that job (and optionally still write to `pet_portraits` for gallery).  
- No “last 15” scan; no ambiguity about which row belongs to this request; you can set `status = 'failed'` on timeout or on n8n error.

---

## 5. Fallback prompts in code

**Your choice:**  
Long default prompts in `getDefaultPrompt()` in `lib/theme-prompts.ts` mirroring the seeded DB content.

**Verdict: ⚠️ Duplication and drift risk**

**Issue:**  
The same long text lives in (a) Supabase seed and (b) code. Any prompt change in the DB will not be reflected in the fallback. After a few edits you get two different “fireman” prompts (DB vs fallback).

**Better options:**

1. **Thin fallback (recommended):**  
   - Fallback is a **short generic** prompt: e.g. “Use Image 1 as style reference and Image 2 as the pet. Output a 16:9 photorealistic portrait. Preserve pet identity.”  
   - No attempt to mirror DB; used only when DB is unavailable.  
   - Document: “Fallback is minimal; for full quality ensure Supabase is up.”

2. **No fallback:**  
   - If Supabase fails, return 503 “Theme configuration unavailable.”  
   - Simpler, but no graceful degradation.

3. **Generated fallback:**  
   - E.g. build a minimal prompt from `theme` string only (“Create a 16:9 portrait of the pet from Image 2 in the style of Image 1 (theme: {theme}).”).  
   - Reduces duplication but quality is lower; use only as last resort.

Recommendation: keep a fallback for resilience, but make it short and generic (option 1).

---

## 6. receive-n8n-image: no auth

**Your choice:**  
`N8N_WEBHOOK_SECRET` is read but not used; any POST to the callback URL can insert/update `pet_portraits`.

**Verdict: ❌ Security gap**

**Risk:**  
Anyone who discovers the URL (logs, browser, docs) can POST fake “completed” portraits (e.g. arbitrary image URLs or base64). That means spam, abuse, or corrupted gallery data.

**Better option:**  
- Require a shared secret (e.g. header `X-Webhook-Secret` or `Authorization: Bearer <secret>`).  
- In `receive-n8n-image`, compare `request.headers.get("X-Webhook-Secret")` to `process.env.N8N_WEBHOOK_SECRET`.  
- If missing or wrong, return 401 and do not write to DB.  
- Configure the same secret in the n8n HTTP Request node that calls this endpoint.

---

## 7. Theme image URL convention

**Your choice:**  
Master image URL is built by convention:  
`{SUPABASE_URL}/storage/.../images/themes/{theme}-master.png`  
(e.g. in n8n “Fetch Theme Image” and in `lib/themes.ts`).

**Verdict: ✅ Fine, but consider storing in DB later**

**What works:**  
Simple; no extra table; adding a theme = upload a file with the right name.

**Limitation:**  
Extension and path are fixed in code. If you ever want different formats or paths per theme, you’ll need config. A small `themes` table (or columns on `theme_prompts`) with `master_image_path` or `preview_image_path` would make that easy later without changing code. Not required now; worth it when you add more themes or non-PNG assets.

---

## 8. n8n as the orchestration layer

**Your choice:**  
Next.js API uploads and calls n8n; n8n fetches images, calls Gemini, then calls back into your API.

**Verdict: ✅ Reasonable for this product**

**Pros:**  
- Visual workflow, quick iterations, no backend code for “fetch theme + call Gemini + callback.”  
- Good fit for a small team and low/medium volume.

**Cons:**  
- n8n is a single point of failure; no built-in retry in your current design.  
- Harder to version and test than code (you already keep workflow JSON in repo, which helps).  
- At high scale you’d typically move to a queue + worker, but that’s not necessary until you need it.

**Recommendation:**  
Keep n8n. Add: (1) webhook auth on the callback, (2) clearer handling when n8n returns an error (don’t tell the user “queued” when it didn’t accept the job), and (3) later, optional job table + status for observability and retries.

---

## 9. Summary: what to do next

| Priority | Item | Effort | Impact |
|----------|------|--------|--------|
| High | Validate theme from DB in API; remove hardcoded `["fireman", "spaceman"]` | Low | Single source of truth; fewer bugs when adding themes |
| High | Secure receive-n8n-image with `N8N_WEBHOOK_SECRET` | Low | Prevents abuse and fake submissions |
| Medium | Don’t return “queued” when n8n returns 4xx/5xx; return error to user | Low | Honest UX when n8n fails |
| Medium | Short, generic fallback prompt in code; document as minimal | Low | Avoids prompt drift; clearer intent |
| Medium | (Later) Job table + job_id; client polls by job; n8n callback updates job | Medium | Clear status, no race, path to retries |
| Low | Optional: GET /api/themes or SSG theme list from DB for fully dynamic UI | Medium | True “add theme without code change” |

---

## 10. Conclusion

- **Prompts in Supabase** is a good choice; the main fix is to **derive “valid themes” from the same place** (DB) in both API and UI, so adding a theme doesn’t require code changes.
- **Fire-and-forget webhook** is acceptable for MVP; improve by **failing fast when n8n fails** and, when you’re ready, by introducing a **job table and polling by job_id**.
- **Callback security** should be fixed soon with a **shared webhook secret**.
- **Fallback prompts** should stay for resilience but be **short and generic** to avoid duplication and drift.

---

## Implementation Done (from review)

The following were implemented step by step:

1. **Theme validation from DB** – `create-portrait` now calls `getActiveThemes()` and rejects themes not in that list. Single source of truth; new themes only need DB + Storage.
2. **Webhook secret** – `receive-n8n-image` checks `X-Webhook-Secret` or `Authorization: Bearer <secret>` when `N8N_WEBHOOK_SECRET` is set; returns 401 if missing/wrong. Optional env var for backward compatibility.
3. **Honest response when n8n fails** – If the webhook returns non-2xx or throws, `create-portrait` returns **503** with a clear message instead of 200 with `queued: true`.
4. **Docs** – `.env.example` and `NETLIFY_ENV_VARS_SETUP.md` updated for `N8N_WEBHOOK_SECRET`; **docs/N8N_WEBHOOK_SECRET_SETUP.md** added for n8n header setup.
