# Current build (stabilized)

Snapshot of the Fluffyfriends portrait pipeline as of **Feb 2025**, after stabilizing the name-tag flow and documentation.

---

## What this build does

- **Create portrait:** User uploads a photo and pet name, selects a theme. App uploads to Supabase Storage, fetches the theme prompt from `theme_prompts`, replaces `{{PET_NAME}}` with the pet name, and POSTs the resolved prompt + image URL to n8n. If the webhook fails, the API returns 503 (no fake “queued”).
- **Name tag (e.g. fireman):** The visible name on the chest patch is **rendered by Gemini** from the prompt. The API ensures the prompt includes a NAME PATCH step with `{{PET_NAME}}` (safety net for fireman if DB prompt is missing it), then replaces the placeholder before sending to n8n. No Cloudinary overlay.
- **Themes:** Valid themes come from Supabase (`theme_prompts` where `active = true`). No hardcoded theme list in the API.
- **n8n:** Webhook receives `body.prompt` (resolved), `body.test_image`, `body.pet_name`, `body.theme`, etc. GEMINI node must use `body.prompt` for the text instruction.

---

## Key files

| Area | File / location |
|------|-------------------|
| API | `app/api/create-portrait/route.ts` – upload, prompt fetch, `{{PET_NAME}}` replace, fireman safety net, webhook POST |
| Themes | `lib/theme-prompts.ts` – `getPromptForTheme()`, `getActiveThemes()` (Supabase) |
| n8n | GEMINI node: `$('Webhook').item.json.body.prompt` (see N8N_GEMINI_USE_PAYLOAD_PROMPT.md) |
| DB | Supabase `theme_prompts`; optional `run-update-fireman-prompt-name.sql` for NAME PATCH step |

---

## Docs to use next

- **Flow and API:** CREATE_PORTRAIT_FLOW.md  
- **Deploy and troubleshoot:** DEPLOYMENT_AND_RUNBOOK.md · **Netlify CLI (login, link, deploy):** NETLIFY_CLI_SETUP.md  
- **Name tag issues:** NAMETAG_NOT_SHOWING_TROUBLESHOOTING.md  
- **Architecture and improvements:** ARCHITECTURE_REVIEW.md  
