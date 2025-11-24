"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { uploadEmoji } from "@/app/actions"
import { Upload, Loader2 } from "lucide-react"

export function UploadForm() {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (formData: FormData) => {
    setUploading(true)
    setError(null)
    setSuccess(false)

    const result = await uploadEmoji(formData)

    if (result.error) {
      setError(result.error)
      setUploading(false)
    } else {
      setSuccess(true)
      setPreview(null)
      setUploading(false)
      // Reset form
      const form = document.querySelector("form") as HTMLFormElement
      form?.reset()
    }
  }

  return (
    <form action={handleSubmit} className="space-y-6 bg-card p-8 rounded-xl border border-border">
      <div className="space-y-2">
        <Label htmlFor="name">Emoji Name</Label>
        <Input id="name" name="name" type="text" placeholder="e.g., Happy Face" required disabled={uploading} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="file">Emoji Image</Label>
        <div className="flex flex-col gap-4">
          {preview && (
            <div className="w-32 h-32 rounded-lg border-2 border-border bg-muted flex items-center justify-center">
              <img src={preview || "/placeholder.svg"} alt="Preview" className="max-w-full max-h-full object-contain" />
            </div>
          )}
          <Input
            id="file"
            name="file"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            required
            disabled={uploading}
          />
        </div>
        <p className="text-sm text-muted-foreground">Upload PNG, JPG, GIF (max 2MB)</p>
      </div>

      {error && <div className="p-4 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>}

      {success && <div className="p-4 rounded-lg bg-primary/10 text-primary text-sm">Emoji uploaded successfully!</div>}

      <Button type="submit" disabled={uploading} className="w-full" size="lg">
        {uploading ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Uploading...
          </>
        ) : (
          <>
            <Upload className="mr-2 h-5 w-5" />
            Upload Emoji
          </>
        )}
      </Button>
    </form>
  )
}
