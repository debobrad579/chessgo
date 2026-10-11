import { Popover, PopoverContent, PopoverTrigger } from "@chessgo/ui/popover"
import { Tooltip, TooltipContent, TooltipTrigger } from "@chessgo/ui/tooltip"
import { useState } from "react"
import { Button } from "@chessgo/ui/button"
import { Undo2 } from "lucide-react"

export function TakebackButton({
  playerColor,
  pendingTakeback,
  handleTakeback,
  disabled = false,
  hidden = false,
}: {
  playerColor: "w" | "b"
  pendingTakeback: "w" | "b" | "n"
  handleTakeback: (accept: boolean) => void
  disabled?: boolean
  hidden?: boolean
}) {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)

  if (hidden) return

  const takebackActive =
    pendingTakeback !== "n" && playerColor !== pendingTakeback

  return (
    <Tooltip>
      <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <Button
              className="text-2xl"
              size="icon"
              variant={takebackActive ? "default" : "ghost"}
              disabled={playerColor === pendingTakeback || disabled}
            >
              <Undo2 />
            </Button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent>
          {takebackActive ? "Accept takeback" : "Propose takeback"}
        </TooltipContent>
        <PopoverContent>
          <div className="space-y-2">
            <p>
              {takebackActive
                ? "Do you want to accept a takeback?"
                : "Do you want to propose a takeback?"}
            </p>
            <div className="flex justify-center gap-2">
              <Button
                className="flex-1"
                variant="secondary"
                onClick={() => {
                  if (takebackActive) {
                    handleTakeback(false)
                  }

                  setIsPopoverOpen(false)
                }}
              >
                {takebackActive ? "Decline" : "No"}
              </Button>
              <Button
                className="flex-1"
                onClick={() => {
                  handleTakeback(true)
                  setIsPopoverOpen(false)
                }}
              >
                {takebackActive ? "Accept" : "Yes"}
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </Tooltip>
  )
}
