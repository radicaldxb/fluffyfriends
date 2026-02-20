# Security: API key exposure and rotation

## What happened

A Gemini API key was exposed in `docs/n8n-fluffyfriends-working.json` and detected by Netlify's secrets scanner during build. The key has been replaced with a placeholder (`YOUR_GEMINI_API_KEY`).

## Action required: Rotate the exposed key

**The exposed key was:** `AIzaSyCXX0W9QOOHkKnCmQWjd2GHCifcXVzVcME`

**You should:**

1. **Rotate or revoke this key** in Google Cloud Console / Google AI Studio:
   - Go to [Google AI Studio](https://makersuite.google.com/app/apikey) or Google Cloud Console
   - Find the API key that starts with `AIzaSyCXX0W9QOOHkKnCmQWjd2GHCifcXVzVcME`
   - **Revoke** it or **regenerate** it
   - Update the key in your **n8n workflow** (GEMINI node) with the new key

2. **Best practice going forward:**
   - **Do not** commit API keys to the repo
   - Use **n8n credentials/secrets** to store the Gemini API key
   - Or use **environment variables** in n8n if supported
   - The workflow JSON should use placeholders like `YOUR_GEMINI_API_KEY` or reference credentials

## Current state

- ✅ The workflow JSON now uses `YOUR_GEMINI_API_KEY` placeholder
- ✅ Netlify build should pass secrets scanning
- ⚠️ **You must rotate the exposed key** and update it in n8n

## How to set the API key in n8n

After importing the workflow:

1. Open the **GEMINI** HTTP Request node
2. In the **URL** field, replace `YOUR_GEMINI_API_KEY` with your actual API key
3. **Better:** Configure the API key as an n8n credential/secret and reference it in the URL expression (e.g. `{{ $credentials.geminiApiKey }}`)
