"use client"

import { useState, useEffect } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { supabase } from "@/lib/supabase"

export default function TestN8nPage() {
  const [testImageUrl, setTestImageUrl] = useState("")
  const [name, setName] = useState("Test Pet")
  const [status, setStatus] = useState<"idle" | "loading" | "processing" | "success" | "error">("idle")
  const [message, setMessage] = useState("")
  const [submittedImageUrl, setSubmittedImageUrl] = useState<string | null>(null)
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null)
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null)

  // Poll for generated image
  useEffect(() => {
    if (submittedImageUrl && status === "processing") {
      const interval = setInterval(async () => {
        try {
          // Check pet_portraits table for recently created images
          // Look for images created in the last 10 minutes with matching pet name
          const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString()

          const { data, error } = await supabase
            .from("pet_portraits")
            .select("image_url, created_at, status, pet_name")
            .gte("created_at", tenMinutesAgo)
            .eq("pet_name", name)
            .order("created_at", { ascending: false })
            .limit(5)

          if (error) {
            console.error("Poll error:", error)
            return
          }

          // Find image that's different from the submitted one (likely the generated one)
          const generated = data?.find(
            (item) => item.image_url && !item.image_url.includes(submittedImageUrl.split("/").pop() || "")
          )

          if (generated && generated.image_url) {
            setGeneratedImageUrl(generated.image_url)
            setStatus("success")
            setMessage("Image generated successfully!")
            clearInterval(interval)
            setPollingInterval(null)
          }
        } catch (err) {
          console.error("Poll error:", err)
        }
      }, 2000) // Poll every 2 seconds

      setPollingInterval(interval)

      // Stop polling after 5 minutes
      const timeout = setTimeout(() => {
        clearInterval(interval)
        setPollingInterval(null)
        if (status === "processing") {
          setStatus("error")
          setMessage("Timeout: Image generation took too long. Check n8n workflow.")
        }
      }, 300000)

      return () => {
        clearInterval(interval)
        clearTimeout(timeout)
      }
    }
  }, [submittedImageUrl, status, name])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus("loading")
    setMessage("")
    setGeneratedImageUrl(null)

    const imageUrl = testImageUrl.trim() || "https://example.com/dummy-pet.jpg"
    const petName = name.trim() || "Test Pet"

    try {
      const res = await fetch("/api/test-n8n", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          test_image: imageUrl,
          name: petName,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setStatus("error")
        const errorMsg = data.error || `HTTP ${data.status || res.status} ${data.statusText || ""}`
        const details = data.body || data.stack
        setMessage(
          details
            ? `${errorMsg}\n\nDetails:\n${typeof details === "string" ? details : JSON.stringify(details, null, 2)}`
            : errorMsg
        )
        return
      }

      // Webhook sent successfully, now wait for n8n to process and send back
      setSubmittedImageUrl(imageUrl)
      setStatus("processing")
      setMessage("Image sent to n8n workflow. Waiting for generated image...")
    } catch (err) {
      setStatus("error")
      setMessage(err instanceof Error ? err.message : "Request failed")
    }
  }

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <div className="mx-auto max-w-2xl px-4 py-14 sm:px-6 md:py-20">
        <h1 className="font-heading text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
          Test n8n webhook
        </h1>
        <p className="mt-2 text-muted-foreground">
          Send a test payload to your n8n webhook (N8N_WEBHOOK_URL in .env.local).
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div>
            <label htmlFor="test_image" className="block text-sm font-medium text-foreground">
              Image URL
            </label>
            <input
              id="test_image"
              type="url"
              value={testImageUrl}
              onChange={(e) => setTestImageUrl(e.target.value)}
              placeholder="https://example.com/dummy-pet.jpg"
              className="mt-1 w-full rounded-organic-sm border border-input bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Leave empty to send a hardcoded dummy URL.
            </p>
          </div>

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-foreground">
              Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Test Pet"
              className="mt-1 w-full rounded-organic-sm border border-input bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
            />
          </div>

          <Button
            type="submit"
            disabled={status === "loading" || status === "processing"}
            className="rounded-organic-sm"
          >
            {status === "loading"
              ? "Sending…"
              : status === "processing"
                ? "Processing…"
                : "Submit"}
          </Button>
        </form>

        {/* Placeholder for generated image */}
        {(status === "processing" || status === "success") && (
          <div className="mt-8 space-y-4">
            <h2 className="font-heading text-xl font-bold text-foreground">Generated Image</h2>
            {status === "processing" && (
              <div className="flex items-center justify-center rounded-organic border border-border bg-muted/30 p-12">
                <div className="text-center">
                  <div className="mb-2 text-muted-foreground">⏳ Processing...</div>
                  <p className="text-sm text-muted-foreground">
                    Waiting for n8n workflow to generate image...
                  </p>
                </div>
              </div>
            )}
            {generatedImageUrl && (
              <div className="overflow-hidden rounded-organic border border-border bg-muted/30">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={generatedImageUrl}
                  alt="Generated pet portrait"
                  className="h-auto w-full object-contain"
                />
              </div>
            )}
          </div>
        )}

        {message && (
          <div
            className={cn(
              "mt-8 rounded-organic-sm border px-4 py-3 text-sm",
              status === "error"
                ? "border-destructive/50 bg-destructive/10 text-destructive"
                : "border-border bg-muted/30 text-foreground"
            )}
          >
            <pre className="whitespace-pre-wrap break-words font-mono text-xs">
              {message}
            </pre>
          </div>
        )}
      </div>
      <Footer />
    </main>
  )
}
