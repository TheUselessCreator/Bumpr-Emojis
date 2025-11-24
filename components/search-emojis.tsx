"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { EmojiCard } from "@/components/emoji-card"
import { Search } from "lucide-react"
import type { User } from "@supabase/supabase-js"
import { searchEmojis } from "@/app/actions"

interface SearchEmojisProps {
  user: User | null
}

export function SearchEmojis({ user }: SearchEmojisProps) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const handleSearch = async (searchQuery: string) => {
    setQuery(searchQuery)
    if (!searchQuery.trim()) {
      setResults([])
      return
    }

    setLoading(true)
    const { emojis } = await searchEmojis(searchQuery)
    setResults(emojis || [])
    setLoading(false)
  }

  return (
    <div className="space-y-6">
      <div className="relative max-w-2xl">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search for emojis..."
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-10 h-12 text-lg"
        />
      </div>

      {loading && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Searching...</p>
        </div>
      )}

      {!loading && query && results.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No emojis found for "{query}"</p>
        </div>
      )}

      {!loading && results.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {results.map((emoji) => (
            <EmojiCard key={emoji.id} emoji={emoji} user={user} />
          ))}
        </div>
      )}
    </div>
  )
}
