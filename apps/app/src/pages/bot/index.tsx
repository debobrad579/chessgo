import { GameOverModal } from "./GameOverModal"
import { useEffect, useRef, useState } from "react"
import { assertBotGame, type Game } from "@/types/chess"
import { useUser } from "@/context/UserContext"
import { ChessGameSkeleton } from "@/components/chess/game/ChessGameSkeleton"
import { useWebSocket } from "@/hooks/useWebSocket"
import { ChessGame, type ChessGameHandle } from "@/components/chess/game"
import { API_BASE } from "@/lib/api"

const PING_TIMEOUT_MS = 90_000

export default function BotPage() {
  const user = useUser()
  const [modalOpen, setModalOpen] = useState(true)
  const [gameData, setGameData] = useState<Game | null>(null)
  const [connected, setConnected] = useState(false)
  const [resultReason, setResultReason] = useState("")
  const chessGameRef = useRef<ChessGameHandle>(null)
  const pingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const { sendJsonMessage, readyState } = useWebSocket(
    `${API_BASE.replace(/^http/, "ws")}/bot`,
    (event) => {
      const data: unknown = JSON.parse(event.data)
      assertBotGame(data)
      const { result_reason, ...game } = data
      setGameData(game)
      setResultReason(result_reason)
    },
  )

  useEffect(() => {
    if (gameData != null && gameData.result !== "*") return
    if (readyState !== "Open") return

    function schedulePing() {
      if (pingTimeoutRef.current) clearTimeout(pingTimeoutRef.current)

      pingTimeoutRef.current = setTimeout(() => {
        sendJsonMessage({ type: "ping" })
        schedulePing()
      }, PING_TIMEOUT_MS)
    }

    schedulePing()

    return () => {
      if (pingTimeoutRef.current) clearTimeout(pingTimeoutRef.current)
    }
  }, [readyState, gameData?.result])

  useEffect(() => {
    setModalOpen(gameData?.result != null && gameData.result !== "*")
  }, [gameData?.result])

  useEffect(() => {
    if (user.id === gameData?.white.id) {
      setConnected(readyState === "Open")
    }
  }, [readyState, gameData?.white.id, gameData?.black.id, user.id])

  return gameData != null ? (
    <>
      <GameOverModal
        open={modalOpen}
        setOpen={setModalOpen}
        result={
          gameData.result === "1/2-1/2"
            ? "draw"
            : gameData.result === "1-0"
              ? user.id === gameData.white.id
                ? "win"
                : "loss"
              : user.id === gameData.black.id
                ? "win"
                : "loss"
        }
        reason={resultReason}
        handleRematch={() => {
          sendJsonMessage({ type: "rematch_request" })
        }}
      />
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
        whiteConnected={user.id === gameData.white.id ? connected : undefined}
        blackConnected={user.id === gameData.black.id ? connected : undefined}
        noClocks
      />
    </>
  ) : (
    <ChessGameSkeleton />
  )
}
