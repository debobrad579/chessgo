export type Move = {
  from: string
  to: string
  timestamp: int
  promotion?: string
}

export type Result = "1-0" | "0-1" | "1/2-1/2" | "*"

export type TimeControl = {
  base: number
  increment: number
}

export type Game = {
  moves: Move[]
  result: Result
  white: User | null
  black: User | null
  time_control: TimeControl
}

export type GameReturnType = {
  game: Game
  think_time: number
}
