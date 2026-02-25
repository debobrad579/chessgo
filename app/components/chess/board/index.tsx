import { Arrow } from "./Arrow"
import { Square } from "./Square"
import { parseFEN } from "@/lib/parsers"
import { squareToInt } from "./utils"
import { useArrows } from "./useArrows"
import { useBoardWidth } from "./useBoardWidth"
import { useDrag } from "./useDrag"
import type { Move } from "../types"

export type ChessboardProps = {
  fen: string
  previousMove?: Move
  check?: "w" | "b"
  onMove?: (move: Move) => void
  draggablePieces?: "w" | "b" | "n"
}

export function Chessboard({
  fen,
  previousMove,
  check,
  onMove,
  draggablePieces = "n",
}: ChessboardProps) {
  const { width, ref } = useBoardWidth()
  const {
    arrows,
    highlightedSquares,
    handleArrowStart,
    handleArrowRelease,
    handleBoardClick,
  } = useArrows(fen)
  const { draggedPiece, handleDragStart } = useDrag({
    width,
    ref,
    draggablePieces,
    onMove,
  })
  const board = parseFEN(fen)

  return (
    <div
      ref={ref}
      className="aspect-square grid grid-cols-8 grid-rows-8 relative"
      onClick={handleBoardClick}
    >
      {board.flat().map((piece, i) => (
        <Square
          key={i}
          index={i}
          squareWidth={width / 8}
          piece={draggedPiece?.index != i ? piece : null}
          isHighlighted={highlightedSquares
            .filter((highlightedSquare) => highlightedSquare.fen === fen)
            .map((highlightedSquare) => highlightedSquare.index)
            .includes(i)}
          isYellow={
            previousMove != null &&
            [
              squareToInt(previousMove.from),
              squareToInt(previousMove.to),
            ].includes(i)
          }
          check={
            (check === "w" && piece === "K") || (check === "b" && piece === "k")
          }
          onRightClick={() => handleArrowStart(i)}
          onRightRelease={() => handleArrowRelease(i)}
          onDragStart={(e) => handleDragStart(i, piece ?? "", e)}
        />
      ))}
      {draggedPiece && (
        <div
          className="absolute cursor-grabbing"
          style={{
            left: draggedPiece.x - width / 16,
            top: draggedPiece.y - width / 16,
            width: width / 8,
            height: width / 8,
          }}
        >
          <img
            src={`/static/pieces/${draggedPiece.piece}.svg`}
            alt={draggedPiece.piece}
            className="w-full h-full"
          />
        </div>
      )}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        {arrows
          .filter((arrow) => arrow.fen === fen)
          .map((arrow) => (
            <Arrow
              key={`${arrow.startIndex}${arrow.endIndex}`}
              squareWidth={width / 8}
              arrow={arrow}
            />
          ))}
      </svg>
    </div>
  )
}
