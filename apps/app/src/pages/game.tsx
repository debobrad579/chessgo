import { Suspense } from "react"
import { ChessGame } from "@/components/chess/game"
import { useFetch } from "@/hooks/useFetch"
import { useParams } from "react-router"
import { ChessGameSkeleton } from "@/components/chess/game/ChessGameSkeleton"
import { NotFound } from "@/components/errors/NotFound"
import { InternalServerError } from "@/components/errors/InternalServerError"
import { ErrorBoundary } from "@/components/errors/ErrorBoundary"
import { assertGame } from "@/types/chess"
import { API_BASE } from "@/lib/api"

function GamePageContent() {
  const { gameID } = useParams()
  const { data } = useFetch(`${API_BASE}/games/${gameID}`, assertGame)

  return <ChessGame gameData={data} />
}

export default function GamePage() {
  return (
    <ErrorBoundary
      fallback={(e) =>
        e.message.includes("404") ? <NotFound /> : <InternalServerError />
      }
    >
      <Suspense fallback={<ChessGameSkeleton />}>
        <GamePageContent />
      </Suspense>
    </ErrorBoundary>
  )
}
