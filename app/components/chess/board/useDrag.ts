import { RefObject, useEffect, useState } from "react"
import { canDragPiece, intToSquare } from "./utils"
import type { ChessboardProps } from "."

export function useDrag({
  width,
  ref,
  draggablePieces = "n",
  onMove,
}: {
  width: number
  ref: RefObject<HTMLDivElement | null>
  draggablePieces: ChessboardProps["draggablePieces"]
  onMove: ChessboardProps["onMove"]
}) {
  const [dragStartSquare, setDragStartSquare] = useState<number | null>(null)
  const [draggedPiece, setDraggedPiece] = useState<{
    index: number
    piece: string
    x: number
    y: number
  } | null>(null)

  function handleDragStart(index: number, piece: string, e: React.MouseEvent) {
    if (!ref.current || piece === "" || !canDragPiece(piece, draggablePieces))
      return

    const rect = ref.current.getBoundingClientRect()
    setDraggedPiece({
      index,
      piece,
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    })
    setDragStartSquare(index)
  }

  function handleDragMove(e: MouseEvent) {
    if (!draggedPiece || !ref.current) return

    const rect = ref.current.getBoundingClientRect()

    setDraggedPiece({
      ...draggedPiece,
      x: Math.max(0, Math.min(e.clientX - rect.left, width)),
      y: Math.max(0, Math.min(e.clientY - rect.top, width)),
    })
  }

  function handleDragEnd(e: MouseEvent) {
    if (!draggedPiece || !ref.current || dragStartSquare === null) {
      setDraggedPiece(null)
      setDragStartSquare(null)
      return
    }

    const rect = ref.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const squareWidth = width / 8

    const col = Math.floor(x / squareWidth)
    const row = Math.floor(y / squareWidth)
    const targetIndex = row * 8 + col

    if (
      targetIndex >= 0 &&
      targetIndex < 64 &&
      targetIndex !== dragStartSquare
    ) {
      onMove?.({
        from: intToSquare(dragStartSquare),
        to: intToSquare(targetIndex),
        timestamp: 0,
      })
    }

    setDraggedPiece(null)
    setDragStartSquare(null)
  }

  useEffect(() => {
    if (!draggedPiece) return

    const handleMove = (e: MouseEvent) => handleDragMove(e)
    const handleUp = (e: MouseEvent) => handleDragEnd(e)

    window.addEventListener("mousemove", handleMove)
    window.addEventListener("mouseup", handleUp)

    return () => {
      window.removeEventListener("mousemove", handleMove)
      window.removeEventListener("mouseup", handleUp)
    }
  }, [draggedPiece, width, dragStartSquare])

  return {
    draggedPiece,
    handleDragStart,
  }
}
