import { useNavigate, useParams } from "react-router"
import { GameOverModal } from "@/components/chess/game/GameOverModal"
import { NotFound } from "@/components/errors/NotFound"
import { useEffect, useRef, useState } from "react"
import { assertLiveGame, type Game } from "@/types/chess"
import { useUser } from "@/context/UserContext"
import { ChessGameSkeleton } from "@/components/chess/game/ChessGameSkeleton"
import { useWebSocket } from "@/hooks/useWebSocket"
import { ChessGame, type ChessGameHandle } from "@/components/chess/game"
import { playerExists } from "@/components/chess/game/utils"
import { API_BASE } from "@/lib/api"
import { useSettings } from "@/context/SettingsContext"
import { ResignButton } from "@/components/chess/game/buttons/ResignButton"
import { DrawButton } from "@/components/chess/game/buttons/DrawButton"
import { NewGameButton } from "@/components/chess/game/buttons/NewGameButton"
import { RematchButton } from "@/components/chess/game/buttons/RematchButton"

const PING_TIMEOUT_MS = 90_000

export default function LivePage() {
  const { gameID } = useParams()
  if (gameID == null) return <NotFound />
  return <LiveGame key={gameID} gameID={gameID} />
}

function LiveGame({ gameID }: { gameID: string }) {
  const user = useUser()
  const { showGameOverModal, playGameOverSound } = useSettings()
  const navigate = useNavigate()
  const [modalOpen, setModalOpen] = useState(false)
  const [gameData, setGameData] = useState<Game | null>(null)
  const [whiteConnected, setWhiteConnected] = useState(false)
  const [blackConnected, setBlackConnected] = useState(false)
  const [resultReason, setResultReason] = useState("")
  const [pendingDrawOffer, setPendingDrawOffer] = useState<"w" | "b" | "n">("n")
  const [rematchRequest, setRematchRequest] = useState<"w" | "b" | "n">("n")
  const chessGameRef = useRef<ChessGameHandle>(null)
  const pingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const audioRef = useRef<HTMLAudioElement>(null)

  const { sendJsonMessage, readyState } = useWebSocket(
    `${API_BASE.replace(/^http/, "ws")}/live/${gameID}`,
    (event) => {
      const data: unknown = JSON.parse(event.data)
      assertLiveGame(data)
      const {
        white_connected,
        black_connected,
        result_reason,
        pending_draw_offer,
        rematch_request,
        rematch_game_id,
        ...game
      } = data
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
    if (readyState === "Closed" && gameData == null) {
      navigate(`/games/${gameID}`)
    }
  }, [readyState, gameData])

  useEffect(() => {
    if (gameData != null && gameData.result !== "*") {
      if (showGameOverModal) setModalOpen(true)
      if (
        playGameOverSound &&
        navigator.userActivation.hasBeenActive &&
        audioRef.current != null
      )
        audioRef.current.play()
    } else setModalOpen(false)
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

  function handleNewGame() {
    if (gameData == null) return

    fetch(`${API_BASE}/live`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        color: "random",
        time: String(Math.floor(gameData.time_control.base / 60000)),
        increment: String(Math.floor(gameData.time_control.increment / 1000)),
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        navigate(`/live/${data?.game_id}`, { replace: true })
      })
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
        handleNewGame={handleNewGame}
      />
      <ChessGame
        ref={chessGameRef}
        gameData={gameData}
        onMove={(move) => {
          if (!playerExists(gameData.white) || !playerExists(gameData.black))
            return

          if (chessGameRef.current?.makeMove(move)) {
            sendJsonMessage({
              type: "move",
              payload: move,
            })
          }
        }}
        whiteConnected={whiteConnected}
        blackConnected={blackConnected}
        clockType="per-move"
        gameButtons={[
          gameData.result === "*" && (
            <ResignButton
              handleResign={() => sendJsonMessage({ type: "resign" })}
              disabled={gameData.moves.length === 0}
              key="resign-button"
            />
          ),
          gameData.result === "*" && (
            <DrawButton
              playerColor={user.id === gameData.white.id ? "w" : "b"}
              pendingDrawOffer={pendingDrawOffer}
              handleOfferDraw={() => sendJsonMessage({ type: "draw_offer" })}
              handleRespondToDrawOffer={(accept: boolean) => {
                sendJsonMessage({ type: "draw_response", payload: { accept } })
              }}
              disabled={gameData.moves.length === 0}
              key="draw-button"
            />
          ),
          gameData.result !== "*" && (
            <NewGameButton
              handleNewGame={handleNewGame}
              timeControl={gameData.time_control}
              key="new-game-button"
            />
          ),
          gameData.result !== "*" && (
            <RematchButton
              playerColor={user.id === gameData.white.id ? "w" : "b"}
              handleRematch={() => sendJsonMessage({ type: "rematch_request" })}
              rematchRequest={rematchRequest}
              key="rematch-button"
            />
          ),
        ]}
      />
      <audio src="/sounds/notify.mp3" ref={audioRef} />
    </>
  ) : (
    <ChessGameSkeleton />
  )
}
