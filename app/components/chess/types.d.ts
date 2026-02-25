export type Move = {
  from: string
  to: string
  timestamp: int
  promotion?: string
}

export type Result = "1-0" | "0-1" | "1/2-1/2" | "*"

export type Player = { name: string; elo: string }

export type Game = {
  moves: Move[]
  result: Result
  white: Player
  black: Player
  thinkTime?: number
}
