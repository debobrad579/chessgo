import { Button } from "@chessgo/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@chessgo/ui/dialog"
import { type Dispatch, type SetStateAction } from "react"
import { Link } from "react-router"
import { Loader2 } from "lucide-react"

export function GameOverModal({
  result,
  reason,
  open,
  setOpen,
  time,
  increment,
  handleNewGame,
  isNewGameLoading,
}: {
  result: "win" | "loss" | "draw" | "aborted"
  reason: string
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
  time: number
  increment: number
  handleNewGame: () => void
  isNewGameLoading: boolean
}) {
  return (
    <Dialog open={open} onOpenChange={(open) => setOpen(open)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-center">
            {result === "aborted"
              ? "Game Aborted"
              : result === "win"
                ? "You Won!"
                : result === "loss"
                  ? "You Lost!"
                  : "Game Drawn!"}
          </DialogTitle>
          {result !== "aborted" && (
            <DialogDescription className="text-center">
              by {reason}
            </DialogDescription>
          )}
        </DialogHeader>
        <div className="flex gap-2">
          <Button
            className="flex-1"
            variant={isNewGameLoading ? "secondary" : "default"}
            onClick={() => handleNewGame()}
          >
            {isNewGameLoading && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {isNewGameLoading ? "Seeking" : `New ${time}+${increment}`}
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
