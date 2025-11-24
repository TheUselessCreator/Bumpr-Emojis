import { getSupabaseServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { EmojiCard } from "@/components/emoji-card"

export default async function ProfilePage() {
  const supabase = await getSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/")
  }

  // Fetch user's uploaded emojis
  const { data: emojis } = await supabase
    .from("emojis")
    .select(`
      id,
      name,
      image_url,
      created_at,
      emoji_likes (
        id,
        user_id
      )
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  const emojisWithLikes =
    emojis?.map((emoji) => ({
      id: emoji.id,
      name: emoji.name,
      image_url: emoji.image_url,
      like_count: emoji.emoji_likes?.length || 0,
      user_liked: emoji.emoji_likes?.some((like: any) => like.user_id === user.id) || false,
    })) || []

  const avatarUrl = user.user_metadata?.avatar_url
  const displayName = user.user_metadata?.full_name || user.email || "User"

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8 flex items-center gap-6">
          {avatarUrl ? (
            <img
              src={avatarUrl || "/placeholder.svg"}
              alt={displayName}
              className="h-24 w-24 rounded-full border-4 border-border"
            />
          ) : (
            <div className="h-24 w-24 rounded-full bg-primary/20 border-4 border-border flex items-center justify-center">
              <span className="text-4xl font-bold">{displayName[0]?.toUpperCase()}</span>
            </div>
          )}
          <div>
            <h1 className="text-4xl font-bold">{displayName}</h1>
            <p className="text-muted-foreground">{emojisWithLikes.length} emojis uploaded</p>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-2xl font-bold">Your Emojis</h2>
        </div>

        {emojisWithLikes.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg mb-4">You haven't uploaded any emojis yet</p>
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
