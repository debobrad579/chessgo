import { useNavigate, useParams } from "react-router"
import { GameOverModal } from "./GameOverModal"
import { NotFound } from "@/components/errors/NotFound"
import { useEffect, useRef, useState } from "react"
import type { Game } from "@/types/chess"
import { useUser } from "@/context/UserContext"
import { ChessGameSkeleton } from "@/components/chess/game/ChessGameSkeleton"
import { useWebSocket } from "@/hooks/useWebSocket"
import { ChessGame, type ChessGameHandle } from "@/components/chess/game"

type LiveGame = Game & {
  white_connected: boolean
  black_connected: boolean
  result_reason: string
  pending_draw_offer: "w" | "b" | "n"
  rematch_request: "w" | "b" | "n"
  rematch_game_id: string
}

export default function LivePage() {
  const user = useUser()
  const { gameID } = useParams()
  const navigate = useNavigate()
  const [modalOpen, setModalOpen] = useState(true)
  const [gameData, setGameData] = useState<Game | null>(null)
  const [whiteConnected, setWhiteConnected] = useState(false)
  const [blackConnected, setBlackConnected] = useState(false)
  const [resultReason, setResultReason] = useState("")
  const [pendingDrawOffer, setPendingDrawOffer] = useState<"w" | "b" | "n">("n")
  const [rematchRequest, setRematchRequest] = useState<"w" | "b" | "n">("n")
  const chessGameRef = useRef<ChessGameHandle>(null)

  const { sendJsonMessage, readyState } = useWebSocket(
    `/api/live/${gameID}`,
    (event) => {
      const {
        white_connected,
        black_connected,
        result_reason,
        pending_draw_offer,
        rematch_request,
        rematch_game_id,
        ...game
      }: LiveGame = JSON.parse(event.data)
      if (rematch_game_id !== "00000000-0000-0000-0000-000000000000") {
        setGameData(null)
        navigate(`/live/${rematch_game_id}`)
      } else {
        setGameData(game)
        setWhiteConnected(white_connected)
        setBlackConnected(black_connected)
        setResultReason(result_reason)
        setPendingDrawOffer(pending_draw_offer)
        setRematchRequest(rematch_request)
      }
    },
  )

  useEffect(() => {
    if (readyState === "Closed" && gameData == null) {
      navigate(`/games/${gameID}`)
    }
  }, [readyState, gameData])

  useEffect(() => {
    setModalOpen(gameData?.result != null && gameData.result !== "*")
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
        timeControl={gameData.time_control}
        rematchRequest={
          rematchRequest === "n"
            ? "n"
            : rematchRequest === "w"
              ? user.id === gameData.white.id
                ? "outgoing"
                : "incoming"
              : user.id === gameData.black.id
                ? "outgoing"
                : "incoming"
        }
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
        handleOfferDraw={() => sendJsonMessage({ type: "draw_offer" })}
        handleRespondToDrawOffer={(accept) => {
          sendJsonMessage({ type: "draw_response", payload: { accept } })
        }}
        handleRematch={() => {
          sendJsonMessage({ type: "rematch_request" })
        }}
        pendingDrawOffer={pendingDrawOffer}
        rematchRequest={rematchRequest}
        whiteConnected={whiteConnected}
        blackConnected={blackConnected}
      />
    </>
  ) : (
    <ChessGameSkeleton />
  )
}
