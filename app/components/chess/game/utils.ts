import { Chess } from "chess.js"
import { Move } from "../types"

export function moveToSan(fen: string, move: Move): string | null {
  const chess = new Chess(fen)

  try {
    const result = chess.move(move)
    return result.san
  } catch {
    return null
  }
}

export function getMoveNumberArrays(moves: Move[]): [string, string][] {
  const chess = new Chess()
  const result: [string, string][] = []

  for (let i = 0; i < moves.length; i += 2) {
    const white = chess.move(moves[i]).san
    const black = i + 1 < moves.length ? chess.move(moves[i + 1]).san : ""
    result.push([white, black])
  }

  return result
}
