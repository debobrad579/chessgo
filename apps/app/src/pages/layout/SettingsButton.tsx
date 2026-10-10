import { useLichessAccount } from "@/context/LichessContext"
import { useUser } from "@/context/UserContext"
import { API_BASE } from "@/lib/api"
import { Button } from "@chessgo/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@chessgo/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@chessgo/ui/tabs"
import { Settings } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@chessgo/ui/select"
import { useTheme } from "@/context/ThemeContext"
import { Label } from "@chessgo/ui/label"
import { Switch } from "@chessgo/ui/switch"
import { useSettings } from "@/context/SettingsContext"
import { Input } from "@chessgo/ui/input"

export function SettingsButton({ mobile = false }: { mobile?: boolean }) {
  const user = useUser()
  const lichessAccount = useLichessAccount()
  const { theme, setTheme } = useTheme()
  const {
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
  } = useSettings()

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" className={mobile ? "px-1 py-0" : undefined}>
          <Settings />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="ui">
          <TabsList variant="line" className="w-full">
            <TabsTrigger value="ui">Appearance</TabsTrigger>
            <TabsTrigger value="game">Game</TabsTrigger>
            {user.email && <TabsTrigger value="account">Account</TabsTrigger>}
          </TabsList>
          <TabsContent
            value="ui"
            className="grid auto-rows-[1.6rem] grid-cols-[2fr_3fr] items-center gap-2"
          >
            <Label>Theme:</Label>
            <Select value={theme} onValueChange={setTheme}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            <Label htmlFor="coords-switch">Board Coordinates:</Label>
            <Switch
              id="coords-switch"
              checked={showBoardCoordinates}
              onCheckedChange={setShowBoardCoordinates}
            />
          </TabsContent>
          <TabsContent
            value="game"
            className="grid auto-rows-[1.6rem] grid-cols-[2fr_3fr] items-center gap-2"
          >
            <Label htmlFor="premoves-switch">Premoves:</Label>
            <Switch
              id="premoves-switch"
              checked={allowPremoves}
              onCheckedChange={setAllowPremoves}
            />
            <Label htmlFor="game-over-modal-switch">Game Over Modal:</Label>
            <Switch
              id="game-over-modal-switch"
              checked={showGameOverModal}
              onCheckedChange={setShowGameOverModal}
            />
            <Label htmlFor="piece-sounds-switch">Piece Sounds:</Label>
            <Switch
              id="piece-sounds-switch"
              checked={playPieceSounds}
              onCheckedChange={setPlayPieceSounds}
            />
            <Label htmlFor="game-over-sound-switch">Game Over Sound:</Label>
            <Switch
              id="game-over-sound-switch"
              checked={playGameOverSound}
              onCheckedChange={setPlayGameOverSound}
            />
            <Label htmlFor="low-time-sound-switch">Low Time Sound:</Label>
            <div className="flex items-center gap-2">
              <Switch
                id="low-time-sound-switch"
                checked={playLowTimeSound}
                onCheckedChange={setPlayLowTimeSound}
              />
              {playLowTimeSound && (
                <>
                  <Input
                    className="w-12"
                    value={lowTimeSoundThreshold}
                    onChange={(e) => {
                      const raw = e.target.value

                      if (raw.length > 3) return

                      if (raw === "") {
                        setLowTimeSoundThreshold(0)
                        return
                      }

                      let num = NaN

                      if (raw[0] === "0") {
                        num = parseInt(raw[1])
                      } else {
                        num = parseInt(raw)
                      }

                      if (!isNaN(num)) setLowTimeSoundThreshold(num)
                    }}
                  />
                  <div>s</div>
                </>
              )}
            </div>
          </TabsContent>
          <TabsContent value="account">
            {!lichessAccount.connected ? (
              <Button
                className="w-full"
                disabled={lichessAccount.connected}
                onClick={() => {
                  fetch(`${API_BASE}/lichess/tokens`, {
                    method: "POST",
                    credentials: "include",
                  })
                    .then((res) => res.json())
                    .then((data) => {
                      const authURL = data.authURL
                      if (typeof authURL === "string") {
                        window.location.href = authURL
                      }
                    })
                }}
              >
                Link Lichess Account
              </Button>
            ) : (
              <Button
                variant="destructive"
                className="w-full"
                onClick={() => {
                  fetch(`${API_BASE}/lichess/tokens`, {
                    method: "DELETE",
                    credentials: "include",
                  })
                }}
              >
                Unlink Lichess Account
              </Button>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
