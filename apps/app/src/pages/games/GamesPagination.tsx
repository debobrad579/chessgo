import { startTransition, type Dispatch, type SetStateAction } from "react"
import { useFetch } from "@/hooks/useFetch"
import { useWindowSize } from "@/hooks/useWindowSize"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@chessgo/ui/pagination"
import { PAGE_SIZE } from "."
import { API_BASE } from "@/lib/api"

export function GamesPagination({
  pageNumber,
  setPageNumber,
}: {
  pageNumber: number
  setPageNumber: Dispatch<SetStateAction<number>>
}) {
  const { data: gameCount } = useFetch(`${API_BASE}/games/count`, assertNumber)

  const { width } = useWindowSize()
  const VISIBLE_PAGES = Math.min(7, Math.max(3, Math.floor(width / 100)))

  const pageCount = Math.ceil(gameCount / PAGE_SIZE)
  const start = Math.max(
    1,
    Math.min(
      pageNumber - Math.floor(VISIBLE_PAGES / 2),
      pageCount - VISIBLE_PAGES + 1,
    ),
  )
  const visiblePages = Array.from(
    { length: Math.min(VISIBLE_PAGES, pageCount) },
    (_, i) => start + i,
  )

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            onClick={() =>
              startTransition(() => setPageNumber((p) => Math.max(1, p - 1)))
            }
          />
        </PaginationItem>
        {visiblePages[0] > 1 && (
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
        )}
        {visiblePages.map((p) => (
          <PaginationItem key={p}>
            <PaginationLink
              isActive={p === pageNumber}
              onClick={() => startTransition(() => setPageNumber(p))}
            >
              {p}
            </PaginationLink>
          </PaginationItem>
        ))}
        {visiblePages[visiblePages.length - 1] < pageCount && (
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
        )}
        <PaginationItem>
          <PaginationNext
            onClick={() =>
              startTransition(() =>
                setPageNumber((p) => Math.min(pageCount, p + 1)),
              )
            }
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}

function assertNumber(data: unknown): asserts data is number {
  if (typeof data !== "number") throw new Error("Expected number")
}
