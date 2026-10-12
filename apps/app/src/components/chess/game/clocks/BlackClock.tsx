import { useUser } from "@/context/UserContext"
import { useChessGameContext } from "../ChessGameContext"
import { Clock } from "./Clock"
import { useRemainingTime } from "./useRemainingTime"
import { getMaterialScore } from "../utils"

export function BlackClock() {
  const { black, blackConnected, result, undoCount, clockType, game } =
    useChessGameContext()
  const user = useUser()

  const timestamp = useRemainingTime("b")

  const materialScore = getMaterialScore(game.fen())

  return (
    <Clock
      name={black.name}
      playerClock={user.id === black.id}
      rating={black.rating}
      connected={blackConnected}
      timestamp={timestamp}
      result={getResult(result, !(undoCount !== 0 && clockType === "per-move"))}
      materialScore={materialScore < 0 ? -materialScore : undefined}
      className="bg-gray-900 text-white hover:bg-gray-800"
    />
  )
}

function getResult(result: string, showResult: boolean) {
  if (!showResult) return undefined
  switch (result) {
    case "1-0":
      return "loss"
    case "0-1":
      return "win"
    case "1/2-1/2":
      return "draw"
  }
}
