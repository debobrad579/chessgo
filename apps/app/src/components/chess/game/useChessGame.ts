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

const turnKey = (gameData: Game) =>
  `${gameData.moves.length}:${gameData.result}`

export function useChessGame(
  gameData: Game,
  clockType: string,
  ref: Ref<ChessGameHandle>,
) {
  const [optimisticMoves, setOptimisticMoves] = useState(gameData.moves)
  const [undoCount, setUndoCount] = useState(0)
  const previousMoveRef = useRef<Move | null>(null)
  const previousMoveIsCaptureRef = useRef<boolean>(false)
  const [anchor, setAnchor] = useState({
    key: turnKey(gameData),
    startedAt: performance.now() - gameData.think_time,
  })
  const [prevGameData, setPrevGameData] = useState(gameData)

  if (gameData !== prevGameData) {
    setPrevGameData(gameData)
    setOptimisticMoves(gameData.moves)
    if (gameData.moves.length !== prevGameData.moves.length) setUndoCount(0)

    const key = turnKey(gameData)
    const candidate = performance.now() - gameData.think_time
    setAnchor((a) =>
      a.key === key
        ? { key, startedAt: Math.min(a.startedAt, candidate) }
        : { key, startedAt: candidate },
    )
  }

  const clockRunning =
    clockType !== "no-clocks" &&
    gameData.result === "*" &&
    playerExists(gameData.white) &&
    playerExists(gameData.black)

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
      const chessMove = game.move(move)
      const moveIsCapture = chessMove.isCapture() || chessMove.isEnPassant()

      if (i == visibleMoves.length - 1) {
        previousMoveRef.current = move
        previousMoveIsCaptureRef.current = moveIsCapture
      }
    }

    return game
  }, [optimisticMoves, undoCount])

  useEffect(() => {
    setOptimisticMoves(gameData.moves)
    setUndoCount(0)

    if (
      gameData.result !== "*" ||
      !playerExists(gameData.white) ||
      !playerExists(gameData.black)
    )
      return
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
      if (undoCount !== 0) return false
      try {
        game.move(move)

        const now = performance.now()
        const len = optimisticMoves.length
        const wasTicking = clockType !== "lichess" || len >= 2
        const thinkTime = wasTicking ? now - anchor.startedAt : 0

        const parity = len % 2
        const last = optimisticMoves.filter((_, i) => i % 2 === parity).at(-1)
        const prevTimestamp = last?.timestamp ?? gameData.time_control.base
        const optimisticTimestamp =
          prevTimestamp - thinkTime + (gameData.time_control.increment ?? 0)

        setOptimisticMoves((m) => [
          ...m,
          { ...move, timestamp: optimisticTimestamp },
        ])
        setAnchor({ key: `${len + 1}:*`, startedAt: now })
        return true
      } catch {
        return false
      }
    },
  }))

  return {
    optimisticMoves,
    turnStartedAt: anchor.startedAt,
    clockRunning,
    game,
    undoCount,
    setUndoCount,
    previousMove: previousMoveRef.current,
    previousMoveIsCapture: previousMoveIsCaptureRef.current,
  }
}
