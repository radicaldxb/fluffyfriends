# Fix: "Put Output in Field" Alert in n8n

## The Alert

n8n is warning that "Put Output in Field" is blank when Response Format is "File".

## Solution

### Option 1: Leave it Blank (Recommended)
- **"Put Output in Field"** should be **empty/blank** when Response Format is "File"
- n8n automatically stores binary data in the standard property (`data`)
- The alert is just a warning - you can ignore it if the workflow works

### Option 2: Set to "data" (If Alert Persists)
If n8n requires a value or the alert is blocking you:

1. In **"Fetch Theme Image"** HTTP Request node
2. Find **"Put Output in Field"** or **"Output Property Name"**
3. Set it to: `data`
4. Save

**Why:** The Extract from File node expects binary data in the `data` property by default.

---

## Complete Settings for Fetch Theme Image Node

| Setting | Value |
|---------|-------|
| **Method** | `GET` |
| **URL** (Expression mode) | `={{ `https://mblnpneghvkfmbgmbrco.supabase.co/storage/v1/object/public/images/themes/${$json.body.theme}-master.png` }}` |
| **Response Format** | `File` |
| **Put Output in Field** | `data` (or leave blank if alert is just a warning) |

---

## Verify It Works

After setting "Put Output in Field" to `data`:

1. Save the workflow
2. Test execution
3. Check that "Extract from File1" node receives the binary data
4. The alert should disappear

---

## If Alert Still Appears

Some n8n versions show this alert but it's safe to ignore if:
- Response Format is "File"
- Your Extract from File node works correctly
- The workflow executes successfully

The alert is just n8n being cautious - binary data handling is automatic when Response Format is "File".
