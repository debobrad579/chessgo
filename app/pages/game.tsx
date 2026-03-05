import { ChessGame } from "@/components/chess/game"
import { useFetch } from "@/hooks/useFetch"
import { useParams } from "react-router"
import { ChessGameSkeleton } from "@/components/chess/game/GameSkeleton"
import { Game } from "@/types/chess"

export default function GamePage() {
  const { gameID } = useParams()
  const { data } = useFetch<Game>(`/api/games/${gameID}`)

  return data != null ? <ChessGame gameData={data} /> : <ChessGameSkeleton />
}
