import { createContext, useContext } from "react"
import { ChessGameProps } from "."

const ChessGameContext = createContext<ChessGameProps | null>(null)

export function ChessGameProvider({
  children,
  value,
}: {
  children: React.ReactNode
  value: ChessGameProps
}) {
  return (
    <ChessGameContext.Provider value={value}>
      {children}
    </ChessGameContext.Provider>
  )
}

export function useChessGameContext() {
  const ctx = useContext(ChessGameContext)
  if (!ctx)
    throw new Error("useChessGameContext must be used within ChessGameProvider")
  return ctx
}
