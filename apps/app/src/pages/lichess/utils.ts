export async function seekGame(
  accessToken: string,
  {
    rated,
    time,
    increment,
    color,
  }: { rated: string; time: string; increment: string; color: string },
  controller: AbortController,
): Promise<string | undefined> {
  const gamePromise = (async () => {
    const response = await fetch("https://lichess.org/api/stream/event", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      signal: controller.signal,
    })

    if (!response.ok || !response.body) {
      if (!controller.signal.aborted) {
        controller.abort()
      }
      return undefined
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ""

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split("\n")
      buffer = lines.pop() ?? ""

      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed) continue

        try {
          const event = JSON.parse(trimmed)

          if (
            event?.type === "gameStart" &&
            typeof event.game?.gameId === "string"
          ) {
            controller.abort()
            return event.game.gameId
          }
        } catch {}
      }
    }

    controller.abort()
    return undefined
  })()

  fetch("https://lichess.org/api/board/seek", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Bearer ${accessToken}`,
    },
    body: new URLSearchParams({
      rated: String(rated),
      variant: "standard",
      ratingRange: "",
      time,
      increment,
      color,
    }),
    signal: controller.signal,
  }).catch(() => {
    if (!controller.signal.aborted) {
      controller.abort()
    }
  })

  return gamePromise
}
