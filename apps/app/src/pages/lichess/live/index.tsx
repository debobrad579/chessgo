import { useParams } from "react-router"
import { GameOverModal } from "./GameOverModal"
import { NotFound } from "@/components/errors/NotFound"
import { useEffect, useRef, useState } from "react"
import type { Player, Game, Move } from "@/types/chess"
import { useUser } from "@/context/UserContext"
import { ChessGameSkeleton } from "@/components/chess/game/ChessGameSkeleton"
import { ChessGame, type ChessGameHandle } from "@/components/chess/game"
import { useEventStream } from "@/hooks/useEventStream"
import { useLichessAccount } from "@/context/LichessContext"
import { Unauthorized } from "@/components/errors/Unauthorized"
import type { GameState, LichessBoardStreamEvent } from "../types"
import { Chess } from "chess.js"

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

  function updateGameState(state: GameState, white?: Player, black?: Player) {
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
        result: "*",
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

      return game
    })
    setResultReason(state.status)
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
    setModalOpen(gameData?.result != null && gameData.result !== "*")
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
      />
      <ChessGame
        ref={chessGameRef}
        gameData={gameData}
        onMove={(move) => {
          if (chessGameRef.current?.makeMove(move)) {
            fetch(
              `https://lichess.org/api/board/game/${gameID}/move/${move.from}${move.to}${move.promotion}`,
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
