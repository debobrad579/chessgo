import type { Color } from "chess.js"
import { useChessGameContext } from "../ChessGameContext"
import { useThinkTime } from "./useThinkTime"

export function useRemainingTime(color: Color) {
  const { moves, undoCount, timeControl, result, clockType, clockRunning } =
    useChessGameContext()
  const thinkTime = useThinkTime()
  const firstMoveNumber = color === "w" ? 0 : 1

  const clockMoves =
    clockType === "lichess" ? moves : moves.slice(0, moves.length - undoCount)

  const base =
    clockMoves.filter((_, i) => i % 2 === firstMoveNumber).at(-1)?.timestamp ??
    timeControl.base

  const myTurn = clockMoves.length % 2 === firstMoveNumber
  const started = clockType !== "lichess" || clockMoves.length >= 2
  const ticking =
    clockRunning &&
    myTurn &&
    started &&
    result === "*" &&
    (undoCount === 0 || clockType === "lichess")

  return ticking ? Math.max(0, base - thinkTime) : base
}
