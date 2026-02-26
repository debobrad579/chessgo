import { Chess, Color } from "chess.js"
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

export function getPlayerTimestamp({
  moves,
  undoCount,
  gameTurn,
  playerColor,
  thinkTime,
  initialTime,
}: {
  moves: Move[]
  undoCount: number
  gameTurn: Color
  playerColor: Color
  thinkTime: number
  initialTime: number
}) {
  const playerMoves = moves
    .slice(0, moves.length - undoCount)
    .filter((_, i) => (playerColor === "w" ? i % 2 === 0 : i % 2 === 1))
  const lastMove = playerMoves.at(-1)

  if (!lastMove) {
    if (gameTurn === playerColor) {
      return initialTime - thinkTime
    }
    return initialTime
  }

  if (gameTurn === playerColor) {
    return lastMove.timestamp - thinkTime
  }

  return lastMove.timestamp
}
