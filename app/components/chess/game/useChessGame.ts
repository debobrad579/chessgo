import { useEffect, useMemo, useRef, useState } from "react"
import { Chess } from "chess.js"
import { useEventListener } from "@/hooks/useEventListener"
import { GameData, Move } from "@/types/chess"
import { playerExists } from "./utils"

export function useChessGame({ gameData }: { gameData: GameData }) {
  const [optimisticMoves, setOptimisticMoves] = useState(gameData.moves)
  const [optimisticThinkTime, setOptimisticThinkTime] = useState(
    gameData.think_time,
  )
  const [undoCount, setUndoCount] = useState(0)
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
    setOptimisticMoves(gameData.moves)
    setOptimisticThinkTime(gameData.think_time)
    setUndoCount(0)

    if (
      gameData.result !== "*" ||
      !playerExists(gameData.white) ||
      !playerExists(gameData.black)
    )
      return

    const startTime = Date.now()

    const interval = setInterval(() => {
      setOptimisticThinkTime(gameData.think_time + (Date.now() - startTime))
    }, 100)

    return () => clearInterval(interval)
  }, [gameData])

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

      const justMovedIsWhite = game.turn() === "b"
      const playerMoves = optimisticMoves.filter((_, i) =>
        justMovedIsWhite ? i % 2 === 0 : i % 2 === 1,
      )
      const lastTimestamp =
        playerMoves.at(-1)?.timestamp ?? gameData.time_control.base
      const optimisticTimestamp = lastTimestamp - optimisticThinkTime

      setOptimisticMoves((prev) => [
        ...prev,
        { ...move, timestamp: optimisticTimestamp },
      ])
      setOptimisticThinkTime(0)
      setUndoCount(0)
      return true
    } catch {
      return false
    }
  }

  return {
    optimisticMoves,
    optimisticThinkTime,
    game,
    undoCount,
    mouseOverBoard,
    reset,
    undoMove,
    redoMove,
    setUndoCount,
    addMove,
  }
}
