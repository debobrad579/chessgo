import { ChessGame } from "@/components/chess/game"
import { useFetch } from "@/hooks/useFetch"
import { Move, Result } from "@/types/chess"
import { useParams } from "react-router"

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

  return (
    <div className="h-full w-full flex items-center justify-center overflow-hidden">
      <div className="aspect-square w-[min(100vw,100vh)]">
        {data != null && (
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
        )}
      </div>
    </div>
  )
}
