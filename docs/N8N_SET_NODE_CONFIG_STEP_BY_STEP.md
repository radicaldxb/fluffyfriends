# n8n Set Node Configuration - Step by Step

## What You See

- **Mode:** Currently "Manual Mapping"
- **Fields to Set:** Empty (needs prompt field)
- **Include Other Input Fields:** OFF

---

## Step-by-Step Configuration

### Step 1: Change Mode

**Change from "Manual Mapping" to "Merge":**

1. Click the **Mode** dropdown.
2. Select **"Merge"** (or **"Keep Only Set Fields"** if you only want prompt + images, not all Merge fields).

**Why Merge?** It keeps existing fields from Merge AND adds your new `prompt` field.

---

### Step 2: Add Prompt Field

1. Click **"Add Field"** (the red button in "Fields to Set" section).
2. A new field row appears.
3. **Name:** Type `prompt`
4. **Value:** Click in the value field, then:
   - Click the **fx** icon (Expression mode) to enable it.
   - Type: `{{ $('Webhook').item.json.body.prompt }}`
5. Click outside or press Enter.

---

### Step 3: Optional - Include Other Fields

**Turn ON "Include Other Input Fields":**

- This keeps all fields from Merge (like image data) along with your new `prompt` field.
- If you turn it OFF, only the fields you explicitly add will be in the output.

**Recommendation:** Turn it **ON** so GEMINI can still access image data from Merge.

---

### Step 4: Test

1. Click **"Execute step"** (red button at top).
2. Check the **OUTPUT** panel (right side).
3. You should see:
   ```json
   {
     "prompt": "INSTRUCTION: Create a high-fidelity...",
     ...other fields from Merge...
   }
   ```

---

## Final Configuration

**Mode:** Merge  
**Fields to Set:**
- `prompt` = `{{ $('Webhook').item.json.body.prompt }}`

**Include Other Input Fields:** ON (recommended)

---

## Then Update GEMINI

After Set node works, update GEMINI JSON Body:

**Change:**
```javascript
"text": "{{ $('Webhook').item.json.body.prompt }}"
```

**To:**
```javascript
"text": "{{ $json.prompt }}"
```

Now GEMINI gets prompt from Set node output (simple `$json.prompt`).
