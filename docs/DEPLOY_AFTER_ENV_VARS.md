# Deploy After Adding Environment Variables

## Important: Trigger a New Deploy

After adding environment variables in Netlify, you **must** trigger a new deployment for them to take effect.

## Option 1: Trigger Deploy from Netlify Dashboard (Recommended)

1. Go to [Netlify Dashboard](https://app.netlify.com)
2. Select your site
3. Go to **Deploys** tab
4. Click **Trigger deploy** button (top right)
5. Select **Deploy site**
6. Wait for the deploy to complete (usually 1-2 minutes)

## Option 2: Push a Commit (Alternative)

If you prefer, you can push any commit to trigger an automatic deploy:

```bash
git commit --allow-empty -m "Trigger deploy after adding env vars"
git push origin dev
```

## Verify Variables Are Active

After deployment completes:

1. Go to your site's `/create` page
2. Try uploading an image with a theme selected
3. If it works, the variables are set correctly!

## If You Still Get Errors

Check Netlify logs:
- Netlify → Functions → `create-portrait` → View logs
- Look for any error messages

Common issues:
- Variables not saved (go back and verify they're there)
- Deploy not triggered (variables only apply to new deploys)
- Typo in variable names (must be exact: `NEXT_PUBLIC_SUPABASE_URL`, etc.)
