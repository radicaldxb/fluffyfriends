"use client"

import { useState, useEffect, useRef } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { SketchDivider } from "@/components/sketch-divider"
import { cn } from "@/lib/utils"
import { supabase } from "@/lib/supabase"
import Image from "next/image"

type Status = "idle" | "uploading" | "processing" | "success" | "error"
type Theme = "fireman" | "spaceman"

export default function CreatePortraitPage() {
  const [theme, setTheme] = useState<Theme | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [petName, setPetName] = useState("")
  const [status, setStatus] = useState<Status>("idle")
  const [message, setMessage] = useState("")
  const [resultImageUrl, setResultImageUrl] = useState<string | null>(null)
  const [resultPetName, setResultPetName] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const uploadUrlRef = useRef<string | null>(null)
  const processingStartedAtRef = useRef<number>(0)

  useEffect(() => {
    if (status === "processing") {
      const interval = setInterval(async () => {
        try {
          const { data: rows, error } = await supabase
            .from("pet_portraits")
            .select("image_url, created_at, pet_name, original_image_url")
            .order("created_at", { ascending: false })
            .limit(15)

          if (error) {
            console.error("Poll error:", error)
            return
          }

          const startedAt = processingStartedAtRef.current
          const uploadUrl = uploadUrlRef.current
          const cutoff = startedAt - 5000

          const withOriginal = (row: { original_image_url?: string }) => (row as { original_image_url?: string }).original_image_url
          const exactMatch = (rows ?? []).find(
            (row) => row?.image_url && uploadUrl && withOriginal(row) === uploadUrl
          )
          const newestAfterStart = (rows ?? []).find(
            (row) => row?.image_url && new Date(row.created_at).getTime() >= cutoff
          )
          const matched = exactMatch ?? newestAfterStart
          if (matched?.image_url) {
            setResultImageUrl(matched.image_url)
            setResultPetName(matched.pet_name ?? null)
            setStatus("success")
          }
        } catch (err) {
          console.error("Poll error:", err)
        }
      }, 3000)

      const timeout = setTimeout(() => {
        clearInterval(interval)
        if (status === "processing") {
          setStatus("error")
          setMessage("This is taking longer than usual. Your portrait may still appear in the gallery soon.")
        }
      }, 300000)

      return () => {
        clearInterval(interval)
        clearTimeout(timeout)
      }
    }
  }, [status])

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0]
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
    }
    if (!selected) {
      setFile(null)
      return
    }
    if (!selected.type.startsWith("image/")) {
      setFile(null)
      return
    }
    setFile(selected)
    setPreviewUrl(URL.createObjectURL(selected))
    setStatus("idle")
    setMessage("")
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!file || !theme) return

    setStatus("uploading")
    setMessage("")

    try {
      const formData = new FormData()
      formData.set("file", file)
      formData.set("theme", theme)
      if (petName.trim()) formData.set("pet_name", petName.trim())

      const res = await fetch("/api/create-portrait", {
        method: "POST",
        body: formData,
      })

      const data = await res.json()

      if (!res.ok) {
        setStatus("error")
        setMessage(data.error || `Request failed (${res.status})`)
        return
      }

      if (data.webhook_ok === false) {
        setStatus("error")
        const detail = data.webhook_error || (data.webhook_status ? `Status ${data.webhook_status}` : "No response")
        setMessage(
          `Your photo was uploaded, but the workflow didn't start. n8n didn't accept the trigger (${detail}). Check that the transform-pet workflow is Active and N8N_WEBHOOK_URL uses the production URL (webhook/… not webhook-test/…).`
        )
        return
      }

      uploadUrlRef.current = typeof data.upload_url === "string" ? data.upload_url : null
      processingStartedAtRef.current = Date.now()
      setStatus("processing")
      setMessage("We're creating your portrait. This usually takes a few minutes.")
    } catch (err) {
      setStatus("error")
      setMessage(err instanceof Error ? err.message : "Something went wrong.")
    }
  }

  function handleReset() {
    setTheme(null)
    setFile(null)
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
    }
    setPetName("")
    setStatus("idle")
    setMessage("")
    setResultImageUrl(null)
    setResultPetName(null)
    uploadUrlRef.current = null
    processingStartedAtRef.current = 0
    fileInputRef.current?.value && (fileInputRef.current.value = "")
  }

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <section className="py-14 md:py-20">
        <div className="mx-auto max-w-2xl px-4 sm:px-6">
          <p className="text-sm font-medium uppercase tracking-widest text-primary">
            Create your portrait
          </p>
          <h1 className="mt-3 text-balance text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Upload your pet photo
          </h1>
          <p className="mt-4 text-pretty text-muted-foreground">
            Choose a theme, then upload a clear photo of your pet. We'll create a unique portrait in that style.
          </p>

          {(status === "idle" || status === "uploading" || status === "error") && (
            <form onSubmit={handleSubmit} className="mt-10 space-y-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-3">
                  Choose a theme
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setTheme("fireman")}
                    disabled={status === "uploading"}
                    className={cn(
                      "rounded-organic border-2 overflow-hidden text-left transition-all",
                      theme === "fireman"
                        ? "border-primary bg-primary/10"
                        : "border-border bg-card hover:border-primary/50",
                      status === "uploading" && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    <div className="relative aspect-square w-full bg-muted">
                      <Image
                        src="/images/themes/fireman-preview.webp"
                        alt="Fireman theme preview"
                        fill
                        className="object-cover"
                        unoptimized
                        onError={(e) => {
                          // Hide image if file doesn't exist yet
                          e.currentTarget.style.display = "none"
                        }}
                      />
                    </div>
                    <div className="p-4">
                      <div className="font-heading text-lg font-bold text-foreground">Fireman</div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Classic firefighter style
                      </p>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setTheme("spaceman")}
                    disabled={status === "uploading"}
                    className={cn(
                      "rounded-organic border-2 overflow-hidden text-left transition-all",
                      theme === "spaceman"
                        ? "border-primary bg-primary/10"
                        : "border-border bg-card hover:border-primary/50",
                      status === "uploading" && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    <div className="relative aspect-square w-full bg-muted">
                      <Image
                        src="/images/themes/spaceman-preview.webp"
                        alt="Spaceman theme preview"
                        fill
                        className="object-cover"
                        unoptimized
                        onError={(e) => {
                          // Hide image if file doesn't exist yet
                          e.currentTarget.style.display = "none"
                        }}
                      />
                    </div>
                    <div className="p-4">
                      <div className="font-heading text-lg font-bold text-foreground">Spaceman</div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Futuristic astronaut style
                      </p>
                    </div>
                  </button>
                </div>
                {!theme && (
                  <p className="mt-2 text-sm text-destructive">Please select a theme</p>
                )}
              </div>

              <div>
                <label htmlFor="pet-photo" className="block text-sm font-medium text-foreground">
                  Pet photo
                </label>
                <input
                  ref={fileInputRef}
                  id="pet-photo"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileChange}
                  required
                  disabled={status === "uploading"}
                  className="mt-2 block w-full text-sm text-muted-foreground file:mr-4 file:rounded-organic-sm file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-medium file:text-primary-foreground file:hover:bg-primary/90"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  JPEG, PNG or WebP, max 10 MB
                </p>
              </div>

              {previewUrl && file && (
                <div className="overflow-hidden rounded-organic border border-border bg-muted/30">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="h-auto max-h-80 w-full object-contain"
                  />
                </div>
              )}

              <div>
                <label htmlFor="pet-name" className="block text-sm font-medium text-foreground">
                  Pet name (optional)
                </label>
                <input
                  id="pet-name"
                  type="text"
                  value={petName}
                  onChange={(e) => setPetName(e.target.value)}
                  placeholder="e.g. Max, Luna"
                  disabled={status === "uploading"}
                  className="mt-2 w-full rounded-organic-sm border border-input bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
                />
              </div>

              <Button
                type="submit"
                disabled={!file || !theme || status === "uploading"}
                className="w-full rounded-organic-sm sm:w-auto"
              >
                {status === "uploading" ? "Uploading…" : "Create my portrait"}
              </Button>
            </form>
          )}

          {status === "processing" && (
            <div className="mt-10 rounded-organic border border-border bg-muted/30 p-8 text-center">
              <p className="text-muted-foreground">Creating your portrait…</p>
              <p className="mt-2 text-sm text-muted-foreground">{message}</p>
              <p className="mt-4 text-xs text-muted-foreground">
                You can leave this page; we'll add it to the gallery when it's ready.
              </p>
            </div>
          )}

          {status === "success" && resultImageUrl && (
            <div className="mt-10 space-y-6">
              <div className="rounded-organic border border-border bg-muted/30 p-6 text-center">
                <p className="font-semibold text-foreground">Your portrait is ready!</p>
                <div className="mt-4 overflow-hidden rounded-organic border border-border">
                  <Image
                    src={resultImageUrl}
                    alt={resultPetName || "Your pet portrait"}
                    width={400}
                    height={400}
                    className="h-auto w-full object-contain"
                    unoptimized={resultImageUrl.startsWith("http")}
                  />
                </div>
                {resultPetName && (
                  <p className="mt-3 text-sm text-muted-foreground">{resultPetName}</p>
                )}
                <div className="mt-6 flex flex-wrap justify-center gap-3">
                  <Button
                    onClick={handleReset}
                    variant="outline"
                    className="rounded-organic-sm"
                    asChild
                  >
                    <a href="/#gallery">View in gallery</a>
                  </Button>
                  <Button onClick={handleReset} className="rounded-organic-sm">
                    Create another
                  </Button>
                </div>
              </div>
            </div>
          )}

          {status === "error" && message && (
            <div
              className={cn(
                "mt-6 rounded-organic-sm border px-4 py-3 text-sm",
                "border-destructive/50 bg-destructive/10 text-destructive"
              )}
            >
              {message}
            </div>
          )}
        </div>
      </section>

      <SketchDivider />
      <Footer />
    </main>
  )
}
