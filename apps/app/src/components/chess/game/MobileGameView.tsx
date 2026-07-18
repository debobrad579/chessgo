import { Chessboard } from "@/components/chess/board"
import { BlackClock, WhiteClock } from "./Clock"
import { NavigationButtons } from "./NavigationButtons"
import { ScrollArea, ScrollBar } from "@chessgo/ui/scroll-area"
import { MoveCell } from "./MoveCell"
import { getMoveNumberArrays } from "./utils"
import { useRef, useState } from "react"
import { useUser } from "@/context/UserContext"
import { useChessGameContext } from "./ChessGameContext"
import { GameButtons } from "./GameButtons"

export function MobileGameView() {
  const user = useUser()
  const { moves, result, undoCount, white, black, game, setUndoCount, onMove } =
    useChessGameContext()

  const [flipBoard, setFlipBoard] = useState(user.id === black.id)
  const listScrollAreaRef = useRef<HTMLDivElement>(null)

  const previousMove =
    moves.length >= 1 && undoCount !== moves.length
      ? moves.at(moves.length - undoCount - 1)
      : null

  return (
    <div className="flex flex-col gap-2">
      {flipBoard ? <WhiteClock /> : <BlackClock />}
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
      {flipBoard ? <BlackClock /> : <WhiteClock />}
      <ScrollArea
        ref={listScrollAreaRef}
        className="relative w-full text-nowrap"
      >
        <MoveCell
          active={undoCount === moves.length}
          undoCount={undoCount}
          scrollAreaRef={listScrollAreaRef}
          noStyles
        />
        <div className="flex w-full gap-4">
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
        <ScrollBar orientation="horizontal" className="absolute top-5" />
      </ScrollArea>
      <NavigationButtons
        moveCount={moves.length}
        undoCount={undoCount}
        setUndoCount={setUndoCount}
      />
      <GameButtons handleFlipBoard={() => setFlipBoard((prev) => !prev)} />
    </div>
  )
}
