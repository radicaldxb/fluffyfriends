# Do this: save both .avif and .jpg

The app is already set up. You only need to fix **one node** in n8n so it sends or writes **original_image_url** (the .jpg) as well as **image_url** (the .avif).

---

## Option A: You use the **Supabase** node (insert into `pet_portraits`)

1. Open the **Supabase** node that runs after CONVERTER (the one that inserts into `pet_portraits`).
2. In the **Columns** / field mapping, you must have **two** URL columns:

   | Column name            | Value (Expression) |
   |------------------------|--------------------|
   | **image_url**          | `{{ $('CONVERTER').item.json.eager[0].secure_url }}` |
   | **original_image_url** | `{{ $('CONVERTER').item.json.secure_url }}` |

3. If **original_image_url** is missing:
   - Add a new row in the column mapping.
   - Column: **original_image_url**
   - Value: **Expression** → `{{ $('CONVERTER').item.json.secure_url }}`
4. Replace `CONVERTER` with your Cloudinary node’s name if it’s different.
5. Save the workflow and run a test.

---

## Option B: You use an **HTTP Request** node (POST to your app)

1. Open the **HTTP Request** node that POSTs to `https://your-site.netlify.app/api/receive-n8n-image`.
2. Method: **POST**. Body: **JSON**.
3. Ensure the body includes **both** of these (Expression mode):

   | Key                  | Value |
   |----------------------|--------|
   | **image_url**        | `{{ $('CONVERTER').item.json.eager[0].secure_url }}` |
   | **original_image_url** | `{{ $('CONVERTER').item.json.secure_url }}` |

4. Plus: pet_name, name, showcase_consent, status (from Webhook or other nodes).
5. Replace `CONVERTER` with your Cloudinary node’s name if different.
6. Save the workflow and run a test.

---

## Check it worked

- In **Supabase** → Table **pet_portraits** → latest row: **original_image_url** should contain a Cloudinary URL ending in `.jpg` (or same id without `f_avif,q_auto`).
- If you use the HTTP Request node: in the node output, the response should have **original_image_url_stored: true** and **original_image_url: "https://res.cloudinary.com/..."**.

---

## One-time: ensure the column exists in Supabase

If the column **original_image_url** doesn’t exist yet in `pet_portraits`:

1. Supabase Dashboard → **SQL Editor**.
2. Run (once):

```sql
alter table public.pet_portraits add column if not exists original_image_url text;
```

Then do Option A or B above.
