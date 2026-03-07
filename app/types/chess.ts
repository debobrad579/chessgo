export type Move = {
  from: string
  to: string
  timestamp: number
  promotion?: "q" | "r" | "b" | "n"
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

export type GameOver = {
  result: Result
  reason: string
}

export type Game = {
  id: string
  moves: Move[]
  think_time: number
  time_control: TimeControl
  white: Player
  black: Player
  result: Result
}

export type GameData = {
  id: string
  moves: Move[]
  think_time: number
  time_control: TimeControl
  white: Player
  black: Player
  result: GameOver
  pending_draw_offer: "w" | "b" | "n"
  white_connected: boolean
  black_connected: boolean
}

export type GameListItem = {
  id: string
  white: Player
  black: Player
  time_control: TimeControl
}
