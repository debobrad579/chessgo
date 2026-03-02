import { ChessGame, ChessGameHandle } from "@/components/chess/game"
import { GameData } from "@/types/chess"
import { useWebSocket } from "@/hooks/useWebSocket"
import { useRef, useState } from "react"
import { useParams } from "react-router"

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

export default function LivePage() {
  const { gameID } = useParams()

  const [game, setGameData] = useState(defaultGame)
  const chessGameRef = useRef<ChessGameHandle>(null)

  const { sendJsonMessage } = useWebSocket(`/live/${gameID}`, (event) => {
    const parsed: GameData = JSON.parse(event.data)
    setGameData(parsed)
  })

  return (
    <ChessGame
      ref={chessGameRef}
      gameData={game}
      onMove={(move) => {
        if (chessGameRef.current?.makeMove(move)) {
          sendJsonMessage(move)
        }
      }}
    />
  )
}
