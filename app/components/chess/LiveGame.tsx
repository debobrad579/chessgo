import { useUser } from "@/context/UserContext"
import { useRef, useState } from "react"
import { useWebSocket } from "@/hooks/useWebSocket"
import { ChessGame, type ChessGameHandle } from "./game"
import type { Game } from "./types"

export const defaultGame: Game = {
  moves: [],
  result: "*",
  white: { name: "White", elo: "1500" },
  black: { name: "Black", elo: "1500" },
}

export function LiveGame() {
  const { user } = useUser()
  const [game, setGameData] = useState(defaultGame)
  const chessGameRef = useRef<ChessGameHandle>(null)
  const { readyState, sendJsonMessage } = useWebSocket("/ws", (event) => {
    if (event.data) {
      const data: Game = JSON.parse(event.data)
      setGameData(data)
    }
  })

  return (
    <div>
      {readyState}
      <br />
      {user != null ? <h1>User: {user.Name}</h1> : <h1>No user logged in</h1>}
      <ChessGame
        ref={chessGameRef}
        gameData={game}
        onMove={(move) => {
          if (!chessGameRef.current?.makeMove(move)) return
          sendJsonMessage(move)
        }}
      />
    </div>
  )
}
