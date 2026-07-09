export type GameStatus =
  | "created"
  | "started"
  | "aborted"
  | "mate"
  | "resign"
  | "stalemate"
  | "timeout"
  | "draw"
  | "insufficientMaterialClaim"
  | "outoftime"
  | "cheat"
  | "noStart"
  | "unknownFinish"
  | "variantEnd"

export type Color = "white" | "black"

export type Speed =
  | "ultraBullet"
  | "bullet"
  | "blitz"
  | "rapid"
  | "classical"
  | "correspondence"

export type Variant =
  | "standard"
  | "chess960"
  | "crazyhouse"
  | "antichess"
  | "atomic"
  | "horde"
  | "kingOfTheHill"
  | "racingKings"
  | "threeCheck"
  | "fromPosition"

export interface VariantInfo {
  key: Variant
  name: string
  short: string
}

export interface ClockInfo {
  initial: number
  increment: number
}

export interface PerfInfo {
  name: string
}

export interface GamePlayer {
  id: string
  name: string
  title?: string | null
  rating?: number
  provisional?: boolean
  aiLevel?: number
}

export interface GameState {
  type: "gameState"
  moves: string
  wtime: number
  btime: number
  winc: number
  binc: number
  status: GameStatus
  winner?: Color
  wdraw?: boolean
  bdraw?: boolean
  wtakeback?: boolean
  btakeback?: boolean
  rematch?: string
}

export interface GameFull {
  type: undefined
  id: string
  rated: boolean
  variant: VariantInfo
  clock: ClockInfo | null
  speed: Speed
  perf: PerfInfo
  createdAt: number
  white: GamePlayer
  black: GamePlayer
  initialFen: string
  state: GameState
  tournamentId?: string
}

export type ChatRoom = "player" | "spectator"

export interface ChatLine {
  type: "chatLine"
  room: ChatRoom
  username: string
  text: string
}

export interface OpponentGone {
  type: "opponentGone"
  gone: boolean
  claimWinInSeconds?: number
}

export type LichessBoardStreamEvent =
  | GameFull
  | GameState
  | ChatLine
  | OpponentGone
