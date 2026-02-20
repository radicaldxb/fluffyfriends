# n8n: Set Node (Edit Fields) - How to Use

## What is the Set Node?

The **Set** node (sometimes called **"Edit Fields"** in n8n) lets you:
- Add new fields to your data
- Modify existing fields
- Remove fields
- Combine data from multiple sources

**In your case:** Use it to pull the `prompt` from the Webhook node and add it to the data flow after Merge.

---

## How to Add Set Node

1. In n8n workflow editor, click **"+"** (add node) between **Merge** and **GEMINI**.
2. Search for **"Set"** or **"Edit Fields"**.
3. Select the **Set** node (or **Edit Fields** if that's what it's called in your n8n version).
4. Connect: **Merge** → **Set** → **GEMINI**.

---

## Configure Set Node

### Step 1: Mode

Choose **"Merge"** mode:
- This keeps all existing fields from Merge
- Adds your new `prompt` field on top

### Step 2: Add Fields

Click **"Add Value"** or **"Add Field"** and add:

**Field 1:**
- **Name:** `prompt`
- **Value:** `{{ $('Webhook').item.json.body.prompt }}`
- **Type:** String (or leave default)

**Optional Field 2 (for Supabase callback):**
- **Name:** `pet_name`
- **Value:** `{{ $('Webhook').item.json.body.pet_name }}`
- **Type:** String

**Optional Field 3:**
- **Name:** `test_image`
- **Value:** `{{ $('Webhook').item.json.body.test_image }}`
- **Type:** String

---

## Visual Guide

**Before Set node:**
```
Merge output:
{
  "data": "base64_image_data..."  // merged image data only
}
```

**After Set node:**
```
Set output:
{
  "data": "base64_image_data...",  // from Merge
  "prompt": "INSTRUCTION: Create a high-fidelity...",  // from Webhook
  "pet_name": "My Pet",  // from Webhook
  "test_image": "https://..."  // from Webhook
}
```

---

## Then Update GEMINI

In the **GEMINI** node JSON Body, change:

**From:**
```javascript
"text": "{{ $('Webhook').item.json.body.prompt }}"
```

**To:**
```javascript
"text": "{{ $json.prompt }}"
```

Now GEMINI gets the prompt from Set node output (simple `$json.prompt`), not trying to reference Webhook through Merge.

---

## Alternative Node Names

Depending on your n8n version, the node might be called:
- **"Set"** (most common)
- **"Edit Fields"**
- **"Set Fields"**
- **"Modify Fields"**

They all do the same thing: add/modify fields in your data.

---

## Why This Works

- **Merge** combines images but loses webhook context.
- **Set** explicitly pulls `prompt` from Webhook and adds it.
- **GEMINI** receives everything: images (from Merge) + prompt (from Set).

This is cleaner than trying to reference Webhook through Merge's output.
