"use client"

import { useEventListener } from "@/hooks/useEventListener"
import { useEffect, useRef, useState } from "react"
import { Arrow } from "./arrow"
import { Square } from "./square"
import { parseFEN } from "@/lib/parsers"

export function Chessboard({
  fen,
  previousMove,
  check,
  onMove,
}: {
  fen: string
  previousMove?: { from: string; to: string }
  check?: "w" | "b"
  onMove?: (from: string, to: string) => void
}) {
  const [highlightedSquares, setHighlightedSquares] = useState<
    { index: number; fen: string }[]
  >([])
  const [startArrowIndex, setStartArrowIndex] = useState<number | undefined>()
  const [arrows, setArrows] = useState<
    { startIndex: number; endIndex: number; fen: string }[]
  >([])
  const [width, setWidth] = useState(0)
  const [draggedPiece, setDraggedPiece] = useState<{
    index: number
    piece: string
    x: number
    y: number
  } | null>(null)
  const [dragStartSquare, setDragStartSquare] = useState<number | null>(null)

  const ref = useRef<HTMLDivElement>(null)
  const board = parseFEN(fen)

  useEventListener("resize", () => {
    if (!ref.current) return
    setWidth(ref.current?.clientWidth)
  })

  useEffect(() => {
    if (!ref.current) return
    setWidth(ref.current?.clientWidth)
  }, [])

  function addHighlightedSquare(i: number) {
    const highlightedIndices = highlightedSquares.map(
      (highlightedSquare) => highlightedSquare.index
    )

    if (highlightedIndices.includes(i)) {
      return setHighlightedSquares((prevHighlightedSquares) =>
        prevHighlightedSquares.toSpliced(highlightedIndices.indexOf(i), 1)
      )
    }

    setHighlightedSquares((prevRightClickedSquares) => [
      ...prevRightClickedSquares,
      { index: i, fen: fen },
    ])
  }

  function addArrow(i: number) {
    if (startArrowIndex == null) return

    const arrowKeys = arrows.map(
      (arrow) => `${arrow.startIndex}${arrow.endIndex}`
    )
    const arrowKey = `${startArrowIndex}${i}`

    if (arrowKeys.includes(arrowKey)) {
      return setArrows((prevArrows) =>
        prevArrows.toSpliced(arrowKeys.indexOf(arrowKey), 1)
      )
    }

    setArrows((prevArrows) => [
      ...prevArrows,
      { startIndex: startArrowIndex, endIndex: i, fen: fen },
    ])
  }

  function handleDragStart(index: number, piece: string, e: React.MouseEvent) {
    if (!ref.current || piece === "") return

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

    if (targetIndex >= 0 && targetIndex < 64 && targetIndex !== dragStartSquare) {
      onMove?.(intToSquare(dragStartSquare), intToSquare(targetIndex))
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

  return (
    <div
      ref={ref}
      className="aspect-square grid grid-cols-8 grid-rows-8 relative"
      onClick={() => {
        setArrows((prevArrows) =>
          prevArrows.filter((arrow) => arrow.fen !== fen)
        )
        setHighlightedSquares((prevHighlightedSquares) =>
          prevHighlightedSquares.filter(
            (highlightedSquare) => highlightedSquare.fen !== fen
          )
        )
      }}
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
          onRightClick={() => setStartArrowIndex(i)}
          onRightRelease={() => {
            if (startArrowIndex === i) addHighlightedSquare(i)
            else addArrow(i)
            setStartArrowIndex(undefined)
          }}
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

function squareToInt(square: string) {
  const file = square.charCodeAt(0) - "a".charCodeAt(0)
  const rank = 8 - parseInt(square[1], 10)
  return rank * 8 + file
}

function intToSquare(index: number) {
  const file = String.fromCharCode("a".charCodeAt(0) + (index % 8))
  const rank = 8 - Math.floor(index / 8)
  return file + rank
}
