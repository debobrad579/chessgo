import { Tooltip, TooltipContent, TooltipTrigger } from "@chessgo/ui/tooltip"
import { Popover, PopoverContent, PopoverTrigger } from "@chessgo/ui/popover"
import { Button } from "@chessgo/ui/button"
import { Flag } from "lucide-react"
import { useState } from "react"

export function ResignButton({
  handleResign,
  disabled = false,
  hidden = false,
}: {
  handleResign: () => void
  disabled?: boolean
  hidden?: boolean
}) {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)

  if (hidden) return

  return (
    <Tooltip>
      <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <Button size="icon" variant="ghost" disabled={disabled}>
              <Flag />
            </Button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent>Resign</TooltipContent>
        <PopoverContent>
          <div className="space-y-2">
            <p>Are you sure you want to resign?</p>
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
                  handleResign()
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
