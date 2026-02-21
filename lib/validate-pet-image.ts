/**
 * Subject isolation: validate that an image shows exactly one pet (dog/cat),
 * with no humans, no other animals, and no prominent objects.
 * Used before the image is sent to the portrait pipeline to avoid burning tokens
 * on group photos, people, or objects.
 */

const GEMINI_VALIDATION_MODEL = "gemini-1.5-flash"
const GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta"

export type ValidatePetImageResult =
  | { valid: true }
  | { valid: false; reason: string }

/**
 * Check image content via Gemini Vision. Returns valid only when the image
 * contains exactly one pet (dog or cat), no humans, no other animals, no objects.
 * If GEMINI_API_KEY is not set, returns valid (validation skipped) and logs a warning.
 */
export async function validatePetImage(
  imageBuffer: Buffer,
  mimeType: string
): Promise<ValidatePetImageResult> {
  const apiKey = process.env.GEMINI_API_KEY?.trim()
  if (!apiKey) {
    console.warn(
      "[validate-pet-image] GEMINI_API_KEY not set; skipping subject validation. Set it for strict subject isolation."
    )
    return { valid: true }
  }

  const prompt = `You are a strict image validator for a pet portrait app. The image must show EXACTLY ONE pet (a single dog OR a single cat). 
Rules:
- Exactly one dog or one cat only. No multiple pets, no group photos of animals.
- No humans (no people, no faces, no hands).
- No objects as main subject (no fruit, food, toys, furniture, etc.).
- No other animals (no birds, fish, etc.).

Reply with exactly one line in this format:
VALID: yes
or
VALID: no
REASON: <one short reason>

If the image is blurry, has no clear subject, or does not show exactly one pet with no people and no objects, reply VALID: no with REASON.`

  const base64 = imageBuffer.toString("base64")
  const url = `${GEMINI_BASE}/models/${GEMINI_VALIDATION_MODEL}:generateContent?key=${apiKey}`

  const body = {
    contents: [
      {
        parts: [
          {
            inline_data: {
              mime_type: mimeType,
              data: base64,
            },
          },
          { text: prompt },
        ],
      },
    ],
    generationConfig: {
      maxOutputTokens: 128,
      temperature: 0.1,
    },
  }

  let res: Response
  try {
    res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(15000),
    })
  } catch (err) {
    console.error("[validate-pet-image] Gemini request failed:", err)
    return {
      valid: false,
      reason: "Image check is temporarily unavailable. Please try again.",
    }
  }

  if (!res.ok) {
    const text = await res.text().catch(() => "")
    console.error("[validate-pet-image] Gemini API error:", res.status, text.slice(0, 300))
    return {
      valid: false,
      reason: "Image check is temporarily unavailable. Please try again.",
    }
  }

  let data: { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> }
  try {
    data = await res.json()
  } catch {
    return {
      valid: false,
      reason: "Image check failed. Please try another photo.",
    }
  }

  const text =
    data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim()?.toLowerCase() ?? ""
  if (!text) {
    return {
      valid: false,
      reason: "We couldn't verify this photo. Please use a clear photo of one pet only.",
    }
  }

  const validLine = text.includes("valid: yes")
  const noLine = text.includes("valid: no")
  let reason = "Please upload a photo of a single pet only (no group photos, people, or objects)."
  const reasonMatch = text.match(/reason:\s*(.+?)(?:\n|$)/i)
  if (reasonMatch?.[1]) {
    reason = reasonMatch[1].trim().slice(0, 200)
  }

  if (validLine && !noLine) {
    return { valid: true }
  }
  return { valid: false, reason }
}
