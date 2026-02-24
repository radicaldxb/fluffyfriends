# JPG (original) not saving – checklist

The app stores the **.jpg** (original) only when n8n sends **original_image_url** in the request to your app. If it’s not saving, the problem is in **n8n**, not the API.

---

## 1. You must call the **app API**, not insert into Supabase directly

- **Correct:** An **HTTP Request** node that **POSTs** to  
  `https://your-site.netlify.app/api/receive-n8n-image`  
  with a **JSON body** that includes **original_image_url**.
- **Wrong:** Using the built-in **Supabase** node to insert into `pet_portraits` directly. That node often doesn’t map `original_image_url`, or the column mapping is missing.

If you use the Supabase node, either switch to an HTTP Request to `.../api/receive-n8n-image` (and use the body below), or in the Supabase node add a column **original_image_url** and set its value to:  
`{{ $('CONVERTER').item.json.secure_url }}`  
(Replace `CONVERTER` with your Cloudinary upload node name.)

---

## 2. Map from the Cloudinary (CONVERTER) response

The CONVERTER node returns JSON like this (you shared it):

- **secure_url** = original .jpg, e.g. `https://res.cloudinary.com/.../v1771914589/xxx.jpg`
- **eager[0].secure_url** = .avif, e.g. `https://res.cloudinary.com/.../f_avif,q_auto/.../xxx.avif`

So you must pass **both** to your app or to Supabase.

### If you use an HTTP Request node (POST to receive-n8n-image)

Body (Expression mode):

| Field | Value |
|-------|--------|
| **image_url** | `{{ $('CONVERTER').item.json.eager[0].secure_url }}` (.avif) |
| **original_image_url** | `{{ $('CONVERTER').item.json.secure_url }}` (.jpg) |
| pet_name, name, showcase_consent, status | from Webhook / your nodes |

### If you use the built-in Supabase node (direct insert into pet_portraits)

In the Supabase node, set **Columns** / field mapping so that both URLs are written:

| Column | Expression (use your node name if not CONVERTER) |
|--------|--------------------------------------------------|
| **image_url** | `{{ $('CONVERTER').item.json.eager[0].secure_url }}` |
| **original_image_url** | `{{ $('CONVERTER').item.json.secure_url }}` |
| pet_name | from Webhook, e.g. `{{ $('Webhook').item.json.body.pet_name }}` |
| status | `completed` |

If **original_image_url** is missing in the Supabase node’s column list or expression, the .jpg URL is never written.

---

## 3. Check the response from your app

When n8n calls receive-n8n-image, the response body includes:

- **original_image_url_stored: true** → .jpg was received and saved.
- **original_image_url_stored: false** or missing → the request did not include a valid **original_image_url**.

In n8n, open the node that calls receive-n8n-image and look at the **output** of the last run. Check the response JSON for `original_image_url_stored`. If it’s false, add or fix **original_image_url** in the request body (step 2).

---

## 4. Node name

The expression uses `$('CONVERTER')` — the name of the node that uploads to Cloudinary. If your node is named differently (e.g. "Cloudinary AVIF"), use that name:  
`$('Cloudinary AVIF').item.json.secure_url`  
and  
`$('Cloudinary AVIF').item.json.eager[0].secure_url`.

---

Summary: Use an **HTTP Request** to **/api/receive-n8n-image** with **original_image_url** in the body set to your Cloudinary node’s **secure_url**. Then check the response for **original_image_url_stored: true**.
