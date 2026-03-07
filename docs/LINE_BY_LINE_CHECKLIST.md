# Line-by-line checklist of applied changes

Use this to verify each change in your editor. Go to the file and line number and confirm the content matches.

---

## 1. `lib/utils.ts`

| Lines | What to verify |
|-------|----------------|
| **8–15** | `isValidDownloadUrl` exists: comment "Returns true only for real URLs...", checks for `{{` and `$json`, returns true only for `http://` or `https://` |

---

## 2. `components/footer.tsx`

| Lines | What to verify |
|-------|----------------|
| **23–30** | Only two paragraphs: (1) "Portraits made with love, built to last. 🐾" (2) copyright line. No "FluffyFriends — because every pet deserves to be immortalised." and no "We never sell or share your photos. Secure checkout. Happiness guarantee." |

---

## 3. `app/api/portrait-balance/route.ts`

| Lines | What to verify |
|-------|----------------|
| **11** | `const now = new Date().toISOString()` |
| **18** | `.or(\`expires_at.is.null,expires_at.gt."${now}"\`)` — no longer `.gt("expires_at", ...)` only |

---

## 4. `app/api/deduct-portrait/route.ts`

| Lines | What to verify |
|-------|----------------|
| **13** | `const now = new Date().toISOString()` |
| **19** | `.or(\`expires_at.is.null,expires_at.gt."${now}"\`)` |

---

## 5. `app/api/approve-portrait/route.ts`

| Lines | What to verify |
|-------|----------------|
| **4** | Exactly one: `import { isValidDownloadUrl } from "@/lib/utils"` (no duplicate) |
| **273–278** | After reading `data.landscape_url` and `data.portrait_url`, trim and validate with `isValidDownloadUrl(landscape) && isValidDownloadUrl(portrait)` before setting `updatedPortrait` |

---

## 6. `app/create/page.tsx`

| Lines | What to verify |
|-------|----------------|
| **4** | `import Link from "next/link"` |
| **277–278** | `<main className="min-h-screen bg-background flex flex-col">` |
| **279–289** | Returning customer banner: `{portraitsRemaining !== null && portraitsRemaining > 0 && (` then div with "🐾 Welcome back! You have" + strong with count + "remaining. No payment needed at the end." |
| **303** | `<section className="py-10 md:py-14 flex-1">` |
| **421–438** | After the "Next — upload their photo" Button closing `</div>`, next block: `<p className="text-sm text-muted-foreground text-center mt-3">` with "Already have a portrait pack?" and `<Link href="/my-portraits" ...>Access my portraits →</Link>` |
| **640–649** | Success step: conditional copy — when `portraitsRemaining != null && portraitsRemaining > 0 && emailFromQuery` show "Use one portrait from your pack — no payment needed." else "Choose your package and continue to payment." |
| **678–714** | When pack user: `portraitsRemaining != null && portraitsRemaining > 0 && emailFromQuery ?` → single CTA "Use 1 portrait from my pack →" that `router.push` to success with portrait and email; no package grid |
| **715–770** | Else: package selection grid + "Continue to payment" button (Stripe) |

---

## 7. `app/checkout/success/page.tsx`

| Lines | What to verify |
|-------|----------------|
| **12** | `import { isValidDownloadUrl } from "@/lib/utils"` |
| **197–199** | Step 4 completed: `<main className="min-h-screen bg-background flex flex-col">`, `<section className="flex-1 mx-auto w-full max-w-7xl ...">` |
| **167–174** | After approve success: `if (isValidDownloadUrl(data.landscape_url) && isValidDownloadUrl(data.portrait_url)) { setDownloadLinks({ ... }); }` — no unconditional setDownloadLinks |
| **232–235** | `{!downloadLinks && (` with message "Your download links are in the email we sent you. If you don't see it, check your spam folder." |
| **260–266** | After portraits-remaining / get-more blocks: only `<div className="mt-10...">` with single "Back to home" Link — no "Create another portrait" button here |
| **462** | Step 3 preview still has `<Link href="/create">Create another portrait</Link>` (only place that link appears) |

---

## 8. `app/my-portraits/page.tsx`

