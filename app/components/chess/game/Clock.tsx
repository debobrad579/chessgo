import { formatMilliseconds } from "@/lib/formatters"
import { cn } from "@/lib/utils"
import { getPlayerTimestamp } from "./utils"
import { Color } from "chess.js"
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

  return (
    <div
      className={cn(
        "h-9 px-4 py-2 rounded-md border border-border font-semibold transition-colors flex justify-between items-center gap-2 w-full px-2 py-1 font-bold",
        color === "w"
          ? "bg-gray-100 hover:bg-gray-200 text-black"
          : "bg-gray-900 hover:bg-gray-800 text-white",
      )}
    >
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
              }),
            )
          : won
            ? 1
            : lost
              ? 0
              : "1/2"}
      </div>

      <div className="flex gap-2 items-center">
        {connected != null && (
          <span
            className={cn(
              "h-2.5 w-2.5 rounded-full",
              connected ? "bg-green-500" : "bg-red-500",
            )}
          />
        )}
        <div className="font-bold">
          {color === "w" ? white.name || "White" : black.name || "Black"}
        </div>
      </div>
    </div>
  )
}
