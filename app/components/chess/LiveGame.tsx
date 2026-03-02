import { useRef, useState } from "react"
import { useWebSocket } from "@/hooks/useWebSocket"
import { ChessGame, type ChessGameHandle } from "./game"
import type { GameData } from "@/types/chess"

export const defaultGame: GameData = {
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

export function LiveGame({ gameID }: { gameID: string }) {
  const [game, setGameData] = useState(defaultGame)
  const chessGameRef = useRef<ChessGameHandle>(null)

  const { readyState, sendJsonMessage } = useWebSocket(
    `/live/${gameID}`,
    (event) => {
      const parsed: GameData = JSON.parse(event.data)
      setGameData(parsed)
    },
  )

  return (
    <div>
      {readyState}
      <ChessGame
        ref={chessGameRef}
        gameData={game}
        onMove={(move) => {
          if (chessGameRef.current?.makeMove(move)) {
            sendJsonMessage(move)
          }
        }}
      />
    </div>
  )
}
