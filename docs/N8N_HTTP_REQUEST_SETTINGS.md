# n8n HTTP Request node settings for Fetch Theme Image

## Exact settings

### Node name
**Name:** `Fetch Theme Image`

✅ Use this exact name — you'll reference it in the GEMINI node as `$('Fetch Theme Image')`

---

### HTTP Request settings

| Setting | Value |
|---------|-------|
| **Method** | `GET` |
| **URL** | Expression mode (fx icon) → see expression below |
| **Response Format** | `File` ⚠️ Important — must be "File" not "JSON" |
| **Put Output in Field** | **Leave default/empty** (n8n handles binary automatically) |

**URL Expression:**
```javascript
={{ `${process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project-ref.supabase.co'}/storage/v1/object/public/images/themes/${$json.theme}-master.png` }}
```

---

## About "Put Output in Field"

**When Response Format is "File":**
- n8n automatically stores the binary data in the standard binary property
- **Leave "Put Output in Field" empty/default** — don't change it
- The Extract from File node will automatically find the binary data

**If you see this option:**
- Some n8n versions show "Put Output in Field" even for File responses
- **Default behavior:** Leave it empty — n8n uses the standard binary property
- **Only change if:** Your Extract from File node specifically expects a different property name (unlikely)

---

## Extract from File node settings

After "Fetch Theme Image", add Extract from File:

| Setting | Value |
|---------|-------|
| **Name** | `Extract Theme Image` ✅ (or `Extract from File` if you prefer) |
| **Operation** | `Extract from file to base64 string` ⚠️ This converts binary to base64 string |
| **Binary Property Name** | Leave **default** (usually `data`) — don't change unless you know what you're doing |
| **Options** | Leave default/empty |

**What it does:**
- Reads the binary image data from "Fetch Theme Image" HTTP Request output
- Converts it to a base64 string
- Outputs it as `json.data` (so GEMINI can use `$('Extract Theme Image').item.json.data`)

**Note:** If your n8n version shows different operation names:
- Use **"Extract from file to base64 string"** (what you have)
- Or **"binaryToProperty"** (if available)
- Both do the same thing: convert binary → base64 string in `json.data`

**Connection:**
- Input: "Fetch Theme Image" HTTP Request node
- Output: Connect to "Merge" node (input 0 — theme image branch)

---

## Reference in GEMINI node

In your GEMINI node's JSON body expression, reference the Extract node:

```javascript
"data": "{{ $('Extract Theme Image').item.json.data }}"
```

Or if you named it "Extract from File":
```javascript
"data": "{{ $('Extract from File').item.json.data }}"
```

**Important:** Use the **Extract from File node name**, not the HTTP Request node name, because Extract converts binary → base64 string that GEMINI needs.
