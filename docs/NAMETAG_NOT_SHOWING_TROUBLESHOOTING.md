# Name tag not showing — troubleshooting

When the fireman portrait appears **without** the pet name on the chest patch, or shows the literal text **`{{PET_NAME}}`**, work through these checks. In the current build the **visible name is rendered by Gemini** from the prompt (no Cloudinary overlay).

---

## 1. Database: does the fireman prompt include the name patch?

- In **Supabase** → **Table Editor** → **theme_prompts**, open the row where `theme_name = 'fireman'`.
- The **prompt** column should contain:
  - The placeholder `{{PET_NAME}}`, and
  - A “NAME PATCH” (or step 9) instruction about the chest patch.

If not, run **`supabase/run-update-fireman-prompt-name.sql`** in the Supabase SQL Editor. That adds the NAME PATCH step with `{{PET_NAME}}`.

**Safety net:** Even if the DB prompt is missing this step, the **create-portrait API** will append it for the fireman theme before replacing the placeholder. So the main risk is the **deployed app** not being the latest (see step 3).

---

## 2. API: is the webhook payload using the resolved prompt?

The **create-portrait** API:

- Fetches the prompt from Supabase (`getPromptForTheme(theme)`).
- For fireman, appends the NAME PATCH step if the prompt doesn’t already contain `{{PET_NAME}}`.
- Replaces every `{{PET_NAME}}` with the actual pet name.
- Sends in the webhook body: **`prompt`** (fully resolved), `pet_name`, `theme`, `test_image`, etc.

In n8n, trigger a fireman portrait and open the **Webhook** node output. Check **body.prompt**: it must contain the **real pet name** in the NAME PATCH step and **must not** contain the literal `{{PET_NAME}}`. If it still contains `{{PET_NAME}}`, the replacement did not run — usually because the deployed code is old (see step 3).

---

## 3. Deployment and Git

If **body.prompt** in n8n still has `{{PET_NAME}}`, the app that handled the request is not running the latest **create-portrait** code.

- Ensure **`app/api/create-portrait/route.ts`** (with placeholder replacement and fireman safety net) is **committed and pushed** to the branch Netlify uses.
- Trigger a **new deploy** after the push so Netlify builds from the latest commit.

See **DEPLOYMENT_AND_RUNBOOK.md** for Git sync and deploy steps.

---

## 4. n8n: does GEMINI use the payload prompt?

The GEMINI node must use the prompt from the webhook, not a hardcoded string.

- In the GEMINI node **JSON Body** (Expression mode), the text part must be:  
  **`$('Webhook').item.json.body.prompt`**
- If your webhook node has a different name, use that name instead of `Webhook`.

See **N8N_GEMINI_USE_PAYLOAD_PROMPT.md** for the full expression and checklist.

---

## Quick checklist

| Check | What to verify |
|--------|-----------------|
| DB | fireman row in `theme_prompts` has prompt with `{{PET_NAME}}` and NAME PATCH step (or rely on API safety net). |
| Webhook payload | Webhook node output has **body.prompt** with the **resolved** pet name, no literal `{{PET_NAME}}`. |
| Git + Deploy | Latest create-portrait code is pushed and a new deploy has run. |
| n8n GEMINI | Node uses `$('Webhook').item.json.body.prompt` for the text instruction. |

If all of the above are correct, the fireman portrait should show the pet name on the chest patch, rendered by Gemini.
