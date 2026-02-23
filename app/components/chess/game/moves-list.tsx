import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { MoveCell } from "./move-cell"
import { cn } from "@/lib/utils"
import { getMoveNumberArrays } from "./utils"
import type { Game } from "../types"
import { useRef } from "react"

export function MovesList({
  moves,
  result,
  undoCount,
  onWhiteMoveClick,
  onBlackMoveClick,
}: {
  moves: Game["moves"]
  result: Game["result"]
  undoCount: number
  onWhiteMoveClick: (index: number) => void
  onBlackMoveClick: (index: number) => void
}) {
  const listScrollAreaRef = useRef<HTMLDivElement>(null)

  return (
    <ScrollArea
      ref={listScrollAreaRef}
      className="@lg:hidden w-full pb-2 text-nowrap"
    >
      <MoveCell
        active={undoCount === moves.length}
        undoCount={undoCount}
        scrollAreaRef={listScrollAreaRef}
        noStyles
      />
      <div className={cn("flex gap-4 w-full")}>
        {getMoveNumberArrays(moves).map((moveSet, index) => (
          <div key={index} className="flex gap-2">
            <div>{index + 1}.</div>
            <MoveCell
              onClick={() => onWhiteMoveClick(index)}
              active={undoCount === moves.length - index * 2 - 1}
              undoCount={undoCount}
              scrollAreaRef={listScrollAreaRef}
            >
              {moveSet[0]}
            </MoveCell>
            <MoveCell
              onClick={() => onBlackMoveClick(index)}
              active={undoCount === moves.length - index * 2 - 2}
              undoCount={undoCount}
              scrollAreaRef={listScrollAreaRef}
            >
              {moveSet[1]}
            </MoveCell>
          </div>
        ))}
        <div className="font-bold whitespace-nowrap">
          {result.replace("-", " - ")}
        </div>
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  )
}
