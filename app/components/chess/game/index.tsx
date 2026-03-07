import { type Dispatch, type SetStateAction, forwardRef } from "react"
import type { Game, Move, Player, Result, TimeControl } from "@/types/chess"
import type { ChessboardProps } from "../board"
import { useMediaQuery } from "@/hooks/useMediaQuery"
import { useChessGame } from "./useChessGame"
import { Chess } from "chess.js"
import { DesktopGameView } from "./DesktopGameView"
import { MobileGameView } from "./MobileGameView"
import { ChessGameProvider } from "./ChessGameContext"

export type ChessGameProps = {
  moves: Move[]
  result: Result
  thinkTime: number
  undoCount: number
  setUndoCount: Dispatch<SetStateAction<number>>
  white: Player
  black: Player
  timeControl: TimeControl
  game: Chess
  onMove?: (move: Move) => void
  handleResign?: () => void
  handleOfferDraw?: () => void
  handleRespondToDrawOffer?: (accept: boolean) => void
  pendingDrawOffer?: "w" | "b" | "n"
  rematchRequest?: "w" | "b" | "n"
  handleRematch?: () => void
  whiteConnected?: boolean
  blackConnected?: boolean
}

export type ChessGameHandle = {
  makeMove: (move: Move) => void
}

export const ChessGame = forwardRef<
  ChessGameHandle,
  {
    gameData: Game
    onMove?: ChessboardProps["onMove"]
    handleResign?: () => void
    handleOfferDraw?: () => void
    handleRespondToDrawOffer?: (accept: boolean) => void
    pendingDrawOffer?: "w" | "b" | "n"
    rematchRequest?: "w" | "b" | "n"
    handleRematch?: () => void
    whiteConnected?: boolean
    blackConnected?: boolean
  }
>(function Game(
  {
    gameData,
    onMove,
    handleResign,
    handleOfferDraw,
    handleRespondToDrawOffer,
    pendingDrawOffer,
    rematchRequest,
    handleRematch,
    whiteConnected,
    blackConnected,
  },
  ref,
) {
  const {
    game,
    optimisticMoves,
    optimisticThinkTime,
    undoCount,
    setUndoCount,
  } = useChessGame(gameData, ref)

  const mobile = useMediaQuery("(orientation: portrait)")

  return (
    <ChessGameProvider
      value={{
        moves: optimisticMoves,
        result: gameData.result,
        thinkTime: optimisticThinkTime,
        white: gameData.white,
        black: gameData.black,
        timeControl: gameData.time_control,
        undoCount,
        setUndoCount,
        game,
        onMove,
        handleResign,
        handleOfferDraw,
        handleRespondToDrawOffer,
        rematchRequest,
        handleRematch,
        pendingDrawOffer,
        whiteConnected,
        blackConnected,
      }}
    >
      {mobile ? <MobileGameView /> : <DesktopGameView />}
    </ChessGameProvider>
  )
})
