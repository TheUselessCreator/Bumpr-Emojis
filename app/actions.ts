"use server"

import { getSupabaseServerClient } from "@/lib/supabase/server"
import { getDiscordAuthUrl } from "@/lib/discord-auth"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function likeEmoji(emojiId: string) {
  const supabase = await getSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Not authenticated" }
  }

  const { error } = await supabase.from("emoji_likes").insert({
    emoji_id: emojiId,
    user_id: user.id,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/")
  return { success: true }
}

export async function unlikeEmoji(emojiId: string) {
  const supabase = await getSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Not authenticated" }
  }

  const { error } = await supabase.from("emoji_likes").delete().eq("emoji_id", emojiId).eq("user_id", user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/")
  return { success: true }
}

export async function signInWithDiscord() {
  const authUrl = await getDiscordAuthUrl()
  redirect(authUrl)
}

export async function signOut() {
  const supabase = await getSupabaseServerClient()
  await supabase.auth.signOut()
  revalidatePath("/")
}

export async function uploadEmoji(formData: FormData) {
  const supabase = await getSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Not authenticated" }
  }

  const name = formData.get("name") as string
  const file = formData.get("file") as File

  if (!name || !file) {
    return { error: "Name and file are required" }
  }

  // Upload to storage
  const fileExt = file.name.split(".").pop()
  const fileName = `${user.id}-${Date.now()}.${fileExt}`

  const { error: uploadError } = await supabase.storage.from("emojis").upload(fileName, file)

  if (uploadError) {
    return { error: uploadError.message }
  }

  // Get public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from("emojis").getPublicUrl(fileName)

  // Insert into database
  const { error: dbError } = await supabase.from("emojis").insert({
    name,
    image_url: publicUrl,
    user_id: user.id,
  })

  if (dbError) {
    return { error: dbError.message }
  }

  revalidatePath("/explore")
  revalidatePath("/profile")
  return { success: true }
}

export async function searchEmojis(query: string) {
  const supabase = await getSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

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
    .ilike("name", `%${query}%`)
    .order("created_at", { ascending: false })

  const emojisWithLikes =
    emojis?.map((emoji) => ({
      id: emoji.id,
      name: emoji.name,
      image_url: emoji.image_url,
      like_count: emoji.emoji_likes?.length || 0,
      user_liked: user ? emoji.emoji_likes?.some((like: any) => like.user_id === user.id) : false,
    })) || []

  return { emojis: emojisWithLikes }
}
