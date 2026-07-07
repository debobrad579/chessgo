import { createContext, useContext, type ReactNode } from "react"
import { useFetch } from "@/hooks/useFetch"
import { assertLichessAccount, type LichessAccount } from "@/types/user"
import { API_BASE } from "@/lib/api"

const LichessContext = createContext<LichessAccount | null>(null)

export function LichessAccountProvider({ children }: { children: ReactNode }) {
  const { data: account } = useFetch(
    `${API_BASE}/lichess/account`,
    { credentials: "include" },
    assertLichessAccount,
  )

  return (
    <LichessContext.Provider value={account}>
      {children}
    </LichessContext.Provider>
  )
}

export function useLichessAccount() {
  const ctx = useContext(LichessContext)
  if (!ctx)
    throw new Error("useLichessAccount must be used within a UserProvider")
  return ctx
}
