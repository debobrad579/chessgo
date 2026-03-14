import { type RefObject, useState } from "react"
import { canDragPiece, intToSquare } from "./utils"
import type { ChessboardProps } from "."
import { Chess } from "chess.js"

export function useDrag({
  width,
  fen,
  boardRef,
  draggablePieces = "n",
  onMove,
  flipBoard = false,
}: {
  width: number
  fen: string
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
  const [selectedSquare, setSelectedSquare] = useState<{
    index: number
    piece: string
  } | null>(null)
  const [pendingPromotion, setPendingPromotion] = useState<{
    from: string
    to: string
    timestamp: number
  } | null>(null)

  function move(piece: string, from: number, to: number) {
    setSelectedSquare(null)

    if (onMove == null) return
    const move = {
      from: intToSquare(from),
      to: intToSquare(to),
      timestamp: 0,
    }

    let isPromotion = true
    try {
      const isPawn = piece === "P" || piece === "p"
      const isWhitePromotion = piece === "P" && Math.floor(to / 8) === 0
      const isBlackPromotion = piece === "p" && Math.floor(to / 8) === 7
      if (!isPawn || (!isWhitePromotion && !isBlackPromotion)) {
        isPromotion = false
      }
      const chess = new Chess(fen)
      chess.move({
        ...move,
        promotion: "q",
      })
    } catch {
      isPromotion = false
    }

    if (isPromotion) {
      setPendingPromotion(move)
    } else {
      onMove(move)
    }
  }

  function handleDragStart(
    index: number,
    piece: string,
    e: React.PointerEvent,
  ) {
    if (
      selectedSquare != null &&
      selectedSquare.index != index &&
      !canDragPiece(piece, draggablePieces)
    ) {
      move(selectedSquare.piece, selectedSquare.index, index)
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

    if (draggedPiece == null) return

    if (index === targetIndex) {
      setSelectedSquare(
        selectedSquare?.index === index ? null : { index, piece },
      )
      setDraggedPiece(null)
      return
    }

    if (targetIndex >= 0 && targetIndex < 64) {
      move(piece, index, targetIndex)
    }

    setDraggedPiece(null)
  }

  return {
    draggedPiece,
    selectedSquare,
    handleDragStart,
    handleDragMove,
    handleDragEnd,
    pendingPromotion,
    setPendingPromotion,
  }
}
