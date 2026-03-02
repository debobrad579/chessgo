import { Button } from "@/components/ui/button"
import {
  ChevronFirst,
  ChevronLast,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import type { Dispatch, SetStateAction } from "react"

export function NavigationButtons({
  moveCount,
  undoCount,
  setUndoCount,
}: {
  moveCount: number
  undoCount: number
  setUndoCount: Dispatch<SetStateAction<number>>
}) {
  return (
    <div className="flex gap-2">
      <Button
        className="w-full"
        onClick={() => setUndoCount(moveCount)}
        disabled={undoCount === moveCount}
      >
        <ChevronFirst />
      </Button>
      <Button
        className="w-full"
        onClick={() => {
          if (undoCount === moveCount) return
          setUndoCount((prev) => prev + 1)
        }}
        disabled={undoCount === moveCount}
      >
        <ChevronLeft />
      </Button>
      <Button
        className="w-full"
        onClick={() => {
          if (undoCount === moveCount) return
          setUndoCount((prev) => prev - 1)
        }}
        disabled={undoCount === 0}
      >
        <ChevronRight />
      </Button>
      <Button
        className="w-full"
        onClick={() => setUndoCount(0)}
        disabled={undoCount === 0}
      >
        <ChevronLast />
      </Button>
    </div>
  )
}
