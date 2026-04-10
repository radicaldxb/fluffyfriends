import { NextResponse } from "next/server"
import { petmasterUnauthorizedResponse } from "@/lib/petmaster-api-guard"

const MODEL = "claude-sonnet-4-20250514"

function assembleInitialDm(name: string, pet: string, compliment: string): string {
  const line = compliment.trim().replace(/^[\s"'“”]+|[\s"'“”]+$/g, "").replace(/\.$/, "")
  const wave = String.fromCodePoint(0x1f44b)
  const paw = String.fromCodePoint(0x1f43e)
  return [
    `Hi ${name} ${wave}`,
    "",
    `${pet} is ${line}.`,
    "",
    "I'll be straight with you: I'm Stephan, I run a small pet portrait business called FluffyFriends and I'm trying to grow it. We turn pet photos into personalised fine art portraits with your pet's name in the artwork, think oil painting meets your actual dog.",
    "",
    "I'd love to gift you a free portrait pack, no strings attached, no posting required, no catch. I just want more pet lovers to know we exist, and honestly I'd love your feedback on the experience too.",
    "",
    `If you're curious, take a look at what the portraits look like at fluffyfriends.online, and if you'd like one for ${pet}, just share your email and I'll set up your free pack directly at fluffyfriends.online/my-portraits. That's where you'll access and download your portraits, no account needed, just your email.`,
    "",
    `Either way, keep posting ${pet}. Genuinely brightens my day. ${paw}`,
    "Stephan",
  ].join("\n")
}

async function anthropicText(prompt: string, maxTokens: number, apiKey: string): Promise<string | null> {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: maxTokens,
      messages: [{ role: "user", content: prompt }],
    }),
  })

  if (!res.ok) {
    const errText = await res.text()
    console.error("Anthropic error:", res.status, errText)
    return null
  }

  const json = (await res.json()) as {
    content?: Array<{ type: string; text?: string }>
  }
  return json.content?.find((c) => c.type === "text")?.text?.trim() ?? null
}

export async function POST(request: Request) {
  const denied = await petmasterUnauthorizedResponse()
  if (denied) return denied

  const apiKey = process.env.ANTHROPIC_API_KEY?.trim()
  if (!apiKey) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY is not configured" }, { status: 503 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  if (
    typeof body !== "object" ||
    body === null ||
    (body as { stage?: string }).stage !== "initial"
  ) {
    return NextResponse.json({ error: "Only stage: initial is supported" }, { status: 400 })
  }

  const b = body as {
    handle?: string
    name?: string
    pet?: string
    followers?: number
    post_url?: string
    observation?: string
  }

  const name = typeof b.name === "string" ? b.name.trim() : ""
  const pet = typeof b.pet === "string" ? b.pet.trim() : ""
  const observation = typeof b.observation === "string" ? b.observation.trim() : ""

  if (!name || !pet || !observation) {
    return NextResponse.json(
      { error: "name, pet, and observation are required" },
      { status: 400 },
    )
  }

  const complimentPrompt = `Write exactly one short sentence (max 35 words) that completes the thought "${pet} is …" — warm, specific, and grounded only in this observation about their Instagram content. Do not be generic or salesy. Do not include "${pet} is" in your answer. Do not use marketing language. Output only the sentence, no quotes.

Observation:
${observation}`

  const compliment = await anthropicText(complimentPrompt, 1000, apiKey)
  if (!compliment) {
    return NextResponse.json({ error: "Failed to generate DM" }, { status: 502 })
  }

  const dm = assembleInitialDm(name, pet, compliment)
  return NextResponse.json({ dm })
}
