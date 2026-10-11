import { Button } from "@chessgo/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@chessgo/ui/tooltip"
import { Loader2, Sword } from "lucide-react"
import { formatTimeControl } from "@/lib/formatters"
import type { TimeControl } from "@/types/chess"

export function NewGameButton({
  handleNewGame,
  timeControl,
  isLoading = false,
  hidden = false,
}: {
  handleNewGame: () => void
  timeControl: TimeControl
  isLoading?: boolean
  hidden?: boolean
}) {
  if (hidden) return

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          size="icon"
          variant={isLoading ? "default" : "ghost"}
          onClick={handleNewGame}
        >
          {isLoading ? <Loader2 className="animate-spin" /> : <Sword />}
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        {isLoading ? "Cancel" : `New ${formatTimeControl(timeControl)}`}
      </TooltipContent>
    </Tooltip>
  )
}
