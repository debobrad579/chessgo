import { formatMilliseconds } from "@/lib/formatters"
import { cn } from "@/lib/utils"
import { useChessGameContext } from "./ChessGameContext"

export function WhiteClock() {
  const {
    white,
    whiteConnected,
    moves,
    undoCount,
    thinkTime,
    timeControl,
    result,
    clockType,
  } = useChessGameContext()

  function getTimestamp() {
    switch (clockType) {
      case "per-move": {
        if (moves.length === 0) {
          return timeControl.base - thinkTime
        }

        const effectiveMoves = moves.slice(0, moves.length - undoCount)
        const whiteToMove = effectiveMoves.length % 2 === 0
        const playerMoves = effectiveMoves.filter((_, i) => i % 2 === 0)
        const lastMove = playerMoves.at(-1)

        if (!lastMove) {
          return whiteToMove && undoCount === 0
            ? timeControl.base - thinkTime
            : timeControl.base
        }

        if (whiteToMove && result === "*" && undoCount === 0) {
          return lastMove.timestamp - thinkTime
        }

        return lastMove.timestamp
      }
      case "lichess": {
        if (moves.length === 0) {
          return timeControl.base
        }

        if (moves.length % 2 === 0 && result === "*") {
          return moves[0].timestamp - thinkTime
        }

        return moves[0].timestamp
      }
    }
  }

  function getResult() {
    if (undoCount !== 0 && clockType !== "lichess") {
      return
    }

    switch (result) {
      case "1-0":
        return "win"
      case "0-1":
        return "loss"
      case "1/2-1/2":
        return "draw"
    }
  }

  return (
    <Clock
      name={white.name}
      rating={white.rating}
      connected={whiteConnected}
      timestamp={getTimestamp()}
      result={getResult()}
      className="bg-gray-100 text-black hover:bg-gray-200"
    />
  )
}

export function BlackClock() {
  const {
    black,
    blackConnected,
    moves,
    undoCount,
    thinkTime,
    timeControl,
    result,
    clockType = false,
  } = useChessGameContext()

  function getTimestamp() {
    switch (clockType) {
      case "per-move": {
        if (moves.length === 0) {
          return timeControl.base
        }

        if (moves.length === 1) {
          return timeControl.base - thinkTime
        }

        const effectiveMoves = moves.slice(0, moves.length - undoCount)
        const blackToMove = effectiveMoves.length % 2 !== 0
        const playerMoves = effectiveMoves.filter((_, i) => i % 2 !== 0)
        const lastMove = playerMoves.at(-1)

        if (!lastMove) {
          return blackToMove && undoCount === 0
            ? timeControl.base - thinkTime
            : timeControl.base
        }

        if (blackToMove && result === "*" && undoCount === 0) {
          return lastMove.timestamp - thinkTime
        }

        return lastMove.timestamp
      }
      case "lichess": {
        if (moves.length <= 1) {
          return timeControl.base
        }

        if (moves.length % 2 !== 0 && result === "*") {
          return moves[1].timestamp - thinkTime
        }

        return moves[1].timestamp
      }
    }
  }

  function getResult() {
    if (undoCount !== 0 && clockType !== "lichess") {
      return
    }

    switch (result) {
      case "0-1":
        return "win"
      case "1-0":
        return "loss"
      case "1/2-1/2":
        return "draw"
    }
  }

  return (
    <Clock
      name={black.name}
      rating={black.rating}
      connected={blackConnected}
      timestamp={getTimestamp()}
      result={getResult()}
      className="bg-gray-900 text-white hover:bg-gray-800"
    />
  )
}

function Clock({
  name,
  connected,
  rating,
  timestamp,
  result,
  className,
}: {
  name: string
  timestamp?: number
  connected?: boolean
  rating?: number
  result?: "win" | "loss" | "draw"
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex h-9 w-full items-center justify-between gap-2 rounded-md border border-border px-2 px-4 py-1 py-2 font-bold font-semibold transition-colors",
        className,
      )}
    >
      {(() => {
        switch (result) {
          case "win":
            return <div className="text-green-500">1</div>
          case "loss":
            return <div className="text-red-500">0</div>
          case "draw":
            return <div>1/2</div>
          default:
            return (
              timestamp != null && <div>{formatMilliseconds(timestamp)}</div>
            )
        }
      })()}
      <div className="flex items-center gap-2">
        {connected != null && (
          <span
            className={cn(
              "h-2.5 w-2.5 rounded-full",
              connected ? "bg-green-500" : "bg-red-500",
            )}
          />
        )}
        <div className="font-bold">{name}</div>
        {rating != null && <div className="pb-1 text-sm">({rating})</div>}
      </div>
    </div>
  )
}
