import { getSupabaseServerClient } from "@/lib/supabase/server"
import { exchangeCodeForToken, getDiscordUser } from "@/lib/discord-auth"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")

  if (!code) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  try {
    const tokenData = await exchangeCodeForToken(code)

    const discordUser = await getDiscordUser(tokenData.access_token)

    const supabase = await getSupabaseServerClient()

    const { data, error } = await supabase.auth.signInWithPassword({
      email: `${discordUser.id}@discord.user`,
      password: discordUser.id,
    })

    if (error && error.message.includes("Invalid login credentials")) {
      const { error: signUpError } = await supabase.auth.signUp({
        email: `${discordUser.id}@discord.user`,
        password: discordUser.id,
        options: {
          data: {
            discord_id: discordUser.id,
            username: discordUser.username,
            avatar_url: discordUser.avatar
              ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png`
              : null,
            full_name: discordUser.global_name || discordUser.username,
          },
        },
      })

      if (signUpError) {
        console.error("[v0] Sign up error:", signUpError)
      }
    }
  } catch (error) {
    console.error("[v0] Auth error:", error)
  }

  // Redirect to home page
  return NextResponse.redirect(new URL("/", request.url))
}
