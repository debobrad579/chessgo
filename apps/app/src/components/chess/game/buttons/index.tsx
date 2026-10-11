import { useChessGameContext } from "../ChessGameContext"
import { FlipBoardButton } from "./FlipBoardButton"
import { CopyURLButton } from "./CopyURLButton"

export function GameButtons({
  handleFlipBoard,
}: {
  handleFlipBoard: () => void
}) {
  const { gameButtons } = useChessGameContext()

  return (
    <div className="flex justify-between gap-2">
      <div className="flex gap-2">{gameButtons}</div>
      <div className="flex gap-2">
        <FlipBoardButton handleFlipBoard={handleFlipBoard} />
        <CopyURLButton />
      </div>
    </div>
  )
}
