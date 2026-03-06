import { Suspense } from "react"
import { ChessGame } from "@/components/chess/game"
import { useFetch } from "@/hooks/useFetch"
import { useParams } from "react-router"
import { ChessGameSkeleton } from "@/components/chess/game/ChessGameSkeleton"
import { Game } from "@/types/chess"

function GamePageContent() {
  const { gameID } = useParams()
  const { data } = useFetch<Game>(`/api/games/${gameID}`)

  return <ChessGame gameData={data} />
}

export default function GamePage() {
  return (
    <Suspense fallback={<ChessGameSkeleton />}>
      <GamePageContent />
    </Suspense>
  )
}
