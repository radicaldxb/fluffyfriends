# Fix: Theme is "undefined" in n8n Workflow

## Error
```
Invalid URL: =https://.../undefined-master.png
```

## Two Issues to Fix

### Issue 1: URL Syntax Error (Double Equals)
**Problem:** URL starts with `=` instead of `https://`

**Current (WRONG):**
```
=  ={{ `https://.../${$json.theme}-master.png` }}
```

**Should be:**
```
={{ `https://.../${$json.theme}-master.png` }}
```

**Fix:** Remove the extra `= ` at the beginning.

---

### Issue 2: Theme is "undefined"
**Problem:** `$json.theme` is undefined because the webhook payload structure is different.

**The webhook receives:**
```json
{
  "body": {
    "test_image": "...",
    "pet_name": "...",
    "name": "...",
    "theme": "fireman"  // ← This is nested in body
  }
}
```

**But your Fetch Theme Image node is trying to access:** `$json.theme`

**Should access:** `$json.body.theme` instead

---

## Complete Fix for Fetch Theme Image Node

### Step 1: Fix the URL Expression

1. Click **"Fetch Theme Image"** HTTP Request node
2. Find the **URL** field
3. Make sure it's in **Expression mode** (fx icon active)
4. Replace with this exact expression:

```javascript
={{ `https://mblnpneghvkfmbgmbrco.supabase.co/storage/v1/object/public/images/themes/${$json.body.theme}-master.png` }}
```

**Key changes:**
- Removed the extra `= ` at the beginning
- Changed `$json.theme` → `$json.body.theme` (because theme is in the body object)

---

## Alternative: If Your Webhook Structure is Different

If your webhook receives the theme directly (not nested in body), use:

```javascript
={{ `https://mblnpneghvkfmbgmbrco.supabase.co/storage/v1/object/public/images/themes/${$json.theme}-master.png` }}
```

But based on the error showing `undefined`, it's likely nested in `body`.

---

## Verify Webhook Payload Structure

To check what your webhook actually receives:

1. In n8n, add a **Code** node or **Set** node after the Webhook
2. Log `$json` to see the structure
3. Or check the webhook execution data in n8n

**Expected structure from your app:**
```json
{
  "body": {
    "test_image": "...",
    "pet_name": "...",
    "name": "...",
    "theme": "fireman"  // or "spaceman"
  }
}
```

---

## After Fixing

1. Save the workflow
2. Test again from `/create` page
3. The URL should be: `https://.../fireman-master.png` (not `undefined-master.png`)
