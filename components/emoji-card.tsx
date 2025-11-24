"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Heart } from "lucide-react"
import { likeEmoji, unlikeEmoji } from "@/app/actions"
import type { User } from "@supabase/supabase-js"

interface EmojiCardProps {
  emoji: {
    id: string
    name: string
    image_url: string
    like_count: number
    user_liked: boolean
  }
  user: User | null
}

export function EmojiCard({ emoji, user }: EmojiCardProps) {
  const [liked, setLiked] = useState(emoji.user_liked)
  const [likeCount, setLikeCount] = useState(emoji.like_count)
  const [loading, setLoading] = useState(false)

  const handleLike = async () => {
    if (!user) {
      alert("Please sign in with Discord to like emojis!")
      return
    }

    setLoading(true)

    if (liked) {
      const result = await unlikeEmoji(emoji.id)
      if (!result.error) {
        setLiked(false)
        setLikeCount((prev) => prev - 1)
      }
    } else {
      const result = await likeEmoji(emoji.id)
      if (!result.error) {
        setLiked(true)
        setLikeCount((prev) => prev + 1)
      }
    }

    setLoading(false)
  }

  return (
    <Card className="group relative overflow-hidden bg-card/50 border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
      <div className="aspect-square relative bg-muted/30 flex items-center justify-center p-6">
        <img
          src={emoji.image_url || "/placeholder.svg"}
          alt={emoji.name}
          className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform duration-300"
        />
      </div>
      <div className="p-4 space-y-3">
        <h3 className="font-semibold text-lg truncate">{emoji.name}</h3>
        <div className="flex items-center justify-between">
          <Button
            onClick={handleLike}
            disabled={loading}
            variant={liked ? "default" : "outline"}
            size="sm"
            className={liked ? "bg-red-500 hover:bg-red-600" : ""}
          >
            <Heart className={`w-4 h-4 mr-1 ${liked ? "fill-current" : ""}`} />
            {likeCount}
          </Button>
        </div>
      </div>
    </Card>
  )
}
