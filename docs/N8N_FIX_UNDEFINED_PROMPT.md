# n8n: Fix "undefined" Prompt in Set Node

## Issue

The expression `{{ $('Webhook').item.json.body.prompt }}` shows **"undefined"** and output shows `Prompt: [null]`.

---

## Why It's Undefined

**Most likely:** The Webhook node's test/pinned data doesn't include `prompt` (it's old data from before your app sent prompts).

---

## Solution 1: Check Webhook Output First

**Before fixing Set node, verify Webhook has prompt:**

1. In n8n, open the **Webhook** node.
2. Check the **OUTPUT** panel (right side).
3. Look for `body` → does it have `prompt`?
   - ✅ **If YES:** Expression syntax might be wrong → try Solution 2
   - ❌ **If NO:** Webhook doesn't have prompt → unpin old data and run real execution

---

## Solution 2: Try Alternative Expression Syntax

If Webhook output shows `prompt` exists, try these expressions in Set node:

**Option A:** Old n8n syntax (like Fluffyfriends-9 uses):
```
{{ $node["Webhook"].json.body.prompt }}
```

**Option B:** Without `.item`:
```
{{ $('Webhook').json.body.prompt }}
```

**Option C:** Explicit first item:
```
{{ $('Webhook').item[0].json.body.prompt }}
```

**Option D:** Check if body exists first:
```
{{ $('Webhook').item?.json?.body?.prompt || '' }}
```

---

## Solution 3: Unpin and Run Real Execution

**If Webhook output doesn't have `prompt`:**

1. **Unpin** the Webhook node's test data (click "Unpin" or clear pinned data).
2. **Run a real execution** from your site:
   - Go to `/create`
   - Select theme, upload photo, submit
3. **Check Webhook output** after execution — should now show `body.prompt`.
4. **Re-test Set node** — expression should work now.

---

## Solution 4: Debug with Set Node After Webhook

**Add a temporary Set node right after Webhook to debug:**

1. Add a **Set** node between **Webhook** and the branches.
2. Add field: `debug_prompt` = `{{ $json.body.prompt }}`
3. Execute and check output — if this shows the prompt, then Webhook has it.
4. Remove this debug node after testing.

---

## Most Likely Fix

**The expression syntax is probably correct.** The issue is:

1. **Pinned/test data is old** (doesn't have `prompt`).
2. **Unpin Webhook data** and run a real execution from your site.
3. **Then** the Set node expression should work.

---

## Quick Test

1. In Set node, temporarily change the expression to:
   ```
   {{ $('Webhook').item.json.body.theme }}
   ```
   (We know `theme` exists in webhook body)
2. Execute Set node.
3. If `theme` shows up → expression syntax works, just need `prompt` in Webhook.
4. If `theme` is also undefined → expression syntax issue, try Option A/B/C above.
