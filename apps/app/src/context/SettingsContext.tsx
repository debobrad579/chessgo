import { useLocalStorage } from "@/hooks/useLocalStorage"
import { createContext, useContext, type ReactNode } from "react"

type SettingsContextType = {
  showBoardCoordinates: boolean
  setShowBoardCoordinates: (value: boolean) => void
  allowPremoves: boolean
  setAllowPremoves: (value: boolean) => void
  showGameOverModal: boolean
  setShowGameOverModal: (value: boolean) => void
  playPieceSounds: boolean
  setPlayPieceSounds: (value: boolean) => void
  playGameOverSound: boolean
  setPlayGameOverSound: (value: boolean) => void
  playLowTimeSound: boolean
  setPlayLowTimeSound: (value: boolean) => void
  lowTimeSoundThreshold: number
  setLowTimeSoundThreshold: (value: number) => void
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
  const [showGameOverModal, setShowGameOverModal] = useLocalStorage(
    "show-game-over-modal",
    true,
  )
  const [playPieceSounds, setPlayPieceSounds] = useLocalStorage(
    "play-piece-sounds",
    true,
  )
  const [playGameOverSound, setPlayGameOverSound] = useLocalStorage(
    "play-game-over-sound",
    true,
  )
  const [playLowTimeSound, setPlayLowTimeSound] = useLocalStorage(
    "play-low-time-sound",
    true,
  )
  const [lowTimeSoundThreshold, setLowTimeSoundThreshold] = useLocalStorage(
    "low-time-sound-threshold",
    60,
  )

  return (
    <SettingsContext.Provider
      value={{
        showBoardCoordinates,
        setShowBoardCoordinates,
        allowPremoves,
        setAllowPremoves,
        showGameOverModal,
        setShowGameOverModal,
        playPieceSounds,
        setPlayPieceSounds,
        playGameOverSound,
        setPlayGameOverSound,
        playLowTimeSound,
        setPlayLowTimeSound,
        lowTimeSoundThreshold,
        setLowTimeSoundThreshold,
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
