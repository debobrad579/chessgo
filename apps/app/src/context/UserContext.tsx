import { createContext, useContext, type ReactNode } from "react"
import { useFetch } from "@/hooks/useFetch"
import { assertUser, type User } from "@/types/user"
import { API_BASE } from "@/lib/api"

const UserContext = createContext<User | null>(null)

export function UserProvider({ children }: { children: ReactNode }) {
  const { data: user } = useFetch(`${API_BASE}/api/me`, assertUser)

  return <UserContext.Provider value={user}>{children}</UserContext.Provider>
}

export function useUser() {
  const ctx = useContext(UserContext)
  if (!ctx) throw new Error("useUser must be used within a UserProvider")
  return ctx
}
