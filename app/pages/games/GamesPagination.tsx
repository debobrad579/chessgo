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
} from "@/components/ui/pagination"
import { LIMIT } from "."

export function GamesPagination({
  page,
  setPage,
}: {
  page: number
  setPage: Dispatch<SetStateAction<number>>
}) {
  const { data: gameCount } = useFetch("/api/games/count", assertNumber)

  const { width } = useWindowSize()
  const VISIBLE_PAGES = Math.min(7, Math.max(3, Math.floor(width / 100)))

  const pageCount = Math.ceil(gameCount / LIMIT)
  const start = Math.max(
    1,
    Math.min(
      page - Math.floor(VISIBLE_PAGES / 2),
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
              startTransition(() => setPage((p) => Math.max(1, p - 1)))
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
              isActive={p === page}
              onClick={() => startTransition(() => setPage(p))}
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
              startTransition(() => setPage((p) => Math.min(pageCount, p + 1)))
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
