import { useParams } from "react-router"
import { GameOverModal } from "./GameOverModal"
import { NotFound } from "@/components/errors/NotFound"
import { useEffect, useRef, useState } from "react"
import type { Player, Game, Move, Result } from "@/types/chess"
import { useUser } from "@/context/UserContext"
import { ChessGameSkeleton } from "@/components/chess/game/ChessGameSkeleton"
import { ChessGame, type ChessGameHandle } from "@/components/chess/game"
import { useEventStream } from "@/hooks/useEventStream"
import { useLichessAccount } from "@/context/LichessContext"
import { Unauthorized } from "@/components/errors/Unauthorized"
import type { GameState, GameStatus, LichessBoardStreamEvent } from "../types"
import { Chess } from "chess.js"

type CastlingRights = {
  K: boolean
  Q: boolean
  k: boolean
  q: boolean
}

function getResult(state: GameState): Result {
  if (
    state.status === "stalemate" ||
    state.status === "draw" ||
    state.status === "insufficientMaterialClaim"
  ) {
    return "1/2-1/2"
  }

  if (
    state.status === "mate" ||
    state.status === "resign" ||
    state.status === "timeout" ||
    state.status === "outoftime" ||
    state.status === "cheat" ||
    state.status === "variantEnd" ||
    state.status === "unknownFinish"
  ) {
    if (state.winner === "white") return "1-0"
    if (state.winner === "black") return "0-1"
  }

  return "*"
}

function getResultReason(status: GameStatus) {
  switch (status) {
    case "stalemate":
      return "Stalemate"
    case "insufficientMaterialClaim":
      return "Insufficient Materal"
    case "draw":
      return "Agreement"
    case "mate":
      return "Checkmate"
    case "resign":
      return "Resignation"
    case "outoftime":
    case "timeout":
      return "Timeout"
  }

  return "Unknown Finish"
}

export default function LichessLivePage() {
  const lichessAccount = useLichessAccount()

  if (!lichessAccount.connected) {
    return <Unauthorized />
  }

  const user = useUser()
  const { gameID } = useParams()
  const [modalOpen, setModalOpen] = useState(true)
  const [gameData, setGameData] = useState<Game | null>(null)
  const [whiteConnected, setWhiteConnected] = useState(false)
  const [blackConnected, setBlackConnected] = useState(false)
  const [resultReason, setResultReason] = useState("")
  const [pendingDrawOffer, setPendingDrawOffer] = useState<"w" | "b" | "n">("n")
  const chessGameRef = useRef<ChessGameHandle>(null)
  const castlingRights = useRef<CastlingRights>({
    K: true,
    Q: true,
    k: true,
    q: true,
  })
  const [aborted, setAborted] = useState(false)

  function updateGameState(state: GameState, white?: Player, black?: Player) {
    if (state.status === "aborted") {
      setAborted(true)
    }

    setGameData((prevGame) => {
      const w = white ?? prevGame?.white
      const b = black ?? prevGame?.black
      if (!w || !b) return prevGame

      const game: Game = {
        id: gameID ?? "",
        time_control: { base: 10, increment: 0 },
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
    setResultReason(getResultReason(state.status))
  }

  const connected = useEventStream<LichessBoardStreamEvent>(
    `https://lichess.org/api/board/game/stream/${gameID}`,
    {
      headers: {
        Authorization: `Bearer ${lichessAccount.access_token}`,
      },
    },
    (event) => {
      console.log(event)

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
            }
            black = {
              id: event.black.id,
              name: event.black.name,
            }
            setBlackConnected(true)
          } else {
            black = {
              id: user.id,
              name: user.name,
            }
            white = {
              id: event.white.id,
              name: event.white.name,
            }
            setWhiteConnected(true)
          }
          updateGameState(event.state, white, black)
          break
        }
      }
    },
  )

  useEffect(() => {
    setModalOpen(aborted || gameData?.result !== "*")
  }, [gameData?.result, aborted])

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

  return gameData != null ? (
    <>
      <GameOverModal
        open={modalOpen}
        setOpen={setModalOpen}
        result={
          aborted
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
        handleResign={() => {
          fetch(`https://lichess.org/api/board/game/${gameID}/resign`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${lichessAccount.access_token}`,
            },
          })
        }}
        handleOfferDraw={() => {
          fetch(`https://lichess.org/api/board/game/${gameID}/draw/yes`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${lichessAccount.access_token}`,
            },
          })
        }}
        handleRespondToDrawOffer={(accept) => {
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
        pendingDrawOffer={pendingDrawOffer}
        whiteConnected={whiteConnected}
        blackConnected={blackConnected}
      />
    </>
  ) : (
    <ChessGameSkeleton />
  )
}
