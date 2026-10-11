import { useChessGameContext } from "../ChessGameContext"
import { useUser } from "@/context/UserContext"
import { ResignButton } from "./ResignButton"
import { DrawButton } from "./DrawButton"
import { FlipBoardButton } from "./FlipBoardButton"
import { CopyURLButton } from "./CopyURLButton"
import { RematchButton } from "./RematchButton"
import { NewGameButton } from "./NewGameButton"
import { TakebackButton } from "./TakebackButton"

export function GameButtons({
  handleFlipBoard,
}: {
  handleFlipBoard: () => void
}) {
  const user = useUser()
  const { moves, result, black } = useChessGameContext()
  const playerColor = user.id === black.id ? "b" : "w"

  return (
    <div className="flex justify-between gap-2">
      <div className="flex gap-2">
        {result === "*" ? (
          <>
            <ResignButton disabled={moves.length === 0} />
            <DrawButton
              playerColor={playerColor}
              disabled={moves.length === 0}
            />
            <TakebackButton
              playerColor={playerColor}
              disabled={
                playerColor === "w" ? moves.length === 0 : moves.length <= 1
              }
            />
          </>
        ) : (
          <>
            <NewGameButton />
            <RematchButton playerColor={playerColor} />
          </>
        )}
      </div>
      <div className="flex gap-2">
        <FlipBoardButton handleFlipBoard={handleFlipBoard} />
        <CopyURLButton />
      </div>
    </div>
  )
}
