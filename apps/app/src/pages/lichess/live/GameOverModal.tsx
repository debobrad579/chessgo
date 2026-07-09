import { Button } from "@chessgo/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@chessgo/ui/dialog"
import { formatTimeControl } from "@/lib/formatters"
import type { TimeControl } from "@/types/chess"
import type { Dispatch, SetStateAction } from "react"
import { Link } from "react-router"

export function GameOverModal({
  timeControl,
  result,
  reason,
  open,
  setOpen,
}: {
  timeControl: TimeControl
  result: "win" | "loss" | "draw"
  reason: string
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
}) {
  const timeControlString = formatTimeControl(timeControl)

  return (
    <Dialog open={open} onOpenChange={(open) => setOpen(open)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-center">
            {result === "win"
              ? "You Won!"
              : result === "loss"
                ? "You Lost!"
                : "Game Drawn!"}
          </DialogTitle>
          <DialogDescription className="text-center">
            by {reason}
          </DialogDescription>
        </DialogHeader>
        <div className="flex gap-2">
          <Button className="flex-1" onClick={() => {}}>
            New {timeControlString}
          </Button>
        </div>
        <DialogFooter>
          <Button asChild variant="ghost">
            <Link to="/">Return to lobby</Link>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
