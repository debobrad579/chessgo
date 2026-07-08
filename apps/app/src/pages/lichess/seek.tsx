import { ChessGameSkeleton } from "@/components/chess/game/ChessGameSkeleton"
import { Unauthorized } from "@/components/errors/Unauthorized"
import { useLichessAccount } from "@/context/LichessContext"
import { useEventStream } from "@/hooks/useEventStream"
import { useNavigate, useSearchParams } from "react-router"

export default function LichessSeekPage() {
  const navigate = useNavigate()
  const [searchParams, _] = useSearchParams()
  const lichessAccount = useLichessAccount()

  if (!lichessAccount.connected) {
    return <Unauthorized />
  }

  useEventStream(
    "https://lichess.org/api/stream/event",
    {
      headers: {
        Authorization: "Bearer " + lichessAccount.access_token,
      },
    },
    (event) => {
      console.log(event)
      if (
        event != null &&
        typeof event === "object" &&
        "type" in event &&
        event.type === "gameStart" &&
        "game" in event &&
        event.game != null &&
        typeof event.game === "object" &&
        "gameId" in event.game
      ) {
        navigate(`/lichess/live/${event.game.gameId}`)
      }
    },
  )

  useEventStream(
    "https://lichess.org/api/board/seek",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: "Bearer " + lichessAccount.access_token,
      },
      body: new URLSearchParams({
        rated: searchParams.get("rated") === "true" ? "true" : "false",
        variant: "standard",
        ratingRange: "",
        time: searchParams.get("time") ?? "",
        increment: searchParams.get("increment") ?? "",
        color: searchParams.get("color") ?? "",
      }),
    },
    () => {},
  )

  return <ChessGameSkeleton />
}
