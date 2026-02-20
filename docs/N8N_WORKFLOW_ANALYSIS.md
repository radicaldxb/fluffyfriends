# n8n Workflow Analysis: Fluffyfriends-7.json

## Critical Issues Found

### ❌ Issue 1: Webhook Path Mismatch
**Location:** Webhook node (line 102)
- **Current:** Path is `"7cb07fbe-ce9f-4a18-8ded-2bd4fcdbae56"` (UUID)
- **Expected:** Should be `"transform-pet"` to match your Netlify `N8N_WEBHOOK_URL`
- **Impact:** This is why you're getting 404 errors! The webhook URL doesn't match.

**Fix:** Change the webhook path to `"transform-pet"` in n8n.

---

### ❌ Issue 2: Missing Webhook Response Mode
**Location:** Webhook node (line 100-114)
- **Missing:** `"responseMode": "onReceived"` parameter
- **Impact:** Webhook may not respond immediately, causing timeouts

**Fix:** Add `"responseMode": "onReceived"` to the Webhook node parameters.

---

### ❌ Issue 3: Hardcoded Gemini API Key (SECURITY RISK)
**Location:** GEMINI node (line 134)
- **Current:** `key=YOUR_GEMINI_API_KEY` (redacted - replace with your actual key)
- **Risk:** API key is exposed in the workflow JSON
- **Impact:** Security vulnerability, key could be compromised

**Fix:** 
1. Replace with placeholder: `key=YOUR_GEMINI_API_KEY`
2. Set the actual key in n8n credentials or environment variables
3. Rotate the exposed key in Google Cloud Console

---

### ❌ Issue 4: Syntax Error in Fetch Theme Image URL
**Location:** Fetch Theme Image node (line 206)
- **Current:** `"=  ={{` (double equals with spaces)
- **Expected:** `"={{` (single equals)
- **Impact:** URL expression won't work correctly

**Fix:** Remove the extra `= ` at the beginning.

---

### ❌ Issue 5: Master Theme Node Disabled but Referenced
**Location:** 
- Master Theme node (line 187) is `"disabled": true`
- But GEMINI node (line 137) references: `$('Master Theme').item.json.data`
- **Impact:** This will fail because Master Theme is disabled

**Fix:** 
- The workflow should use `Extract from File1` instead (which extracts from Fetch Theme Image)
- Update GEMINI node to reference: `$('Extract from File1').item.json.data`

---

## Workflow Structure Analysis

### ✅ Good Things:
1. Workflow is **active** (`"active": true`)
2. Connections look correct
3. Using Supabase Storage for theme images (good migration from Google Drive)
4. Proper node structure: Webhook → HTTP Request (pet) + Fetch Theme Image → Extract → Merge → GEMINI → Convert → Supabase

### ⚠️ Minor Issues:
1. Google Drive nodes are disabled (good, since migrated to Supabase)
2. Hardcoded Supabase URL in Fetch Theme Image (should use environment variable)

---

## Required Fixes Summary

1. **Change Webhook path** from UUID to `"transform-pet"`
2. **Add `responseMode: "onReceived"`** to Webhook node
3. **Replace Gemini API key** with placeholder/credential
4. **Fix Fetch Theme Image URL** syntax (remove double equals)
5. **Update GEMINI node** to reference `Extract from File1` instead of `Master Theme`

---

## Step-by-Step Fix Instructions

### Fix 1: Webhook Path
1. Open workflow in n8n
2. Click Webhook node
3. Change **Path** from `7cb07fbe-ce9f-4a18-8ded-2bd4fcdbae56` to `transform-pet`
4. Save workflow

### Fix 2: Webhook Response Mode
1. In Webhook node, find **Response** setting
2. Set to **"When webhook is called"** or **"On received"**
3. Save workflow

### Fix 3: Gemini API Key
1. Click GEMINI node
2. In URL field, replace `YOUR_GEMINI_API_KEY` placeholder with your actual API key
3. Or better: Set up n8n credential and reference it
4. **Rotate the exposed key** in Google Cloud Console
5. Save workflow

### Fix 4: Fetch Theme Image URL
1. Click "Fetch Theme Image" node
2. In URL field, change from:
   ```
   =  ={{ `https://mblnpneghvkfmbgmbrco.supabase.co/storage/v1/object/public/images/themes/${$json.theme}-master.png` }}
   ```
   To:
   ```
   ={{ `${process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mblnpneghvkfmbgmbrco.supabase.co'}/storage/v1/object/public/images/themes/${$json.theme}-master.png` }}
   ```
3. Save workflow

### Fix 5: GEMINI Node Reference
1. Click GEMINI node
2. In JSON body, find: `$('Master Theme').item.json.data`
3. Replace with: `$('Extract from File1').item.json.data`
4. Save workflow

---

## After Fixes

1. **Activate workflow** (toggle should be ON)
2. **Copy Production URL** from Webhook node
3. **Update Netlify** `N8N_WEBHOOK_URL` to match (should be `.../webhook/transform-pet`)
4. **Trigger new deploy** in Netlify
5. **Test** from `/create` page

---

## Security Note

⚠️ **URGENT:** If you see an exposed Gemini API key in your workflow, you should:
1. Rotate it immediately in Google Cloud Console
2. Replace it in the workflow
3. Never commit workflow JSONs with real API keys
