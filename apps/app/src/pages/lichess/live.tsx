import { useNavigate, useParams } from "react-router"
import { GameOverModal } from "@/components/chess/game/GameOverModal"
import { NotFound } from "@/components/errors/NotFound"
import { useEffect, useRef, useState } from "react"
import type { Player, Game, Move, Result } from "@/types/chess"
import { useUser } from "@/context/UserContext"
import { ChessGameSkeleton } from "@/components/chess/game/ChessGameSkeleton"
import { ChessGame, type ChessGameHandle } from "@/components/chess/game"
import { useEventStream } from "@/hooks/useEventStream"
import { useLichessAccount } from "@/context/LichessContext"
import { Unauthorized } from "@/components/errors/Unauthorized"
import type { GameState, LichessBoardStreamEvent } from "./types"
import { Chess } from "chess.js"
import { useSettings } from "@/context/SettingsContext"
import { seekGame } from "./utils"
import { ResignButton } from "@/components/chess/game/buttons/ResignButton"
import { DrawButton } from "@/components/chess/game/buttons/DrawButton"
import { TakebackButton } from "@/components/chess/game/buttons/TakebackButton"
import { NewGameButton } from "@/components/chess/game/buttons/NewGameButton"
import { AbortButton } from "@/components/chess/game/buttons/AbortButton"

type CastlingRights = {
  K: boolean
  Q: boolean
  k: boolean
  q: boolean
}

function getResult(state: GameState): Result {
  if (
    state.winner == null &&
    (state.status === "stalemate" ||
      state.status === "draw" ||
      state.status === "insufficientMaterialClaim" ||
      state.status === "outoftime")
  ) {
    return "1/2-1/2"
  } else if (
    state.status === "mate" ||
    state.status === "resign" ||
    state.status === "outoftime" ||
    state.status === "timeout" ||
    state.status === "cheat" ||
    state.status === "variantEnd" ||
    state.status === "unknownFinish"
  ) {
    if (state.winner === "white") return "1-0"
    if (state.winner === "black") return "0-1"
  } else if (state.status === "aborted") return "aborted"

  return "*"
}

function getResultReason(state: GameState) {
  if (state.winner != null && state.status === "outoftime") {
    return "timeout"
  }

  switch (state.status) {
    case "stalemate":
      return "stalemate"
    case "outoftime":
    case "insufficientMaterialClaim":
      return "insufficient material"
    case "draw":
      return "agreement"
    case "mate":
      return "checkmate"
    case "resign":
      return "resignation"
    case "timeout":
      return "timeout"
  }

  return "unknown"
}

export default function LichessLivePage() {
  const { gameID } = useParams()
  if (gameID == null) return <NotFound />
  return <LichessLiveGame key={gameID} gameID={gameID} />
}

