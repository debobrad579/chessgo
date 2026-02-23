import { useEffect, useMemo, useRef, useState } from "react"
import { Chess } from "chess.js"
import { useEventListener } from "@/hooks/useEventListener"
import { movesToPgn, moveToSan } from "./utils"
import type { ShortMove } from "../types"

export function useChessGame({
  defaultMoves,
  result,
  thinkTime,
}: {
  defaultMoves: string[]
  result: string
  thinkTime?: number | null
}) {
  const [moves, setMoves] = useState(defaultMoves)
  const [undoCount, setUndoCount] = useState(0)
  const [tick, setTick] = useState(0)
  const mouseOverBoard = useRef(false)

  const game = useMemo(() => {
    const chess = new Chess()
    const visibleMoves = moves.slice(0, moves.length - undoCount)
    chess.loadPgn(movesToPgn(visibleMoves))
    return chess
  }, [moves, undoCount])

  useEffect(() => {
    if (thinkTime == null || result !== "*") return
    const start = Date.now()
    const interval = setInterval(() => {
      setTick(Math.floor((Date.now() - start) / 1000))
    }, 1000)
    return () => clearInterval(interval)
  }, [thinkTime, result, moves.length])

  useEffect(() => {
    setMoves(defaultMoves)
    setUndoCount(0)
  }, [defaultMoves.length])

  useEventListener("keydown", (e: KeyboardEvent) => {
    if (!mouseOverBoard.current) return
    const actions: Record<string, () => void> = {
      ArrowLeft: undoMove,
      ArrowRight: redoMove,
      ArrowUp: reset,
      ArrowDown: () => {
        setUndoCount(0)
      },
    }
    if (e.key in actions) {
      e.preventDefault()
      actions[e.key]()
    }
  })

  function reset() {
    setUndoCount(moves.length)
  }

  function undoMove() {
    if (undoCount === moves.length) return
    setUndoCount((prev) => prev + 1)
  }

  function redoMove() {
    if (undoCount === 0) return
    setUndoCount((prev) => prev - 1)
  }

  function addMove(move: ShortMove) {
    const san = moveToSan(game.fen(), move)
    if (san == null) return false

    setMoves((prev) => [...prev, san])
    setUndoCount(0)
    return true
  }

  const previousMove = game.history({ verbose: true }).at(-1)

  return {
    moves,
    game,
    undoCount,
    tick,
    previousMove,
    mouseOverBoard,
    reset,
    undoMove,
    redoMove,
    setUndoCount,
    addMove,
  }
}
