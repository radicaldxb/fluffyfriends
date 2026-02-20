# Fix: n8n Webhook 404 Error

## Error Message
```
{"code":404,"message":"The requested webhook \"POST transform-pet\" is not registered.","hint":"The workflow must be active for a production URL to run successfully..."}
```

This means n8n can't find your workflow. Here's how to fix it:

---

## Step 1: Check Workflow is Active

1. Go to your **n8n instance** (e.g., `https://n8n.srv943460.hstgr.cloud`)
2. Open your **transform-pet** workflow
3. Look at the **top right** of the workflow editor
4. You should see a **toggle switch** that says "Active" or "Inactive"
5. **Make sure it's set to "Active"** (toggle should be ON/green)

**Important:** The workflow MUST be active for production webhooks to work.

---

## Step 2: Verify the Production Webhook URL

1. In the **transform-pet** workflow, click on the **Webhook** node
2. Click the **Production** tab (NOT the Test tab)
3. Copy the **exact Production URL** shown
   - Should look like: `https://n8n.srv943460.hstgr.cloud/webhook/transform-pet`
   - Must have `/webhook/` (not `/webhook-test/`)

---

## Step 3: Update Netlify Environment Variable

1. Go to **Netlify Dashboard** → Your Site → **Site settings** → **Environment variables**
2. Find **`N8N_WEBHOOK_URL`**
3. Click **Edit**
4. Paste the **exact Production URL** from Step 2
5. Click **Save**

**Verify:**
- URL should end with `/webhook/transform-pet` (not `/webhook-test/transform-pet`)
- No trailing slashes
- Full URL including `https://`

---

## Step 4: Trigger a New Deploy

After updating the URL:

1. Go to **Netlify** → **Deploys** tab
2. Click **Trigger deploy** → **Deploy site**
3. Wait for deploy to complete

---

## Step 5: Test Again

1. Go to your site's `/create` page
2. Select a theme and upload an image
3. Submit

**Expected result:**
- Image uploads successfully ✅
- n8n workflow starts ✅
- You see "We're creating your portrait..." ✅

---

## Troubleshooting

### Still Getting 404?

**Check 1: Workflow Name**
- Make sure the workflow is named exactly **"transform-pet"** (case-sensitive)
- Or check what the webhook path actually is in the Webhook node

**Check 2: Webhook Path**
- In n8n Webhook node → Production tab
- The path should be: `transform-pet`
- If it's different, either:
  - Change the path in n8n to `transform-pet`, OR
  - Update `N8N_WEBHOOK_URL` in Netlify to match the actual path

**Check 3: Workflow Active Status**
- Sometimes the UI shows "Active" but it's not actually active
- Try toggling it OFF, then ON again
- Wait a few seconds for it to register

**Check 4: n8n Instance**
- Make sure you're using the correct n8n instance URL
- Check if your n8n instance is running/accessible

---

## Quick Checklist

- [ ] Workflow is **Active** (toggle ON in n8n)
- [ ] Using **Production URL** (not Test URL)
- [ ] URL ends with `/webhook/transform-pet` (not `/webhook-test/transform-pet`)
- [ ] `N8N_WEBHOOK_URL` in Netlify matches the Production URL exactly
- [ ] Triggered a new deploy after updating the URL
- [ ] Workflow name matches the webhook path

---

## Still Not Working?

Check Netlify logs:
- Netlify → Functions → `create-portrait` → View logs
- Look for the webhook request and response
- Share the error details if you need more help
