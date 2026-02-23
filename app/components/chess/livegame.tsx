import { ChessGame, type ChessGameHandle } from "./game"
import useWebSocket, { ReadyState } from "react-use-websocket"
import { useUser } from "@/user-context"
import { useEffect, useRef, useState } from "react"
import type { Game } from "./types"

export const defaultGame: Game = {
  moves: [],
  result: "*",
  white: {
    name: "White",
    elo: "1500",
  },
  black: {
    name: "Black",
    elo: "1500",
  },
}

export function LiveGame() {
  const [game, setGameData] = useState(defaultGame)
  const { user } = useUser()

  const { sendJsonMessage, lastMessage, readyState } = useWebSocket("/ws")

  useEffect(() => {
    if (!lastMessage) return
    const data: Game = JSON.parse(lastMessage.data)
    setGameData(data)
  }, [lastMessage])

  const chessGameRef = useRef<ChessGameHandle>(null)

  const connectionStatus = {
    [ReadyState.CONNECTING]: "Connecting",
    [ReadyState.OPEN]: "Open",
    [ReadyState.CLOSING]: "Closing",
    [ReadyState.CLOSED]: "Closed",
    [ReadyState.UNINSTANTIATED]: "Uninstantiated",
  }[readyState]

  return (
    <div>
      {connectionStatus}
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
