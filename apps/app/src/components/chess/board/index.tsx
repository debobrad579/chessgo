import { Arrow } from "./Arrow"
import { Square } from "./Square"
import { parseFEN } from "@/lib/parsers"
import { squareToInt, squareToPosition } from "./utils"
import { useArrows } from "./useArrows"
import { useBoardWidth } from "./useBoardWidth"
import { useDrag } from "./useDrag"
import type { Move } from "@/types/chess"
import { PromotionPopover } from "./PromotionPopover"

export type ChessboardProps = {
  fen: string
  previousMove?: Move
  check?: "w" | "b"
  onMove?: (move: Move) => void
  flipBoard?: boolean
  draggablePieces?: "w" | "b" | "n"
}

export function Chessboard({
  fen,
  previousMove,
  check,
  onMove,
  flipBoard = false,
  draggablePieces = "n",
}: ChessboardProps) {
  const { width, ref } = useBoardWidth()
  const {
    arrows,
    highlightedSquares,
    handleArrowStart,
    handleArrowEnd,
    handleBoardClick,
  } = useArrows(fen)
  const {
    draggedPiece,
    selectedSquare,
    handleDragStart,
    handleDragMove,
    handleDragEnd,
    pendingPromotion,
    setPendingPromotion,
  } = useDrag({
    boardRef: ref,
    width,
    fen,
    draggablePieces,
    onMove,
    flipBoard,
  })
  const board = parseFEN(fen)

  const anchorPos = pendingPromotion
    ? squareToPosition(pendingPromotion.to, width, flipBoard)
    : null

  function completePromotion(piece: "q" | "r" | "b" | "n") {
    if (!pendingPromotion) return
    onMove?.({ ...pendingPromotion, promotion: piece })
    setPendingPromotion(null)
  }

  return (
    <div
      ref={ref}
      className="aspect-square grid grid-cols-8 grid-rows-8 relative touch-none"
      onClick={handleBoardClick}
      onPointerMove={handleDragMove}
    >
      {board.flat().map((_, i) => {
        const displayIndex = flipBoard ? 63 - i : i
        const piece = board.flat()[displayIndex]

        return (
          <Square
            key={i}
            index={displayIndex}
            flipBoard={flipBoard}
            squareWidth={width / 8}
            showPiece={
              draggedPiece?.index !== displayIndex &&
              squareToInt(pendingPromotion?.from ?? "") !== displayIndex
            }
            piece={piece}
            isHighlighted={highlightedSquares
              .filter((h) => h.fen === fen)
              .map((h) => h.index)
              .includes(displayIndex)}
            isYellow={
              selectedSquare?.index === displayIndex ||
              (previousMove != null &&
                [
                  squareToInt(previousMove.from),
                  squareToInt(previousMove.to),
                ].includes(displayIndex))
            }
            check={
              (check === "w" && piece === "K") ||
              (check === "b" && piece === "k")
            }
            handleArrowStart={handleArrowStart}
            handleArrowEnd={handleArrowEnd}
            handleDragStart={handleDragStart}
            handleDragEnd={handleDragEnd}
          />
        )
      })}
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
            src={`/pieces/${draggedPiece.piece}.svg`}
            alt={draggedPiece.piece}
            className="w-full h-full"
          />
        </div>
      )}
      <PromotionPopover
        open={pendingPromotion != null}
        onSelect={completePromotion}
        onClose={() => setPendingPromotion(null)}
        anchor={
          anchorPos
            ? {
                left: anchorPos.left,
                top: anchorPos.top,
                size: anchorPos.squareWidth,
              }
            : undefined
        }
      />
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        {arrows
          .filter((arrow) => arrow.fen === fen)
          .map((arrow) => {
            const startIndex = flipBoard
              ? 63 - arrow.startIndex
              : arrow.startIndex
            const endIndex = flipBoard ? 63 - arrow.endIndex : arrow.endIndex

            return (
              <Arrow
                key={`${arrow.startIndex}${arrow.endIndex}`}
                squareWidth={width / 8}
                arrow={{ ...arrow, startIndex, endIndex }}
              />
            )
          })}
      </svg>
    </div>
  )
}
