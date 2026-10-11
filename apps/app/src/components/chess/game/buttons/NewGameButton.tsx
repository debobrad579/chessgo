import { Button } from "@chessgo/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@chessgo/ui/tooltip"
import { Loader2, Sword } from "lucide-react"
import { useChessGameContext } from "../ChessGameContext"
import { formatTimeControl } from "@/lib/formatters"

export function NewGameButton() {
  const { isNewGameLoading, handleNewGame, timeControl } = useChessGameContext()

  if (handleNewGame == null) return

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          size="icon"
          variant={isNewGameLoading ? "default" : "ghost"}
          onClick={() => handleNewGame()}
        >
          {isNewGameLoading ? <Loader2 className="animate-spin" /> : <Sword />}
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        {isNewGameLoading ? "Cancel" : `New ${formatTimeControl(timeControl)}`}
      </TooltipContent>
    </Tooltip>
  )
}