function LichessLiveGame({ gameID }: { gameID: string }) {
  const lichessAccount = useLichessAccount()
  if (!lichessAccount.connected) return <Unauthorized />

  const user = useUser()
  const navigate = useNavigate()
  const { showGameOverModal, playGameOverSound } = useSettings()
  const [modalOpen, setModalOpen] = useState(false)
  const [gameData, setGameData] = useState<Game | null>(null)
  const [whiteConnected, setWhiteConnected] = useState(false)
  const [blackConnected, setBlackConnected] = useState(false)
  const [resultReason, setResultReason] = useState("")
  const [pendingDrawOffer, setPendingDrawOffer] = useState<"w" | "b" | "n">("n")
  const [pendingTakeback, setPendingTakeback] = useState<"w" | "b" | "n">("n")
  const chessGameRef = useRef<ChessGameHandle>(null)
  const castlingRights = useRef<CastlingRights>({
    K: true,
    Q: true,
    k: true,
    q: true,
  })
  const [rated, setRated] = useState(false)
  const [isNewGameLoading, setIsNewGameLoading] = useState(false)
  const abortControllerRef = useRef<AbortController>(null)
  const audioRef = useRef<HTMLAudioElement>(null)

  function updateGameState(
    state: GameState,
    white?: Player,
    black?: Player,
    initial?: number,
    increment?: number,
  ) {
    setGameData((prevGame) => {
      const w = white ?? prevGame?.white
      const b = black ?? prevGame?.black
      const time =
        initial != null ? initial * 60_000 : prevGame?.time_control.base
      const inc =
        increment != null ? increment * 1000 : prevGame?.time_control.increment
      if (w == null || b == null || time == null || inc == null) return prevGame

      const game: Game = {
        id: gameID ?? "",
        time_control: { base: time, increment: inc },
        white: w,
        black: b,
        moves: [],
        result: getResult(state),
        think_time: 0,
      }

      const tempGame = new Chess()
      state.moves.split(" ").forEach((moveString) => {
        if (moveString.length < 4) return

        const from = moveString.slice(0, 2)
        let to = moveString.slice(2, 4)

        if (from === "e1" && tempGame.get("e1")?.type === "k") {
          if (to === "h1") {
            to = "g1"
          } else if (to === "a1") {
            to = "c1"
          }
        } else if (from === "e8" && tempGame.get("e8")?.type === "k") {
          if (to === "h8") {
            to = "g8"
          } else if (to === "a8") {
            to = "c8"
          }
        }

        const promotion =
          moveString.length === 5
            ? (moveString[4] as "q" | "r" | "b" | "n")
            : undefined

        const move: Move = {
          from: from,
          to: to,
          timestamp: tempGame.turn() === "w" ? state.wtime : state.btime,
          promotion: promotion,
        }

        tempGame.move(move)
        game.moves.push(move)
      })

      const wCastling = tempGame.getCastlingRights("w")
      const bCastling = tempGame.getCastlingRights("b")

      castlingRights.current = {
        K: wCastling.k,
        Q: wCastling.q,
        k: bCastling.k,
        q: bCastling.q,
      }

      return game
    })

    setPendingDrawOffer(state.wdraw ? "w" : state.bdraw ? "b" : "n")
    setPendingTakeback(state.wtakeback ? "w" : state.btakeback ? "b" : "n")
    setResultReason(getResultReason(state))
  }

  const connected = useEventStream<LichessBoardStreamEvent>(
    `https://lichess.org/api/board/game/stream/${gameID}`,
    {
      headers: {
        Authorization: `Bearer ${lichessAccount.access_token}`,
      },
    },
    (event) => {
      switch (event.type) {
        case "gameState": {
          updateGameState(event)
          break
        }
        case "chatLine": {
          break
        }
        case "opponentGone": {
          if (gameData == null) return
          if (gameData.white.id === user.id) {
            setBlackConnected(!event.gone)
          } else {
            setWhiteConnected(!event.gone)
          }
          break
        }
        default: {
          let white: Player
          let black: Player
          if (event.white.id === lichessAccount.id) {
            white = {
              id: user.id,
              name: user.name,
              rating: event.white.rating,
            }
            black = {
              id: event.black.id,
              name: event.black.name,
              rating: event.black.rating,
            }
            setBlackConnected(true)
          } else {
            black = {
              id: user.id,
              name: user.name,
              rating: event.black.rating,
            }
            white = {
              id: event.white.id,
              name: event.white.name,
              rating: event.white.rating,
            }
            setWhiteConnected(true)
          }
          updateGameState(
            event.state,
            white,
            black,
            (event.clock?.initial ?? 600_000) / 60_000,
            (event.clock?.increment ?? 0) / 1000,
          )
          setRated(event.rated)
          break
        }
      }
    },
  )

  useEffect(() => {
    if (gameData != null && gameData.result !== "*") {
      if (showGameOverModal) setModalOpen(true)
      if (
        playGameOverSound &&
        navigator.userActivation.hasBeenActive &&
        audioRef.current != null
      )
        void audioRef.current.play()
    } else setModalOpen(false)
  }, [gameData?.result])

  useEffect(() => {
    if (user.id === gameData?.white.id) {
      setWhiteConnected(connected)
    } else if (user.id === gameData?.black.id) {
      setBlackConnected(connected)
    }
  }, [connected, gameData?.white.id, gameData?.black.id, user.id])

  if (gameID == null) {
    return <NotFound />
  }

  function handleNewGame() {
    if (!lichessAccount.connected || gameData == null) return

    if (isNewGameLoading && abortControllerRef.current != null) {
      abortControllerRef.current.abort()
      return
    }

    const controller = new AbortController()
    abortControllerRef.current = controller
    controller.signal.addEventListener("abort", () => {
      setIsNewGameLoading(false)
    })

    setIsNewGameLoading(true)

    seekGame(
      lichessAccount.access_token,
      {
        rated: String(rated),
        time: String(gameData.time_control.base / 60000),
        increment: String(gameData.time_control.increment / 1000),
        color: "random",
      },
      controller,
    )
      .then((gameId) => {
        setIsNewGameLoading(false)

        if (gameId != null) {
          navigate(`/lichess/live/${gameId}`)
        }
      })
      .catch(() => setIsNewGameLoading(false))
  }

  return gameData != null ? (
    <>
      <GameOverModal
        open={modalOpen}
        setOpen={setModalOpen}
        result={
          gameData.result === "aborted"
            ? "aborted"
            : gameData.result === "1/2-1/2"
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
        handleNewGame={handleNewGame}
        isNewGameLoading={isNewGameLoading}
      />
      <ChessGame
        ref={chessGameRef}
        gameData={gameData}
        onMove={(move) => {
          if (chessGameRef.current?.makeMove(move)) {
            const from = move.from
            let to = move.to

            if (from === "e1") {
              if (castlingRights.current.K && to === "g1") {
                to = "h1"
              } else if (castlingRights.current.Q && to === "c1") {
                to = "a1"
              }
            } else if (from === "e8") {
              if (castlingRights.current.k && to === "g8") {
                to = "h8"
              } else if (castlingRights.current.q && to === "c8") {
                to = "a8"
              }
            }

            fetch(
              `https://lichess.org/api/board/game/${gameID}/move/${from}${to}${move.promotion}`,
              {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${lichessAccount.access_token}`,
                },
              },
            )
          }
        }}
        whiteConnected={gameData.result === "*" ? whiteConnected : undefined}
        blackConnected={gameData.result === "*" ? blackConnected : undefined}
        clockType="lichess"
        gameButtons={[
          <ResignButton
            handleResign={() => {
              fetch(`https://lichess.org/api/board/game/${gameID}/resign`, {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${lichessAccount.access_token}`,
                },
              })
            }}
            hidden={gameData.moves.length < 2 || gameData.result !== "*"}
            key="resign-button"
          />,
          <AbortButton
            handleAbort={() => {
              fetch(`https://lichess.org/api/board/game/${gameID}/abort`, {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${lichessAccount.access_token}`,
                },
              })
            }}
            hidden={gameData.moves.length >= 2 || gameData.result !== "*"}
            key="resign-button"
          />,
          <DrawButton
            playerColor={user.id === gameData.white.id ? "w" : "b"}
            pendingDrawOffer={pendingDrawOffer}
            handleOfferDraw={() => {
              fetch(`https://lichess.org/api/board/game/${gameID}/draw/yes`, {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${lichessAccount.access_token}`,
                },
              })
            }}
            handleRespondToDrawOffer={(accept: boolean) => {
              fetch(
                `https://lichess.org/api/board/game/${gameID}/draw/${accept ? "yes" : "no"}`,
                {
                  method: "POST",
                  headers: {
                    Authorization: `Bearer ${lichessAccount.access_token}`,
                  },
                },
              )
            }}
            disabled={gameData.moves.length < 2}
            hidden={gameData.result !== "*"}
            key="draw-button"
          />,
          <TakebackButton
            playerColor={user.id === gameData.white.id ? "w" : "b"}
            pendingTakeback={pendingTakeback}
            handleTakeback={(accept: boolean) => {
              fetch(
                `https://lichess.org/api/board/game/${gameID}/takeback/${accept ? "yes" : "no"}`,
                {
                  method: "POST",
                  headers: {
                    Authorization: `Bearer ${lichessAccount.access_token}`,
                  },
                },
              )
            }}
            disabled={gameData.moves.length < 2}
            hidden={gameData.result !== "*"}
            key="takeback-button"
          />,
          <NewGameButton
            timeControl={gameData.time_control}
            isLoading={isNewGameLoading}
            handleNewGame={handleNewGame}
            hidden={gameData.result === "*"}
            key="new-game-button"
          />,
        ]}
      />
      <audio src="/sounds/notify.mp3" ref={audioRef} />
    </>
  ) : (
    <ChessGameSkeleton />
  )
}
