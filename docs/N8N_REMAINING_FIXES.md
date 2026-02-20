# Remaining n8n Workflow Fixes

## ✅ Already Fixed
1. ✅ **Webhook Path** - Changed to `transform-pet` 
2. ✅ **Webhook Response Mode** - Set to "Immediately" (= `onReceived`)

## ❌ Still Need to Fix

### Fix 3: Gemini API Key (SECURITY - URGENT!)

**Location:** GEMINI HTTP Request node

**Current:** URL contains exposed API key:
```
https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-image-preview:generateContent?key=YOUR_GEMINI_API_KEY
```

**Steps:**
1. Click **GEMINI** node in your workflow
2. Find the **URL** field
3. Replace the API key with your new rotated key (or use `YOUR_GEMINI_API_KEY` placeholder)
4. **URGENT:** Rotate this exposed key in Google Cloud Console immediately!

**Why:** This key is exposed and could be misused. Rotate it now.

---

### Fix 4: Fetch Theme Image URL Syntax Error

**Location:** "Fetch Theme Image" HTTP Request node

**Current:** URL has double equals:
```
=  ={{ `https://mblnpneghvkfmbgmbrco.supabase.co/storage/v1/object/public/images/themes/${$json.theme}-master.png` }}
```

**Should be:** Single equals:
```
={{ `https://mblnpneghvkfmbgmbrco.supabase.co/storage/v1/object/public/images/themes/${$json.theme}-master.png` }}
```

**Steps:**
1. Click **"Fetch Theme Image"** node
2. Find the **URL** field
3. Remove the extra `= ` at the beginning (should start with `={{`)
4. Save

**Why:** The double equals will cause the expression to fail, and theme images won't load.

---

### Fix 5: GEMINI Node References Disabled Node

**Location:** GEMINI HTTP Request node → JSON Body

**Current:** References `$('Master Theme').item.json.data` but "Master Theme" node is disabled

**Should reference:** `$('Extract from File1').item.json.data` instead

**Steps:**
1. Click **GEMINI** node
2. Find the **JSON Body** field (should be in Expression mode)
3. Look for: `$('Master Theme').item.json.data`
4. Replace with: `$('Extract from File1').item.json.data`
5. Save

**Why:** The "Master Theme" node is disabled, so this reference will fail. "Extract from File1" extracts the theme image from "Fetch Theme Image" node.

---

## Priority Order

1. **Fix 3 (Gemini API Key)** - SECURITY RISK - Do this first!
2. **Fix 4 (Fetch Theme Image URL)** - Will break theme loading
3. **Fix 5 (GEMINI reference)** - Will break image generation

---

## After All Fixes

1. **Save** the workflow
2. **Activate** it (toggle ON)
3. **Test** from `/create` page
4. Check n8n executions to see if it runs successfully

---

## Quick Reference

**GEMINI Node URL:**
```
https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-image-preview:generateContent?key=YOUR_GEMINI_API_KEY
```

**Fetch Theme Image URL (corrected):**
```
={{ `https://mblnpneghvkfmbgmbrco.supabase.co/storage/v1/object/public/images/themes/${$json.theme}-master.png` }}
```

**GEMINI JSON Body (corrected reference):**
```javascript
{
  "inlineData": {
    "mimeType": "image/jpeg",
    "data": $('Extract from File1').item.json.data
  }
}
```
