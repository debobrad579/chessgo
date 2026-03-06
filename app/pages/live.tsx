import { ChessGame, ChessGameHandle } from "@/components/chess/game"
import { Game, GameData } from "@/types/chess"
import { useWebSocket } from "@/hooks/useWebSocket"
import { useRef, useState } from "react"
import { useParams } from "react-router"
import { ChessGameSkeleton } from "@/components/chess/game/ChessGameSkeleton"

export default function LivePage() {
  const { gameID } = useParams()

  const [gameData, setGameData] = useState<Game | null>(null)
  const [pendingDrawOffer, setPendingDrawOffer] = useState<"w" | "b" | "n">("n")
  const chessGameRef = useRef<ChessGameHandle>(null)

  const { sendJsonMessage } = useWebSocket(`/api/live/${gameID}`, (event) => {
    const parsed: GameData = JSON.parse(event.data)
    setGameData(parsed)
    setPendingDrawOffer(parsed.pending_draw_offer)
  })

  return gameData != null ? (
    <ChessGame
      ref={chessGameRef}
      gameData={gameData}
      onMove={(move) => {
        if (chessGameRef.current?.makeMove(move)) {
          sendJsonMessage({
            type: "move",
            payload: move,
          })
        }
      }}
      handleResign={() => sendJsonMessage({ type: "resign" })}
      handleOfferDraw={() => sendJsonMessage({ type: "draw_offer" })}
      handleRespondToDrawOffer={(accept) => {
        sendJsonMessage({ type: "draw_response", payload: { accept } })
      }}
      pendingDrawOffer={pendingDrawOffer}
    />
  ) : (
    <ChessGameSkeleton />
  )
}
