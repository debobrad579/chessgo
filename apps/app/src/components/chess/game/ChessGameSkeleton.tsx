import { useMediaQuery } from "@/hooks/useMediaQuery"
import { Skeleton } from "@chessgo/ui/skeleton"
import { cn } from "@/lib/utils"
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHeader,
  TableRow,
} from "@chessgo/ui/table"

function ClockSkeleton({ black }: { black?: boolean }) {
  return (
    <div
      className={`h-9 px-2 py-1 rounded-md flex justify-between items-center gap-2 w-full border border-border ${
        black ? "bg-gray-900" : "bg-gray-100"
      }`}
    >
      <Skeleton
        className={`h-4 w-16 ${black ? "bg-gray-700" : "bg-gray-300"}`}
      />
      <Skeleton
        className={`h-4 w-24 ${black ? "bg-gray-700" : "bg-gray-300"}`}
      />
    </div>
  )
}

function NavigationButtonsSkeleton() {
  return (
    <div className="flex gap-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-9 flex-1 rounded-md" />
      ))}
    </div>
  )
}

function GameButtonsSkeleton() {
  return (
    <div className="flex justify-between gap-2">
      <div className="flex gap-2">
        <Skeleton className="h-9 w-9 rounded-md" />
        <Skeleton className="h-9 w-9 rounded-md" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-9 w-9 rounded-md" />
        <Skeleton className="h-9 w-9 rounded-md" />
      </div>
    </div>
  )
}

const MOVE_WIDTHS: [number, number][] = [
  [16, 16],
  [20, 24],
  [16, 28],
  [24, 16],
  [20, 20],
  [28, 16],
  [16, 24],
  [24, 20],
  [20, 16],
  [16, 20],
]

function MoveTableSkeleton() {
  return (
    <div className="flex-1 overflow-hidden pr-1">
      <Table>
        <TableHeader>
          <TableRow className="text-muted-foreground">
            <TableCell>No.</TableCell>
            <TableCell>White</TableCell>
            <TableCell>Black</TableCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          {MOVE_WIDTHS.map(([wWidth, bWidth], i) => (
            <TableRow key={i} style={{ opacity: 1 - i * 0.07 }}>
              <TableCell>
                <div className="animate-pulse bg-gray-300 dark:bg-gray-600 h-lh w-4 rounded-sm" />
              </TableCell>
              <TableCell>
                <div
                  className="animate-pulse bg-gray-300 dark:bg-gray-600 h-lh rounded-sm"
                  style={{ width: wWidth }}
                />
              </TableCell>
              <TableCell>
                {i < MOVE_WIDTHS.length - 1 && (
                  <div
                    className="animate-pulse bg-gray-300 dark:bg-gray-600 h-lh rounded-sm"
                    style={{ width: bWidth }}
                  />
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell className="font-bold text-right">
              <div className="animate-pulse bg-gray-300 dark:bg-gray-600 h-lh w-3 rounded-sm ml-auto" />
            </TableCell>
            <TableCell className="font-bold text-center">
              <div className="animate-pulse bg-gray-300 dark:bg-gray-600 h-lh w-3 rounded-sm mx-auto" />
            </TableCell>
            <TableCell className="font-bold">
              <div className="animate-pulse bg-gray-300 dark:bg-gray-600 h-lh w-3 rounded-sm" />
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  )
}

function MoveListSkeleton() {
  const widthPairs: [number, number][] = [
    [32, 40],
    [40, 32],
    [32, 44],
    [44, 32],
    [36, 40],
    [40, 36],
  ]
  return (
    <div className="w-full overflow-hidden">
      <div className="flex gap-4">
        {widthPairs.map(([wWidth, bWidth], i) => (
          <div
            key={i}
            className="flex gap-2 shrink-0"
            style={{ opacity: 1 - i * 0.12 }}
          >
            <Skeleton className="h-lh w-5" />
            <Skeleton className="h-lh" style={{ width: wWidth }} />
            <Skeleton className="h-lh" style={{ width: bWidth }} />
          </div>
        ))}
      </div>
    </div>
  )
}

function ChessboardSkeleton() {
  return (
    <div className="w-full aspect-square grid grid-cols-8 grid-rows-8">
      {Array.from({ length: 64 }).map((_, i) => {
        const isLightSquare = (Math.floor(i / 8) + (i % 8)) % 2 === 0
        return (
          <div
            key={i}
            className={cn(
              "animate-pulse",
              isLightSquare ? "bg-gray-300" : "bg-gray-500",
            )}
          />
        )
      })}
    </div>
  )
}

function DesktopGameSkeleton() {
  return (
    <div className="flex gap-2 h-full">
      <div className="w-[calc(100vh-7rem-1px)] max-w-[calc(100%-12rem)] shrink aspect-square self-start">
        <ChessboardSkeleton />
      </div>
      <div className="flex-1 flex flex-col gap-2 h-[calc(100vh-7rem-1px)] min-w-48">
        <ClockSkeleton black />
        <NavigationButtonsSkeleton />
        <MoveTableSkeleton />
        <GameButtonsSkeleton />
        <ClockSkeleton />
      </div>
    </div>
  )
}

function MobileGameSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      <ClockSkeleton black />
      <ChessboardSkeleton />
      <ClockSkeleton />
      <MoveListSkeleton />
      <NavigationButtonsSkeleton />
      <GameButtonsSkeleton />
    </div>
  )
}

export function ChessGameSkeleton() {
  const mobile = useMediaQuery("(orientation: portrait)")
  return mobile ? <MobileGameSkeleton /> : <DesktopGameSkeleton />
}
