import { Chess } from "chess.js"
import { ShortMove } from "../types"

export function moveToSan(fen: string, move: ShortMove): string | null {
  const chess = new Chess(fen)

  try {
    const result = chess.move(move)
    return result.san
  } catch {
    return null
  }
}

export function movesToPgn(moves: string[]): string {
  let pgn = ""
  for (let i = 0; i < moves.length; i++) {
    const move = moves[i]
    if (i % 2 === 0) {
      pgn += `${Math.floor(i / 2) + 1}. ${move} `
    } else {
      pgn += `${move} `
    }
  }
  return pgn.trim()
}

export function getMoveNumberArrays(arr: string[]): [string, string][] {
  if (arr.length === 0) {
    return []
  }

  const moveSet: [string, string] = [arr[0] || "", arr[1] || ""]

  return [moveSet, ...getMoveNumberArrays(arr.slice(2))]
}
