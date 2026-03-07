import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { formatTimeControl } from "@/lib/formatters"
import { TimeControl } from "@/types/chess"
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
          <Button className="w-full">
            New {formatTimeControl(timeControl)}
          </Button>
          <Button className="w-full" variant="secondary">
            Rematch
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
