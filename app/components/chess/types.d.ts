export type Game = {
  moves: Move[]
  result: "1-0" | "0-1" | "1/2-1/2" | "*"
  white: Player
  black: Player
  thinkTime?: number
}

export type Player = { name: string; elo: string }

export type Move = {
  from: string
  to: string
  timestamp: int
  promotion?: string
}
