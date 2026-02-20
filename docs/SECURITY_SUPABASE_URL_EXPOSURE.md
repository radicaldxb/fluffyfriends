# Security: Supabase Project URL Exposure

## Issue
The Supabase project URL (`https://mblnpneghvkfmbgmbrco.supabase.co`) was hardcoded in multiple documentation files, exposing infrastructure details.

## What Was Exposed
- **Supabase project URL** (not a secret key, but infrastructure detail)
- Found in:
  - `docs/N8N_UPDATE_TO_SUPABASE.md`
  - `docs/N8N_HTTP_REQUEST_SETTINGS.md`
  - `docs/SUPABASE_THEMES_SETUP.md`
  - `docs/N8N_THEME_SELECTION.md`
  - `docs/THEME_STORAGE_MIGRATION.md`

## Fix Applied
✅ Replaced all hardcoded Supabase URLs with placeholders:
- Changed `https://mblnpneghvkfmbgmbrco.supabase.co` → `https://your-project-ref.supabase.co`
- Updated n8n expressions to use environment variable references where appropriate

## Impact Assessment
- **Risk Level:** Low to Medium
  - The project URL itself is not a secret (it's a public endpoint)
  - However, exposing it reveals infrastructure details
  - No API keys or tokens were exposed (only the project URL)

## Action Items
1. ✅ **Fixed:** All hardcoded URLs replaced with placeholders
2. **Monitor:** Check Netlify secrets scanner on next deploy
3. **Best Practice:** Use environment variables (`NEXT_PUBLIC_SUPABASE_URL`) in code, placeholders in docs

## Prevention
- Never commit actual project URLs or infrastructure details to documentation
- Use placeholders like `your-project-ref` or environment variable references
- If you need to share actual URLs, do so privately (not in git)
