import { Button } from "@chessgo/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@chessgo/ui/dialog"
import { useRef, useState, type Dispatch, type SetStateAction } from "react"
import { Link, useNavigate } from "react-router"
import { seekGame } from "../utils"
import { Loader2 } from "lucide-react"

export function GameOverModal({
  result,
  reason,
  open,
  setOpen,
  rated,
  time,
  increment,
  accessToken,
}: {
  result: "win" | "loss" | "draw" | "aborted"
  reason: string
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
  rated: boolean
  time: number
  increment: number
  accessToken: string
}) {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const controllerRef = useRef<AbortController>(null)

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
            disabled={isLoading}
            onClick={() => {
              controllerRef.current = new AbortController()

              if (isLoading) {
                controllerRef.current.abort()
                setIsLoading(false)
                return
              }

              setIsLoading(true)

              if (!isLoading) {
                return
              }

              seekGame(
                accessToken,
                {
                  rated: String(rated),
                  time: String(time),
                  increment: String(increment),
                  color: "random",
                },
                controllerRef.current,
              )
                .then((gameId) => {
                  setIsLoading(false)

                  if (gameId != null) {
                    navigate(`/lichess/live/${gameId}`)
                  }
                })
                .catch(() => setIsLoading(false))
            }}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLoading ? "Seeking" : `New ${time}+${increment}`}
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
