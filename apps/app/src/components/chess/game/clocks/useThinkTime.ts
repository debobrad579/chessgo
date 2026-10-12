import { useEffect, useReducer } from "react"
import { useChessGameContext } from "../ChessGameContext"

export function useThinkTime() {
  const { turnStartedAt } = useChessGameContext()
  const [, force] = useReducer((x: number) => x + 1, 0)

  useEffect(() => {
    const id = setInterval(force, 100)
    return () => clearInterval(id)
  }, [])

  return Math.max(0, performance.now() - turnStartedAt)
}
