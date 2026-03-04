import { ChessGame } from "@/components/chess/game"
import { Move, Result } from "@/types/chess"
import { useFetch } from "@/hooks/useFetch"
import { useParams } from "react-router"
import { ChessGameSkeleton } from "@/components/chess/game/GameSkeleton"

type SavedGame = {
  id: string
  white_id: string
  white_name: string
  black_id: string
  black_name: string
  time_control_base: number
  time_control_increment: number
  result: Result
  moves: Move[]
}

export default function GamePage() {
  const { gameID } = useParams()
  const { data } = useFetch<SavedGame>(`/games/${gameID}`)

  return data != null ? (
    <ChessGame
      gameData={{
        moves: data.moves,
        think_time: 0,
        time_control: {
          base: data.time_control_base,
          increment: data.time_control_increment,
        },
        result: data.result,
        white: {
          id: data.white_id,
          name: data.white_name,
        },
        black: {
          id: data.black_id,
          name: data.black_name,
        },
      }}
    />
  ) : (
    <ChessGameSkeleton />
  )
}
