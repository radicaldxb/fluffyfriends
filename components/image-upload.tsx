"use client"

import { useCallback, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { PetPortraitInsert } from "@/types/database"

const BUCKET = "images"

const ACCEPT = "image/*"
const MAX_SIZE_MB = 5
const MAX_BYTES = MAX_SIZE_MB * 1024 * 1024

type UploadState = "idle" | "preview" | "uploading" | "success" | "error"

export function ImageUpload() {
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [publicUrl, setPublicUrl] = useState<string | null>(null)
  const [state, setState] = useState<UploadState>("idle")
  const [error, setError] = useState<string | null>(null)
  const [petName, setPetName] = useState("")
  const [status, setStatus] = useState("")
  const [userEmail, setUserEmail] = useState("")

  const clearPreview = useCallback(() => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
    }
  }, [previewUrl])

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      clearPreview()
      setPublicUrl(null)
      setError(null)

      const selected = e.target.files?.[0]
      if (!selected) {
        setFile(null)
        setState("idle")
        return
      }

      if (!selected.type.startsWith("image/")) {
        setError("Please select an image file (e.g. JPEG, PNG, WebP).")
        setState("error")
        return
      }

      if (selected.size > MAX_BYTES) {
        setError(`Image must be under ${MAX_SIZE_MB} MB.`)
        setState("error")
        return
      }

      setFile(selected)
      setPreviewUrl(URL.createObjectURL(selected))
      setState("preview")
    },
    [clearPreview]
  )

  const handleReset = useCallback(() => {
    clearPreview()
    setFile(null)
    setPublicUrl(null)
    setError(null)
    setPetName("")
    setStatus("")
    setUserEmail("")
    setState("idle")
  }, [clearPreview])

  const handleUpload = useCallback(async () => {
    if (!file) return

    setState("uploading")
    setError(null)

    try {
      const ext = file.name.split(".").pop() || "jpg"
      const path = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`

      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(path, file, {
          cacheControl: "3600",
          upsert: false,
        })

      if (uploadError) {
        setError(uploadError.message)
        setState("error")
        return
      }

      const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
      const imageUrl = data.publicUrl
      setPublicUrl(imageUrl)

      const row: PetPortraitInsert = {
        image_url: imageUrl,
        pet_name: petName.trim() || null,
        status: status.trim() || null,
        user_email: userEmail.trim() || null,
      }

      const { error: insertError } = await supabase
        .from("pet_portraits")
        .insert(row)

      if (insertError) {
        setError(insertError.message)
        setState("error")
        return
      }

      setState("success")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.")
      setState("error")
    }
  }, [file, petName, status, userEmail])

  return (
    <div className="mx-auto max-w-md space-y-4 rounded-organic border border-border bg-card p-6">
      <div className="space-y-2">
        <label
          htmlFor="image-upload"
          className="block text-sm font-medium text-foreground"
        >
          Choose an image
        </label>
        <input
          id="image-upload"
          type="file"
          accept={ACCEPT}
          onChange={handleFileChange}
          disabled={state === "uploading"}
          className="block w-full text-sm text-muted-foreground file:mr-4 file:rounded-organic-sm file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-medium file:text-primary-foreground file:hover:bg-primary/90"
        />
      </div>

      {state === "preview" && previewUrl && (
        <div className="space-y-3">
          <p className="text-sm font-medium text-foreground">Preview</p>
          <div className="overflow-hidden rounded-organic border border-border bg-muted/30">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl}
              alt="Preview"
              className="h-auto max-h-64 w-full object-contain"
            />
          </div>
          <div className="grid gap-2 sm:grid-cols-1">
            <label className="text-sm font-medium text-foreground">
              Pet name (optional)
            </label>
            <input
              type="text"
              value={petName}
              onChange={(e) => setPetName(e.target.value)}
              placeholder="Pet name"
              className="rounded-organic-sm border border-input bg-background px-3 py-2 text-sm"
            />
            <label className="text-sm font-medium text-foreground">
              Status (optional)
            </label>
            <input
              type="text"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              placeholder="Status"
              className="rounded-organic-sm border border-input bg-background px-3 py-2 text-sm"
            />
            <label className="text-sm font-medium text-foreground">
              Your email (optional)
            </label>
            <input
              type="email"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              placeholder="you@example.com"
              className="rounded-organic-sm border border-input bg-background px-3 py-2 text-sm"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={handleUpload}
              disabled={state === "uploading"}
              className="rounded-organic-sm"
            >
              {state === "uploading" ? "Uploading…" : "Upload to Supabase"}
            </Button>
            <Button
              variant="outline"
              onClick={handleReset}
              disabled={state === "uploading"}
              className="rounded-organic-sm"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {state === "success" && publicUrl && (
        <div className="space-y-3">
          <p className="text-sm font-medium text-foreground">Uploaded</p>
          <div className="overflow-hidden rounded-organic border border-border bg-muted/30">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={publicUrl}
              alt="Uploaded"
              className="h-auto max-h-64 w-full object-contain"
            />
          </div>
          <p className="break-all text-xs text-muted-foreground">
            {publicUrl}
          </p>
          <Button
            variant="outline"
            onClick={handleReset}
            className="rounded-organic-sm"
          >
            Upload another
          </Button>
        </div>
      )}

      {state === "error" && error && (
        <div
          className={cn(
            "rounded-organic-sm border px-3 py-2 text-sm",
            "border-destructive/50 bg-destructive/10 text-destructive"
          )}
          role="alert"
        >
          {error}
        </div>
      )}

      {state === "uploading" && (
        <p className="text-sm text-muted-foreground">Uploading…</p>
      )}
    </div>
  )
}
