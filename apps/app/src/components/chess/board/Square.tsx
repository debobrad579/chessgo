import type { CSSProperties } from "react"

type SquareProps = {
  index: number
  piece: string | null
  isHighlighted: boolean
  isYellow: boolean
  check: boolean
  squareWidth: number
  handleArrowStart: (index: number) => void
  handleArrowEnd: (index: number) => void
  handleDragStart: (index: number, piece: string, e: React.PointerEvent) => void
  handleDragEnd: (index: number, piece: string, e: React.PointerEvent) => void
  showPiece?: boolean
  flipBoard?: boolean
}

export function Square({
  index,
  piece,
  isHighlighted,
  isYellow,
  check,
  squareWidth,
  handleArrowStart,
  handleArrowEnd,
  handleDragStart,
  handleDragEnd,
  showPiece = true,
  flipBoard = false,
}: SquareProps) {
  const isLight = (Math.floor(index / 8) + (index % 8)) % 2 === 0
  const rank = 8 - Math.floor(index / 8)
  const file = String.fromCharCode(97 + (index % 8))
  const showRank = flipBoard ? file === "h" : file === "a"
  const showFile = flipBoard ? rank === 8 : rank === 1

  function getBackgroundStyle(): CSSProperties {
    let backgroundColor = "#ba8765"
    let textColor = "#eed7b4"

    if (isLight) {
      if (isHighlighted) {
        backgroundColor = "#ee7965"
        textColor = "#e46956"
      } else if (isYellow) {
        backgroundColor = "#f6eb81"
        textColor = "#dcc35a"
      } else {
        backgroundColor = "#eed6b2"
        textColor = "#ba8765"
      }
    } else {
      if (isHighlighted) {
        backgroundColor = "#e46956"
        textColor = "#ee7965"
      } else if (isYellow) {
        backgroundColor = "#dcc35a"
        textColor = "#f6eb81"
      }
    }

    return {
      background: check
        ? `radial-gradient(ellipse at center, rgb(255,0,0) 0%, rgb(231,0,0) 25%, rgba(169,0,0,0) 89%, rgba(158,0,0,0) 100%), ${backgroundColor}`
        : backgroundColor,
      color: textColor,
    }
  }

  return (
    <div
      onMouseDown={(e) => {
        if (e.button === 2) {
          e.preventDefault()
          handleArrowStart(index)
        }
      }}
      onMouseUp={(e) => {
        if (e.button === 2) {
          e.preventDefault()
          handleArrowEnd(index)
        }
      }}
      onPointerDown={(e) => {
        if (e.button !== 2) {
          e.preventDefault()
          handleDragStart(index, piece ?? "", e)
        }
      }}
      onPointerUp={(e) => {
        if (e.button !== 2) {
          e.preventDefault()
          handleDragEnd(index, piece ?? "", e)
        }
      }}
      onContextMenu={(e) => e.preventDefault()}
      className={"relative aspect-square w-full leading-none"}
      style={getBackgroundStyle()}
    >
      {showRank && (
        <div
          className={"absolute top-1 left-1"}
          style={{ fontSize: squareWidth / 5 }}
        >
          {rank}
        </div>
      )}
      {showFile && (
        <div
          className={"absolute right-1 bottom-1"}
          style={{ fontSize: squareWidth / 5 }}
        >
          {file}
        </div>
      )}
      {showPiece && piece != null && (
        <img
          src={`/pieces/${piece}.svg`}
          alt={piece}
          className="h-full w-full cursor-grab"
        />
      )}
    </div>
  )
}
