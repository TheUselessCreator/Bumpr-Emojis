import { getSupabaseServerClient } from "@/lib/supabase/server"
import { EmojiCard } from "@/components/emoji-card"

export default async function ExplorePage() {
  const supabase = await getSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Fetch all emojis with like counts and user likes
  const { data: emojis } = await supabase
    .from("emojis")
    .select(`
      id,
      name,
      image_url,
      emoji_likes (
        id,
        user_id
      )
    `)
    .order("created_at", { ascending: false })

  const emojisWithLikes =
    emojis?.map((emoji) => ({
      id: emoji.id,
      name: emoji.name,
      image_url: emoji.image_url,
      like_count: emoji.emoji_likes?.length || 0,
      user_liked: user ? emoji.emoji_likes?.some((like: any) => like.user_id === user.id) : false,
    })) || []

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Explore Emojis</h1>
          <p className="text-muted-foreground">Browse all emojis in our collection</p>
        </div>

        {emojisWithLikes.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg mb-4">No emojis yet. Upload some to get started!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {emojisWithLikes.map((emoji) => (
              <EmojiCard key={emoji.id} emoji={emoji} user={user} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
