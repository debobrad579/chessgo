import { Button } from "@chessgo/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@chessgo/ui/tooltip"
import { Sword } from "lucide-react"
import { formatTimeControl } from "@/lib/formatters"
import type { TimeControl } from "@/types/chess"
import { Spinner } from "@chessgo/ui/spinner"

export function NewGameButton({
  handleNewGame,
  timeControl,
  isLoading = false,
}: {
  handleNewGame: () => void
  timeControl: TimeControl
  isLoading?: boolean
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          size="icon"
          variant={isLoading ? "default" : "ghost"}
          onClick={handleNewGame}
        >
          {isLoading ? <Spinner /> : <Sword />}
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        {isLoading ? "Cancel" : `New ${formatTimeControl(timeControl)}`}
      </TooltipContent>
    </Tooltip>
  )
}
