import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router"

export default function HomePage() {
  const navigate = useNavigate()

  return (
    <div className="h-screen w-screen flex items-center justify-center overflow-hidden">
      <div className="aspect-square w-[min(100vw,100vh)] p-4">
        <Button
          onClick={() => {
            fetch("/games/new", { method: "POST" })
              .then((res) => res.json())
              .then((data) => {
                navigate(`/live/${data?.game_id}`, { replace: true })
              })
          }}
        >
          New Game
        </Button>
      </div>
    </div>
  )
}
