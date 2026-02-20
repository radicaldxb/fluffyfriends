# Cross-reference: Fluffyfriends-9.json vs repo (n8n-fluffyfriends-working.json)

## Summary

| Area | Fluffyfriends-9 (Dropbox) | Repo (canonical) | Action |
|------|---------------------------|------------------|--------|
| **GEMINI prompt** | Hardcoded template with `$node["Webhook"].json.body.theme` (theme name only) | `$('Webhook').item.json.body.prompt` (full prompt from API/Supabase) | **Keep repo**: prompts from DB |
| **GEMINI body fields** | `inline_data`, `mime_type` (snake_case) | `inlineData`, `mimeType` (camelCase) | **Keep repo**: Gemini API requires camelCase |
| **GEMINI safetySettings** | Missing | Present | **Keep repo** |
| **GEMINI temperature** | 0.65 | 0.7 | Optional: can set to 0.65 in repo |
| **GEMINI image order** | Theme, then user image | Theme, then user image | Same |
| **Supabase (callback) node** | Has `sendHeaders: true` + `X-Webhook-Secret` (real value) | No headers in repo export | **Adopt structure from F-9** with **placeholder** secret in repo |
| **GEMINI API key in URL** | Empty `key=` | `YOUR_GEMINI_API_KEY` | **Keep repo** placeholder |

---

## What the repo version is

- **Prompt:** From webhook `body.prompt` (app sends theme-specific prompt from Supabase `theme_prompts`).
- **Gemini body:** Valid camelCase and safetySettings.
- **Secrets:** No real secrets; placeholders only (GEMINI key, and webhook secret as placeholder when we add it).

---

## What was taken from Fluffyfriends-9

- **Supabase node:** Header structure added so the callback sends `X-Webhook-Secret`. In the repo the value is a placeholder so the workflow is correct but safe to commit.

---

## What to do in n8n (production)

1. **GEMINI node:** Use the repo’s JSON body (prompt = `{{ $('Webhook').item.json.body.prompt }}`, camelCase, safetySettings). Do not use the F-9 body (template string + snake_case).
2. **Supabase node:** Keep your real `X-Webhook-Secret` header as in Fluffyfriends-9; the repo file only has a placeholder.
3. **GEMINI URL:** Use your real API key in the URL; the repo has `YOUR_GEMINI_API_KEY`.
