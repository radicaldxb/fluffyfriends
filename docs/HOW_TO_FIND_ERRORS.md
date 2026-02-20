# How to Find Error Details

## Error ID: `err_1771585360532_anfyo9u`

### Step 1: Check Netlify Logs

1. Go to [Netlify Dashboard](https://app.netlify.com)
2. Select your site
3. Go to **Functions** (in the left sidebar)
4. Click on **`create-portrait`** function
5. Click **"View logs"** or **"Real-time logs"**
6. Search for: `err_1771585360532_anfyo9u`
7. Look for the log entry that shows:
   ```
   [err_1771585360532_anfyo9u] Error in create-portrait API: {
     message: "...",
     stack: "...",
     name: "..."
   }
   ```

### Step 2: Check Browser Console

1. Open your site in the browser
2. Press **F12** to open DevTools
3. Go to **Console** tab
4. Look for any `[create-portrait]` prefixed errors
5. Copy the full error message

### Step 3: Common Error Causes

Based on the error ID, check for:

1. **Missing Environment Variables:**
   - `NEXT_PUBLIC_SUPABASE_URL` not set in Netlify
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` not set in Netlify
   - `N8N_WEBHOOK_URL` not set in Netlify

2. **Supabase Connection Issues:**
   - Invalid Supabase URL or key
   - Network connectivity issues
   - Storage bucket permissions

3. **File Upload Issues:**
   - File too large
   - Invalid file type
   - Storage quota exceeded

### Step 4: Share Error Details

Once you find the error in Netlify logs, share:
- The **message** field
- The **stack** trace (first few lines)
- The **name** field

This will help identify the exact issue.
