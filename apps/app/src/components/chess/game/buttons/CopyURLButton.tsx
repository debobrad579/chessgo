import { Button } from "@chessgo/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@chessgo/ui/popover"
import { Tooltip, TooltipContent, TooltipTrigger } from "@chessgo/ui/tooltip"
import { Share } from "lucide-react"

export function CopyURLButton() {
  return (
    <Tooltip>
      <Popover>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(window.location.href)
                } catch (err) {
                  console.error("Failed to copy URL:", err)
                }
              }}
            >
              <Share />
            </Button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent>Copy URL</TooltipContent>
        <PopoverContent className="w-fit">URL Copied!</PopoverContent>
      </Popover>
    </Tooltip>
  )
}
