import { getSupabaseServerClient } from "@/lib/supabase/server"
import { exchangeCodeForToken, getDiscordUser } from "@/lib/discord-auth"
import { NextResponse } from "next/server"
import { cookies } from "next/headers"

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

    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: `${discordUser.id}@discord.user`,
      password: discordUser.id,
    })

    if (signInError && signInError.message.includes("Invalid login credentials")) {
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
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
        return NextResponse.redirect(new URL("/?error=signup_failed", request.url))
      }

      if (signUpData.session) {
        const cookieStore = await cookies()
        cookieStore.set("sb-access-token", signUpData.session.access_token, {
          path: "/",
          maxAge: 60 * 60 * 24 * 7, // 7 days
        })
        cookieStore.set("sb-refresh-token", signUpData.session.refresh_token, {
          path: "/",
          maxAge: 60 * 60 * 24 * 7, // 7 days
        })
      }
    } else if (signInData?.session) {
      const cookieStore = await cookies()
      cookieStore.set("sb-access-token", signInData.session.access_token, {
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      })
      cookieStore.set("sb-refresh-token", signInData.session.refresh_token, {
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      })
    }

    console.log("[v0] Auth successful, redirecting to home")
  } catch (error) {
    console.error("[v0] Auth error:", error)
    return NextResponse.redirect(new URL("/?error=auth_failed", request.url))
  }

  return NextResponse.redirect(new URL("/", request.url))
}
