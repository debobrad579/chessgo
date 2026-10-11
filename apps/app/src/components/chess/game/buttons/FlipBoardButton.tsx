import { Button } from "@chessgo/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@chessgo/ui/tooltip"
import { ArrowDownUp } from "lucide-react"

export function FlipBoardButton({
  handleFlipBoard,
}: {
  handleFlipBoard: () => void
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button size="icon" variant="ghost" onClick={handleFlipBoard}>
          <ArrowDownUp />
        </Button>
      </TooltipTrigger>
      <TooltipContent>Flip board</TooltipContent>
    </Tooltip>
  )
}
