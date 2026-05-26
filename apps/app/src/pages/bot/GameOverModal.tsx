import { Button } from "@chessgo/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@chessgo/ui/dialog"
import type { Dispatch, SetStateAction } from "react"
import { Link } from "react-router"

export function GameOverModal({
  result,
  reason,
  open,
  setOpen,
  handleRematch,
}: {
  result: "win" | "loss" | "draw"
  reason: string
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
  handleRematch: () => void
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
          <Button className="flex-1" onClick={handleRematch}>
            New Game
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
