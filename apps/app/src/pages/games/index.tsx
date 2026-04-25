import { Table, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Timer } from "lucide-react"
import { Suspense, useState } from "react"
import { GamesTableBody } from "./GamesTableBody"
import { GamesPagination } from "./GamesPagination"
import { GamesTableBodySkeleton } from "./GamesTableBodySkeleton"
import { GamesPaginationSkeleton } from "./GamesPaginationSkeleton"

export const PAGE_SIZE = 10

export default function GamesPage() {
  const [pageNumber, setPageNumber] = useState(1)

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
          <GamesTableBody pageNumber={pageNumber} />
        </Suspense>
      </Table>
      <Suspense fallback={<GamesPaginationSkeleton />}>
        <GamesPagination
          pageNumber={pageNumber}
          setPageNumber={setPageNumber}
        />
      </Suspense>
    </>
  )
}
