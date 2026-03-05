import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useFetch } from "@/hooks/useFetch"
import { useWindowSize } from "@/hooks/useWindowSize"
import { formatTimeControl } from "@/lib/formatters"
import type { Game } from "@/types/chess"
import { Timer } from "lucide-react"
import { useState } from "react"
import { useNavigate } from "react-router"

const LIMIT = 10

export default function GamesPage() {
  const [page, setPage] = useState(1)

  const { data: gameCount } = useFetch<number>("/api/games/count")
  const { data } = useFetch<Game[]>(`/api/games?page=${page}&limit=${LIMIT}`)
  const navigate = useNavigate()

  const { width } = useWindowSize()
  const VISIBLE_PAGES = Math.min(9, Math.max(3, Math.floor(width / 100)))

  const pageCount = Math.ceil((gameCount ?? 0) / LIMIT)
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
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>White</TableHead>
            <TableHead>Black</TableHead>
            <TableHead>
              <Timer />
            </TableHead>
            <TableHead>Result</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data?.map((item) => (
            <TableRow
              key={item.id}
              onClick={() => navigate(`/games/${item.id}`)}
              className="cursor-pointer"
            >
              <TableCell>{item.white.name}</TableCell>
              <TableCell>{item.black.name}</TableCell>
              <TableCell>
                {formatTimeControl({
                  base: item.time_control.base,
                  increment: item.time_control.increment,
                })}
              </TableCell>
              <TableCell>{item.result}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            />
          </PaginationItem>
          {visiblePages[0] > 1 && (
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
          )}
          {visiblePages.map((p) => (
            <PaginationItem key={p}>
              <PaginationLink isActive={p === page} onClick={() => setPage(p)}>
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
              onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </>
  )
}
