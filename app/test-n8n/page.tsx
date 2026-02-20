"use client"

import { useState, useEffect, useRef } from "react"
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

  // Upload and run n8n (same as /create flow)
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [uploadPreviewUrl, setUploadPreviewUrl] = useState<string | null>(null)
  const [uploadName, setUploadName] = useState("Test Pet")
  const uploadInputRef = useRef<HTMLInputElement>(null)

  // Webhook ping (connectivity test)
  const [pingStatus, setPingStatus] = useState<"idle" | "loading">("idle")
  const [pingResult, setPingResult] = useState<{
    ok?: boolean
    status?: number
    responseTimeMs?: number
    error?: string
    hint?: string
    bodyPreview?: string
    url?: string
  } | null>(null)

  // Quick bypass state (no n8n – direct API)
  const [bypassUrl, setBypassUrl] = useState("")
  const [bypassName, setBypassName] = useState("Quick Test Pet")
  const [bypassStatus, setBypassStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [bypassResult, setBypassResult] = useState<{ image_url?: string; table_error?: string; error?: string } | null>(null)

  // Poll for the most recent generated image in pet_portraits
  useEffect(() => {
    if (status === "processing") {
      const interval = setInterval(async () => {
        try {
          const { data, error } = await supabase
            .from("pet_portraits")
            .select("image_url, created_at, status, pet_name")
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle()

          if (error) {
            console.error("Poll error:", error)
            return
          }

          if (data && data.image_url) {
            setGeneratedImageUrl(data.image_url)
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
  }, [status])

  async function handlePingWebhook() {
    setPingStatus("loading")
    setPingResult(null)
    try {
      const res = await fetch("/api/test-webhook", { method: "POST" })
      const data = await res.json()
      setPingResult(data)
    } catch (err) {
      setPingResult({
        ok: false,
        error: err instanceof Error ? err.message : "Request failed",
      })
    } finally {
      setPingStatus("idle")
    }
  }

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

  useEffect(() => {
    return () => {
      if (uploadPreviewUrl) URL.revokeObjectURL(uploadPreviewUrl)
    }
  }, [uploadPreviewUrl])

  function handleUploadFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (uploadPreviewUrl) {
      URL.revokeObjectURL(uploadPreviewUrl)
      setUploadPreviewUrl(null)
    }
    if (!f) {
      setUploadFile(null)
      return
    }
    if (!f.type.startsWith("image/")) {
      setUploadFile(null)
      return
    }
    setUploadFile(f)
    setUploadPreviewUrl(URL.createObjectURL(f))
  }

  async function handleUploadSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!uploadFile) return
    setStatus("loading")
    setMessage("")
    setGeneratedImageUrl(null)
    try {
      const formData = new FormData()
      formData.set("file", uploadFile)
      if (uploadName.trim()) formData.set("pet_name", uploadName.trim())
      const res = await fetch("/api/create-portrait", {
        method: "POST",
        body: formData,
      })
      const data = await res.json()
      if (!res.ok) {
        setStatus("error")
        setMessage(data.error || `HTTP ${res.status}`)
        return
      }
      setStatus("processing")
      setMessage("Image uploaded and sent to n8n. Waiting for generated portrait…")
    } catch (err) {
      setStatus("error")
      setMessage(err instanceof Error ? err.message : "Request failed")
    }
  }

  async function handleBypassSubmit(e: React.FormEvent) {
    e.preventDefault()
    setBypassStatus("loading")
    setBypassResult(null)
    const url = bypassUrl.trim() || "https://placehold.co/400x300?text=Test+Pet"
    try {
      const res = await fetch("/api/receive-n8n-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image_url: url,
          pet_name: bypassName.trim() || "Quick Test Pet",
          status: "completed",
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setBypassStatus("error")
        setBypassResult({ error: data.error || `HTTP ${res.status}` })
        return
      }
      setBypassStatus("success")
      setBypassResult({
        image_url: data.image_url,
        table_error: data.table_error ?? undefined,
      })
    } catch (err) {
      setBypassStatus("error")
      setBypassResult({ error: err instanceof Error ? err.message : "Request failed" })
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

        {/* Test webhook connectivity: ping and see response time */}
        <section className="mt-8 rounded-organic border border-border bg-muted/30 p-6">
          <h2 className="font-heading text-lg font-bold text-foreground">Test webhook connectivity</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Ping the URL in N8N_WEBHOOK_URL. Use the diagnostic workflow (path <code className="rounded bg-muted px-1 py-0.5 text-xs">diagnostic-ping</code>) in n8n and set that URL here to verify the app can reach n8n immediately.
          </p>
          <Button
            type="button"
            onClick={handlePingWebhook}
            disabled={pingStatus === "loading"}
            variant="default"
            className="mt-4 rounded-organic-sm"
          >
            {pingStatus === "loading" ? "Pinging…" : "Ping webhook"}
          </Button>
          {pingResult && (
            <div className="mt-4 space-y-1 rounded-organic-sm border border-border bg-background p-3 font-mono text-sm">
              {pingResult.error && (
                <p className="text-destructive">{pingResult.error}</p>
              )}
              {pingResult.hint && (
                <p className="text-muted-foreground">{pingResult.hint}</p>
              )}
              {typeof pingResult.ok === "boolean" && (
                <p>
                  <span className="text-muted-foreground">OK:</span>{" "}
                  {pingResult.ok ? "Yes" : "No"}
                  {typeof pingResult.status === "number" && (
                    <> · Status: {pingResult.status}</>
                  )}
                </p>
              )}
              {typeof pingResult.responseTimeMs === "number" && (
                <p>
                  <span className="text-muted-foreground">Response time:</span> {pingResult.responseTimeMs} ms
                </p>
              )}
              {pingResult.bodyPreview && (
                <p className="break-all text-muted-foreground">Body: {pingResult.bodyPreview}</p>
              )}
            </div>
          )}
        </section>

        {/* Quick bypass: no n8n, no Gemini – direct to API → storage + table */}
        <section className="mt-8 rounded-organic border border-primary/30 bg-primary/5 p-6">
          <h2 className="font-heading text-lg font-bold text-foreground">Quick test (bypass n8n)</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Send an image URL straight to the API. Storage + table only, no Gemini wait.
          </p>
          <form onSubmit={handleBypassSubmit} className="mt-4 space-y-4">
            <div>
              <label htmlFor="bypass_url" className="block text-sm font-medium text-foreground">
                Image URL
              </label>
              <input
                id="bypass_url"
                type="url"
                value={bypassUrl}
                onChange={(e) => setBypassUrl(e.target.value)}
                placeholder="https://placehold.co/400x300?text=Test+Pet"
                className="mt-1 w-full rounded-organic-sm border border-input bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
              />
            </div>
            <div>
              <label htmlFor="bypass_name" className="block text-sm font-medium text-foreground">
                Pet name
              </label>
              <input
                id="bypass_name"
                type="text"
                value={bypassName}
                onChange={(e) => setBypassName(e.target.value)}
                placeholder="Quick Test Pet"
                className="mt-1 w-full rounded-organic-sm border border-input bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
              />
            </div>
            <Button
              type="submit"
              disabled={bypassStatus === "loading"}
              variant="outline"
              className="rounded-organic-sm"
            >
              {bypassStatus === "loading" ? "Sending…" : "Send to API (no n8n)"}
            </Button>
          </form>
          {bypassResult && (
            <div className="mt-4 space-y-2">
              {bypassResult.error && (
                <p className="text-sm text-destructive">{bypassResult.error}</p>
              )}
              {bypassResult.table_error && (
                <p className="text-sm text-amber-600 dark:text-amber-400">
                  Table error: {bypassResult.table_error}
                </p>
              )}
              {bypassResult.image_url && (
                <div className="flex flex-col gap-2">
                  <p className="text-sm text-muted-foreground">Stored image:</p>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={bypassResult.image_url}
                    alt="Stored"
                    className="h-auto max-h-48 w-auto rounded-organic-sm border border-border object-contain"
                  />
                </div>
              )}
            </div>
          )}
        </section>

        {/* Upload and run n8n (same as /create) */}
        <section className="mt-10 rounded-organic border border-border bg-muted/20 p-6">
          <h2 className="font-heading text-lg font-bold text-foreground">Upload and run n8n</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Upload a pet photo; it goes to storage and triggers the full n8n flow (like /create).
          </p>
          <form onSubmit={handleUploadSubmit} className="mt-4 space-y-4">
            <div>
              <label htmlFor="upload-file" className="block text-sm font-medium text-foreground">
                Pet photo
              </label>
              <input
                ref={uploadInputRef}
                id="upload-file"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleUploadFileChange}
                disabled={status === "loading" || status === "processing"}
                className="mt-1 block w-full text-sm text-muted-foreground file:mr-4 file:rounded-organic-sm file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-medium file:text-primary-foreground file:hover:bg-primary/90"
              />
            </div>
            {uploadPreviewUrl && uploadFile && (
              <div className="overflow-hidden rounded-organic border border-border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={uploadPreviewUrl}
                  alt="Preview"
                  className="h-auto max-h-48 w-full object-contain"
                />
              </div>
            )}
            <div>
              <label htmlFor="upload-name" className="block text-sm font-medium text-foreground">
                Pet name (optional)
              </label>
              <input
                id="upload-name"
                type="text"
                value={uploadName}
                onChange={(e) => setUploadName(e.target.value)}
                placeholder="Test Pet"
                disabled={status === "loading" || status === "processing"}
                className="mt-1 w-full rounded-organic-sm border border-input bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
              />
            </div>
            <Button
              type="submit"
              disabled={!uploadFile || status === "loading" || status === "processing"}
              variant="outline"
              className="rounded-organic-sm"
            >
              {status === "loading" ? "Uploading…" : status === "processing" ? "Processing…" : "Upload and run n8n"}
            </Button>
          </form>
        </section>

        <h2 className="mt-12 font-heading text-lg font-bold text-foreground">Full flow with URL (n8n + Gemini)</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          If the result is the original image (no style), enable the style branch in n8n (Edit Fields → Download file → Master_Fireman) and ensure Merge → GEMINI → Convert to File → Supabase. If nothing runs, use the Test URL in N8N_WEBHOOK_URL and click Execute Workflow in n8n, then submit here within 30s.
        </p>
        <form onSubmit={handleSubmit} className="mt-4 space-y-6">
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
