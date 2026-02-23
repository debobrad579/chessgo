import { ChessGame, type ChessGameHandle } from "./game"
import useWebSocket, { ReadyState } from "react-use-websocket"
import { useUser } from "@/user-context"
import { useEffect, useRef } from "react"
import type { Game } from "./types"

export const sampleGame: Game = {
  moves: ["e4", "c5", "Nf3", "e6", "d4", "cxd4", "Nxd4", "Nf6", "Nc3", "Nc6"],
  result: "1-0",
  white: {
    name: "AliceBot",
    elo: "1850",
    title: "WFM",
    timestamps: [5, 12, 20, 28],
  },
  black: {
    name: "StockfishTest",
    elo: "1900",
    timestamps: [6, 15, 24],
  },
}

export function LiveGame() {
  const { user } = useUser()

  const { sendMessage, lastMessage, readyState } = useWebSocket("/ws")

  useEffect(() => {
    if (lastMessage != null) {
      console.log(`New message: ${lastMessage.data}`)
    }
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
        gameData={sampleGame}
        onMove={(move) => {
          if (!chessGameRef.current?.makeMove(move)) return

          sendMessage(`from ${move.from} to ${move.to}`)
        }}
      />
    </div>
  )
}
