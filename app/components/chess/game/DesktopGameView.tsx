import { Chessboard } from "@/components/chess/board"
import { Clock } from "./Clock"
import { useRef, useState } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { MoveCell } from "./MoveCell"
import { getMoveNumberArrays } from "./utils"
import { NavigationButtons } from "./NavigationButtons"
import { GameButtons } from "./GameButtons"
import { useUser } from "@/context/UserContext"
import { useChessGameContext } from "./ChessGameContext"

export function DesktopGameView() {
  const user = useUser()
  const { moves, result, undoCount, white, black, game, setUndoCount, onMove } =
    useChessGameContext()

  const [flipBoard, setFlipBoard] = useState(user.id === black.id)
  const tableScrollAreaRef = useRef<HTMLDivElement>(null)

  const previousMove =
    moves.length >= 1 && undoCount !== moves.length
      ? moves.at(moves.length - undoCount - 1)
      : null

  return (
    <div className="flex gap-2 h-full">
      <div className="w-[calc(100vh-7rem-1px)]">
        <Chessboard
          fen={game.fen()}
          flipBoard={flipBoard}
          previousMove={
            previousMove
              ? {
                  from: previousMove.from,
                  to: previousMove.to,
                  timestamp: previousMove.timestamp,
                }
              : undefined
          }
          check={game.inCheck() ? game.turn() : undefined}
          onMove={onMove}
          draggablePieces={
            undoCount !== 0 || result !== "*"
              ? "n"
              : user.id === white.id
                ? "w"
                : user.id === black.id
                  ? "b"
                  : "n"
          }
        />
      </div>
      <div className="flex-1 flex flex-col gap-2 h-[calc(100vh-7rem-1px)]">
        <Clock color={flipBoard ? "w" : "b"} />
        <NavigationButtons
          moveCount={moves.length}
          undoCount={undoCount}
          setUndoCount={setUndoCount}
        />
        <ScrollArea
          ref={tableScrollAreaRef}
          className="flex-1 pr-1 overflow-auto"
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
                    onClick={() => setUndoCount(moves.length - index * 2 - 1)}
                    active={undoCount === moves.length - index * 2 - 1}
                    undoCount={undoCount}
                    scrollAreaRef={tableScrollAreaRef}
                    isTableCell
                  >
                    {moveSet[0]}
                  </MoveCell>
                  <MoveCell
                    onClick={() => setUndoCount(moves.length - index * 2 - 2)}
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
                <TableCell className="font-bold">
                  {result.split("-")[1]}
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </ScrollArea>
        <GameButtons handleFlipBoard={() => setFlipBoard((prev) => !prev)} />
        <Clock color={flipBoard ? "b" : "w"} />
      </div>
    </div>
  )
}
