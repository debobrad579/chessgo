import { formatMilliseconds } from "@/lib/formatters"
import { cn } from "@/lib/utils"
import { getPlayerTimestamp } from "./utils"
import type { Color } from "chess.js"
import { useChessGameContext } from "./ChessGameContext"

export function Clock({ color }: { color: Color }) {
  const {
    moves,
    undoCount,
    thinkTime,
    timeControl,
    result,
    white,
    black,
    whiteConnected,
    blackConnected,
    clockType,
  } = useChessGameContext()

  const won =
    (result === "1-0" && color === "w") || (result === "0-1" && color === "b")
  const lost =
    (result === "0-1" && color === "w") || (result === "1-0" && color === "b")

  let connected = null
  if (color === "w" && whiteConnected != null) {
    connected = whiteConnected
  } else if (color === "b" && blackConnected != null) {
    connected = blackConnected
  }

  const name = color === "w" ? white.name : black.name
  const rating = color === "w" ? white.rating : black.rating

  return (
    <div
      className={cn(
        "flex h-9 w-full items-center justify-between gap-2 rounded-md border border-border px-2 px-4 py-1 py-2 font-bold font-semibold transition-colors",
        color === "w"
          ? "bg-gray-100 text-black hover:bg-gray-200"
          : "bg-gray-900 text-white hover:bg-gray-800",
      )}
    >
      {clockType != "no-clocks" && (
        <div
          className={
            undoCount === 0 && won
              ? "text-green-500"
              : undoCount === 0 && lost
                ? "text-red-500"
                : undefined
          }
        >
          {undoCount !== 0 || result === "*"
            ? formatMilliseconds(
                getPlayerTimestamp({
                  playerColor: color,
                  initialTime: timeControl.base,
                  moves,
                  undoCount,
                  thinkTime,
                  result,
                  lichessClocks: clockType === "lichess",
                }),
              )
            : won
              ? 1
              : lost
                ? 0
                : "1/2"}
        </div>
      )}
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
