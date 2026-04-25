import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Skeleton } from "@/components/ui/skeleton"
import { useWindowSize } from "@/hooks/useWindowSize"

export function GamesPaginationSkeleton() {
  const { width } = useWindowSize()
  const VISIBLE_PAGES = Math.min(7, Math.max(3, Math.floor(width / 100)))

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious />
        </PaginationItem>
        {Array.from({ length: VISIBLE_PAGES }).map((_, i) => (
          <PaginationItem key={i}>
            <Skeleton className="h-9 w-9 rounded-md" />
          </PaginationItem>
        ))}
        <PaginationItem>
          <PaginationNext />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}
