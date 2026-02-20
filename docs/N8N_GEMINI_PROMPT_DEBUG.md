# n8n: Fixing "undefined" prompt in GEMINI node

## Issue

When you use `{{ $('Webhook').item.json.body.prompt }}` in the GEMINI node, the expression builder shows `[undefined]`.

---

## Why it's undefined

**The pinned test data doesn't include `prompt`.** The expression builder uses the last execution's data, and if that execution was from old pinned data (before your app sent `prompt`), it won't have that field.

---

## Solutions

### Option 1: Update pinned data (for testing)

1. In n8n, open the **Webhook** node.
2. Click **"Unpin"** or clear the pinned data.
3. **Trigger a real execution** from your site (go to `/create`, select theme, upload, submit).
4. After the execution completes, check the **Webhook** node output — you should see `body.prompt` with the full theme prompt.
5. If you want to pin it for testing, pin the new execution data.

**Then** the expression `{{ $('Webhook').item.json.body.prompt }}` should work.

---

### Option 2: Try alternative expression syntax

If Option 1 doesn't work, try these variations:

**Variation A:** Use `$node` syntax (older n8n style):
```javascript
{{ $node["Webhook"].json.body.prompt }}
```

**Variation B:** Access via Merge output (if Merge passes through body):
```javascript
{{ $json.body.prompt }}
```

**Variation C:** Explicit first item:
```javascript
{{ $('Webhook').item[0].json.body.prompt }}
```

---

### Option 3: Verify the app is sending prompt

1. In your deployed app, check the **Netlify Functions logs** for `/api/create-portrait`.
2. Look for the webhook payload being sent — it should include `prompt`.
3. Or add a **Set** node after **Webhook** in n8n to log `{{ $json.body.prompt }}` and run a real execution.

---

## Most likely fix

**The expression is correct** (`{{ $('Webhook').item.json.body.prompt }}`). The issue is that:

1. Your **pinned test data** is old (doesn't have `prompt`).
2. When you run a **real execution** from your site, the app sends `prompt` and it should work.

**Action:** Unpin the old test data, run a real execution from your site, and the prompt should appear.

---

## Quick test

1. In n8n, add a **Set** node between **Merge** and **GEMINI**.
2. In that Set node, add a field: `test_prompt` = `{{ $('Webhook').item.json.body.prompt }}`
3. Run a real execution from your site.
4. Check the Set node output — if `test_prompt` has the prompt text, then the expression works and you can use it in GEMINI.
