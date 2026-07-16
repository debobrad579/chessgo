import { Button } from "@chessgo/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@chessgo/ui/dialog"
import { Label } from "@chessgo/ui/label"
import { useNavigate } from "react-router"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@chessgo/ui/select"
import { useRef, useState } from "react"
import { API_BASE } from "@/lib/api"
import { useLichessAccount } from "@/context/LichessContext"
import { Switch } from "@chessgo/ui/switch"
import { Input } from "@chessgo/ui/input"
import { seekGame } from "../lichess/utils"
import { Loader2 } from "lucide-react"

export function CreateGameButton() {
  const navigate = useNavigate()
  const lichessAccount = useLichessAccount()
  const [color, setColor] = useState("random")
  const [server, setServer] = useState(
    lichessAccount.connected ? "lichess" : "chessgo",
  )
  const [time, setTime] = useState("10")
  const [increment, setIncrement] = useState("0")
  const [rated, setRated] = useState(lichessAccount.connected)
  const [customTimeControl, setCustomTimeControl] = useState(false)
  const [timeControlError, setTimeControlError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const controllerRef = useRef<AbortController>(null)

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="w-full">Create Game</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Game</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-[1fr_2fr] gap-4">
          <Label>Server:</Label>
          <Select
            value={server}
            onValueChange={(newServer) => {
              setServer(newServer)
              setRated(newServer !== "lichess" ? false : true)
            }}
            disabled={!lichessAccount.connected}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="chessgo">ChessGo</SelectItem>
                <SelectItem value="lichess">Lichess</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <Label>Time Control:</Label>
          <div className="flex items-center gap-2">
            {customTimeControl ? (
              <>
                <Input
                  value={time}
                  onChange={(e) => {
                    const raw = e.target.value

                    if (raw === "") {
                      setTime("0")
                      return
                    }

                    if (!/^-?\d{1,2}$/.test(raw)) return

                    setTime((prev) => {
                      if (prev === "0" && raw.length === 2 && raw[0] === "0") {
                        return raw[1]
                      }
                      return raw
                    })
                  }}
                />
                <span>+</span>
                <Input
                  value={increment}
                  onChange={(e) => {
                    const raw = e.target.value

                    if (raw === "") {
                      setIncrement("0")
                      return
                    }

                    if (!/^-?\d{1,2}$/.test(raw)) return

                    setIncrement((prev) => {
                      if (prev === "0" && raw.length === 2 && raw[0] === "0") {
                        return raw[1]
                      }
                      return raw
                    })
                  }}
                />
              </>
            ) : (
              <Select
                value={`${time}+${increment}`}
                onValueChange={(timeControl) => {
                  const plusIndex = timeControl.indexOf("+")
                  setTime(timeControl.slice(0, plusIndex))
                  setIncrement(timeControl.slice(plusIndex + 1))
                }}
                disabled={!lichessAccount.connected}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {server !== "lichess" && (
                      <>
                        <SelectItem value="1+0">1 + 0</SelectItem>
                        <SelectItem value="2+1">2 + 1</SelectItem>
                        <SelectItem value="3+0">3 + 0</SelectItem>
                        <SelectItem value="3+2">3 + 2</SelectItem>
                        <SelectItem value="5+0">5 + 0</SelectItem>
                      </>
                    )}
                    <SelectItem value="10+0">10 + 0</SelectItem>
                    <SelectItem value="10+5">10 + 5</SelectItem>
                    <SelectItem value="15+10">15 + 10</SelectItem>
                    <SelectItem value="30+0">30 + 0</SelectItem>
                    <SelectItem value="30+20">30 + 20</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            )}
            <Button
              variant={customTimeControl ? "default" : "secondary"}
              onClick={() => setCustomTimeControl((prev) => !prev)}
            >
              Custom
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              id="rated-switch"
              checked={rated}
              disabled={server !== "lichess"}
              onCheckedChange={setRated}
            />
            <Label htmlFor="rated-switch">Rated</Label>
          </div>
          <div className="text-destructive">{timeControlError}</div>
          {!rated && (
            <>
              <Label>Play as:</Label>
              <Select value={color} onValueChange={setColor}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="random">Random</SelectItem>
                    <SelectItem value="white">White</SelectItem>
                    <SelectItem value="black">Black</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </>
          )}
        </div>
        <DialogFooter>
          <Button
            variant={isLoading ? "secondary" : "default"}
            onClick={() => {
              if (isLoading && controllerRef.current != null) {
                controllerRef.current.abort()
                return
              }

              const controller = new AbortController()
              controllerRef.current = controller
              controller.signal.addEventListener("abort", () => {
                setIsLoading(false)
              })

              setIsLoading(true)

              if (Number(time) === 0) {
                setTimeControlError("Invalid time control")
                return
              }

              switch (server) {
                case "chessgo":
                  fetch(`${API_BASE}/live`, {
                    method: "POST",
                    credentials: "include",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      color,
                      time,
                      increment,
                    }),
                    signal: controller.signal,
                  })
                    .then((res) => res.json())
                    .then((data) => {
                      setIsLoading(false)
                      navigate(`/live/${data?.game_id}`, { replace: true })
                    })
                    .catch(() => setIsLoading(false))
                  break
                case "lichess":
                  if (!lichessAccount.connected) {
                    setTimeControlError("Lichess account not connected")
                    return
                  }

                  const timeNumber = Number(time)
                  const incrementNumber = Number(increment)
                  if (60 * timeNumber + 40 * incrementNumber < 180) {
                    setTimeControlError("Cannot play bullet via Lichess API")
                    return
                  }
                  if (60 * timeNumber + 40 * incrementNumber < 480) {
                    setTimeControlError("Cannot play blitz via Lichess API")
                    return
                  }

                  seekGame(
                    lichessAccount.access_token,
                    {
                      rated: String(rated),
                      time,
                      increment,
                      color,
                    },
                    controller,
                  )
                    .then((gameId) => {
                      setIsLoading(false)

                      if (gameId != null) {
                        navigate(`/lichess/live/${gameId}`)
                      }
                    })
                    .catch(() => setIsLoading(false))

                  break
              }
            }}
            className="w-full"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {server === "lichess"
              ? isLoading
                ? "Seeking"
                : "Seek"
              : isLoading
                ? "Creating"
                : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
