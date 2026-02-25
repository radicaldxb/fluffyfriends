# Changes not reflecting on Netlify

If you pushed to GitHub but the live site still shows old content, use one of the two options below.

---

## Option 1: Fix the branch Netlify builds from (one-time)

Netlify only auto-deploys when you push to the **branch it is watching**. If that branch is `main` and you only push to `dev`, the site will not update.

**Steps:**

1. Go to [Netlify Dashboard](https://app.netlify.com) → your site (e.g. **fluffyfriends-dev**).
2. **Site configuration** → **Build & deploy** → **Continuous deployment**.
3. Under **Build settings**, find **Branch to deploy** (or **Production branch**).
4. **Either:**
   - Set it to **`dev`** if you want production to follow `dev`, then push again:  
     `git push origin dev`  
     and wait for the new deploy,  
   **or**
   - Keep it as **`main`** and merge your work into `main`, then push:  
     `git checkout main && git merge dev && git push origin main`.

After this, future pushes to the chosen branch will trigger deploys and your changes will reflect.

---

## Option 2: Deploy from your machine with Netlify CLI (no branch change)

This builds **your current local code** and uploads it to Netlify. It does not depend on which branch Netlify is watching.

**Steps:**

1. In the project root:
   ```bash
   npx netlify login
   ```
   (Complete the browser login if prompted.)

2. Link the site once (if not already linked):
   ```bash
   npx netlify link --name fluffyfriends-dev
   ```
   Or use `--id YOUR_SITE_ID` from Site configuration → General.

3. Deploy to production:
   ```bash
   npm run deploy
   ```
   or:
   ```bash
   npx netlify deploy --prod --build
   ```

The local build runs (`npm run build`), then the result is uploaded. Your latest changes will be live after the command finishes.

**If you get "Forbidden" or auth errors:** see **NETLIFY_CLI_SETUP.md** (re-login, re-link, or use a Personal Access Token).

---

## Optional: Clear cache and redeploy (Netlify UI)

If you already deployed the right branch but still see old behaviour (e.g. old JS):

1. Netlify → **Deploys**.
2. **Trigger deploy** → **Clear cache and deploy site**.

This forces a clean build and can fix stale assets.
