import { getSupabaseServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { UploadForm } from "@/components/upload-form"

export default async function UploadPage() {
  const supabase = await getSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/")
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Upload Emoji</h1>
            <p className="text-muted-foreground">Share your favorite emoji with the community</p>
          </div>

          <UploadForm />
        </div>
      </div>
    </div>
  )
}
