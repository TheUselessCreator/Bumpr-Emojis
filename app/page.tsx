import Link from "next/link"
import { Button } from "@/components/ui/button"
import { getSupabaseServerClient } from "@/lib/supabase/server"

export default async function Home() {
  const supabase = await getSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <div className="min-h-[calc(100vh-73px)] bg-background flex items-center justify-center">
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Hero Section */}
          <div className="space-y-4">
            <div className="inline-flex items-center gap-4 mb-4">
              <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                <span className="text-5xl">😊</span>
              </div>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent text-balance">
              Bumpr Emojis
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto text-balance">
              Discover, share, and like the best Discord emojis. Join the community and find the perfect emoji for your
              server.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/explore">
              <Button size="lg" className="text-lg px-8 py-6">
                Explore Emojis
              </Button>
            </Link>
            {user && (
              <Link href="/upload">
                <Button size="lg" variant="outline" className="text-lg px-8 py-6 bg-transparent">
                  Upload Emoji
                </Button>
              </Link>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8 max-w-3xl mx-auto pt-12">
            <div className="space-y-2">
              <div className="text-4xl md:text-5xl font-bold text-primary">1000+</div>
              <div className="text-sm text-muted-foreground">Emojis</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl md:text-5xl font-bold text-primary">500+</div>
              <div className="text-sm text-muted-foreground">Users</div>
            </div>
            <div className="space-y-2 col-span-2 md:col-span-1">
              <div className="text-4xl md:text-5xl font-bold text-primary">10K+</div>
              <div className="text-sm text-muted-foreground">Likes</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
