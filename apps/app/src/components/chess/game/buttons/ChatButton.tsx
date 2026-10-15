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
import { MessageSquare, MessageSquareDot } from "lucide-react"
import { useState, useEffect } from "react"
import { ScrollArea } from "@chessgo/ui/scroll-area"
import type { ChatMessage } from "@/types/chess"

export function ChatButton({
  chat,
  onSendMessage,
}: {
  chat: ChatMessage[]
  onSendMessage: (message: string) => void
}) {
  const [message, setMessage] = useState("")
  const [read, setRead] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) setRead(false)
  }, [chat])

  useEffect(() => {
    if (open) setRead(true)
  }, [open])

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button size="icon" variant="ghost">
          {chat.length === 0 || read ? <MessageSquare /> : <MessageSquareDot />}
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
