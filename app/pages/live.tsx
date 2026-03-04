import { ChessGame, ChessGameHandle } from "@/components/chess/game"
import { Game, GameData } from "@/types/chess"
import { useWebSocket } from "@/hooks/useWebSocket"
import { useRef, useState } from "react"
import { useParams } from "react-router"

export const defaultGame: Game = {
  moves: [],
  think_time: 0,
  result: "*",
  white: {
    id: "",
    name: "White",
  },
  black: {
    id: "",
    name: "Black",
  },
  time_control: {
    base: 600000,
    increment: 0,
  },
}

export default function LivePage() {
  const { gameID } = useParams()

  const [gameData, setGameData] = useState(defaultGame)
  const [pendingDrawOffer, setPendingDrawOffer] = useState<"w" | "b" | "n">("n")
  const chessGameRef = useRef<ChessGameHandle>(null)

  const { sendJsonMessage } = useWebSocket(`/live/${gameID}`, (event) => {
    const parsed: GameData = JSON.parse(event.data)
    setGameData(parsed)
    setPendingDrawOffer(parsed.pending_draw_offer)
  })

  return (
    <ChessGame
      ref={chessGameRef}
      gameData={gameData}
      onMove={(move) => {
        if (chessGameRef.current?.makeMove(move)) {
          sendJsonMessage({ type: "move", payload: move })
        }
      }}
      handleResign={() => sendJsonMessage({ type: "resign" })}
      handleOfferDraw={() => sendJsonMessage({ type: "draw_offer" })}
      handleRespondToDrawOffer={(accept) => {
        sendJsonMessage({ type: "draw_response", payload: { accept } })
      }}
      pendingDrawOffer={pendingDrawOffer}
    />
  )
}
