export async function getDiscordAuthUrl() {
  const clientId = process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID!
  const redirectUri = process.env.NEXT_PUBLIC_REDIRECT_URL!

  const discordAuthUrl = new URL("https://discord.com/oauth2/authorize")
  discordAuthUrl.searchParams.set("client_id", clientId)
  discordAuthUrl.searchParams.set("redirect_uri", redirectUri)
  discordAuthUrl.searchParams.set("response_type", "code")
  discordAuthUrl.searchParams.set("scope", "identify email")

  return discordAuthUrl.toString()
}

export async function exchangeCodeForToken(code: string) {
  const clientId = process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID!
  const clientSecret = process.env.DISCORD_CLIENT_SECRET!
  const redirectUri = process.env.NEXT_PUBLIC_REDIRECT_URL!

  const response = await fetch("https://discord.com/api/oauth2/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "authorization_code",
      code: code,
      redirect_uri: redirectUri,
    }),
  })

  if (!response.ok) {
    throw new Error("Failed to exchange code for token")
  }

  return response.json()
}

export async function getDiscordUser(accessToken: string) {
  const response = await fetch("https://discord.com/api/users/@me", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  if (!response.ok) {
    throw new Error("Failed to get Discord user")
  }

  return response.json()
}
