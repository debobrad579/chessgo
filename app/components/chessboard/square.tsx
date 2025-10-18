import { cn } from "@/lib/utils"

export function Square({
  index,
  piece,
  isHighlighted,
  isYellow,
  check,
  squareWidth,
  onRightClick,
  onRightRelease,
  onDragStart,
}: {
  index: number
  piece: string | null
  isHighlighted: boolean
  isYellow: boolean
  check: boolean
  squareWidth: number
  onRightClick: () => void
  onRightRelease: () => void
  onDragStart?: (e: React.MouseEvent) => void
}) {
  const isLight = (Math.floor(index / 8) + (index % 8)) % 2 === 0
  const rank = 8 - Math.floor(index / 8)
  const file = String.fromCharCode(97 + (index % 8))

  return (
    <div
      onMouseDown={(e) => {
        e.preventDefault()
        if (e.button === 2) {
          onRightClick()
        } else if (e.button === 0 && piece && onDragStart) {
          onDragStart(e)
        }
      }}
      onMouseUp={(e) => {
        if (e.button === 2) {
          e.preventDefault()
          onRightRelease()
        }
      }}
      onContextMenu={(e) => e.preventDefault()}
      className={cn(
        "w-full aspect-square relative leading-none",
        check &&
        "bg-[radial-gradient(ellipse_at_center,_rgb(255,0,0)_0%,_rgb(231,0,0)_25%,_rgba(169,0,0,0)_89%,_rgba(158,0,0,0)_100%)]",
        isLight
          ? isHighlighted
            ? "bg-[#ee7965] text-[#e46956]"
            : isYellow
              ? "bg-[#f6eb81] text-[#dcc35a]"
              : "bg-[#eed6b2] text-[#ba8765]"
          : isHighlighted
            ? "bg-[#e46956] text-[#ee7965]"
            : isYellow
              ? "bg-[#dcc35a] text-[#f6eb81]"
              : "bg-[#ba8765] text-[hsl(36,64%,82%)]"
      )}
    >
      {file === "a" && (
        <div
          className={"absolute top-[2px] left-[2px]"}
          style={{ fontSize: squareWidth / 5 }}
        >
          {rank}
        </div>
      )}
      {rank === 1 && (
        <div
          className={"absolute bottom-[2px] right-[2px]"}
          style={{ fontSize: squareWidth / 5 }}
        >
          {file}
        </div>
      )}
      {piece != null && (
        <img
          src={`/static/pieces/${piece}.svg`}
          alt={piece}
          className="w-full h-full cursor-grab"
        />
      )}
    </div>
  )
}
