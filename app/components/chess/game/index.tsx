import {
  type Dispatch,
  type RefObject,
  type SetStateAction,
  forwardRef,
} from "react"
import type { GameData, Move, Player, Result, TimeControl } from "@/types/chess"
import type { ChessboardProps } from "../board"
import { useMediaQuery } from "@/hooks/useMediaQuery"
import { useChessGame } from "./useChessGame"
import { useUser } from "@/context/UserContext"
import { User } from "@/types/user"
import { Chess } from "chess.js"
import { DesktopGameView } from "./DesktopGameView"
import { MobileGameView } from "./MobileGameView"

export type ChessGameProps = {
  moves: Move[]
  result: Result
  thinkTime: number
  undoCount: number
  setUndoCount: Dispatch<SetStateAction<number>>
  mouseOverBoard: RefObject<boolean>
  white: Player
  black: Player
  user: User | null
  timeControl: TimeControl
  game: Chess
  onMove?: ChessboardProps["onMove"]
}

export type ChessGameHandle = {
  makeMove: (move: Move) => void
}

export const ChessGame = forwardRef<
  ChessGameHandle,
  { gameData: GameData; onMove?: ChessboardProps["onMove"] }
>(function Game({ gameData, onMove }, ref) {
  const {
    game,
    optimisticMoves,
    optimisticThinkTime,
    undoCount,
    mouseOverBoard,
    setUndoCount,
  } = useChessGame(gameData, ref)

  const mobile = useMediaQuery("(orientation: portrait)")

  const { user } = useUser()

  return mobile ? (
    <MobileGameView
      moves={optimisticMoves}
      result={gameData.result}
      thinkTime={optimisticThinkTime}
      undoCount={undoCount}
      setUndoCount={setUndoCount}
      user={user}
      mouseOverBoard={mouseOverBoard}
      white={gameData.white}
      black={gameData.black}
      timeControl={gameData.time_control}
      game={game}
      onMove={onMove}
    />
  ) : (
    <DesktopGameView
      moves={optimisticMoves}
      result={gameData.result}
      thinkTime={optimisticThinkTime}
      undoCount={undoCount}
      setUndoCount={setUndoCount}
      user={user}
      mouseOverBoard={mouseOverBoard}
      white={gameData.white}
      black={gameData.black}
      timeControl={gameData.time_control}
      game={game}
      onMove={onMove}
    />
  )
})
