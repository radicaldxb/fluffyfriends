# n8n Workflow Update: Use Prompts from Codebase

## What Changed

Prompts are now stored in the codebase (`lib/prompts.ts`) and sent to n8n via the webhook payload. This makes prompts easier to maintain, version control, and update.

## Update Required in n8n

### Step 1: Update GEMINI Node JSON Body

**Current (broken):**
```javascript
{
  "text": `INSTRUCTION: Create a high-fidelity 16:9 Widescreen ${$node["Webhook"].json.body.theme} portrait.
  ...
}
```

**New (corrected):**
```javascript
={{
  {
    "contents": [
      {
        "parts": [
          {
            "text": "{{ $json.body.prompt }}"
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
      "temperature": 0.65
    }
  }
}}
```

### Step 2: Enable Expression Mode

1. Open GEMINI node in n8n
2. Click on **JSON Body** field
3. **Enable Expression mode** (fx icon should be active/highlighted)
4. Paste the expression above
5. Save workflow

### Step 3: Verify Webhook Receives Prompt

The webhook payload now includes:
```json
{
  "test_image": "https://...",
  "pet_name": "My Pet",
  "name": "My Pet",
  "theme": "fireman",
  "prompt": "INSTRUCTION: Create a high-fidelity..."
}
```

You can verify this in n8n by:
1. Running a test execution
2. Checking the Webhook node output
3. Confirming `$json.body.prompt` contains the theme-specific prompt

---

## Benefits

✅ **Prompts in codebase** - Easy to edit, version control, review  
✅ **No n8n updates needed** - Just update code and deploy  
✅ **Type-safe** - TypeScript validation  
✅ **Consistent** - Same prompts across environments  

---

## How to Update Prompts

### Option 1: Edit in Codebase (Recommended)

1. Edit `lib/prompts.ts`
2. Update the prompt text
3. Commit and push
4. Netlify auto-deploys
5. Test with new prompts

### Option 2: Test Locally First

```bash
# Edit lib/prompts.ts
# Test locally
npm run dev
# Deploy when ready
git commit -am "Update prompts"
git push
```

---

## Troubleshooting

### Issue: Prompt is empty or undefined

**Check:**
1. Is Expression mode enabled in GEMINI node?
2. Is the expression `{{ $json.body.prompt }}` correct?
3. Does the webhook payload include `prompt` field?

**Debug:**
- Add a Set node before GEMINI to log: `{{ $json.body.prompt }}`
- Check webhook output to see if prompt is received

### Issue: Wrong prompt for theme

**Check:**
1. Is theme being sent correctly? (`fireman` or `spaceman`)
2. Is `getPromptForTheme()` working correctly?
3. Check `lib/prompts.ts` for correct theme mapping

---

## Node Names Reference

Make sure these node names match your workflow:
- `Extract theme` - Theme image extract node
- `Extract user image` - Pet image extract node

If your nodes have different names, update the references:
```javascript
"data": $('Your Theme Node Name').item.json.data
"data": $('Your Pet Node Name').item.json.data
```
