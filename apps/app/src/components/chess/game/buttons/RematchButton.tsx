import { Tooltip, TooltipContent, TooltipTrigger } from "@chessgo/ui/tooltip"
import { Button } from "@chessgo/ui/button"
import { Swords } from "lucide-react"

export function RematchButton({
  playerColor,
  rematchRequest,
  handleRematch,
}: {
  playerColor: "w" | "b"
  rematchRequest: "w" | "b" | "n"
  handleRematch: () => void
}) {
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
