import { getSupabaseServerClient } from "@/lib/supabase/server"
import { EmojiCard } from "@/components/emoji-card"
import { Trophy } from "lucide-react"

export default async function LeaderboardPage() {
  const supabase = await getSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Fetch all emojis with like counts
  const { data: emojis } = await supabase.from("emojis").select(`
      id,
      name,
      image_url,
      emoji_likes (
        id,
        user_id
      )
    `)

  const emojisWithLikes =
    emojis?.map((emoji) => ({
      id: emoji.id,
      name: emoji.name,
      image_url: emoji.image_url,
      like_count: emoji.emoji_likes?.length || 0,
      user_liked: user ? emoji.emoji_likes?.some((like: any) => like.user_id === user.id) : false,
    })) || []

  // Sort by most likes
  const topEmojis = emojisWithLikes.sort((a, b) => b.like_count - a.like_count)

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center gap-3 mb-8">
          <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center">
            <Trophy className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-4xl font-bold">Leaderboard</h1>
            <p className="text-muted-foreground">Top liked emojis of all time</p>
          </div>
        </div>

        {topEmojis.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">No emojis yet. Be the first to upload!</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Top 3 */}
            {topEmojis.slice(0, 3).length > 0 && (
              <div className="grid md:grid-cols-3 gap-6">
                {topEmojis.slice(0, 3).map((emoji, index) => (
                  <div key={emoji.id} className="relative">
                    <div className="absolute -top-3 -left-3 z-10 h-8 w-8 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-sm font-bold text-primary-foreground">
                      {index + 1}
                    </div>
                    <EmojiCard emoji={emoji} user={user} />
                  </div>
                ))}
              </div>
            )}

            {/* Rest */}
            {topEmojis.length > 3 && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                {topEmojis.slice(3).map((emoji, index) => (
                  <div key={emoji.id} className="relative">
                    <div className="absolute -top-2 -left-2 z-10 h-6 w-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                      {index + 4}
                    </div>
                    <EmojiCard emoji={emoji} user={user} />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
