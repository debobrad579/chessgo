import { useEffect, useMemo, useOptimistic, useRef, useState } from "react"
import { Chess } from "chess.js"
import { useEventListener } from "@/hooks/useEventListener"
import type { Move } from "../types"

export function useChessGame({
  moves,
  result,
  thinkTime,
}: {
  moves: Move[]
  result: string
  thinkTime?: number | null
}) {
  const [optimisticMoves, setOptimisticMoves] = useOptimistic(moves)
  const [undoCount, setUndoCount] = useState(0)
  const [tick, setTick] = useState(0)
  const mouseOverBoard = useRef(false)

  const game = useMemo(() => {
    const chess = new Chess()
    const visibleMoves = optimisticMoves.slice(
      0,
      optimisticMoves.length - undoCount,
    )
    for (const move of visibleMoves) {
      chess.move(move)
    }
    return chess
  }, [optimisticMoves, undoCount])

  useEffect(() => {
    if (thinkTime == null || result !== "*") return
    const start = Date.now()
    const interval = setInterval(() => {
      setTick(Math.floor((Date.now() - start) / 1000))
    }, 1000)
    return () => clearInterval(interval)
  }, [thinkTime, result, moves])

  useEffect(() => {
    setUndoCount(0)
  }, [moves.length])

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
    setUndoCount(optimisticMoves.length)
  }

  function undoMove() {
    if (undoCount === optimisticMoves.length) return
    setUndoCount((prev) => prev + 1)
  }

  function redoMove() {
    if (undoCount === 0) return
    setUndoCount((prev) => prev - 1)
  }

  function addMove(move: Move): boolean {
    try {
      game.move(move)

      setOptimisticMoves((prev) => [...prev, move])
      setUndoCount(0)
      return true
    } catch {
      return false
    }
  }

  return {
    optimisticMoves,
    game,
    undoCount,
    tick,
    mouseOverBoard,
    reset,
    undoMove,
    redoMove,
    setUndoCount,
    addMove,
  }
}
