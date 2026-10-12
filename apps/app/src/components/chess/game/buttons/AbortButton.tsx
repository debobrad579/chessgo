import { Tooltip, TooltipContent, TooltipTrigger } from "@chessgo/ui/tooltip"
import { Popover, PopoverContent, PopoverTrigger } from "@chessgo/ui/popover"
import { Button } from "@chessgo/ui/button"
import { X } from "lucide-react"
import { useState } from "react"

export function AbortButton({
  handleAbort,
  hidden = false,
}: {
  handleAbort: () => void
  hidden?: boolean
}) {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)

  if (hidden) return

  return (
    <Tooltip>
      <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <Button size="icon" variant="ghost">
              <X />
            </Button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent>Abort game</TooltipContent>
        <PopoverContent>
          <div className="space-y-2">
            <p>Are you sure you want to abort the game?</p>
            <div className="flex justify-center gap-2">
              <Button
                className="flex-1"
                variant="secondary"
                onClick={() => setIsPopoverOpen(false)}
              >
                No
              </Button>
              <Button
                className="flex-1"
                variant="destructive"
                onClick={() => {
                  handleAbort()
                  setIsPopoverOpen(false)
                }}
              >
                Yes
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </Tooltip>
  )
}
