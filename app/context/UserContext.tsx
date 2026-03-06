import { createContext, useContext, type ReactNode } from "react"
import { useFetch } from "@/hooks/useFetch"
import type { User } from "@/types/user"

const UserContext = createContext<User | null>(null)

export function UserProvider({ children }: { children: ReactNode }) {
  const { data: user } = useFetch<User>("/api/me")

  return <UserContext.Provider value={user}>{children}</UserContext.Provider>
}

export function useUser() {
  const ctx = useContext(UserContext)
  if (!ctx) throw new Error("useUser must be used within a UserProvider")
  return ctx
}
