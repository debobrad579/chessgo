export type Move = {
  from: string
  to: string
  timestamp: number
  promotion?: string
}

export type Result = "1-0" | "0-1" | "1/2-1/2" | "*"

export type Player = {
  id: string
  name: string
}

export type TimeControl = {
  base: number
  increment: number
}

export type Game = {
  moves: Move[]
  think_time: number
  time_control: TimeControl
  result: Result
  white: Player
  black: Player
}

export type GameData = Game & { pending_draw_offer: "w" | "b" | "n" }

export type GameListItem = {
  id: string
  white: Player
  black: Player
  time_control: TimeControl
}
