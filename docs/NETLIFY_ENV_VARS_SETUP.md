# Setting Environment Variables in Netlify

## Required Variables

You need to set **3 environment variables** in Netlify:

1. `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
2. `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous key
3. `N8N_WEBHOOK_URL` - Your n8n production webhook URL

---

## Step 1: Get Your Supabase Credentials

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **Settings** (gear icon in left sidebar)
4. Click **API** in the settings menu
5. You'll see:
   - **Project URL** - Copy this (e.g., `https://mblnpneghvkfmbgmbrco.supabase.co`)
   - **anon/public key** - Copy this (starts with `eyJ...`)

**Note:** Use the **anon/public** key, NOT the service_role key (that's secret).

---

## Step 2: Get Your n8n Webhook URL

1. Go to your n8n instance (e.g., `https://n8n.srv943460.hstgr.cloud`)
2. Open your **transform-pet** workflow
3. Click on the **Webhook** node
4. Click the **Production** tab (not Test)
5. Copy the **Production URL** (e.g., `https://n8n.srv943460.hstgr.cloud/webhook/transform-pet`)

**Important:** Make sure the workflow is **Active** (toggle in top right).

---

## Step 3: Set Variables in Netlify

1. Go to [Netlify Dashboard](https://app.netlify.com)
2. Select your site
3. Go to **Site settings** (gear icon or Settings in left sidebar)
4. Click **Environment variables** (under "Build & deploy")
5. Click **Add a variable** or **Edit variables**

### Add Each Variable:

**Variable 1:**
- **Key:** `NEXT_PUBLIC_SUPABASE_URL`
- **Value:** Your Supabase Project URL (from Step 1)
- Click **Save**

**Variable 2:**
- **Key:** `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Value:** Your Supabase anon key (from Step 1)
- Click **Save**

**Variable 3:**
- **Key:** `N8N_WEBHOOK_URL`
- **Value:** Your n8n production webhook URL (from Step 2)
- Click **Save**

---

## Step 4: Trigger a New Deploy

After adding the variables, you need to trigger a new deployment:

1. In Netlify, go to **Deploys** tab
2. Click **Trigger deploy** → **Deploy site**
3. Wait for the deploy to complete

**OR** push a new commit to trigger an automatic deploy.

---

## Optional: N8N_PING_WEBHOOK_URL

If you want to use the "Ping webhook" button on `/test-n8n` without swapping URLs:

1. In n8n, get the **test-production-url** workflow's Production URL
2. In Netlify, add:
   - **Key:** `N8N_PING_WEBHOOK_URL`
   - **Value:** The test-production-url webhook URL
   - Click **Save**

---

## Verify Variables Are Set

After deploying, test your site:

1. Go to `/create` page
2. Try uploading an image
3. If it works, variables are set correctly!

If you still get errors, check:
- Netlify → Functions → `create-portrait` → View logs
- Look for error messages about missing variables

---

## Troubleshooting

**"N8N_WEBHOOK_URL missing" error:**
- Variable not set in Netlify
- Variable name is misspelled (must be exactly `N8N_WEBHOOK_URL`)
- Need to trigger a new deploy after adding

**"Supabase credentials not configured" error:**
- `NEXT_PUBLIC_SUPABASE_URL` or `NEXT_PUBLIC_SUPABASE_ANON_KEY` not set
- Check variable names are exact (case-sensitive)
- Need to trigger a new deploy after adding

**Variables not working:**
- Make sure you clicked **Save** after adding each variable
- Trigger a new deploy (variables only apply to new deploys)
- Check for typos in variable names
