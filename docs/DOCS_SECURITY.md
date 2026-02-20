# Documentation Security - What Gets Published

## Netlify Only Publishes `.next` Folder

**From `netlify.toml`:**
```toml
publish = ".next"
```

This means Netlify **only** publishes the Next.js build output (`.next` folder), **NOT** your source files or documentation.

## What This Means

### ✅ Safe (Not Published by Netlify):
- `docs/` folder - **NOT** served by Netlify
- `app/` source files - Compiled into `.next`, source not accessible
- `lib/` source files - Compiled into `.next`, source not accessible
- `supabase/` SQL files - **NOT** published
- Any other source files - **NOT** published

### ⚠️ Potential Exposure:
- **GitHub Repository** - If your repo is **public**, anyone can see:
  - All files in the repo (including `docs/`)
  - Git history (including old commits with exposed keys)
  - All branches

## Current Status

✅ **All API keys have been redacted** from documentation files:
- `docs/N8N_REMAINING_FIXES.md` - Uses `YOUR_GEMINI_API_KEY` placeholder
- `docs/N8N_WORKFLOW_ANALYSIS.md` - Uses `YOUR_GEMINI_API_KEY` placeholder
- `docs/SECURITY_API_KEY_ROTATION.md` - Already redacted

✅ **Netlify secrets scanner** should pass (no keys in published files)

## Recommendations

### If Your Repo is Public:
1. ✅ **Already done:** All API keys redacted from docs
2. ⚠️ **Consider:** Making repo private if it contains sensitive documentation
3. ⚠️ **Check:** Git history - old commits may still contain exposed keys
   - Use `git log -p` to check
   - Consider using `git filter-branch` or BFG Repo-Cleaner to remove from history

### If Your Repo is Private:
- ✅ You're safe - only collaborators can see the docs
- ✅ Netlify doesn't publish docs anyway

## Verification

**To verify docs aren't published:**
1. Visit your Netlify site: `https://your-site.netlify.app/docs/`
2. You should get a **404** (docs folder not served)
3. Only Next.js routes (like `/create`, `/api/*`) are accessible

**What IS accessible on Netlify:**
- `/create` - Your app pages
- `/api/*` - API routes
- `/images/*` - Files from `public/images/`
- **NOT** `/docs/*` - Documentation is not served

## Summary

✅ **Netlify does NOT publish your docs folder**  
✅ **All API keys are redacted from docs**  
⚠️ **If repo is public, docs are visible on GitHub** (but keys are redacted)  
✅ **Netlify secrets scanner should pass** (no keys in build output)
