import { LiveGame } from "@/components/chess/LiveGame"
import { useParams } from "react-router"

export default function LivePage() {
  const { gameID } = useParams()

  return (
    <div className="h-screen w-screen flex items-center justify-center overflow-hidden">
      <div className="aspect-square w-[min(100vw,100vh)] p-4">
        <LiveGame gameID={gameID!} />
      </div>
    </div>
  )
}
