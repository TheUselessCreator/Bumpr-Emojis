import { getSupabaseRouteHandlerClient } from "@/lib/supabase/server"
import { exchangeCodeForToken, getDiscordUser } from "@/lib/discord-auth"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")

  console.log("[v0] Auth callback received, code:", code ? "present" : "missing")

  if (!code) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  try {
    const tokenData = await exchangeCodeForToken(code)
    console.log("[v0] Got Discord token")

    const discordUser = await getDiscordUser(tokenData.access_token)
    console.log("[v0] Got Discord user:", discordUser.username)

    const { supabase, response } = await getSupabaseRouteHandlerClient(request as any)

    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: `${discordUser.id}@discord.user`,
      password: discordUser.id,
    })

    console.log("[v0] Sign in attempt:", signInError ? "failed" : "success")

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

      console.log("[v0] Sign up attempt:", signUpError ? "failed" : "success", signUpData?.user?.id)

      if (signUpError) {
        console.error("[v0] Sign up error:", signUpError)
        return NextResponse.redirect(new URL("/?error=signup_failed", request.url))
      }
    } else if (signInError) {
      console.error("[v0] Sign in error:", signInError)
      return NextResponse.redirect(new URL("/?error=signin_failed", request.url))
    }

    console.log("[v0] Auth successful, redirecting to home")

    return NextResponse.redirect(new URL("/", request.url), {
      headers: response.headers,
    })
  } catch (error) {
    console.error("[v0] Auth error:", error)
    return NextResponse.redirect(new URL("/?error=auth_failed", request.url))
  }
}
