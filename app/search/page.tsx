import { SearchEmojis } from "@/components/search-emojis"
import { getSupabaseServerClient } from "@/lib/supabase/server"

export default async function SearchPage() {
  const supabase = await getSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Search Emojis</h1>
          <p className="text-muted-foreground">Find your perfect emoji</p>
        </div>

        <SearchEmojis user={user} />
      </div>
    </div>
  )
}
