import { Popover, PopoverContent, PopoverTrigger } from "@chessgo/ui/popover"
import { Tooltip, TooltipContent, TooltipTrigger } from "@chessgo/ui/tooltip"
import { useEffect, useReducer, useState } from "react"
import { Button } from "@chessgo/ui/button"
import { Scale } from "lucide-react"

export function ClaimWinButton({
  claimInSeconds,
  disconnectedAt,
  handleClaimWin,
  handleClaimDraw,
}: {
  claimInSeconds: number
  disconnectedAt: number
  handleClaimWin: () => void
  handleClaimDraw: () => void
}) {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)

  const [, force] = useReducer((x: number) => x + 1, 0)

  useEffect(() => {
    const id = setInterval(force, 100)
    return () => clearInterval(id)
  }, [])

  const timeRemaining =
    disconnectedAt + claimInSeconds * 1000 - performance.now()
  const canClaim = timeRemaining <= 0

  return (
    <Tooltip>
      <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <Button
              className="text-2xl"
              size="icon"
              variant={canClaim ? "default" : "ghost"}
            >
              <Scale />
            </Button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent>Claim victory or draw</TooltipContent>
        <PopoverContent>
          <div className="space-y-2">
            <p>
              Claim victory or draw
              {!canClaim && ` in ${Math.ceil(timeRemaining / 1000)} seconds`}
            </p>
            <div className="flex justify-center gap-2">
              <Button
                className="flex-1"
                variant="secondary"
                onClick={() => {
                  handleClaimDraw()
                  setIsPopoverOpen(false)
                }}
                disabled={!canClaim}
              >
                Claim Draw
              </Button>
              <Button
                className="flex-1"
                onClick={() => {
                  handleClaimWin()
                  setIsPopoverOpen(false)
                }}
                disabled={!canClaim}
              >
                Claim Victory
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </Tooltip>
  )
}
