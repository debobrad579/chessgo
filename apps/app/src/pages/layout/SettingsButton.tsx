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

export function SettingsButton({ mobile = false }: { mobile?: boolean }) {
  const user = useUser()
  const lichessAccount = useLichessAccount()
  const { theme, setTheme } = useTheme()

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
            <TabsTrigger value="ui">UI</TabsTrigger>
            <TabsTrigger value="game">Game</TabsTrigger>
            {user.email && <TabsTrigger value="account">Account</TabsTrigger>}
          </TabsList>
          <TabsContent value="ui" className="grid grid-cols-[1fr_2fr]">
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
          </TabsContent>
          <TabsContent value="game">Game settings placeholder</TabsContent>
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
