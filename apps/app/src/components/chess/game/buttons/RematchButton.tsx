import { Tooltip, TooltipContent, TooltipTrigger } from "@chessgo/ui/tooltip"
import { useChessGameContext } from "../ChessGameContext"
import { Button } from "@chessgo/ui/button"
import { Swords } from "lucide-react"

export function RematchButton({ playerColor }: { playerColor: "w" | "b" }) {
  const { rematchRequest, handleRematch } = useChessGameContext()

  if (handleRematch == null) return

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          size="icon"
          variant={rematchRequest === "n" ? "ghost" : "default"}
          onClick={handleRematch}
        >
          <Swords />
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        {rematchRequest === "n"
          ? "Rematch"
          : rematchRequest !== playerColor
            ? "Accept Rematch"
            : "Cancel Rematch"}
      </TooltipContent>
    </Tooltip>
  )
}
