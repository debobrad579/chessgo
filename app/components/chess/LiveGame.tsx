import { useUser } from "@/context/UserContext"
import { useRef, useState } from "react"
import { useWebSocket } from "@/hooks/useWebSocket"
import { ChessGame, type ChessGameHandle } from "./game"
import type { Game, GameReturnType } from "./types"

export const defaultGame: Game = {
  moves: [],
  result: "*",
  white: null,
  black: null,
  time_control: {
    base: 600000,
    increment: 0,
  },
}

export function LiveGame({ gameID }: { gameID: string }) {
  const { user } = useUser()
  const [game, setGameData] = useState(defaultGame)
  const [thinkTime, setThinkTime] = useState(0)
  const chessGameRef = useRef<ChessGameHandle>(null)

  const { readyState, sendJsonMessage } = useWebSocket(
    `/games/${gameID}`,
    (event) => {
      const parsed: GameReturnType = JSON.parse(event.data)
      setGameData(parsed.game)
      setThinkTime(parsed.think_time)
    },
  )

  return (
    <div>
      {readyState}
      <br />
      {user != null ? <h1>User: {user.name}</h1> : <h1>No user logged in</h1>}
      <ChessGame
        ref={chessGameRef}
        gameData={game}
        thinkTime={thinkTime}
        onMove={(move) => {
          if (!chessGameRef.current?.makeMove(move)) return
          sendJsonMessage(move)
        }}
      />
    </div>
  )
}
