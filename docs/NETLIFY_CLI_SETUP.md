# Netlify CLI – Setup and Deploy

Use the Netlify CLI to deploy from your machine (e.g. `npm run deploy`). If you hit **Forbidden** or auth errors, follow the troubleshooting steps below.

---

## 1. Install

No need to install globally; use `npx`:

```bash
npx netlify --version
```

Or add a deploy script to `package.json` (see below) and run `npm run deploy`.

---

## 2. Log in

```bash
npx netlify login
```

- A browser window opens; sign in to Netlify and authorize the CLI.
- If it fails: try `npx netlify logout` then `npx netlify login` again.
- **Alternative (no browser):** Use a **Personal Access Token** and set `NETLIFY_AUTH_TOKEN` (see Troubleshooting).

---

## 3. Link the site

Link this repo to your Netlify site **once** (creates `.netlify/state.json`; that folder is gitignored).

**By site name (e.g. fluffyfriends-dev):**

```bash
npx netlify link --name fluffyfriends-dev
```

If you see **"Project already linked to \"fluffyfriends-dev\""** — that’s success; you can skip to **Deploy** (step 4). To link a different site, run `npx netlify unlink` first, then `npx netlify link` again.

**By site ID (if name doesn’t work):**

1. Netlify Dashboard → your site → **Site configuration** → **General** → **Site ID** (e.g. `4b965095-c326-425e-8b6b-93cfbe41b094`).
2. Run:

```bash
npx netlify link --id 4b965095-c326-425e-8b6b-93cfbe41b094
```

Replace the ID with your actual Site ID.

**Check link:**

```bash
npx netlify status
```

You should see the site name and team.

---

## 4. Deploy

**Production (build + publish):**

```bash
npx netlify deploy --prod --build
```

Or use the npm script:

```bash
npm run deploy
```

- **Build** runs locally (`npm run build` per `netlify.toml`).
- **Publish** uploads the build output to Netlify and updates the live site.

**Draft (preview without going live):**

```bash
npx netlify deploy --build
```

(Omit `--prod` to get a draft URL only.)

---

## 5. Troubleshooting

### "Forbidden" or "JSONHTTPError: Forbidden"

- **Cause:** Auth token invalid, expired, or your user doesn’t have permission to deploy this site.
- **Steps:**
  1. **Re-login:** `npx netlify logout` then `npx netlify login`. Complete the browser flow and try deploy again.
  2. **Re-link:** `npx netlify unlink` then `npx netlify link --id YOUR_SITE_ID` (get Site ID from Netlify → Site configuration → General).
  3. **Use a Personal Access Token:** In Netlify go to **User settings** → **Applications** → **Personal access tokens** → **New access token**. Then:
     - `export NETLIFY_AUTH_TOKEN=your_token_here`
     - Run `npx netlify deploy --prod --build` again (no `netlify login` needed for that session).
  4. **Team/site access:** If the site belongs to a team, ensure your account has deploy permission. In Netlify: **Team** → **Members** / **Site** → **Access**.

If CLI still fails, use **manual deploy**: push to Git and in Netlify go to **Deploys** → **Trigger deploy** → **Deploy site** (see **DEPLOYMENT_AND_RUNBOOK.md**).

### "Site not linked" or "Could not find site"

- Run `npx netlify link` and pick the site, or use `--id YOUR_SITE_ID` with the Site ID from the Netlify dashboard.

### Build fails locally but Netlify builds succeed

- Netlify may use a different Node version or no Turbopack. If your local `npm run build` fails (e.g. font/Turbopack errors), you can still trigger a **manual deploy** from the Netlify UI (it builds on Netlify’s servers). For CLI deploys, fix the local build or rely on manual deploy.

### "Lock compromised" or npm errors during `--build`

- Run `rm -rf node_modules package-lock.json && npm install` and try again. If it persists, run the build yourself (`npm run build`) and deploy without `--build`: `npx netlify deploy --prod --dir=.next` (only if your `netlify.toml` publish matches).

---

## Quick reference

| Goal              | Command |
|-------------------|--------|
| Log in            | `npx netlify login` |
| Link site         | `npx netlify link --name fluffyfriends-dev` or `--id SITE_ID` |
| Deploy production | `npx netlify deploy --prod --build` or `npm run deploy` |
| Deploy draft      | `npx netlify deploy --build` |
| Check status      | `npx netlify status` |
| Unlink            | `npx netlify unlink` |
