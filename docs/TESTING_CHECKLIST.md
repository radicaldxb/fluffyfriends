# Testing Checklist - Before You Test

## Pre-Test Checklist

### ✅ n8n Workflow
- [ ] Webhook path is `transform-pet` (not UUID)
- [ ] Webhook Response is set to "Immediately"
- [ ] Workflow is **Active** (toggle ON)
- [ ] GEMINI node references correct nodes:
  - Pet image: `$('Extract user image').item.json.data`
  - Theme image: `$('Extract from File1').item.json.data`
- [ ] Fetch Theme Image URL syntax is correct (no double equals)
- [ ] Gemini API key is set (not placeholder)

### ✅ Netlify Configuration
- [ ] `N8N_WEBHOOK_URL` is set to Production URL (ends with `/webhook/transform-pet`)
- [ ] `NEXT_PUBLIC_SUPABASE_URL` is set
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` is set
- [ ] Latest deploy completed successfully

### ✅ Supabase
- [ ] Theme images uploaded to `images/themes/`:
  - `fireman-master.png`
  - `spaceman-master.png`
- [ ] Theme images are public (run `supabase/run-allow-public-read-themes.sql`)

---

## Testing Steps

1. **Go to `/create` page** on your deployed site
2. **Select a theme** (Fireman or Spaceman)
3. **Upload a pet image** (JPEG, PNG, or WebP, under 10MB)
4. **Enter pet name** (optional)
5. **Click Submit**

---

## Expected Results

### ✅ Success Flow:
1. Image uploads to Supabase Storage ✅
2. n8n webhook receives trigger ✅
3. You see: "We're creating your portrait. This usually takes a few minutes."
4. n8n workflow executes:
   - Fetches pet image ✅
   - Fetches theme image from Supabase ✅
   - Sends to Gemini API ✅
   - Returns generated image ✅
5. Portrait appears on `/create` page ✅

### ❌ If Errors Occur:

**404 Error:**
- Check workflow is Active
- Verify `N8N_WEBHOOK_URL` matches Production URL exactly
- Check webhook path is `transform-pet`

**Theme Image Not Found:**
- Check Fetch Theme Image URL syntax
- Verify theme images exist in Supabase Storage
- Check theme images are public

**Gemini API Error:**
- Check API key is valid
- Verify node references are correct
- Check n8n execution logs for details

**No Portrait Appears:**
- Check n8n execution logs
- Verify Supabase insert succeeded
- Check browser console for errors

---

## Debugging

**Check n8n Executions:**
- Go to n8n → Executions
- Find the latest execution
- Check each node for errors

**Check Netlify Logs:**
- Netlify → Functions → `create-portrait` → View logs
- Look for any error messages

**Check Browser Console:**
- F12 → Console tab
- Look for `[create-portrait]` errors

---

## Success Indicators

✅ **Workflow is working if:**
- No 404 errors
- n8n execution appears in Executions list
- Execution completes successfully (green checkmark)
- Portrait appears on `/create` page within a few minutes
