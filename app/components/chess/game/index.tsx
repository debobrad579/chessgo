import {
  ChevronFirst,
  ChevronLast,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Chessboard, type ChessboardProps } from "@/components/chess/board"
import { Clock } from "./Clock"
import { MovesTable } from "./MovesTable"
import { MovesList } from "./MovesList"
import { useChessGame } from "./useChessGame"
import { forwardRef, useImperativeHandle } from "react"
import type { GameData, Move } from "@/types/chess"
import { useUser } from "@/context/UserContext"

export type ChessGameHandle = {
  makeMove: (move: Move) => void
}

type ChessGameProps = {
  gameData: GameData
  onMove?: ChessboardProps["onMove"]
}

export const ChessGame = forwardRef<ChessGameHandle, ChessGameProps>(
  function ChessGame({ gameData, onMove }, ref) {
    const {
      game,
      optimisticMoves,
      optimisticThinkTime,
      undoCount,
      mouseOverBoard,
      reset,
      undoMove,
      redoMove,
      setUndoCount,
      addMove,
    } = useChessGame({ gameData })

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

    const previousMove =
      optimisticMoves.length >= 1
        ? optimisticMoves.at(optimisticMoves.length - undoCount - 1)
        : null

    const whiteResult = {
      "1-0": "win",
      "0-1": "loss",
      "1/2-1/2": "draw",
      "*": "*",
    }[gameData.result] as "win" | "loss" | "draw" | "*"

    const blackResult = {
      "0-1": "win",
      "1-0": "loss",
      "1/2-1/2": "draw",
      "*": "*",
    }[gameData.result] as "win" | "loss" | "draw" | "*"

    const { user } = useUser()

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
                moves={optimisticMoves}
                playerColor={user?.id === gameData.black.id ? "w" : "b"}
                undoCount={undoCount}
                thinkTime={optimisticThinkTime}
                initialTime={gameData.time_control.base}
                result={
                  user?.id === gameData.black.id ? whiteResult : blackResult
                }
                player={
                  user?.id === gameData.black.id
                    ? gameData.white
                    : gameData.black
                }
              />
              <Chessboard
                fen={game.fen()}
                flipBoard={user?.id === gameData.black.id}
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
                  undoCount !== 0 || gameData.result !== "*"
                    ? "n"
                    : user?.id === gameData.white.id
                      ? "w"
                      : user?.id === gameData.black.id
                        ? "b"
                        : "n"
                }
              />
              <Clock
                moves={optimisticMoves}
                playerColor={user?.id === gameData.black.id ? "b" : "w"}
                undoCount={undoCount}
                thinkTime={optimisticThinkTime}
                initialTime={gameData.time_control.base}
                result={
                  user?.id === gameData.black.id ? blackResult : whiteResult
                }
                player={
                  user?.id === gameData.black.id
                    ? gameData.black
                    : gameData.white
                }
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
            result={gameData.result}
            undoCount={undoCount}
            onWhiteMoveClick={handleWhiteMoveClick}
            onBlackMoveClick={handleBlackMoveClick}
          />
          <MovesList
            moves={optimisticMoves}
            result={gameData.result}
            undoCount={undoCount}
            onWhiteMoveClick={handleWhiteMoveClick}
            onBlackMoveClick={handleBlackMoveClick}
          />
        </div>
      </div>
    )
  },
)
