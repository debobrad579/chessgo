import { useUser } from "@/context/UserContext"
import { useChessGameContext } from "../ChessGameContext"
import { Clock } from "./Clock"
import { useRemainingTime } from "./useRemainingTime"
import { getMaterialScore } from "../utils"

export function WhiteClock() {
  const { white, whiteConnected, result, undoCount, clockType, game } =
    useChessGameContext()
  const user = useUser()

  const timestamp = useRemainingTime("w")

  const materialScore = getMaterialScore(game.fen())

  return (
    <Clock
      name={white.name}
      playerClock={user.id === white.id}
      rating={white.rating}
      connected={whiteConnected}
      timestamp={timestamp}
      result={getResult(result, !(undoCount !== 0 && clockType === "per-move"))}
      materialScore={materialScore > 0 ? materialScore : undefined}
      className="bg-gray-100 text-black hover:bg-gray-200"
    />
  )
}

function getResult(result: string, showResult: boolean) {
  if (!showResult) return undefined
  switch (result) {
    case "1-0":
      return "win"
    case "0-1":
      return "loss"
    case "1/2-1/2":
      return "draw"
  }
}
