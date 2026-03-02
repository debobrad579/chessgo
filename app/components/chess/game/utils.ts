import { Chess, Color } from "chess.js"
import { Move, Player } from "@/types/chess"

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
  playerColor,
  thinkTime,
  initialTime,
}: {
  moves: Move[]
  undoCount: number
  playerColor: Color
  thinkTime: number
  initialTime: number
}) {
  const effectiveMoves = moves.slice(0, moves.length - undoCount)

  const currentTurn: Color = effectiveMoves.length % 2 === 0 ? "w" : "b"

  const playerMoves = effectiveMoves.filter((_, i) =>
    playerColor === "w" ? i % 2 === 0 : i % 2 === 1,
  )

  const lastMove = playerMoves.at(-1)

  if (!lastMove) {
    if (currentTurn === playerColor && undoCount === 0) {
      return initialTime - thinkTime
    }
    return initialTime
  }

  if (currentTurn === playerColor && undoCount === 0) {
    return lastMove.timestamp - thinkTime
  }

  return lastMove.timestamp
}

export function playerExists(player: Player) {
  return player.id !== "00000000-0000-0000-0000-000000000000"
}
