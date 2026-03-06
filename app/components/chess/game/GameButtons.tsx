import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { ArrowDownUp, Flag, Share } from "lucide-react"
import { useState } from "react"
import { useChessGameContext } from "./ChessGameContext"
import { useUser } from "@/context/UserContext"

export function GameButtons({
  handleFlipBoard,
}: {
  handleFlipBoard: () => void
}) {
  const user = useUser()
  const [resignPopoverOpen, setResignPopoverOpen] = useState(false)
  const [drawOfferPopoverOpen, setDrawOfferPopoverOpen] = useState(false)
  const {
    result,
    black,
    pendingDrawOffer,
    handleResign,
    handleOfferDraw,
    handleRespondToDrawOffer,
  } = useChessGameContext()

  const playerColor = user.id === black.id ? "b" : "w"
  const drawOfferActive =
    pendingDrawOffer !== "n" && playerColor !== pendingDrawOffer

  return (
    <div className="flex justify-between gap-2">
      <div className="flex gap-2">
        {result === "*" &&
          handleOfferDraw != null &&
          handleRespondToDrawOffer != null && (
            <Tooltip>
              <Popover
                open={drawOfferPopoverOpen}
                onOpenChange={setDrawOfferPopoverOpen}
              >
                <TooltipTrigger asChild>
                  <PopoverTrigger asChild>
                    <Button
                      className="text-2xl"
                      size="icon"
                      variant={drawOfferActive ? "default" : "ghost"}
                      disabled={playerColor === pendingDrawOffer}
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
                        className="w-full"
                        variant="secondary"
                        onClick={() => {
                          if (drawOfferActive) {
                            handleRespondToDrawOffer(false)
                          }

                          setDrawOfferPopoverOpen(false)
                        }}
                      >
                        {drawOfferActive ? "Decline" : "No"}
                      </Button>
                      <Button
                        className="w-full"
                        onClick={() => {
                          if (drawOfferActive) {
                            handleRespondToDrawOffer(true)
                          } else {
                            handleOfferDraw()
                          }

                          setDrawOfferPopoverOpen(false)
                        }}
                      >
                        {drawOfferActive ? "Accept" : "Yes"}
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </Tooltip>
          )}
        {result === "*" && handleResign != null && (
          <Tooltip>
            <Popover
              open={resignPopoverOpen}
              onOpenChange={setResignPopoverOpen}
            >
              <TooltipTrigger asChild>
                <PopoverTrigger asChild>
                  <Button size="icon" variant="ghost">
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
                      className="w-full"
                      variant="secondary"
                      onClick={() => setResignPopoverOpen(false)}
                    >
                      No
                    </Button>
                    <Button
                      className="w-full"
                      variant="destructive"
                      onClick={() => {
                        handleResign()
                        setDrawOfferPopoverOpen(false)
                      }}
                    >
                      Yes
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </Tooltip>
        )}
      </div>
      <div className="flex gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button size="icon" variant="ghost" onClick={handleFlipBoard}>
              <ArrowDownUp />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Flip board</TooltipContent>
        </Tooltip>
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
      </div>
    </div>
  )
}
