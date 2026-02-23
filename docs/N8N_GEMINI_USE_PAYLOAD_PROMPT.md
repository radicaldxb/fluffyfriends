# n8n: Make GEMINI Use the Prompt from the Webhook Payload

The app sends the theme-specific prompt in the webhook body (`body.prompt`). The GEMINI node must use that instead of hardcoded text.

---

## What to change

In the **GEMINI** node, in the **JSON Body** field:

1. **Turn on Expression mode** (click the **fx** icon so the field is in expression mode).
2. Replace the entire JSON body with the expression below.

The only change from your current setup is the **first `"text"` value**: it must read the prompt from the Webhook node instead of a fixed string.

---

## Expression to paste (full JSON Body)

Copy everything below and paste it into the GEMINI node **JSON Body** (with Expression mode ON):

```javascript
={{
  {
    "contents": [
      {
        "parts": [
          {
            "text": "{{ $('Webhook').item.json.body.prompt }}"
          },
          {
            "inlineData": {
              "mimeType": "image/jpeg",
              "data": $('Extract theme').item.json.data
            }
          },
          {
            "inlineData": {
              "mimeType": "image/jpeg",
              "data": $('Extract user image').item.json.data
            }
          }
        ]
      }
    ],
    "safetySettings": [
      { "category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_NONE" },
      { "category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_NONE" },
      { "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_NONE" },
      { "category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_NONE" }
    ],
    "generationConfig": {
      "temperature": 0.7,
      "responseModalities": ["TEXT", "IMAGE"]
    }
  }
}}
```

Important: **`"text": "{{ $('Webhook').item.json.body.prompt }}"`** — that makes GEMINI use the prompt your API sends (from Supabase `theme_prompts`), not the old hardcoded text.

---

## Checklist

- [ ] GEMINI node open in n8n
- [ ] JSON Body field is in **Expression** mode (fx icon active)
- [ ] Pasted the expression above (with `$('Webhook').item.json.body.prompt` in the text part)
- [ ] Node names match: **Webhook**, **Extract theme**, **Extract user image**
- [ ] Saved the workflow
- [ ] Test: create a portrait on your site and confirm the result matches the theme (and that no “JSON parameter” error appears)

---

## If your Webhook node has a different name

If the node that receives the POST is not named **Webhook**, replace `$('Webhook')` with your node name, e.g.:

- `$('Your Webhook Node Name').item.json.body.prompt`

---

## Verify the payload contains `prompt`

1. In n8n, run the workflow once (e.g. trigger from your site).
2. Open the **Webhook** node output.
3. In the JSON, check **body** → you should see **prompt** with the long theme text.

If **body.prompt** is missing, the app is not sending it. Confirm your deployed app uses the latest `create-portrait` API that adds `prompt` to the webhook payload (from `getPromptForTheme(theme)`).
