import { Button } from "@chessgo/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@chessgo/ui/sheet"
import { Textarea } from "@chessgo/ui/textarea"
import { MessageSquare } from "lucide-react"
import { useChessGameContext } from "../ChessGameContext"
import { useState } from "react"
import { ScrollArea } from "@chessgo/ui/scroll-area"

export function ChatButton() {
  const { chat, onSendMessage } = useChessGameContext()
  const [message, setMessage] = useState("")

  if (chat == null) return

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button size="icon" variant="ghost">
          <MessageSquare />
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom">
        <div className="flex h-[50vh] flex-col">
          <SheetHeader>
            <SheetTitle>Chat</SheetTitle>
            <SheetDescription>
              <Textarea
                className="mt-2 max-h-[5.4rem] resize-none overflow-hidden"
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
            </SheetDescription>
          </SheetHeader>
          <ScrollArea className="min-h-0 flex-1 px-4 pb-4">
            <div className="space-y-2">
              {chat.map((message, i) => (
                <p key={i} className="break-words">
                  [{message.user}]: {message.text}
                </p>
              ))}
            </div>
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  )
}
