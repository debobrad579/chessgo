import {
  type MouseEventHandler,
  type ReactNode,
  type RefObject,
  useEffect,
  useRef,
} from "react"
import { TableCell } from "@/components/ui/table"
import { cn } from "@/lib/utils"

export function MoveCell({
  active,
  scrollAreaRef,
  undoCount,
  onClick,
  isTableCell = false,
  noStyles = false,
  children,
}: {
  active: boolean
  scrollAreaRef: RefObject<HTMLDivElement | null>
  undoCount: number
  onClick?: MouseEventHandler<HTMLElement>
  isTableCell?: boolean
  noStyles?: boolean
  children?: ReactNode
}) {
  const ref = useRef<HTMLTableCellElement>(null)

  useEffect(() => {
    if (!active || !scrollAreaRef.current || !ref.current) return
    const viewport = scrollAreaRef.current.querySelector(
      "[data-radix-scroll-area-viewport]",
    )
    if (!viewport) return

    const positionAxis = isTableCell ? "Top" : "Left"
    const sizeAxis = isTableCell ? "Height" : "Width"

    const itemStart = ref.current[`offset${positionAxis}`]
    const itemEnd = itemStart + ref.current[`offset${sizeAxis}`]
    const viewportStart = viewport[`scroll${positionAxis}`]
    const viewportEnd = viewportStart + viewport[`client${sizeAxis}`]

    if (itemStart >= viewportStart && itemEnd <= viewportEnd) return

    viewport.scrollTo({
      [positionAxis.toLowerCase()]: itemStart,
      behavior: "instant",
    })
  }, [undoCount])

  const Cell = isTableCell ? TableCell : "div"

  return (
    <Cell
      ref={ref}
      onClick={onClick}
      className={cn(
        !noStyles && "cursor-pointer",
        !noStyles && active && "font-bold",
      )}
    >
      {children}
    </Cell>
  )
}
