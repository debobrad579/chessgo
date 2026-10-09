import {
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type Ref,
} from "react"
import { Chess } from "chess.js"
import { useEventListener } from "@/hooks/useEventListener"
import type { Game, Move } from "@/types/chess"
import type { ChessGameHandle } from "."
import { playerExists } from "./utils"

export function useChessGame(gameData: Game, ref: Ref<ChessGameHandle>) {
  const [optimisticMoves, setOptimisticMoves] = useState(gameData.moves)
  const [optimisticThinkTime, setOptimisticThinkTime] = useState(
    gameData.think_time,
  )
  const [undoCount, setUndoCount] = useState(0)
  const previousMoveRef = useRef<Move | null>(null)
  const previousMoveIsCaptureRef = useRef<boolean>(false)

  const game = useMemo(() => {
    const game = new Chess()
    const visibleMoves = optimisticMoves.slice(
      0,
      optimisticMoves.length - undoCount,
    )

    if (visibleMoves.length === 0) {
      previousMoveRef.current = null
    }

    for (let i = 0; i < visibleMoves.length; i++) {
      const move = visibleMoves[i]
      const moveIsCapture = game.move(move).isCapture()

      if (i == visibleMoves.length - 1) {
        previousMoveRef.current = move
        previousMoveIsCaptureRef.current = moveIsCapture
      }
    }

    return game
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
    const actions: Record<string, () => void> = {
      ArrowLeft: () => {
        if (undoCount === optimisticMoves.length) return
        setUndoCount((prev) => prev + 1)
      },
      ArrowRight: () => {
        if (undoCount === 0) return
        setUndoCount((prev) => prev - 1)
      },
      ArrowUp: () => setUndoCount(optimisticMoves.length),
      ArrowDown: () => {
        setUndoCount(0)
      },
    }
    if (e.key in actions) {
      e.preventDefault()
      actions[e.key]()
    }
  })

  useImperativeHandle(ref, () => ({
    makeMove: (move: Move) => {
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
    },
  }))

  return {
    optimisticMoves,
    optimisticThinkTime,
    game,
    undoCount,
    setUndoCount,
    previousMove: previousMoveRef.current,
    previousMoveIsCapture: previousMoveIsCaptureRef.current,
  }
}
