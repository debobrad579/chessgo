import { RefObject, useState } from "react"
import { canDragPiece, intToSquare } from "./utils"
import type { ChessboardProps } from "."

export function useDrag({
  width,
  boardRef,
  draggablePieces = "n",
  onMove,
  flipBoard = false,
}: {
  width: number
  boardRef: RefObject<HTMLDivElement | null>
  draggablePieces: ChessboardProps["draggablePieces"]
  onMove: ChessboardProps["onMove"]
  flipBoard?: boolean
}) {
  const [draggedPiece, setDraggedPiece] = useState<{
    index: number
    piece: string
    x: number
    y: number
  } | null>(null)
  const [selectedSquare, setSelectedSquare] = useState<number | null>(null)

  function handleDragStart(
    index: number,
    piece: string,
    e: React.PointerEvent,
  ) {
    if (
      selectedSquare != null &&
      selectedSquare != index &&
      !canDragPiece(piece, draggablePieces)
    ) {
      onMove?.({
        from: intToSquare(selectedSquare),
        to: intToSquare(index),
        timestamp: 360,
      })
      return
    }

    if (
      !boardRef.current ||
      piece === "" ||
      !canDragPiece(piece, draggablePieces)
    )
      return

    e.currentTarget.setPointerCapture(e.pointerId)

    const rect = boardRef.current.getBoundingClientRect()
    setDraggedPiece({
      index,
      piece,
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    })
  }

  function handleDragMove(e: React.PointerEvent) {
    if (!draggedPiece || !boardRef.current) return

    const rect = boardRef.current.getBoundingClientRect()

    setDraggedPiece({
      ...draggedPiece,
      x: Math.max(0, Math.min(e.clientX - rect.left, width)),
      y: Math.max(0, Math.min(e.clientY - rect.top, width)),
    })
  }

  function handleDragEnd(index: number, piece: string, e: React.PointerEvent) {
    setSelectedSquare(null)

    if (boardRef.current == null) return

    const rect = boardRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const squareWidth = width / 8

    const col = flipBoard
      ? 7 - Math.floor(x / squareWidth)
      : Math.floor(x / squareWidth)
    const row = flipBoard
      ? 7 - Math.floor(y / squareWidth)
      : Math.floor(y / squareWidth)
    const targetIndex = row * 8 + col

    if (index === targetIndex && canDragPiece(piece, draggablePieces)) {
      setSelectedSquare(selectedSquare === index ? null : index)
      setDraggedPiece(null)
      return
    }

    if (draggedPiece == null) {
      setDraggedPiece(null)
      return
    }

    if (targetIndex >= 0 && targetIndex < 64) {
      onMove?.({
        from: intToSquare(index),
        to: intToSquare(targetIndex),
        timestamp: 360,
      })
    }

    setDraggedPiece(null)
  }

  return {
    draggedPiece,
    selectedSquare,
    handleDragStart,
    handleDragMove,
    handleDragEnd,
  }
}
