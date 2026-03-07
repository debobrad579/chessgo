import { useParams } from "react-router"
import { GameOverModal } from "./GameOverModal"
import { NotFound } from "@/components/errors/NotFound"
import { useEffect, useRef, useState } from "react"
import type { GameData } from "@/types/chess"
import { useUser } from "@/context/UserContext"
import { ChessGameSkeleton } from "@/components/chess/game/ChessGameSkeleton"
import { useWebSocket } from "@/hooks/useWebSocket"
import { ChessGame, ChessGameHandle } from "@/components/chess/game"

export default function LivePage() {
  const user = useUser()
  const { gameID } = useParams()
  const [modalOpen, setModalOpen] = useState(true)
  const [gameData, setGameData] = useState<GameData | null>(null)
  const [whiteConnected, setWhiteConnected] = useState(false)
  const [blackConnected, setBlackConnected] = useState(false)
  const chessGameRef = useRef<ChessGameHandle>(null)

  const { sendJsonMessage, readyState } = useWebSocket(
    `/api/live/${gameID}`,
    (event) => {
      const parsed: GameData = JSON.parse(event.data)
      setGameData(parsed)
    },
  )

  useEffect(() => {
    setModalOpen(gameData?.result != null && gameData.result.result !== "*")
  }, [gameData?.result])

  useEffect(() => {
    if (user.id === gameData?.white.id) {
      setWhiteConnected(readyState === "Open")
    } else if (user.id === gameData?.black.id) {
      setBlackConnected(readyState === "Open")
    }
  }, [readyState, gameData?.white.id, gameData?.black.id, user.id])

  if (gameID == null) {
    return <NotFound />
  }

  return gameData != null ? (
    <>
      <GameOverModal
        open={modalOpen}
        setOpen={setModalOpen}
        result={
          gameData.result.result === "1/2-1/2"
            ? "draw"
            : gameData.result.result === "1-0"
              ? user.id === gameData.white.id
                ? "win"
                : "loss"
              : user.id === gameData.black.id
                ? "win"
                : "loss"
        }
        reason={gameData.result.reason}
        timeControl={gameData.time_control}
      />
      <ChessGame
        ref={chessGameRef}
        gameData={{
          id: gameData.id,
          moves: gameData.moves,
          white: gameData.white,
          black: gameData.black,
          think_time: gameData.think_time,
          time_control: gameData.time_control,
          result: gameData.result.result,
        }}
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
        pendingDrawOffer={gameData.pending_draw_offer}
        whiteConnected={whiteConnected}
        blackConnected={blackConnected}
      />
    </>
  ) : (
    <ChessGameSkeleton />
  )
}
