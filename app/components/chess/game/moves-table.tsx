import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { MoveCell } from "./move-cell"
import type { Game } from "../types"
import { getMoveNumberArrays } from "./utils"
import { useRef } from "react"

export function MovesTable({
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
  const tableScrollAreaRef = useRef<HTMLDivElement>(null)

  return (
    <ScrollArea
      ref={tableScrollAreaRef}
      className="w-[10.5rem] pr-1 aspect-video hidden @lg:block"
    >
      <Table>
        <TableHeader>
          <TableRow className="text-muted-foreground">
            <MoveCell
              active={undoCount === moves.length}
              undoCount={undoCount}
              scrollAreaRef={tableScrollAreaRef}
              isTableCell
              noStyles
            >
              No.
            </MoveCell>
            <TableCell>White</TableCell>
            <TableCell>Black</TableCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          {getMoveNumberArrays(moves).map((moveSet, index) => (
            <TableRow key={index}>
              <TableCell>{index + 1}.</TableCell>
              <MoveCell
                onClick={() => onWhiteMoveClick(index)}
                active={undoCount === moves.length - index * 2 - 1}
                undoCount={undoCount}
                scrollAreaRef={tableScrollAreaRef}
                isTableCell
              >
                {moveSet[0]}
              </MoveCell>
              <MoveCell
                onClick={() => onBlackMoveClick(index)}
                active={undoCount === moves.length - index * 2 - 2}
                undoCount={undoCount}
                scrollAreaRef={tableScrollAreaRef}
                isTableCell
              >
                {moveSet[1]}
              </MoveCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell className="font-bold text-right">
              {result.split("-")[0]}
            </TableCell>
            <TableCell className="font-bold text-center">-</TableCell>
            <TableCell className="font-bold">{result.split("-")[1]}</TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </ScrollArea>
  )
}
