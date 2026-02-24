import {
  ChevronFirst,
  ChevronLast,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Chessboard, type ChessboardProps } from "@/components/chess/board"
import { Clock } from "./clock"
import { MovesTable } from "./moves-table"
import { useChessGame } from "./use-chess-game"
import { MovesList } from "./moves-list"
import { forwardRef, useImperativeHandle } from "react"
import type { Game, Move } from "../types"

export type ChessGameHandle = {
  makeMove: (move: Move) => void
}

type ChessGameProps = {
  gameData: Game
  onMove: ChessboardProps["onMove"]
}
export const ChessGame = forwardRef<ChessGameHandle, ChessGameProps>(
  function ChessGame(
    {
      gameData: { white, black, moves, result, thinkTime },
      onMove,
    }: ChessGameProps,
    ref,
  ) {
    const {
      game,
      optimisticMoves,
      undoCount,
      tick,
      mouseOverBoard,
      reset,
      undoMove,
      redoMove,
      setUndoCount,
      addMove,
    } = useChessGame({ moves, result, thinkTime })

    useImperativeHandle(ref, () => ({
      makeMove: (move: Move) => {
        return addMove(move)
      },
    }))

    function handleWhiteMoveClick(index: number) {
      setUndoCount(optimisticMoves.length - index * 2 - 1)
    }

    function handleBlackMoveClick(index: number) {
      setUndoCount(optimisticMoves.length - index * 2 - 2)
    }

    const previousMove = optimisticMoves.at(
      optimisticMoves.length - undoCount - 1,
    )

    return (
      <div className="@container">
        <div
          className="flex flex-col @lg:flex-row gap-2"
          onMouseEnter={() => (mouseOverBoard.current = true)}
          onMouseLeave={() => (mouseOverBoard.current = false)}
        >
          <div className="flex-1 space-y-2">
            <div>
              <Clock
                className="bg-gray-800 text-white"
                timestamp={previousMove?.timestamp}
                undoCount={undoCount}
                turn={game.turn() === "b"}
                result={
                  { "0-1": "win", "1-0": "loss", "1/2-1/2": "draw", "*": "*" }[
                    result
                  ] as "win" | "loss" | "draw" | "*"
                }
                thinkTime={(thinkTime ?? 0) + tick}
                player={black}
              />
              <Chessboard
                fen={game.fen()}
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
                draggablePieces={undoCount != 0 ? "n" : game.turn()}
              />
              <Clock
                className="bg-gray-200 text-black"
                timestamp={previousMove?.timestamp}
                undoCount={undoCount}
                turn={game.turn() === "w"}
                result={
                  { "1-0": "win", "0-1": "loss", "1/2-1/2": "draw", "*": "*" }[
                    result
                  ] as "win" | "loss" | "draw" | "*"
                }
                thinkTime={(thinkTime ?? 0) + tick}
                player={white}
              />
            </div>
            <div className="flex gap-2">
              <Button
                className="w-full"
                onClick={reset}
                disabled={undoCount === optimisticMoves.length}
              >
                <ChevronFirst />
              </Button>
              <Button
                className="w-full"
                onClick={undoMove}
                disabled={undoCount === optimisticMoves.length}
              >
                <ChevronLeft />
              </Button>
              <Button
                className="w-full"
                onClick={redoMove}
                disabled={undoCount === 0}
              >
                <ChevronRight />
              </Button>
              <Button
                className="w-full"
                onClick={() => {
                  setUndoCount(0)
                }}
                disabled={undoCount === 0}
              >
                <ChevronLast />
              </Button>
            </div>
          </div>
          <MovesTable
            moves={optimisticMoves}
            result={result}
            undoCount={undoCount}
            onWhiteMoveClick={handleWhiteMoveClick}
            onBlackMoveClick={handleBlackMoveClick}
          />
          <MovesList
            moves={optimisticMoves}
            result={result}
            undoCount={undoCount}
            onWhiteMoveClick={handleWhiteMoveClick}
            onBlackMoveClick={handleBlackMoveClick}
          />
        </div>
      </div>
    )
  },
)
