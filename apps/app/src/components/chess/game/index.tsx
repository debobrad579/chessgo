import {
  type Dispatch,
  type SetStateAction,
  forwardRef,
  type ReactNode,
} from "react"
import type {
  Game,
  Move,
  Player,
  Result,
  TimeControl,
  ChatMessage,
} from "@/types/chess"
import type { ChessboardProps } from "../board"
import { useMediaQuery } from "@/hooks/useMediaQuery"
import { useChessGame } from "./useChessGame"
import { Chess } from "chess.js"
import { DesktopGameView } from "./DesktopGameView"
import { MobileGameView } from "./MobileGameView"
import { ChessGameProvider } from "./ChessGameContext"

type ClockType = "no-clocks" | "per-move" | "lichess"

export type ChessGameProps = {
  moves: Move[]
  result: Result
  resultReason: string
  thinkTime: number
  turnStartedAt: number
  clockRunning: boolean
  undoCount: number
  setUndoCount: Dispatch<SetStateAction<number>>
  white: Player
  black: Player
  game: Chess
  timeControl: TimeControl
  clockType: ClockType
  gameButtons: ReactNode[]
  rated: boolean
  chat?: ChatMessage[]
  onSendMessage?: (message: string) => void
  onMove?: (move: Move) => void
  whiteConnected?: boolean
  blackConnected?: boolean
  previousMove?: Move
  previousMoveIsCapture?: boolean
}

export type ChessGameHandle = {
  makeMove: (move: Move) => void
}

export const ChessGame = forwardRef<
  ChessGameHandle,
  {
    gameData: Game
    resultReason: string
    rated?: boolean
    clockType?: ClockType
    onMove?: ChessboardProps["onMove"]
    onSendMessage?: ChessGameProps["onSendMessage"]
    whiteConnected?: boolean
    blackConnected?: boolean
    gameButtons?: ReactNode[]
    chat?: ChatMessage[]
  }
>(function Game(
  {
    gameData,
    resultReason,
    clockType,
    onSendMessage,
    onMove,
    gameButtons,
    whiteConnected,
    blackConnected,
    chat,
    rated,
  },
  ref,
) {
  const {
    game,
    optimisticMoves,
    turnStartedAt,
    clockRunning,
    undoCount,
    setUndoCount,
    previousMove,
    previousMoveIsCapture,
  } = useChessGame(gameData, clockType ?? "per-move", ref)

  const mobile = useMediaQuery("(max-aspect-ratio: 7/6)")

  return (
    <ChessGameProvider
      value={{
        moves: optimisticMoves,
        result: gameData.result,
        resultReason,
        thinkTime: gameData.think_time,
        turnStartedAt: turnStartedAt,
        clockRunning: clockRunning,
        white: gameData.white,
        black: gameData.black,
        timeControl: gameData.time_control,
        clockType: clockType ?? "per-move",
        undoCount,
        setUndoCount,
        game,
        onMove,
        whiteConnected,
        blackConnected,
        previousMove: previousMove ?? undefined,
        previousMoveIsCapture,
        gameButtons: gameButtons ?? [],
        chat,
        onSendMessage,
        rated: rated ?? false,
      }}
    >
      {mobile ? <MobileGameView /> : <DesktopGameView />}
    </ChessGameProvider>
  )
})
