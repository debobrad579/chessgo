import { Table, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Timer } from "lucide-react"
import { Suspense, useState } from "react"
import { GamesTableBody } from "./GamesTableBody"
import { GamesPagination } from "./GamesPagination"
import { GamesTableBodySkeleton } from "./GamesTableBodySkeleton"
import { GamesPaginationSkeleton } from "./GamesPaginationSkeleton"

export const LIMIT = 10

export default function GamesPage() {
  const [page, setPage] = useState(1)

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
        <Suspense fallback={<GamesTableBodySkeleton />}>
          <GamesTableBody page={page} />
        </Suspense>
      </Table>
      <Suspense fallback={<GamesPaginationSkeleton />}>
        <GamesPagination page={page} setPage={setPage} />
      </Suspense>
    </>
  )
}
