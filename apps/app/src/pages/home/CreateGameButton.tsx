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
import { RadioGroup, RadioGroupItem } from "@chessgo/ui/radio-group"
import { useNavigate } from "react-router"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@chessgo/ui/select"
import { useState } from "react"
import { API_BASE } from "@/lib/api"

export function CreateGameButton() {
  const navigate = useNavigate()
  const [color, setColor] = useState("random")
  const [timeControl, setTimeControl] = useState("3+2")

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
        <div className="space-y-4">
          <div className="flex gap-2">
            <Label className="whitespace-nowrap">Play as:</Label>
            <Select value={color} onValueChange={setColor}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a color" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="random">Random</SelectItem>
                  <SelectItem value="white">White</SelectItem>
                  <SelectItem value="black">Black</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <RadioGroup
            value={timeControl}
            onValueChange={setTimeControl}
            className="grid grid-cols-3 grid-rows-3 gap-4"
          >
            <div className="flex items-center gap-2">
              <RadioGroupItem value="1+0" id="1+0" />
              <Label htmlFor="1+0">1 min</Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="1+1" id="1+1" />
              <Label htmlFor="1+1">1 + 1</Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="2+1" id="2+1" />
              <Label htmlFor="2+1">2 + 1</Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="3+0" id="3+0" />
              <Label htmlFor="3+0">3 min</Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="3+2" id="3+2" />
              <Label htmlFor="3+2">3 + 2</Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="5+0" id="5+0" />
              <Label htmlFor="5+0">5 min</Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="10+0" id="10+0" />
              <Label htmlFor="10+0">10 min</Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="15+10" id="15+10" />
              <Label htmlFor="15+10">15 + 10</Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="30+0" id="30+0" />
              <Label htmlFor="30+0">30 min</Label>
            </div>
          </RadioGroup>
        </div>
        <DialogFooter>
          <Button
            onClick={() => {
              fetch(`${API_BASE}/live/new`, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  color: color,
                  time_control: timeControl,
                }),
              })
                .then((res) => res.json())
                .then((data) => {
                  navigate(`/live/${data?.game_id}`, { replace: true })
                })
            }}
            className="w-full"
          >
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
