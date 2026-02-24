# GEMINI Returning Text Instead of Image — Fix

## What you’re seeing

The GEMINI node returns a **text** response (e.g. Midjourney-style instructions) and **no image**:

- `candidates[0].content.parts[0]` has only `"text": "To create this image using an AI image generator..."`
- There is **no** `inlineData` with base64 image data
- Downstream nodes (Convert to File, Cloudinary, receive-n8n-image) then fail because they expect `candidates[0].content.parts[0].inlineData.data`

## Why it happens

1. **Wrong model** – The URL might be using a **text-only** model (e.g. `gemini-3.1-pro-preview`) instead of the **image-generation** model.
2. **Missing image output config** – The image model needs `responseModalities: ["TEXT", "IMAGE"]` in `generationConfig` so the API returns image data.
3. **Prompt** – The model may still choose to “explain” instead of generating; the prompt can be tightened to ask for image output only.

## Fixes (in order)

### 1. Use the image-generation model in the GEMINI node URL

**Correct (image-capable):**
```text
https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-image-preview:generateContent?key=YOUR_GEMINI_API_KEY
```

**Wrong (text-oriented; will not return image):**
```text
https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-pro-preview:generateContent?key=...
```

In n8n: open the GEMINI HTTP Request node → **URL** → ensure the path is **`gemini-3-pro-image-preview`**, not `gemini-3.1-pro-preview` (or any other non-image model).

### 2. Add `responseModalities` to `generationConfig`

In the GEMINI node **JSON body** (expression mode), your `generationConfig` must ask for image output. Change it from e.g.:

```json
"generationConfig": {
  "temperature": 0.7
}
```

to:

```json
"generationConfig": {
  "temperature": 0.7,
  "responseModalities": ["TEXT", "IMAGE"]
}
```

So the model is explicitly allowed (and nudged) to return image data.

### 3. (Optional) Make the prompt ask for image-only output

Add one short line at the **start** of your prompt text so the model doesn’t reply with instructions:

- Prepend: **"Generate the portrait image. Output ONLY the generated image — no text, no instructions, no descriptions."**

Then your existing theme instructions (Image 1 = theme, Image 2 = pet, etc.). That reduces the chance of a long text reply.

## Full `generationConfig` snippet to paste

Use this inside your existing GEMINI JSON body (replace your current `generationConfig`):

```json
"generationConfig": {
  "temperature": 0.7,
  "responseModalities": ["TEXT", "IMAGE"]
}
```

If you use a different `temperature` (e.g. 0.65), keep it and only add the line:

```json
"responseModalities": ["TEXT", "IMAGE"]
```

## After changing

1. Save the workflow.
2. Run it again (e.g. from `/create`).
3. Open the GEMINI node output: `candidates[0].content.parts` should contain at least one part with **`inlineData`** and **`data`** (base64). That’s what Convert to File / Cloudinary / receive-n8n-image expect.

## Quick checklist

| Check | Action |
|--------|--------|
| GEMINI node **URL** | Model is `gemini-3-pro-image-preview` (not `gemini-3.1-pro-preview`) |
| **generationConfig** | Includes `"responseModalities": ["TEXT", "IMAGE"]` |
| **Prompt** (optional) | Start with “Generate the portrait image. Output ONLY the generated image…” |

Once these are in place, the GEMINI output should contain the base64 image and the rest of the flow can use it.
