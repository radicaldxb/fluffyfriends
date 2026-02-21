# Future feature: Two pets (e.g. two dogs) in one portrait

## What happened in your test

You uploaded a photo of **two dogs**. The subject validation in n8n should have blocked it (single pet only), but the image went through and the portrait was generated with **two dogs** in the theme (spaceman / firefighter). So:

1. **Blocking:** The validation branch needs to reliably reject two‑pet images (see fix below).
2. **Quality:** The current prompt + Gemini already handles two subjects well when they do get through: both dogs are consistently styled, well composed, and the result is high quality. That’s useful for a future “two pets” product.

---

## Why two dogs passed validation

From your workflow JSON, the **If** node has:

- **Value 2:** `=VALID: no`

In n8n, a leading `=` makes the value an **expression**. So `=VALID: no` is not the literal string `"VALID: no"`; it’s evaluated and can be wrong or empty. The “contains” check then never sees `"VALID: no"`, so the reject branch is not taken and two‑pet images go to the portrait path.

**Fix so two dogs are blocked:** In the If node, set Value 2 to the **literal** string `VALID: no` (no leading `=`), or, if the field only accepts expressions, use `="VALID: no"`. Re-test with a two‑dog photo; it should be rejected with the “single pet only” message.

---

## Current flow (single pet)

- **Validation:** “Validate Subject” Gemini node checks for **exactly one** dog or cat; if not, n8n calls your app with `rejected: true`.
- **Portrait:** One theme image + one user image; prompt says “Use the pet from Image 2” (singular).
- **Output:** One pet in the theme (e.g. one dog as astronaut).

---

## Future “two pets” feature (outline)

When you want to support “two dogs (or two pets) in one portrait” as a product:

### 1. Product / UX

- **Option in UI:** e.g. “One pet” vs “Two pets” (or “Group portrait”) on the create page.
- **Copy:** “Upload a photo with **two** pets” and validation rules (e.g. exactly two dogs/cats, no people).
- **Naming:** Optional “Pet 1 name” / “Pet 2 name” or “Group name”.

### 2. Validation

- **New path or branch:** A separate validation (or same “Validate Subject” with a different prompt) that accepts **exactly two** pets and rejects one, three, or non‑pet.
- **Prompt variant:** e.g. “The image must show EXACTLY TWO pets (two dogs or two cats). No single pet, no more than two, no humans, no other animals. Reply: VALID: yes / VALID: no REASON: …”

### 3. n8n workflow

- **Input:** Same webhook; body can carry a flag, e.g. `"mode": "two_pets"` or `theme` like `spaceman_two` (or a dedicated `portrait_type`).
- **Branching:**  
  - If `mode === "two_pets"` → use “Validate two pets” node and a **two‑pet prompt**.  
  - Else → current “Validate Subject” (single pet) and single‑pet prompt.
- **Portrait GEMINI:**  
  - **Single pet:** Current prompt (Image 2 = one pet).  
  - **Two pets:** Prompt that says “Use **both** pets from Image 2. Preserve both identities. Compose them together in the same scene in the style of Image 1.” (You can refine wording; your current runs already show Gemini can do two subjects well.)

### 4. Prompts (Supabase / DB)

- **Single pet:** Keep current `theme_prompts` row per theme (one pet).
- **Two pets:** Either:
  - New rows, e.g. `theme_id = 'spaceman_two'` and prompt text for two subjects, or  
  - Same theme_id with an extra column like `portrait_type` (single / two_pets) and different prompt text.

### 5. App / API

- **Create page:** Send `mode` or `portrait_type` (e.g. `single` / `two_pets`) with theme and image.
- **create-portrait API:** Pass that through to n8n so the workflow can choose validation + prompt branch.
- **receive-n8n-image:** No change needed for two‑pet output; same callback with one generated image.

### 6. What already works

- **Gemini:** Your two‑dog results show it can render two pets in one themed image with good consistency and composition.
- **Flow:** Same webhook → fetch theme image + user image → Merge → GEMINI → Supabase. The only changes are validation rules and prompt text (and optional UI/API flag).

---

## Summary

| Item | Action now | Later (two‑pet feature) |
|------|------------|---------------------------|
| Block two dogs | Fix If node Value 2 → literal `VALID: no` (or `="VALID: no"`) | — |
| Validation | Keep single‑pet validator | Add “exactly two pets” validator and branch by mode |
| Prompt | Current single‑pet prompt | Add two‑pet prompt (both pets from Image 2, same scene) |
| UI | “One pet only” copy | Add “Two pets” option and copy |
| API | — | Optional `mode` / `portrait_type` in body for n8n |

Fixing the If node Value 2 will block two‑dog uploads now; the rest can be implemented when you add the “two pets” product.
