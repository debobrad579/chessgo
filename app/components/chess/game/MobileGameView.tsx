import { Chessboard } from "@/components/chess/board"
import { Clock } from "./Clock"
import { NavigationButtons } from "./NavigationButtons"
import { ChessGameProps } from "."
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { MoveCell } from "./MoveCell"
import { getMoveNumberArrays } from "./utils"
import { useRef } from "react"

export function MobileGameView({
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
  const listScrollAreaRef = useRef<HTMLDivElement>(null)

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
      className="flex flex-col gap-2"
      onMouseEnter={() => (mouseOverBoard.current = true)}
      onMouseLeave={() => (mouseOverBoard.current = false)}
    >
      <Clock
        moves={moves}
        playerColor={user?.id === black.id ? "w" : "b"}
        undoCount={undoCount}
        thinkTime={thinkTime}
        initialTime={timeControl.base}
        result={user?.id === black.id ? whiteResult : blackResult}
        player={user?.id === black.id ? white : black}
      />
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
      <Clock
        moves={moves}
        playerColor={user?.id === black.id ? "b" : "w"}
        undoCount={undoCount}
        thinkTime={thinkTime}
        initialTime={timeControl.base}
        result={user?.id === black.id ? blackResult : whiteResult}
        player={user?.id === black.id ? black : white}
      />
      <ScrollArea ref={listScrollAreaRef} className="w-full text-nowrap">
        <MoveCell
          active={undoCount === moves.length}
          undoCount={undoCount}
          scrollAreaRef={listScrollAreaRef}
          noStyles
        />
        <div className="flex gap-4 w-full">
          {getMoveNumberArrays(moves).map((moveSet, index) => (
            <div key={index} className="flex gap-2">
              <div>{index + 1}.</div>
              <MoveCell
                onClick={() => setUndoCount(moves.length - index * 2 - 1)}
                active={undoCount === moves.length - index * 2 - 1}
                undoCount={undoCount}
                scrollAreaRef={listScrollAreaRef}
              >
                {moveSet[0]}
              </MoveCell>
              <MoveCell
                onClick={() => setUndoCount(moves.length - index * 2 - 2)}
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
      <NavigationButtons
        moveCount={moves.length}
        undoCount={undoCount}
        setUndoCount={setUndoCount}
      />
    </div>
  )
}
