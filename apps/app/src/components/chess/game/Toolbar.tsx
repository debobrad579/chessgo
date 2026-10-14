import { useChessGameContext } from "./ChessGameContext"
import { FlipBoardButton } from "./buttons/FlipBoardButton"
import { CopyURLButton } from "./buttons/CopyURLButton"
import { Badge } from "@chessgo/ui/badge"
import { formatTimeControl } from "@/lib/formatters"
import { timeControlType } from "./utils"
import { ChatButton } from "./buttons/ChatButton"

export function Toolbar({
  handleFlipBoard,
  showChatButton = false,
}: {
  handleFlipBoard: () => void
  showChatButton?: boolean
}) {
  const { gameButtons, timeControl, rated, clockType } = useChessGameContext()

  return (
    <div className="@container flex justify-between gap-2 overflow-hidden">
      <div className="flex items-center gap-2">{gameButtons}</div>
      <div className="flex items-center gap-2">
        {showChatButton && <ChatButton />}
        <FlipBoardButton handleFlipBoard={handleFlipBoard} />
        <CopyURLButton />
        {clockType !== "no-clocks" && (
          <Badge variant="secondary" className="hidden @sm:inline-flex">
            {formatTimeControl(timeControl)} • {rated ? "Rated" : "Casual"} •{" "}
            {timeControlType(timeControl)}
          </Badge>
        )}
      </div>
    </div>
  )
}