| Lines | What to verify |
|-------|----------------|
| **9** | `import { isValidDownloadUrl } from "@/lib/utils"` |
| **21–28** | Portrait type includes `image_url` and `original_image_url` |
| **109–128** | Select includes `image_url, original_image_url`; map sets `image_url`, `original_image_url` from row |
| **257–270** | `landscapeValid`, `portraitValid`, `imageValid`, `originalValid` with `isValidDownloadUrl`; `previewUrl` = first valid of landscape → portrait → image_url → original_image_url |
| **276–288** | Thumbnail: img with `previewUrl` or paw placeholder |
| **284–328** | Download buttons only when `landscapeValid` / `portraitValid`; when both false: "Download links not available yet. Check your email for the links, or they may still be generating." |
| **152–154** | `<main className="min-h-screen bg-background flex flex-col">`, `<section className="flex-1 mx-auto max-w-3xl ...">` |

---

## 9. `app/gallery/page.tsx`

| Lines | What to verify |
|-------|----------------|
| **10** | `import { isValidDownloadUrl } from "@/lib/utils"` |
| **27** | Select includes `original_image_url` and `users(city, country)` |
| **33–50** | Build list with `withValidSrc`: validate `image_url` then `original_image_url` with `isValidDownloadUrl`; use `users` for city/country; filter out null |
| **59–62** | `<main className="min-h-screen bg-background flex flex-col">`, `<section className="flex-1 py-14 md:py-20">` |
| **111–118** | Overlay: `className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-orange-500/80 to-transparent px-3 py-4"`, white text, city/country in span |

---

## 10. `components/gallery-section.tsx`

| Lines | What to verify |
|-------|----------------|
| **8** | `import { isValidDownloadUrl } from "@/lib/utils"` |
| **10–16** | staticPortraits include `city: null`, `country: null` |
| **19** | Portrait type includes `city?` and `country?` |
| **29–55** | Select includes `original_image_url`, `users(city, country)`; validate image_url then original_url; filter null; set city/country from users |
| **105–114** | Overlay: `from-orange-500/80`, white text, city/country — no hover-only overlay |

---

## 11. `app/page.tsx` (Home)

| Lines | What to verify |
|-------|----------------|
| **17–19** | `<main className="min-h-screen bg-background flex flex-col">`, `<div className="flex-1 flex flex-col">` |
| **22–27** | "Already have a portrait pack?" with Link to `/my-portraits` "Access my portraits →" |
| **46** | `</div>` then `<Footer />` (footer outside flex-1 div) |

---

## 12. `app/terms/page.tsx`

| Lines | What to verify |
|-------|----------------|
| **7** | `<main className="min-h-screen bg-background flex flex-col">` |
| **9** | `<section className="flex-1 mx-auto max-w-2xl px-4 py-14 md:py-20 w-full">` |

---

## 13. `app/privacy/page.tsx`

| Lines | What to verify |
|-------|----------------|
| **7** | `<main className="min-h-screen bg-background flex flex-col">` |
| **9** | `<section className="flex-1 mx-auto max-w-2xl px-4 py-14 md:py-20 w-full">` |

---

## 14. `app/support/page.tsx`

| Lines | What to verify |
|-------|----------------|
| **7** | `<main className="min-h-screen bg-background flex flex-col">` |
| **9** | `<section className="flex-1 mx-auto max-w-2xl px-4 py-14 md:py-20 w-full">` |

---

## Quick grep checks (run in project root)

- **One isValidDownloadUrl import in approve-portrait:**  
  `grep -n "isValidDownloadUrl" app/api/approve-portrait/route.ts`  
  → Should show only line 4 (import) and lines 275–276 (usage).

- **No duplicate "Create another portrait" in success completed block:**  
  In `app/checkout/success/page.tsx` between the "You have X remaining" box and "Back to home", there should be no Button with "Create another portrait".

- **expires_at fix in both APIs:**  
  `grep -n "expires_at" app/api/portrait-balance/route.ts app/api/deduct-portrait/route.ts`  
  → Both should show `.or(\`expires_at.is.null,expires_at.gt."${now}"\`)`.
