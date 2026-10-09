import { useLocalStorage } from "@/hooks/useLocalStorage"
import { createContext, useContext, type ReactNode } from "react"

type SettingsContextType = {
  showBoardCoordinates: boolean
  setShowBoardCoordinates: (value: boolean) => void
  allowPremoves: boolean
  setAllowPremoves: (value: boolean) => void
  playPieceSounds: boolean
  setPlayPieceSounds: (value: boolean) => void
}

const SettingsContext = createContext<SettingsContextType | null>(null)

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [showBoardCoordinates, setShowBoardCoordinates] = useLocalStorage(
    "show-board-coordinates",
    true,
  )
  const [allowPremoves, setAllowPremoves] = useLocalStorage(
    "allow-premoves",
    true,
  )
  const [playPieceSounds, setPlayPieceSounds] = useLocalStorage(
    "play-piece-sounds",
    true,
  )

  return (
    <SettingsContext.Provider
      value={{
        showBoardCoordinates,
        setShowBoardCoordinates,
        allowPremoves,
        setAllowPremoves,
        playPieceSounds,
        setPlayPieceSounds,
      }}
    >
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const context = useContext(SettingsContext)

  if (!context) {
    throw new Error("useSettings must be used within SettingsProvider")
  }

  return context
}
