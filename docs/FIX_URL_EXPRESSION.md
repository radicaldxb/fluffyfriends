# Fix: URL Expression Not Evaluating in n8n

## Problem

The URL shows `=https://...` instead of `https://...`, meaning the expression isn't being evaluated.

## Solution: Make Sure Expression Mode is ON

The `={{ }}` syntax only works when **Expression mode** is enabled.

### Step-by-Step Fix

1. **Click "Fetch Theme Image" HTTP Request node**
2. **Find the URL field**
3. **Click the fx icon** (or toggle) next to the URL field to enable **Expression mode**
4. **The field should show "Expression" or have a different background color**
5. **Paste this EXACT expression:**

```javascript
https://mblnpneghvkfmbgmbrco.supabase.co/storage/v1/object/public/images/themes/{{ $json.body.theme }}-master.png
```

**OR if Expression mode requires the `={{ }}` wrapper:**

```javascript
={{ `https://mblnpneghvkfmbgmbrco.supabase.co/storage/v1/object/public/images/themes/${$json.body.theme}-master.png` }}
```

---

## Alternative: Use String Concatenation

If the template literal doesn't work, try string concatenation:

```javascript
={{ 'https://mblnpneghvkfmbgmbrco.supabase.co/storage/v1/object/public/images/themes/' + $json.body.theme + '-master.png' }}
```

---

## Verify Expression Mode is ON

**Signs that Expression mode is active:**
- ✅ Field shows "Expression" label
- ✅ Field background might be different color
- ✅ fx icon is highlighted/active
- ✅ You can use `{{ }}` syntax

**If Expression mode is OFF:**
- ❌ Field treats everything as literal text
- ❌ `={{ }}` gets included as part of the URL
- ❌ Results in `=https://...` error

---

## Quick Test

After setting the expression:
1. Save the workflow
2. Run a test execution
3. Check the "Fetch Theme Image" node output
4. The URL should be: `https://.../fireman-master.png` (no `=` at the start)
