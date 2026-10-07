import type { Move } from "@/types/chess"
import { Chess } from "chess.js"

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

export function squareToPosition(
  square: string,
  width: number,
  flipBoard: boolean,
) {
  const file = square.charCodeAt(0) - "a".charCodeAt(0)
  const rank = 8 - parseInt(square[1], 10)
  const col = flipBoard ? 7 - file : file
  const row = flipBoard ? 7 - rank : rank
  const squareWidth = width / 8
  return { left: col * squareWidth, top: row * squareWidth, squareWidth }
}

export function isValidPremove(fen: string, premove: Move) {
  const game = new Chess(fen)

  for (const move of game.moves()) {
    game.move(move)

    try {
      game.move(premove)
      return true
    } catch {}

    game.undo()
  }

  return false
}
