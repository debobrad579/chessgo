import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
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
      <Tooltip>
        <TooltipTrigger asChild className="flex-1">
          <Button
            variant="outline"
            onClick={() => setUndoCount(moveCount)}
            disabled={undoCount === moveCount}
          >
            <ChevronFirst />
          </Button>
        </TooltipTrigger>
        <TooltipContent>First move</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild className="flex-1">
          <Button
            variant="outline"
            onClick={() => {
              if (undoCount === moveCount) return
              setUndoCount((prev) => prev + 1)
            }}
            disabled={undoCount === moveCount}
          >
            <ChevronLeft />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Previous move</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild className="flex-1">
          <Button
            variant="outline"
            onClick={() => {
              if (undoCount === 0) return
              setUndoCount((prev) => prev - 1)
            }}
            disabled={undoCount === 0}
          >
            <ChevronRight />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Next move</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild className="flex-1">
          <Button
            className="w-full"
            variant="outline"
            onClick={() => setUndoCount(0)}
            disabled={undoCount === 0}
          >
            <ChevronLast />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Last move</TooltipContent>
      </Tooltip>
    </div>
  )
}
