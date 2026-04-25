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
import type { TimeControl } from "@/types/chess"
import type { Dispatch, SetStateAction } from "react"
import { Link, useNavigate } from "react-router"

export function GameOverModal({
  timeControl,
  result,
  reason,
  open,
  setOpen,
  rematchRequest,
  handleRematch,
}: {
  timeControl: TimeControl
  result: "win" | "loss" | "draw"
  reason: string
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
  rematchRequest: "incoming" | "outgoing" | "n"
  handleRematch: () => void
}) {
  const navigate = useNavigate()

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
          <Button
            className="flex-1"
            onClick={() => {
              fetch("/api/live/new", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  color: "random",
                  time_control: timeControlString,
                }),
              })
                .then((res) => res.json())
                .then((data) => {
                  navigate(`/live/${data?.game_id}`, { replace: true })
                })
            }}
          >
            New {timeControlString}
          </Button>
          <Button
            className="flex-1"
            variant={rematchRequest === "n" ? "secondary" : "default"}
            onClick={handleRematch}
          >
            {rematchRequest === "n"
              ? "Rematch"
              : rematchRequest === "incoming"
                ? "Accept Rematch"
                : "Cancel Rematch"}
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
