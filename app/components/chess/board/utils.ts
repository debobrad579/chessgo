export function squareToInt(square: string) {
  const file = square.charCodeAt(0) - "a".charCodeAt(0)
  const rank = 8 - parseInt(square[1], 10)
  return rank * 8 + file
}

export function intToSquare(index: number) {
  const file = String.fromCharCode("a".charCodeAt(0) + (index % 8))
  const rank = 8 - Math.floor(index / 8)
  return file + rank
}

export function canDragPiece(piece: string, draggablePieces: "w" | "b" | "n") {
  if (draggablePieces == "n" || piece == "") return false

  if (piece == piece.toUpperCase()) {
    if (draggablePieces == "b") return false
  } else {
    if (draggablePieces == "w") return false
  }

  return true
}
