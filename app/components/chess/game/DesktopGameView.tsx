import { Chessboard } from "@/components/chess/board"
import { Clock } from "./Clock"
import { useRef } from "react"
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
import { ChessGameProps } from "."

export function DesktopGameView({
  moves,
  result,
  thinkTime,
  undoCount,
  user,
  white,
  black,
  mouseOverBoard,
  timeControl,
  game,
  setUndoCount,
  onMove,
}: ChessGameProps) {
  const tableScrollAreaRef = useRef<HTMLDivElement>(null)

  const previousMove =
    moves.length >= 1 && undoCount !== moves.length
      ? moves.at(moves.length - undoCount - 1)
      : null

  const whiteResult = {
    "1-0": "win",
    "0-1": "loss",
    "1/2-1/2": "draw",
    "*": "*",
  }[result] as "win" | "loss" | "draw" | "*"

  const blackResult = {
    "0-1": "win",
    "1-0": "loss",
    "1/2-1/2": "draw",
    "*": "*",
  }[result] as "win" | "loss" | "draw" | "*"

  return (
    <div
      className="flex gap-2"
      onMouseEnter={() => (mouseOverBoard.current = true)}
      onMouseLeave={() => (mouseOverBoard.current = false)}
    >
      <div className="w-[min(100vw-2rem,100vh-7rem)]">
        <Chessboard
          fen={game.fen()}
          flipBoard={user?.id === black.id}
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
              : user?.id === white.id
                ? "w"
                : user?.id === black.id
                  ? "b"
                  : "n"
          }
        />
      </div>
      <div className="flex-1 flex flex-col gap-2 h-[min(100vw-2rem,100vh-7rem)]">
        <Clock
          moves={moves}
          playerColor={user?.id === black.id ? "w" : "b"}
          undoCount={undoCount}
          thinkTime={thinkTime}
          initialTime={timeControl.base}
          result={user?.id === black.id ? whiteResult : blackResult}
          player={user?.id === black.id ? white : black}
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
        <NavigationButtons
          moveCount={moves.length}
          undoCount={undoCount}
          setUndoCount={setUndoCount}
        />
        <Clock
          moves={moves}
          playerColor={user?.id === black.id ? "b" : "w"}
          undoCount={undoCount}
          thinkTime={thinkTime}
          initialTime={timeControl.base}
          result={user?.id === black.id ? blackResult : whiteResult}
          player={user?.id === black.id ? black : white}
        />
      </div>
    </div>
  )
}
