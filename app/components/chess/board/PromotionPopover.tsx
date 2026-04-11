import { Button } from "@/components/ui/button"
import { Popover, PopoverAnchor, PopoverContent } from "@/components/ui/popover"
import { ChessBishop, ChessKnight, ChessQueen, ChessRook } from "lucide-react"

export function PromotionPopover({
  open,
  onSelect,
  onClose,
  anchor,
}: {
  open: boolean
  onSelect: (piece: "q" | "r" | "b" | "n") => void
  onClose: () => void
  anchor?: { left: number; top: number; size: number }
}) {
  return (
    <Popover open={open} onOpenChange={onClose}>
      {anchor && (
        <PopoverAnchor asChild>
          <div
            className="absolute pointer-events-none"
            style={{
              left: anchor.left + anchor.size / 2,
              top: anchor.top,
              width: 0,
              height: 0,
            }}
          />
        </PopoverAnchor>
      )}
      <PopoverContent
        className="flex flex-col gap-2 w-fit"
        side="bottom"
        align="center"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <Button size="icon-lg" variant="ghost" onClick={() => onSelect("q")}>
          <ChessQueen />
        </Button>
        <Button size="icon-lg" variant="ghost" onClick={() => onSelect("r")}>
          <ChessRook />
        </Button>
        <Button size="icon-lg" variant="ghost" onClick={() => onSelect("b")}>
          <ChessBishop />
        </Button>
        <Button size="icon-lg" variant="ghost" onClick={() => onSelect("n")}>
          <ChessKnight />
        </Button>
      </PopoverContent>
    </Popover>
  )
}
