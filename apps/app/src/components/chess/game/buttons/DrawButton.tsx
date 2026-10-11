import { Popover, PopoverContent, PopoverTrigger } from "@chessgo/ui/popover"
import { Tooltip, TooltipContent, TooltipTrigger } from "@chessgo/ui/tooltip"
import { useState } from "react"
import { useChessGameContext } from "../ChessGameContext"
import { Button } from "@chessgo/ui/button"

export function DrawButton({
  playerColor,
  disabled,
}: {
  playerColor: "w" | "b"
  disabled: boolean
}) {
  const { pendingDrawOffer, handleOfferDraw, handleRespondToDrawOffer } =
    useChessGameContext()
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)

  if (handleOfferDraw == null || handleRespondToDrawOffer == null) return

  const drawOfferActive =
    pendingDrawOffer !== "n" && playerColor !== pendingDrawOffer

  return (
    <Tooltip>
      <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <Button
              className="text-2xl"
              size="icon"
              variant={drawOfferActive ? "default" : "ghost"}
              disabled={playerColor === pendingDrawOffer || disabled}
            >
              &frac12;
            </Button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent>
          {drawOfferActive ? "Accept draw" : "Offer draw"}
        </TooltipContent>
        <PopoverContent>
          <div className="space-y-2">
            <p>
              {drawOfferActive
                ? "Do you want to accept a draw?"
                : "Do you want to offer a draw?"}
            </p>
            <div className="flex justify-center gap-2">
              <Button
                className="flex-1"
                variant="secondary"
                onClick={() => {
                  if (drawOfferActive) {
                    handleRespondToDrawOffer(false)
                  }

                  setIsPopoverOpen(false)
                }}
              >
                {drawOfferActive ? "Decline" : "No"}
              </Button>
              <Button
                className="flex-1"
                onClick={() => {
                  if (drawOfferActive) {
                    handleRespondToDrawOffer(true)
                  } else {
                    handleOfferDraw()
                  }

                  setIsPopoverOpen(false)
                }}
              >
                {drawOfferActive ? "Accept" : "Yes"}
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </Tooltip>
  )
}
