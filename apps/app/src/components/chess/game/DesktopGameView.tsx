import { Chessboard } from "@/components/chess/board"
import { WhiteClock } from "./clocks/WhiteClock"
import { BlackClock } from "./clocks/BlackClock"
import { useRef, useState } from "react"
import { ScrollArea } from "@chessgo/ui/scroll-area"
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHeader,
  TableRow,
} from "@chessgo/ui/table"
import { MoveCell } from "./MoveCell"
import { getMoveNumberArrays } from "./utils"
import { NavigationButtons } from "./NavigationButtons"
import { useUser } from "@/context/UserContext"
import { useChessGameContext } from "./ChessGameContext"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@chessgo/ui/tabs"
import { useLocalStorage } from "@/hooks/useLocalStorage"
import { Textarea } from "@chessgo/ui/textarea"
import { Toolbar } from "./Toolbar"

export function DesktopGameView() {
  const user = useUser()
  const {
    moves,
    result,
    undoCount,
    white,
    black,
    game,
    setUndoCount,
    onMove,
    previousMove,
    previousMoveIsCapture,
    chat,
    onSendMessage,
  } = useChessGameContext()

  const [message, setMessage] = useState("")
  const [flipBoard, setFlipBoard] = useState(user.id === black.id)
  const tableScrollAreaRef = useRef<HTMLDivElement>(null)
  const [tab, setTab] = useLocalStorage("game-tab", "moves")

  return (
    <div className="flex h-full gap-2">
      <div className="w-[calc(100vh-7rem-1px)]">
        <Chessboard
          fen={game.fen()}
          flipBoard={flipBoard}
          previousMove={
            previousMove
              ? {
                  from: previousMove.from,
                  to: previousMove.to,
                  timestamp: previousMove.timestamp,
                }
              : undefined
          }
          previousMoveIsCapture={previousMoveIsCapture}
          check={game.inCheck() ? game.turn() : undefined}
          onMove={onMove}
          draggablePieces={
            undoCount !== 0 || result !== "*"
              ? "n"
              : user.id === white.id
                ? "w"
                : user.id === black.id
                  ? "b"
                  : "n"
          }
        />
      </div>
      <div className="flex h-[calc(100vh-7rem-1px)] min-w-0 flex-1 flex-col gap-2">
        {flipBoard ? <WhiteClock /> : <BlackClock />}
        <NavigationButtons
          moveCount={moves.length}
          undoCount={undoCount}
          setUndoCount={setUndoCount}
        />
        <Tabs
          value={chat == null ? "moves" : tab}
          onValueChange={(value) => setTab(value)}
          className="flex min-h-0 flex-1 flex-col"
        >
          {chat != null && (
            <TabsList className="w-full" variant="line">
              <TabsTrigger value="moves">Moves</TabsTrigger>
              <TabsTrigger value="chat">Chat</TabsTrigger>
            </TabsList>
          )}
          <TabsContent value="moves" className="flex min-h-0 flex-1 flex-col">
            <ScrollArea
              className="flex-1 overflow-auto"
              ref={tableScrollAreaRef}
            >
              <Table>
                <TableHeader>
                  <TableRow className="text-muted-foreground">
                    <MoveCell
                      active={undoCount === moves.length}
                      undoCount={undoCount}
                      scrollAreaRef={tableScrollAreaRef}
                      isTableCell
                      noStyles
                    >
                      No.
                    </MoveCell>
                    <TableCell>White</TableCell>
                    <TableCell>Black</TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {getMoveNumberArrays(moves).map((moveSet, index) => (
                    <TableRow key={index}>
                      <TableCell>{index + 1}.</TableCell>
                      <MoveCell
                        onClick={() =>
                          setUndoCount(moves.length - index * 2 - 1)
                        }
                        active={undoCount === moves.length - index * 2 - 1}
                        undoCount={undoCount}
                        scrollAreaRef={tableScrollAreaRef}
                        isTableCell
                      >
                        {moveSet[0]}
                      </MoveCell>
                      <MoveCell
                        onClick={() =>
                          setUndoCount(moves.length - index * 2 - 2)
                        }
                        active={undoCount === moves.length - index * 2 - 2}
                        undoCount={undoCount}
                        scrollAreaRef={tableScrollAreaRef}
                        isTableCell
                      >
                        {moveSet[1]}
                      </MoveCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell className="text-right font-bold">
                      {result.split("-")[0]}
                    </TableCell>
                    <TableCell className="text-center font-bold">-</TableCell>
                    <TableCell className="font-bold">
                      {result.split("-")[1]}
                    </TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </ScrollArea>
          </TabsContent>
          <TabsContent
            value="chat"
            className="flex min-h-0 flex-1 flex-col gap-2"
          >
            <ScrollArea className="flex-1 overflow-hidden">
              <div className="space-y-2">
                {chat?.map((message, i) => (
                  <p key={i} className="break-words">
                    [{message.user}]: {message.text}
                  </p>
                ))}
              </div>
            </ScrollArea>
            <Textarea
              className="max-h-[5.4rem] resize-none overflow-hidden"
              placeholder="Send a message in chat"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key !== "Enter") return
                e.preventDefault()

                if (onSendMessage != null && message !== "") {
                  onSendMessage(message)
                  setMessage("")
                }
              }}
            />
          </TabsContent>
        </Tabs>
        <Toolbar handleFlipBoard={() => setFlipBoard((prev) => !prev)} />
        {flipBoard ? <BlackClock /> : <WhiteClock />}
      </div>
    </div>
  )
}
