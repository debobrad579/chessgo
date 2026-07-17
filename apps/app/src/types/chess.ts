export type Move = {
  from: string
  to: string
  timestamp: number
  promotion?: "q" | "r" | "b" | "n"
}

function isMove(move: unknown): move is Move {
  return (
    move != null &&
    typeof move === "object" &&
    "from" in move &&
    typeof move.from === "string" &&
    "to" in move &&
    typeof move.to === "string" &&
    "timestamp" in move &&
    typeof move.timestamp === "number" &&
    (!("promotion" in move) ||
      move.promotion === "q" ||
      move.promotion === "r" ||
      move.promotion === "b" ||
      move.promotion === "n")
  )
}

export type Result = "1-0" | "0-1" | "1/2-1/2" | "*"

function isResult(result: unknown): result is Result {
  return (
    result === "1-0" ||
    result === "0-1" ||
    result === "1/2-1/2" ||
    result === "*"
  )
}

export type Player = {
  id: string
  name: string
  rating?: number
}

function isPlayer(player: unknown): player is Player {
  return (
    player != null &&
    typeof player === "object" &&
    "id" in player &&
    typeof player.id === "string" &&
    "name" in player &&
    typeof player.name === "string"
  )
}

export type TimeControl = {
  base: number
  increment: number
}

function isTimeControl(timeControl: unknown): timeControl is TimeControl {
  return (
    timeControl != null &&
    typeof timeControl === "object" &&
    "base" in timeControl &&
    typeof timeControl.base === "number" &&
    "increment" in timeControl &&
    typeof timeControl.increment === "number"
  )
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

export function assertGame(game: unknown): asserts game is Game {
  if (
    game == null ||
    typeof game !== "object" ||
    !("id" in game) ||
    typeof game.id !== "string" ||
    !("moves" in game) ||
    !Array.isArray(game.moves) ||
    !game.moves.every(isMove) ||
    !("think_time" in game) ||
    typeof game.think_time !== "number" ||
    !("time_control" in game) ||
    !isTimeControl(game.time_control) ||
    !("white" in game) ||
    !isPlayer(game.white) ||
    !("black" in game) ||
    !isPlayer(game.black) ||
    !("result" in game) ||
    !isResult(game.result)
  )
    throw new Error(`Invalid Game: ${JSON.stringify(game)}`)
}

export type GameSummary = Omit<Game, "moves" | "think_time">

export function assertGameSummary(game: unknown): asserts game is GameSummary {
  if (
    game == null ||
    typeof game !== "object" ||
    !("id" in game) ||
    typeof game.id !== "string" ||
    !("white" in game) ||
    !isPlayer(game.white) ||
    !("black" in game) ||
    !isPlayer(game.black) ||
    !("time_control" in game) ||
    !isTimeControl(game.time_control) ||
    !("result" in game) ||
    !isResult(game.result)
  )
    throw new Error(`Invalid GameSummary: ${JSON.stringify(game)}`)
}

export function assertGameSummaryList(
  data: unknown,
): asserts data is GameSummary[] {
  if (!Array.isArray(data)) throw new Error("Expected array")
  data.forEach(assertGameSummary)
}

export type GameListItem = {
  id: string
  white: Player
  black: Player
  time_control: TimeControl
}

function assertGameListItem(game: unknown): asserts game is GameListItem {
  if (
    game == null ||
    typeof game !== "object" ||
    !("id" in game) ||
    typeof game.id !== "string" ||
    !("white" in game) ||
    !isPlayer(game.white) ||
    !("black" in game) ||
    !isPlayer(game.black) ||
    !("time_control" in game) ||
    !isTimeControl(game.time_control)
  )
    throw new Error(`Invalid GameListItem: ${JSON.stringify(game)}`)
}

export function assertGameList(data: unknown): asserts data is GameListItem[] {
  if (!Array.isArray(data)) throw new Error("Expected array")
  data.forEach(assertGameListItem)
}

export type LiveGame = Game & {
  white_connected: boolean
  black_connected: boolean
  result_reason: string
  pending_draw_offer: "w" | "b" | "n"
  rematch_request: "w" | "b" | "n"
  rematch_game_id: string
}

export function assertLiveGame(game: unknown): asserts game is LiveGame {
  assertGame(game)

  if (
    !("white_connected" in game) ||
    typeof game.white_connected !== "boolean" ||
    !("black_connected" in game) ||
    typeof game.black_connected !== "boolean" ||
    !("result_reason" in game) ||
    typeof game.result_reason !== "string" ||
    !("pending_draw_offer" in game) ||
    (game.pending_draw_offer !== "w" &&
      game.pending_draw_offer !== "b" &&
      game.pending_draw_offer !== "n") ||
    !("rematch_request" in game) ||
    (game.rematch_request !== "w" &&
      game.rematch_request !== "b" &&
      game.rematch_request !== "n") ||
    !("rematch_game_id" in game) ||
    typeof game.rematch_game_id !== "string"
  )
    throw new Error(`Invalid LiveGame: ${JSON.stringify(game)}`)
}

export function assertBotGame(game: unknown): asserts game is LiveGame {
  assertGame(game)

  if (!("result_reason" in game) || typeof game.result_reason !== "string")
    throw new Error(`Invalid LiveGame: ${JSON.stringify(game)}`)
}
