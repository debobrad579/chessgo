import { TableBody, TableCell, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { LIMIT } from "."

const ROW_WIDTHS: [number, number, number, number][] = [
  [64, 72, 32, 20],
  [80, 56, 20, 20],
  [56, 80, 32, 20],
  [72, 64, 32, 40],
  [60, 76, 32, 20],
  [84, 60, 20, 40],
  [68, 68, 20, 20],
  [76, 52, 20, 20],
  [52, 84, 32, 20],
  [80, 72, 32, 40],
]

export function GamesTableBodySkeleton() {
  return (
    <TableBody>
      {Array.from({ length: LIMIT }).map((_, i) => {
        const [white, black, time, result] = ROW_WIDTHS[i % ROW_WIDTHS.length]
        return (
          <TableRow key={i} style={{ opacity: 1 - i * (0.6 / LIMIT) }}>
            <TableCell>
              <Skeleton className="h-lh rounded-sm" style={{ width: white }} />
            </TableCell>
            <TableCell>
              <Skeleton className="h-lh rounded-sm" style={{ width: black }} />
            </TableCell>
            <TableCell>
              <Skeleton className="h-lh rounded-sm" style={{ width: time }} />
            </TableCell>
            <TableCell>
              <Skeleton className="h-lh rounded-sm" style={{ width: result }} />
            </TableCell>
          </TableRow>
        )
      })}
    </TableBody>
  )
}
